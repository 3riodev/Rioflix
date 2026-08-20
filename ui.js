// ============ RIOFLIX SHARED UI ============

function requireProfile(){
  const p = DB.getActiveProfile();
  if(!p){ location.href = 'profiles.html'; return null; }
  return p;
}

function renderNavbar(active){
  const p = DB.getActiveProfile();
  const initial = p ? p.name.trim().charAt(0).toUpperCase() : '?';
  const links = [
    ['home.html', t('home'), 'home'],
    ['browse.html?type=movie', t('movies'), 'movies'],
    ['browse.html?type=series', t('series'), 'series'],
    ['categories.html', t('categories'), 'categories'],
    ['newpopular.html', t('newPopular'), 'newpopular'],
    ['mylist.html', t('myList'), 'mylist'],
  ];
  const linksHtml = links.map(([href,label,key])=>
    `<a href="${href}" class="${active===key?'active':''}">${label}</a>`).join('');

  const nav = document.createElement('div');
  nav.innerHTML = `
  <header class="navbar" id="mainNavbar">
    <div class="nav-left">
      <a href="home.html" class="brand">RIOFLIX</a>
      <nav class="nav-links">${linksHtml}</nav>
    </div>
    <div class="nav-right">
      <button class="icon-btn" id="searchBtn" title="${t('search')}" onclick="location.href='search.html'">&#128269;</button>
      <button class="icon-btn" id="notifBtn" title="${t('notifications')}" onclick="toggleNotifPanel()">&#128276;<span id="notifDot" style="display:none;width:7px;height:7px;background:var(--ember);border-radius:50%;position:relative;top:-9px;right:6px;"></span></button>
      <div class="avatar-btn" style="position:relative;cursor:pointer;" onclick="toggleProfileMenu()">
        <div class="avatar-sm" style="background:${p?p.avatarColor:'var(--surface2)'};color:#000;">${initial}</div>
      </div>
    </div>
  </header>
  <div id="notifPanel" style="display:none;position:fixed;top:60px;inset-inline-end:70px;width:320px;max-height:400px;overflow-y:auto;background:var(--surface);border:1px solid var(--line);border-radius:8px;z-index:200;"></div>
  <div id="profileMenu" style="display:none;position:fixed;top:60px;inset-inline-end:20px;width:200px;background:var(--surface);border:1px solid var(--line);border-radius:8px;z-index:200;overflow:hidden;">
    <a href="profiles.html" style="display:block;padding:12px 16px;font-size:13.5px;border-bottom:1px solid var(--line);">${t('manageProfiles')}</a>
    <a href="viewinghistory.html" style="display:block;padding:12px 16px;font-size:13.5px;border-bottom:1px solid var(--line);">${t('viewingHistory')}</a>
    <a href="admin.html" style="display:block;padding:12px 16px;font-size:13.5px;border-bottom:1px solid var(--line);">${t('admin')}</a>
    <a href="#" onclick="switchLang();return false;" style="display:block;padding:12px 16px;font-size:13.5px;">${p&&p.lang==='ar'?'English':'العربية'}</a>
  </div>
  <nav class="bottom-nav">
    <a href="home.html" class="${active==='home'?'active':''}"><span class="bn-icon">&#8962;</span>${t('home')}</a>
    <a href="search.html" class="${active==='search'?'active':''}"><span class="bn-icon">&#128269;</span>${t('search')}</a>
    <a href="newpopular.html" class="${active==='newpopular'?'active':''}"><span class="bn-icon">&#10024;</span>${t('newTab')}</a>
    <a href="mylist.html" class="${active==='mylist'?'active':''}"><span class="bn-icon">&#128209;</span>${t('myList')}</a>
    <a href="profiles.html" class="${active==='profile'?'active':''}"><span class="bn-icon">&#128100;</span>${t('profile')}</a>
  </nav>`;
  document.body.prepend(nav);
  window.addEventListener('scroll', ()=>{
    const el = document.getElementById('mainNavbar');
    if(!el) return;
    el.classList.toggle('scrolled', window.scrollY>30);
  });
  renderNotifPanel();
}

