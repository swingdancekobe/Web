(() => {
  const root=document.querySelector('#playlist-chapters');
  const status=document.querySelector('#playlist-status');
  if(!root)return;
  const element=(tag,text,cls)=>{const el=document.createElement(tag);if(text)el.textContent=text;if(cls)el.className=cls;return el;};
  const anchor=(url,text,cls)=>{const a=element('a',text,cls);a.href=url;a.target='_blank';a.rel='noopener noreferrer';return a;};
  function render(data) {
    const feature=document.querySelector('#featured-video');
    const v=data.featured;
    if(feature && v && /^[\w-]{11}$/.test(v.id)) {
      feature.querySelector('h2').textContent=v.title;
      const date=feature.querySelector('time');date.dateTime=v.publishedAt;
      date.textContent=new Date(v.publishedAt).toLocaleDateString(root.dataset.lang==='ja'?'ja-JP':'en-GB',{year:'numeric',month:'long',day:'numeric',timeZone:'Asia/Tokyo'});
      const frame=feature.querySelector('iframe');
      const src=`https://www.youtube-nocookie.com/embed/${v.id}`;
      if(frame.src!==src)frame.src=src;
      frame.title=v.title;
      feature.querySelector('a').href=`https://www.youtube.com/watch?v=${v.id}`;
    }
    const fragment=document.createDocumentFragment();
    for(const p of data.playlists) {
      if(!/^[\w-]+$/.test(p.id))continue;
      const section=element('section',null,'playlist-chapter');section.dataset.playlist=p.id;
      const heading=element('div',null,'playlist-heading');heading.append(element('h2',p[root.dataset.lang]||p.en),anchor(`https://www.youtube.com/playlist?list=${p.id}`,root.dataset.allLabel,'text-link'));
      const grid=element('div',null,'playlist-grid');
      for(const v of p.videos.slice(0,6)) {
        if(!/^[\w-]{11}$/.test(v.id))continue;
        const card=element('article',null,'video-card');
        const date=element('time',new Date(v.publishedAt).toLocaleDateString(root.dataset.lang==='ja'?'ja-JP':'en-GB',{year:'numeric',month:'short',day:'numeric',timeZone:'Asia/Tokyo'}));date.dateTime=v.publishedAt;
        const frame=element('iframe');frame.src=`https://www.youtube-nocookie.com/embed/${v.id}`;frame.title=v.title;frame.loading='lazy';frame.referrerPolicy='strict-origin-when-cross-origin';frame.allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';frame.allowFullscreen=true;
        card.append(element('h3',v.title),date,frame,anchor(`https://www.youtube.com/watch?v=${v.id}`,root.dataset.watchLabel,'video-fallback'));grid.append(card);
      }
      section.append(heading,grid);fragment.append(section);
    }
    root.replaceChildren(fragment);root.dataset.updated=data.updatedAt;

  }
  async function refresh() {
    if(document.hidden||location.protocol==='file:')return;
    try {
      let response=await fetch('/api/playlists',{cache:'no-store'});
      if(response.status===404)response=await fetch('../playlist-videos.json',{cache:'no-store'});
      if(!response.ok)throw Error('Unavailable');
      const data=await response.json();
      if(!Array.isArray(data.playlists)||!data.playlists.length)throw Error('No videos');
      // Apply new lists on page load; avoid resetting a video while a visitor watches.
      if(!root.children.length || (!refreshed && data.updatedAt!==root.dataset.updated))render(data);
      status.textContent=data.stale?status.dataset.stale:'';
    } catch {status.textContent=root.children.length?status.dataset.stale:status.dataset.empty;}
    refreshed=true;
  }
  let refreshed=false;
  refresh();
})();
