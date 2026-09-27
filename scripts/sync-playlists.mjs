import fs from 'node:fs';
import { pathToFileURL } from 'node:url';

const definitions = JSON.parse(fs.readFileSync('content/playlists.json','utf8'));
const snapshotPath = 'content/playlist-videos.json';
let inFlight;
export function readSnapshot() {
  try { return JSON.parse(fs.readFileSync(snapshotPath,'utf8')); }
  catch { return {updatedAt:null,playlists:[]}; }
}
async function request(url, options = {}) {
  const response = await fetch(url,{...options,signal:AbortSignal.timeout(25000)});
  if (!response.ok) throw Error(`YouTube returned HTTP ${response.status}`);
  return response;
}
function walk(object, visit) {
  if (!object || typeof object !== 'object') return;
  visit(object);
  for (const value of Object.values(object)) walk(value,visit);
}
function extractPage(data) {
  const videos = new Map(); let continuation;
  walk(data, object => {
    const model = object.lockupViewModel;
    if (model?.contentType === 'LOCKUP_CONTENT_TYPE_VIDEO') {
      const id = model.contentId, title = model.metadata?.lockupMetadataViewModel?.title?.content;
      if (/^[\w-]{11}$/.test(id) && title) videos.set(id,{id,title});
    }
    const old = object.playlistVideoRenderer;
    if (old?.isPlayable && /^[\w-]{11}$/.test(old.videoId)) {
      videos.set(old.videoId,{id:old.videoId,title:old.title?.runs?.map(r=>r.text).join('') || old.title?.simpleText});
    }
    const token = object.continuationItemRenderer?.continuationEndpoint?.continuationCommand?.token;
    if (token) continuation = token;
  });
  return {videos:[...videos.values()],continuation};
}
async function playlistVideos(id) {
  const html = await (await request(`https://www.youtube.com/playlist?list=${encodeURIComponent(id)}&hl=en`)).text();
  const match = html.match(/var ytInitialData = (.*?);<\/script>/s);
  if (!match) throw Error('YouTube playlist format was not recognised');
  const data = JSON.parse(match[1]);
  // Read only the playlist content, not recommendations or page chrome.
  let result = extractPage(data.contents);
  const videos = new Map(result.videos.map(v=>[v.id,v]));
  const version = html.match(/"INNERTUBE_CLIENT_VERSION":"([^"]+)"/)?.[1];
  const seen = new Set();
  for (let page=0; result.continuation; page++) {
    if (!version || page >= 30 || seen.has(result.continuation)) throw Error('Could not read the complete playlist');
    seen.add(result.continuation);
    const response = await request('https://www.youtube.com/youtubei/v1/browse?prettyPrint=false', {
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({context:{client:{clientName:'WEB',clientVersion:version,hl:'en'}},continuation:result.continuation})
    });
    result = extractPage(await response.json());
    for (const video of result.videos) videos.set(video.id,video);
  }
  if (!videos.size) throw Error('Playlist has no readable public videos');
  return [...videos.values()];
}
async function publicationDate(id) {
  const html = await (await request(`https://www.youtube.com/watch?v=${id}&hl=en`)).text();
  const date = html.match(/"publishDate"\s*:\s*"([^"]+)"/)?.[1]
    || html.match(/"uploadDate"\s*:\s*"([^"]+)"/)?.[1];
  if (!date || Number.isNaN(Date.parse(date))) throw Error(`No publication date for video ${id}`);
  return date;
}
export function syncPlaylists() {
  if (inFlight) return inFlight;
  inFlight = (async()=>{
    const previous = readSnapshot();
    const dates = new Map((previous.playlists||[]).flatMap(p=>p.videos).map(v=>[v.id,v.publishedAt]));
    const dateRequests = new Map();
    const playlists = [];
    // Four playlists sequentially, at most four metadata requests at once.
    for (const definition of definitions) {
      const videos = await playlistVideos(definition.id);
      for (let i=0;i<videos.length;i+=4) {
        await Promise.all(videos.slice(i,i+4).map(async video=>{
          if (!dates.has(video.id)) {
            if (!dateRequests.has(video.id)) dateRequests.set(video.id,publicationDate(video.id));
            dates.set(video.id,await dateRequests.get(video.id));
          }
          video.publishedAt = dates.get(video.id);
        }));
      }
      videos.sort((a,b)=>Date.parse(b.publishedAt)-Date.parse(a.publishedAt)||a.id.localeCompare(b.id));
      playlists.push({...definition,videos});
    }
    playlists.sort((a,b)=>Date.parse(b.videos[0].publishedAt)-Date.parse(a.videos[0].publishedAt));
    const snapshot = {updatedAt:new Date().toISOString(),playlists};
    // Replace the saved snapshot only after every playlist has succeeded.
    fs.writeFileSync(snapshotPath+'.tmp',JSON.stringify(snapshot,null,2)+'\n');
    fs.renameSync(snapshotPath+'.tmp',snapshotPath);
    fs.mkdirSync('dist',{recursive:true});
    fs.writeFileSync('dist/playlist-videos.json',JSON.stringify(snapshot));
    return snapshot;
  })().finally(()=>{inFlight=undefined;});
  return inFlight;
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const result=await syncPlaylists();
    console.log(JSON.stringify(result.playlists.map(p=>({name:p.en,count:p.videos.length,latest:p.videos.slice(0,6)})),null,2));
  } catch(error) { console.error('Playlist refresh failed; saved data retained:',error.message);process.exitCode=1; }
}