function renderNotifPanel(){
  const panel = document.getElementById('notifPanel');
  if(!panel) return;
  const lang = currentLang();
  const notifs = DB.getNotifications();
  const dot = document.getElementById('notifDot');
  if(dot) dot.style.display = notifs.some(n=>!n.read) ? 'inline-block':'none';
  if(!notifs.length){
    panel.innerHTML = `<div style="padding:20px;color:var(--muted);font-size:13px;text-align:center;">${t('myListEmptySub')}</div>`;
    return;
  }
  panel.innerHTML = notifs.map(n=>`
    <div style="padding:12px 16px;border-bottom:1px solid var(--line);font-size:13px;${n.read?'opacity:.55;':''}">
      ${lang==='ar'?n.textAr:n.textEn}
      <div style="color:var(--muted2);font-size:11px;margin-top:4px;">${timeAgo(n.at)}</div>
    </div>`).join('') +
    `<div style="padding:10px;display:flex;gap:8px;">
      <button class="link-btn" onclick="DB.markAllRead();renderNotifPanel();">Mark as read</button>
      <button class="link-btn danger" onclick="DB.clearNotifications();renderNotifPanel();">Clear all</button>
    </div>`;
}
function toggleNotifPanel(){
  const panel = document.getElementById('notifPanel');
  const menu = document.getElementById('profileMenu');
  if(menu) menu.style.display='none';
  panel.style.display = panel.style.display==='none' ? 'block':'none';
}
function toggleProfileMenu(){
  const menu = document.getElementById('profileMenu');
  const panel = document.getElementById('notifPanel');
  if(panel) panel.style.display='none';
  menu.style.display = menu.style.display==='none' ? 'block':'none';
}
document.addEventListener('click',(e)=>{
  const panel=document.getElementById('notifPanel'), menu=document.getElementById('profileMenu');
  if(panel && !panel.contains(e.target) && e.target.id!=='notifBtn') panel.style.display='none';
  if(menu && !menu.contains(e.target) && !e.target.closest('.avatar-btn')) menu.style.display='none';
});

function switchLang(){
  const p = DB.getActiveProfile();
  const newLang = (p && p.lang==='ar') ? 'en' : 'ar';
  if(p){ DB.updateActiveProfile(pr=>{ pr.lang=newLang; }); }
  localStorage.setItem('rioflix_lang', newLang);
  location.reload();
}

function timeAgo(ts){
  const s = Math.floor((Date.now()-ts)/1000);
  if(s<60) return currentLang()==='ar' ? 'الآن' : 'now';
  const m = Math.floor(s/60); if(m<60) return currentLang()==='ar' ? `منذ ${m} د` : `${m}m ago`;
  const h = Math.floor(m/60); if(h<24) return currentLang()==='ar' ? `منذ ${h} س` : `${h}h ago`;
  const d = Math.floor(h/24); return currentLang()==='ar' ? `منذ ${d} ي` : `${d}d ago`;
}

function renderFooter(){
  const f = document.createElement('div');
  f.className='site-footer';
  f.innerHTML = `<b>RIOFLIX</b> — ${t('madeBy')}`;
  document.body.appendChild(f);
}

function titleDisplayName(tt){
  const lang = currentLang();
  return (lang==='ar' && tt.titleAr) ? tt.titleAr : tt.title;
}
function titleDisplayDesc(tt){
  const lang = currentLang();
  return (lang==='ar' && tt.descriptionAr) ? tt.descriptionAr : tt.description;
}

function totalEpisodesCount(tt){
  if(tt.type!=='series') return 0;
  return (tt.seasons||[]).reduce((s,se)=>s+se.episodes.length,0);
}

// ---------- Card ----------
function cardHtml(tt, opts){
  opts = opts||{};
  const lang = currentLang();
  const name = titleDisplayName(tt);
  const inList = DB.isInMyList(tt.id);
  const like = DB.getLikeState(tt.id);
  let progressHtml='';
  let subHtml = `<span>${tt.year}</span>`;
  if(tt.type==='series'){
    const p = DB.getProgress(tt.id);
    if(p && p.season && p.episode){
      subHtml = `<span>${t('watchedS_E',{s:p.season,e:p.episode})}</span>`;
    } else {
      subHtml = `<span>${t('seasons')}: ${(tt.seasons||[]).length}</span>`;
    }
  }
  const prog = DB.getProgress(tt.id);
  if(prog && prog.duration){
    const pct = Math.min(100, Math.round((prog.time/prog.duration)*100));
    progressHtml = `<div class="card-progress"><i style="width:${pct}%"></i></div>`;
  }
  return `
  <div class="card ${opts.wide?'card-wide':''}" data-id="${tt.id}" onclick="location.href='title.html?id=${tt.id}'">
    <div class="card-top">
      <img src="${tt.poster}" alt="${name}" loading="lazy" onerror="this.style.opacity=0"/>
      ${tt.type==='series'?`<span class="card-badge">${t('series')}</span>`:''}
      ${progressHtml}
    </div>
    <div class="card-body">
      <div class="card-title">${name}</div>
      <div class="card-sub">${subHtml}<span class="dot">•</span><span>&#9733; ${tt.rating||'-'}</span></div>
    </div>
    <div class="card-hover-actions">
      <button class="chip-btn ${inList?'active':''}" title="${t('addToList')}" onclick="event.stopPropagation();quickToggleList(this,'${tt.id}')">${inList?'&#10003;':'&#65291;'}</button>
      <button class="chip-btn ${like==='like'?'active':''}" title="${t('like')}" onclick="event.stopPropagation();quickLike(this,'${tt.id}','like')">&#128077;</button>
      <button class="chip-btn ${like==='dislike'?'active':''}" title="${t('dislike')}" onclick="event.stopPropagation();quickLike(this,'${tt.id}','dislike')">&#128078;</button>
    </div>
  </div>`;
}

