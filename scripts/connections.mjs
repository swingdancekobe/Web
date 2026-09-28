import fs from 'node:fs';
const data = JSON.parse(fs.readFileSync('content/connections.json','utf8').replace(/^\uFEFF/,''));
export function renderConnections(t, lang, escape) {
 const link = (url,label) => `<a href="${escape(url)}"${url === 'welcome.html' ? '' : ' target="_blank" rel="noopener noreferrer"'}>${label}</a>`;
 const icons={
 website:'<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/>',
 facebook:'<path d="M14 22v-9h3l.5-4H14V7c0-1.2.4-2 2-2h2V1.4C17.3 1.2 16 1 14.8 1 11.5 1 10 3 10 6.5V9H7v4h3v9z"/>',
 instagram:'<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1"/>',
 email:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 6 9 7 9-7"/>'};
 const communityLinks=c=>['website','facebook','instagram','email'].filter(k=>c[k]).map(k=>{
 const label=k==='website'?t('links.website'):k==='email'?escape(c[k]):k==='facebook'?'Facebook':'Instagram';
 return `<a href="${escape(k==='email'?'mailto:'+c[k]:c[k])}" aria-label="${escape(c.name)} — ${label}" title="${label}"${k==='email'||c[k]==='welcome.html'?'':' target="_blank" rel="noopener noreferrer"'}><svg viewBox="0 0 24 24" aria-hidden="true" class="${k==='facebook'?'':'outline-icon'}">${icons[k]}</svg></a>`;
 }).join('');
 const photos = [
 {src:'../assets/savoy-ballroom.png',alt:t('links.savoyPhoto')},
 {src:'../assets/frankie-manning.png',alt:t('links.frankiePhoto')}
 ];
 return `<div class="connection-directory"><section><h2>${t('links.rootsTitle')}</h2><div class="resource-grid">${data.history.map((r,i)=>`<article class="connection-card discover-card"><h3>${link(r.url,escape(r.name))}</h3><p>${escape(r[lang])}</p><figure><img src="${photos[i].src}" alt="${photos[i].alt}" width="${i===0?3611:564}" height="${i===0?2706:732}"></figure></article>`).join('')}</div></section>
 <section class="lindy-game"><div><h2>${t('links.gameTitle')}</h2><p>${t('links.gameText')}</p></div><a class="button" href="https://doodles.google/doodle/celebrating-swing-dancing-and-the-savoy-ballroom/" target="_blank" rel="noopener noreferrer"><span aria-hidden="true">♫ </span>${t('links.gameButton')}</a></section>
 <section><h2>${t('links.japanTitle')}</h2><div class="directory-invitation"><p>${t('links.joinDirectory')}</p><div class="social-links directory-icons">${communityLinks({name:'Swing Dance Kobe',email:'info@swingdancekobe.com'})}</div></div><table class="festival-table connections-table"><thead><tr><th scope="col">${t('links.community')}</th><th scope="col">${t('links.city')}</th><th scope="col">${t('links.destinations')}</th></tr></thead><tbody>${data.communities.map(c=>`<tr><th scope="row">${escape(c.name)}</th><td>${escape(c[lang]||'—')}</td><td><div class="social-links directory-icons">${communityLinks(c)}</div></td></tr>`).join('')}</tbody></table></section>
 <section><h2>${t('links.moviesTitle')}</h2><div class="movie-tiles">${[...data.films].sort((a,b)=>b.year-a.year).map(f=>`<article class="movie-tile">${link(f.url,`<img class="film-poster" src="${escape(f.poster)}" alt="${escape(f.name)}" width="80" height="120" loading="lazy">`)}<div><h3>${escape(f.name)}</h3><p>${f.year}</p>${link(f.url,'IMDb')}</div></article>`).join('')}</div></section></div>`;
}
