export function renderEvents(t) {
  const external = (url, label, cls = '') => `<a class="${cls}" href="${url}" target="_blank" rel="noopener noreferrer">${label}</a>`;
  const venue = (name, url) => `<span>${t(name)}</span>${external(url, t('festival.map'), 'map-link')}`;
  const nosta = 'https://maps.app.goo.gl/P7tGnP4SrbfstaaV9';
  const rows = [
    ['oct2','19:30–21:30','park','parkSocialText','garden','https://maps.app.goo.gl/T9n8kLWJGpu2nF2L8'],
    ['oct3','18:00–20:30','warmup','warmupText','platz','https://maps.app.goo.gl/Xr2ddo63jcq5DsrH8'],
    ['oct9','19:30–21:30','park','parkText','garden','https://maps.app.goo.gl/T9n8kLWJGpu2nF2L8'],
    ['oct10','11:00','parade','paradeText','station','https://maps.app.goo.gl/DatdjRhUk5LKqdRU9'],
    ['oct10','12:00–16:40','live','liveText','nosta',nosta],
    ['oct11','11:00','parade','paradeText','station','https://maps.app.goo.gl/DatdjRhUk5LKqdRU9'],
    ['oct11','12:00–16:40','live','liveText','nosta',nosta]
  ];
  const timetable = (day, acts) => `<article class="band-day"><h3>${t('festival.' + day)}</h3><p>${venue('festival.nosta', nosta)}</p><table class="festival-table"><caption class="sr-only">${t('festival.' + day)} — ${t('festival.bands')}</caption><thead><tr><th scope="col">${t('festival.time')}</th><th scope="col">${t('festival.performer')}</th></tr></thead><tbody>${acts.map((act,i) => `<tr><th scope="row" class="time-cell">${12+i}:00–${12+i}:40</th><td>${t('festival.'+act)}</td></tr>`).join('')}</tbody></table></article>`;
  return `<div class="festival-page">
    <section class="festival-hero"><p class="eyebrow">${t('festival.eyebrow')}</p><h1>${t('festival.title')}</h1><p class="festival-date">${t('festival.dates')}</p><div class="festival-actions">${external('https://www.kobejazzstreet.gr.jp/',t('festival.official'),'button')}${external('https://www.kobejazzstreet.gr.jp/ticket/',t('festival.buy'),'button')}</div></section>
    <section class="festival-invitation"><div><h2>${t('festival.call')}</h2><p>${t('festival.intro')}</p></div><aside class="lesson-note"><h3>${t('festival.lessonsTitle')}</h3><p>${t('festival.lessons')}</p></aside></section>


    <section class="festival-section"><div class="agenda-heading"><h2>${t('festival.agenda')}</h2><div class="social-links">${external('https://www.facebook.com/groups/1112888595513671/','<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 22v-9h3l.5-4H14V7c0-1.2.4-2 2-2h2V1.4C17.3 1.2 16 1 14.8 1 11.5 1 10 3 10 6.5V9H7v4h3v9z"/></svg><span class="sr-only">Facebook</span>')}${external('https://www.instagram.com/swingdancekobe','<svg viewBox="0 0 24 24" class="outline-icon" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" class="icon-dot"/></svg><span class="sr-only">Instagram</span>')}</div></div><div class="agenda-days">${[...new Set(rows.map(row=>row[0]))].map(day=>`<article class="agenda-day"><h3>${t('festival.'+day)}</h3><table class="festival-table grouped-agenda"><caption class="sr-only">${t('festival.'+day)}</caption><thead><tr>${['time','event','venue'].map(k=>`<th scope="col">${t('festival.'+k)}</th>`).join('')}</tr></thead><tbody>${rows.filter(row=>row[0]===day).map(([date,time,name,desc,place,url])=>`<tr><th scope="row" class="time-cell">${time}</th><td><strong>${t('festival.'+name)}</strong><p>${t('festival.'+desc)}</p></td><td>${venue('festival.'+place,url)}</td></tr>`).join('')}</tbody></table></article>`).join('')}</div></section>
    <section class="festival-section"><h2>${t('festival.bands')}</h2><p>${t('festival.liveText')}</p><div class="band-grid">${timetable('oct10',['sat1','soul','sat3','clap','sat5'])}${timetable('oct11',['sun1','soul','clap','sat1','sun5'])}</div></section>

  </div>`;
}