function quickToggleList(btn,id){
  const now = DB.toggleMyList(id);
  btn.classList.toggle('active',now);
  btn.innerHTML = now ? '&#10003;' : '&#65291;';
  showToast(now ? t('addToList') : t('removeFromList'));
}
function quickLike(btn,id,kind){
  const current = DB.getLikeState(id);
  DB.setLike(id, current===kind ? null : kind);
  const row = btn.parentElement;
  row.querySelectorAll('.chip-btn').forEach((b,i)=>{ if(i>0) b.classList.remove('active'); });
  if(current!==kind) btn.classList.add('active');
}

// ---------- Row ----------
function renderRow(container, titleText, items, opts){
  opts=opts||{};
  if(!items || !items.length) return;
  const rowId = 'row_'+Math.random().toString(36).slice(2,8);
  const wrap = document.createElement('div');
  wrap.className='row';
  const isTop10 = !!opts.top10;
  wrap.innerHTML = `
    <div class="row-head"><span class="row-title">${titleText}</span></div>
    <div class="row-track-wrap">
      <button class="row-arrow left" onclick="scrollRow('${rowId}',-1)">&#8249;</button>
      <div class="row-track" id="${rowId}">
        ${items.map((tt,i)=> isTop10 ? topTenCardHtml(tt,i+1) : cardHtml(tt,{wide:opts.wide})).join('')}
      </div>
      <button class="row-arrow right" onclick="scrollRow('${rowId}',1)">&#8250;</button>
    </div>`;
  container.appendChild(wrap);
}
function topTenCardHtml(tt,rank){
  const name = titleDisplayName(tt);
  return `<div class="card top10-card" onclick="location.href='title.html?id=${tt.id}'">
    <span class="top10-rank">${rank}</span>
    <div style="flex:1;min-width:0;">
      <div class="card-top" style="border-radius:6px;"><img src="${tt.poster}" alt="${name}" loading="lazy"/></div>
      <div class="card-body"><div class="card-title">${name}</div></div>
    </div>
  </div>`;
}
function scrollRow(id,dir){
  const el = document.getElementById(id);
  const rtl = document.documentElement.dir==='rtl';
  const amt = 640 * (rtl ? -dir : dir);
  el.scrollBy({left:amt, behavior:'smooth'});
}

// ---------- Skeletons ----------
function heroSkeleton(){ return `<div class="skel skel-hero"></div>`; }
function rowSkeleton(){
  return `<div class="row"><div class="row-head"><div class="skel skel-text" style="width:160px;"></div></div>
    <div class="skel-row">${Array(6).fill('<div class="skel skel-card"></div>').join('')}</div></div>`;
}

// ---------- Toast ----------
function showToast(msg){
  const el = document.createElement('div');
  el.className='toast'; el.textContent=msg;
  document.body.appendChild(el);
  setTimeout(()=>el.remove(),2200);
}

// ---------- Modal ----------
function openModal(innerHtml, opts){
  opts=opts||{};
  const overlay = document.createElement('div');
  overlay.className='modal-overlay';
  overlay.id='activeModal';
  overlay.innerHTML = `<div class="modal ${opts.lg?'modal-lg':''}" style="position:relative;" onclick="event.stopPropagation()">
    <button class="modal-close" onclick="closeModal()">&#10005;</button>${innerHtml}</div>`;
  overlay.onclick = closeModal;
  document.body.appendChild(overlay);
  return overlay;
}
function closeModal(){ const m=document.getElementById('activeModal'); if(m) m.remove(); }

// ---------- Stars ----------
function starsHtml(id, value, size){
  let html = `<span class="stars ${size||''}" data-target="${id}">`;
  for(let i=1;i<=5;i++){
    html += `<span class="star ${i<=(value||0)?'filled':''}" data-val="${i}" onclick="onStarClick(event,'${id}')">&#9733;</span>`;
  }
  html += `</span>`;
  return html;
}
window._starHandlers = {};
function onStarClick(e,id){
  const val = parseInt(e.target.getAttribute('data-val'),10);
  if(window._starHandlers[id]) window._starHandlers[id](val);
  const holder = e.target.closest('.stars');
  holder.querySelectorAll('.star').forEach(s=>{
    s.classList.toggle('filled', parseInt(s.getAttribute('data-val'),10) <= val);
  });
}

// ---------- Empty / Error states ----------
function emptyStateHtml(title, sub){
  return `<div class="empty-state"><h3>${title}</h3><p>${sub}</p></div>`;
}
function errorStateHtml(){
  return `<div class="empty-state"><h3>${t('errorGeneric')}</h3>
    <button class="btn btn-secondary" style="margin-top:14px;" onclick="location.reload()">${t('retry')}</button></div>`;
}

// ---------- Page boot helper ----------
function bootPage(activeNav){
  DB.init();
  applyDirection();
  document.body.classList.toggle('lang-ar', currentLang()==='ar');
  const p = requireProfile();
  if(!p) return null;
  renderNavbar(activeNav);
  return p;
}
