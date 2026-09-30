import { renderPortfolio } from './portfolio.mjs';
import { renderConnections } from './connections.mjs';
import { renderEvents } from './events.mjs';
import { generateSocialImage } from './social-image.mjs';
import fs from 'node:fs';
import path from 'node:path';
const csv = fs.readFileSync('content/translations.csv', 'utf8').replace(/^\uFEFF/, '');
function parseCSV(input) {
  const rows = []; let row = [], field = '', quoted = false;
  for (let i = 0; i < input.length; i++) {
    const c = input[i];
    if (c === '"') { if (quoted && input[i + 1] === '"') { field += '"'; i++; } else quoted = !quoted; }
    else if (c === ',' && !quoted) { row.push(field); field = ''; }
    else if (c === '\n' && !quoted) { row.push(field.replace(/\r$/, '')); rows.push(row); row = []; field = ''; }
    else field += c;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  if (quoted) throw Error('Unclosed CSV quote');
  return rows;
}
const rows = parseCSV(csv); const dictionary = {};
for (const [key, en, ja, ...extra] of rows.slice(1)) {
  if (!key) continue;
  if (!en || extra.length || dictionary[key]) throw Error('Invalid or duplicate translation row: ' + key);
  dictionary[key] = { en, ja: ja || en };
  if (!ja) console.warn('Missing Japanese translation: ' + key);
}
const config = JSON.parse(fs.readFileSync('content/site.json', 'utf8'));
const publicUrl = (config.publicUrl || '').replace(/\/$/, '');
const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safeURL = value => /^https:\/\//.test(value || '') ? escape(value) : '#';
const pages = ['welcome','events','portfolio','learn','links','contact'];
const out = 'dist'; fs.mkdirSync(out, { recursive: true });
await generateSocialImage({
  source: path.join(out, 'assets/kobe-harbour.png'),
  output: path.join(out, 'assets/kobe-harbour-social.jpg'),
  brand: dictionary['site.name'].en,
  harbour: dictionary['common.harbour'],
  harbourNote: dictionary['common.harbourNote'],
});
const art = fs.existsSync('dist/assets/sunflower-community.jpg');
for (const lang of ['en','ja']) for (const page of pages) {
  const t = key => { if (!dictionary[key]) throw Error('Missing key: ' + key); return escape(dictionary[key][lang]); };
  const brandName = escape(dictionary['site.name'].en);
  const local = value => escape(typeof value === 'object' ? value[lang] || value.en : value);
  const href = target => `${target}.html`;
  const empty = (title, body) => `<div class="empty"><span class="ornament" aria-hidden="true">✦</span><h2>${t(title)}</h2><p>${t(body)}</p></div>`;
  const intro = `<div class="page-intro"><p class="eyebrow">${t(page + '.eyebrow')}</p><h1>${t(page + '.title')}</h1><p class="lead">${t(page + '.intro')}</p></div>`;
  const schools = config.schools.map(s => `<article class="listing"><h3><a href="${safeURL(s.url)}">${local(s.name)}</a></h3><p>${local(s.description)}</p></article>`).join('');
  let content = '';
  if (page === 'welcome') content = `<section class="hero welcome-introduction"><div class="hero-copy"><div class="welcome-heading"><h1>${t('nav.welcome')}</h1></div><p class="lead">${t('welcome.introductionOne').replace(lang === 'en' ? 'Frankie Manning' : 'フランキー・マニング', '<a href="https://en.wikipedia.org/wiki/Frankie_Manning" target="_blank" rel="noopener noreferrer">' + (lang === 'en' ? 'Frankie Manning' : 'フランキー・マニング') + '</a>')}</p><p class="lead">${t('welcome.introductionTwo').replace(lang === 'en' ? 'scientifically proven' : '科学的にも証明されています', '<a href="https://psychology-spot.com/dancing-makes-me-happy/?fbclid=IwAR10XCwCl6aqUj1dYN2WeRth3UDSUnEq0qhvcbBJzdtS-33oyCSvqq_9S0I" target="_blank" rel="noopener noreferrer">' + (lang === 'en' ? 'scientifically proven' : '科学的にも証明されています') + '</a>')}</p></div>${art ? `<figure class="hero-art welcome-community-photo"><img src="../assets/sunflower-community.jpg" alt="${t('about.photoAlt')}" width="4018" height="2289"></figure>` : ''}</section><section class="lindy-introduction" aria-labelledby="lindy-heading"><h2 id="lindy-heading">${t('welcome.lindyTitle')}</h2><div><p>${t('welcome.lindyText')}</p></div></section><section class="lindy-videos" aria-label="${t('welcome.videosLabel')}">${[['bEdtElNqnzs','welcome.videoOrigins'],['YibBVIYwQWs','welcome.videoMovies'],['GMMjhIAwvQ4','welcome.videoSocial']].map(([id,key]) => `<article class="video-card"><h3>${t(key)}</h3><iframe src="https://www.youtube-nocookie.com/embed/${id}" title="${t(key)}" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe><a class="video-fallback" href="https://www.youtube.com/watch?v=${id}" target="_blank" rel="noopener noreferrer">${t('welcome.watchYouTube')}</a></article>`).join('')}</section>`;
  if (page === 'events') content = renderEvents(t);
  if (page === 'portfolio') content = renderPortfolio(t,lang,escape);
  if (page === 'learn') content = `<section class="learn-hero"><div><p class="eyebrow">${t('learn.eyebrow')}</p><h1>${t('learn.title')}</h1><p class="lead">${t('learn.intro')}</p></div><figure><img src="../assets/swing-dance.png" alt="${t('art.alt')}" width="1536" height="1024"></figure></section><section class="learn-options">${['first','second'].map((n,i)=>`<article><span class="learn-symbol" aria-hidden="true">${i===0?'♫':'✦'}</span><h2>${t('learn.'+n+'Title')}</h2><p>${t('learn.'+n)}</p></article>`).join('')}</section><section class="learn-contact"><div><h2>${t('learn.stayConnected')}</h2><p>${t('learn.contactNote')}</p></div><div class="social-links"><a href="mailto:info@swingdancekobe.com" aria-label="${t('common.emailLabel')}" title="info@swingdancekobe.com"><svg viewBox="0 0 24 24" aria-hidden="true" class="outline-icon"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 6 9 7 9-7"/></svg></a><a href="https://www.facebook.com/groups/1112888595513671/" target="_blank" rel="noopener noreferrer" aria-label="Facebook" title="Facebook"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 22v-9h3l.5-4H14V7c0-1.2.4-2 2-2h2V1.4C17.3 1.2 16 1 14.8 1 11.5 1 10 3 10 6.5V9H7v4h3v9z"/></svg></a><a href="https://www.instagram.com/swingdancekobe" target="_blank" rel="noopener noreferrer" aria-label="Instagram" title="Instagram"><svg viewBox="0 0 24 24" aria-hidden="true" class="outline-icon"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" class="icon-dot"/></svg></a></div></section>`;
  if (page === 'links') content = `<div class="page-intro connections-intro"><h1>${t('links.title')}</h1><p class="lead">${t('links.intro')}</p></div>` + renderConnections(t, lang, escape);
  if (page === 'contact') content = `<section class="page-intro community-intro"><h1>${t('about.title')}</h1><p class="lead">${t('about.intro')}</p></section><figure class="community-photo"><img src="../assets/sunflower-community.jpg" alt="${t('about.photoAlt')}" width="4018" height="2289"><figcaption>${t('about.photoCaption')}</figcaption></figure><div class="community-story"><section><h2>${t('about.beginTitle')}</h2><p>${t('about.begin')}</p></section><section><h2>${t('about.shareTitle')}</h2>${['shareRoger','shareLucy','shareNatsuki'].map(k=>`<p>${t('about.'+k)}</p>`).join('')}</section><section><h2>${t('about.thanksTitle')}</h2><p>${t('about.venues')}</p><p>${t('about.firstBand').replace('Clap Stomp Swingin’', '<a href="https://www.youtube.com/@clapstompswingin3987" target="_blank" rel="noopener noreferrer">Clap Stomp Swingin’</a>')}</p><p>${t('about.community')}</p><p class="community-thanks">${t('about.closing')}</p></section><section class="community-videos"><p>${t('about.videoNote')}</p><a class="button" href="portfolio.html">${t('about.videoLink')}</a></section><div class="about-question"><p>${t('about.questions')}</p><div class="social-links"><a href="mailto:info@swingdancekobe.com" aria-label="${t('common.emailLabel')}" title="info@swingdancekobe.com"><svg viewBox="0 0 24 24" aria-hidden="true" class="outline-icon"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 6 9 7 9-7"/></svg></a><a href="https://www.facebook.com/groups/1112888595513671/" target="_blank" rel="noopener noreferrer" aria-label="Facebook" title="Facebook"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 22v-9h3l.5-4H14V7c0-1.2.4-2 2-2h2V1.4C17.3 1.2 16 1 14.8 1 11.5 1 10 3 10 6.5V9H7v4h3v9z"/></svg></a><a href="https://www.instagram.com/swingdancekobe" target="_blank" rel="noopener noreferrer" aria-label="Instagram" title="Instagram"><svg viewBox="0 0 24 24" aria-hidden="true" class="outline-icon"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" class="icon-dot"/></svg></a></div></div></div>`;
  const other = lang === 'en' ? 'ja' : 'en';
  const description = t(page === 'welcome' ? 'welcome.introductionOne' : page === 'contact' ? 'about.intro' : page === 'portfolio' ? 'portfolio.videoIntro' : page+'.intro');
  const pageUrl = publicUrl ? `${publicUrl}/${lang}/${page}.html` : '';
  const imageUrl = publicUrl ? `${publicUrl}/assets/kobe-harbour-social.jpg` : '';
  const shareMeta = publicUrl ? `<meta property="og:type" content="website"><meta property="og:site_name" content="${t('site.name')}"><meta property="og:title" content="${t('site.name')} — ${t('nav.'+page)}"><meta property="og:description" content="${description}"><meta property="og:url" content="${pageUrl}"><meta property="og:image" content="${imageUrl}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="Kobe harbour behind Swing Dance Kobe masthead lettering in English and Japanese"><meta name="twitter:card" content="summary_large_image">` : '';
  const html = `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="referrer" content="strict-origin-when-cross-origin"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${t('nav.'+page)} — ${t('site.name')}</title><meta name="description" content="${description}">${shareMeta}<link rel="stylesheet" href="../styles.css"><link rel="alternate" hreflang="${other}" href="../${other}/${page}.html"><link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='16' fill='%23a43c24'/%3E%3Ctext x='16' y='24' text-anchor='middle' font-family='Georgia' font-size='25' fill='%23fff2d9'%3ES%3C/text%3E%3C/svg%3E"></head><body><a class="skip" href="#main">${lang === 'en' ? 'Skip to content' : '本文へスキップ'}</a><header><div class="masthead"><p class="harbour-kicker"><span class="japan-flag" aria-hidden="true"></span><span>${t('common.harbour')}</span><span class="japan-lettering" lang="ja" aria-hidden="true">日本</span></p><a class="brand" href="welcome.html" aria-label="${t('site.name')}">${brandName}</a><p class="harbour-signature">${t('common.harbourNote')}</p></div><nav aria-label="${lang === 'en' ? 'Main navigation' : 'メインナビゲーション'}">${pages.map(p=>`<a href="${href(p)}" ${p===page?'aria-current="page"':''}>${t('nav.'+p)}</a>`).join('')}</nav><div class="menu-actions"><div class="social-links" aria-label="Social media"><a href="https://www.facebook.com/groups/1112888595513671/" target="_blank" rel="noopener noreferrer" aria-label="Facebook" title="Facebook"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 22v-9h3l.5-4H14V7c0-1.2.4-2 2-2h2V1.4C17.3 1.2 16 1 14.8 1 11.5 1 10 3 10 6.5V9H7v4h3v9z"/></svg></a><a href="https://www.instagram.com/swingdancekobe" target="_blank" rel="noopener noreferrer" aria-label="Instagram" title="Instagram"><svg viewBox="0 0 24 24" aria-hidden="true" class="outline-icon"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" class="icon-dot"/></svg></a><a href="https://www.youtube.com/channel/UCJ_ZqMee4em5JMvqMbEd4LQ" target="_blank" rel="noopener noreferrer" aria-label="YouTube" title="YouTube"><svg viewBox="0 0 24 24" aria-hidden="true"><path fill-rule="evenodd" d="M22 7c-.2-1.5-1-2.3-2.5-2.5C17.3 4.2 14.7 4 12 4s-5.3.2-7.5.5C3 4.7 2.2 5.5 2 7c-.3 1.5-.5 3.2-.5 5s.2 3.5.5 5c.2 1.5 1 2.3 2.5 2.5 2.2.3 4.8.5 7.5.5s5.3-.2 7.5-.5c1.5-.2 2.3-1 2.5-2.5.3-1.5.5-3.2.5-5s-.2-3.5-.5-5ZM10 8v8l7-4z"/></svg></a><a href="mailto:info@swingdancekobe.com" aria-label="${t('common.emailLabel')}" title="info@swingdancekobe.com"><svg viewBox="0 0 24 24" aria-hidden="true" class="outline-icon"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 6 9 7 9-7"/></svg></a></div><a class="language" lang="${other}" hreflang="${other}" href="../${other}/${page}.html" aria-label="${other === 'ja' ? '日本語に切り替え' : 'Switch to English'}">${other === 'ja' ? '日本語' : 'English'}</a></div></header><main id="main">${content}</main><footer><a class="footer-brand" href="welcome.html">${brandName.toUpperCase()}</a><p>${t('common.footer')}</p></footer></body></html>`;
  fs.mkdirSync(path.join(out,lang),{recursive:true}); fs.writeFileSync(path.join(out,lang,page+'.html'),html);
}
// Serve the Japanese welcome page directly, without a visible redirect.
const entry = fs.readFileSync('dist/ja/welcome.html','utf8').replace(/(href|src)="([^"\s]+)"/g, (match,attr,url) => {
  if (/^(?:[a-z][a-z0-9+.-]*:|\/|#)/i.test(url)) return match;
  const target = url.startsWith('../') ? url.slice(3) : 'ja/' + url;
  return attr + '="' + target + '"';
}).replace(`content="${publicUrl}/ja/welcome.html"`, `content="${publicUrl}/"`);
fs.writeFileSync('dist/index.html', entry);
console.log('Built 12 bilingual pages.');
