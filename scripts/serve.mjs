import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { readSnapshot, syncPlaylists } from './sync-playlists.mjs';
const refreshEvery = 15 * 60 * 1000;
let refreshFailed = false;
const refresh = () => syncPlaylists().then(() => {refreshFailed=false;}).catch(error => {
  refreshFailed=true;
  console.warn('YouTube refresh unavailable; keeping saved videos:',error.message);
});
if (!readSnapshot().updatedAt || Date.now()-Date.parse(readSnapshot().updatedAt)>refreshEvery) void refresh();
setInterval(refresh,refreshEvery).unref();
const root = path.resolve('dist');
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml' };
http.createServer((req, res) => {
  try {
    if (new URL(req.url,'http://localhost').pathname === '/api/playlists') {
      const data=readSnapshot();
      res.setHeader('Content-Type','application/json; charset=utf-8');
      res.setHeader('Cache-Control','no-store');
      res.end(JSON.stringify({...data,stale:refreshFailed || !data.updatedAt || Date.now()-Date.parse(data.updatedAt)>refreshEvery*2}));
      return;
    }
    let file = path.resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
    if (file !== root && !file.startsWith(root + path.sep)) throw Error();
    if (fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
    res.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream');
    res.end(fs.readFileSync(file));
  } catch { res.writeHead(404); res.end('Not found'); }
}).listen(4173, '127.0.0.1', () => console.log('http://127.0.0.1:4173'));
