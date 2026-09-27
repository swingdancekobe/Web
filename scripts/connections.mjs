import fs from 'node:fs';
const data = JSON.parse(fs.readFileSync('content/connections.json','utf8').replace(/^\uFEFF/,''));
export function renderConnections(t, lang, escape) {
 const link = (url,label) => `<a href="${escape(url)}"${url === 'welcome.html' ? '' : ' target="_blank" rel="noopener noreferrer"'}>${label}</a>`;
 const photos = [
 {src:'../assets/savoy-ballroom.png',alt:t('links.savoyPhoto')},
 {src:'../assets/frankie-manning.png',alt:t('links.frankiePhoto')}
 ];
 return `<div class="connection-directory"><section><h2>${t('links.rootsTitle')}</h2><div class="resource-grid">${data.history.map((r,i)=>`<article class="connection-card discover-card"><h3>${link(r.url,escape(r.name))}</h3><p>${escape(r[lang])}</p><figure><img src="${photos[i].src}" alt="${photos[i].alt}" width="${i===0?3611:564}" height="${i===0?2706:732}"></figure></article>`).join('')}</div></section>
 <section><h2>${t('links.japanTitle')}</h2><table class="festival-table connections-table"><thead><tr><th scope="col">${t('links.community')}</th><th scope="col">${t('links.city')}</th><th scope="col">${t('links.destinations')}</th></tr></thead><tbody>${data.communities.map(c=>`<tr><th scope="row">${escape(c.name)}</th><td>${escape(c[lang]||'—')}</td><td><div class="connection-actions">${c.website ? link(c.website,t('links.website')) : ''}${c.facebook ? link(c.facebook,'Facebook') : ''}</div></td></tr>`).join('')}</tbody></table></section>
 <section><h2>${t('links.moviesTitle')}</h2><table class="festival-table connections-table film-table"><thead><tr><th scope="col">${t('links.year')}</th><th scope="col">${t('links.film')}</th><th scope="col">${t('links.destinations')}</th></tr></thead><tbody>${[...data.films].sort((a,b)=>b.year-a.year).map(f=>`<tr><td>${f.year}</td><th scope="row"><div class="film-title">${link(f.url,`<img class="film-poster" src="${escape(f.poster)}" alt="${escape(f.name)}" width="80" height="120" loading="lazy">`)}<span>${escape(f.name)}</span></div></th><td>${link(f.url,'IMDb')}</td></tr>`).join('')}</tbody></table></section></div>`;
}
