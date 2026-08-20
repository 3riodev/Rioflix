// ============ RIOFLIX DATA LAYER ============
// Everything persists in localStorage on the visitor's own browser (per-device).
// Titles support TWO source kinds, chosen per movie / per episode:
//   { kind:'iframe', url:'https://...' }   -> embedded in an <iframe>
//   { kind:'video',  url:'https://....m3u8 | .mp4', subtitles:[{lang,label,url}] } -> native <video> (+hls.js for m3u8)

const DB_KEYS = {
  profiles:'rioflix_profiles',
  titles:'rioflix_titles',
  activeProfile:'rioflix_active_profile',
  notifications:'rioflix_notifications',
};

const DB = {

  // ---------- bootstrap ----------
  init(){
    if(!localStorage.getItem(DB_KEYS.titles)){
      localStorage.setItem(DB_KEYS.titles, JSON.stringify(SEED_TITLES));
    }
    if(!localStorage.getItem(DB_KEYS.profiles)){
      localStorage.setItem(DB_KEYS.profiles, JSON.stringify(SEED_PROFILES));
    }
    if(!localStorage.getItem(DB_KEYS.notifications)){
      localStorage.setItem(DB_KEYS.notifications, JSON.stringify(SEED_NOTIFS));
    }
  },

  // ---------- generic ----------
  _get(key){ try{ return JSON.parse(localStorage.getItem(key)) || []; }catch(e){ return []; } },
  _set(key,val){ localStorage.setItem(key, JSON.stringify(val)); },

  // ---------- titles ----------
  getTitles(){ return this._get(DB_KEYS.titles); },
  saveTitles(list){ this._set(DB_KEYS.titles,list); },
  getTitle(id){ return this.getTitles().find(x=>x.id===id); },
  upsertTitle(title){
    const list = this.getTitles();
    const i = list.findIndex(x=>x.id===title.id);
    if(i>-1) list[i]=title; else list.push(title);
    this.saveTitles(list);
  },
  deleteTitle(id){ this.saveTitles(this.getTitles().filter(x=>x.id!==id)); },

  // ---------- profiles ----------
  getProfiles(){ return this._get(DB_KEYS.profiles); },
  saveProfiles(list){ this._set(DB_KEYS.profiles,list); },
  getProfile(id){ return this.getProfiles().find(p=>p.id===id); },
  upsertProfile(p){
    const list=this.getProfiles();
    const i=list.findIndex(x=>x.id===p.id);
    if(i>-1) list[i]=p; else list.push(p);
    this.saveProfiles(list);
  },
  deleteProfile(id){ this.saveProfiles(this.getProfiles().filter(p=>p.id!==id)); },
  newProfileTemplate(name){
    return {
      id:'p_'+Date.now(), name: name||'Profile', avatarColor: ['#FF5A2B','#F4C430','#4CA1FF','#7CE38B','#C77CFF'][Math.floor(Math.random()*5)],
      lang: localStorage.getItem('rioflix_lang')||'ar', kids:false, pin:'',
      myList:[], likes:{}, dislikes:{}, ratings:{}, // ratings[titleId] = {overall, episodes:{ep_id:val}}
      continueWatching:{}, // continueWatching[titleId] = {time,duration,season,episode,updatedAt}
      history:[], folders:[]
    };
  },

  getActiveProfile(){
    const id = localStorage.getItem(DB_KEYS.activeProfile);
    if(!id) return null;
    return this.getProfile(id);
  },
  setActiveProfile(id){ localStorage.setItem(DB_KEYS.activeProfile,id); },
  clearActiveProfile(){ localStorage.removeItem(DB_KEYS.activeProfile); },

  updateActiveProfile(mutatorFn){
    const p = this.getActiveProfile();
    if(!p) return;
    mutatorFn(p);
    this.upsertProfile(p);
    return p;
  },

  // ---------- My List ----------
  toggleMyList(titleId){
    let inList=false;
    this.updateActiveProfile(p=>{
      p.myList = p.myList||[];
      const i = p.myList.indexOf(titleId);
      if(i>-1){ p.myList.splice(i,1); inList=false; } else { p.myList.push(titleId); inList=true; }
    });
    return inList;
  },
  isInMyList(titleId){
    const p=this.getActiveProfile(); if(!p) return false;
    return (p.myList||[]).includes(titleId);
  },

  // ---------- Likes ----------
  setLike(titleId,val){ // val: 'like' | 'dislike' | null
    this.updateActiveProfile(p=>{
      p.likes=p.likes||{}; p.dislikes=p.dislikes||{};
      delete p.likes[titleId]; delete p.dislikes[titleId];
      if(val==='like') p.likes[titleId]=true;
      if(val==='dislike') p.dislikes[titleId]=true;
    });
  },
  getLikeState(titleId){
    const p=this.getActiveProfile(); if(!p) return null;
    if(p.likes && p.likes[titleId]) return 'like';
    if(p.dislikes && p.dislikes[titleId]) return 'dislike';
    return null;
  },

  // ---------- Ratings ----------
  setRating(titleId, overall){
    this.updateActiveProfile(p=>{
      p.ratings=p.ratings||{};
      p.ratings[titleId]=p.ratings[titleId]||{episodes:{}};
      p.ratings[titleId].overall=overall;
    });
  },
  setEpisodeRating(titleId, epId, val){
    this.updateActiveProfile(p=>{
      p.ratings=p.ratings||{};
      p.ratings[titleId]=p.ratings[titleId]||{episodes:{}};
      p.ratings[titleId].episodes = p.ratings[titleId].episodes||{};
      p.ratings[titleId].episodes[epId]=val;
    });
  },
  getRating(titleId){
    const p=this.getActiveProfile(); if(!p) return null;
    return (p.ratings && p.ratings[titleId]) || null;
  },

  // ---------- Continue Watching ----------
  saveProgress(titleId, data){ // {time,duration,season,episode}
    this.updateActiveProfile(p=>{
      p.continueWatching = p.continueWatching||{};
      if(data.duration && data.time/data.duration > 0.95){
        delete p.continueWatching[titleId]; // finished -> drop from Continue Watching
      } else {
        p.continueWatching[titleId] = Object.assign({}, data, {updatedAt:Date.now()});
      }
      // history log
      p.history = p.history||[];
      p.history = p.history.filter(h=>h.titleId!==titleId);
      p.history.unshift({titleId, season:data.season, episode:data.episode, time:data.time, duration:data.duration, at:Date.now()});
      p.history = p.history.slice(0,200);
    });
  },
  getProgress(titleId){
    const p=this.getActiveProfile(); if(!p) return null;
    return (p.continueWatching && p.continueWatching[titleId]) || null;
  },
  getContinueWatchingList(){
    const p=this.getActiveProfile(); if(!p) return [];
    const cw = p.continueWatching||{};
    return Object.keys(cw).map(tid=>({title:this.getTitle(tid), progress:cw[tid]}))
      .filter(x=>x.title)
      .sort((a,b)=>b.progress.updatedAt-a.progress.updatedAt);
  },

  // ---------- Folders (custom user lists) ----------
  createFolder(name){
    let folder;
    this.updateActiveProfile(p=>{
      p.folders=p.folders||[];
      folder={id:'f_'+Date.now(), name, items:[]};
      p.folders.push(folder);
    });
    return folder;
  },
  deleteFolder(folderId){
    this.updateActiveProfile(p=>{ p.folders=(p.folders||[]).filter(f=>f.id!==folderId); });
  },
  toggleFolderItem(folderId,titleId){
    this.updateActiveProfile(p=>{
      const f=(p.folders||[]).find(x=>x.id===folderId); if(!f) return;
      const i=f.items.indexOf(titleId);
      if(i>-1) f.items.splice(i,1); else f.items.push(titleId);
    });
  },
  getFolders(){ const p=this.getActiveProfile(); return p? (p.folders||[]) : []; },

  // ---------- Notifications ----------
  getNotifications(){ return this._get(DB_KEYS.notifications); },
  markAllRead(){ const n=this.getNotifications().map(x=>Object.assign({},x,{read:true})); this._set(DB_KEYS.notifications,n); },
  clearNotifications(){ this._set(DB_KEYS.notifications,[]); },

  // ---------- Recommendations (simple heuristic engine) ----------
  getRecommendations(limit){
    const p=this.getActiveProfile();
    const all=this.getTitles();
    if(!p) return all.slice(0,limit||10);
    const genreScore={};
    const boost=(genres,weight)=>{ (genres||[]).forEach(g=>{ genreScore[g]=(genreScore[g]||0)+weight; }); };
    Object.keys(p.likes||{}).forEach(tid=>{ const tt=this.getTitle(tid); if(tt) boost(tt.genres,3); });
    (p.history||[]).forEach(h=>{ const tt=this.getTitle(h.titleId); if(tt) boost(tt.genres,1.5); });
    (p.myList||[]).forEach(tid=>{ const tt=this.getTitle(tid); if(tt) boost(tt.genres,1); });
    Object.keys(p.dislikes||{}).forEach(tid=>{ const tt=this.getTitle(tid); if(tt) boost(tt.genres,-2); });
    const scored = all.map(tt=>({tt, score:(tt.genres||[]).reduce((s,g)=>s+(genreScore[g]||0),0)}));
    scored.sort((a,b)=>b.score-a.score);
    return scored.slice(0,limit||10).map(x=>x.tt);
  },
  getBecauseYouWatched(){
    const p=this.getActiveProfile(); if(!p || !(p.history||[]).length) return null;
    const last = p.history[0];
    const seed = this.getTitle(last.titleId);
    if(!seed) return null;
    const similar = this.getTitles().filter(x=>x.id!==seed.id && (x.genres||[]).some(g=>(seed.genres||[]).includes(g)));
    return {seedTitle:seed, items:similar.slice(0,12)};
  },
  getSimilar(title,limit){
    return this.getTitles().filter(x=>x.id!==title.id && (x.genres||[]).some(g=>(title.genres||[]).includes(g))).slice(0,limit||12);
  },

  // ---------- Search ----------
  // Simple bilingual search: lets "spider" find English titles and "سبايدر" find Arabic titles,
  // and normalizes so language differences don't block matching against whichever title field exists.
  search(query){
    if(!query || !query.trim()) return [];
    const q = query.trim().toLowerCase();
    return this.getTitles().filter(tt=>{
      const hay = [tt.title,tt.titleAr,tt.originalTitle,tt.description,tt.descriptionAr,
        ...(tt.cast||[]),tt.director,...(tt.genres||[])].filter(Boolean).join(' ').toLowerCase();
      return hay.includes(q);
    });
  },
};

// ============ SEED DATA ============
// Video sources below are real, freely-licensed (Creative Commons) demo assets from the
// Blender Foundation open movie project + a standard CC-licensed HLS test stream, so the
// catalog works out of the box. Replace/add your own titles from the Admin panel — either
// with iframe embed links or direct mp4/m3u8 links.

const SEED_TITLES = [
  {
    id:'bigbuckbunny', type:'movie',
    title:'Big Buck Bunny', titleAr:'باك باني الكبير', originalTitle:'Big Buck Bunny', year:2008,
    rating:8.0, ageRating:'PG', genres:['Comedy','Animation','Family'], country:'NL', language:'English',
    description:'A giant rabbit deals with three bullying rodents, in a lush computer-generated forest.',
    descriptionAr:'أرنب عملاق يواجه ثلاثة قوارض متنمرة في غابة خلابة مُولَّدة بالحاسوب.',
    poster:'https://peach.blender.org/wp-content/uploads/title_anouncement.jpg?x11217',
    backdrop:'https://peach.blender.org/wp-content/uploads/bbb-splash.png?x11217',
    cast:['Blender Foundation'], director:'Sacha Goedegebure', runtime:10,
    trailer:null,
    source:{kind:'video', url:'https://download.blender.org/peach/bigbuckbunny_movies/BigBuckBunny_320x180.mp4', subtitles:[]},
  },
  {
    id:'sintel', type:'movie',
    title:'Sintel', titleAr:'سينتل', originalTitle:'Sintel', year:2010,
    rating:8.5, ageRating:'PG-13', genres:['Fantasy','Adventure','Drama'], country:'NL', language:'English',
    description:'A lonely young woman, Sintel, helps and befriends a dragon, whom she calls Scales.',
    descriptionAr:'فتاة شابة وحيدة تدعى سينتل تساعد تنينًا صغيرًا تسميه سكيلز وتصبح صديقته، ثم تبحث عنه بعد أن يُخطف.',
    poster:'https://durian.blender.org/wp-content/uploads/2010/06/sintel_poster.jpg',
    backdrop:'https://durian.blender.org/wp-content/uploads/2010/06/05_comp_lit2.jpg',
    cast:['Halina Reijn','Thom Hoffman'], director:'Colin Levy', runtime:15,
    trailer:null,
    source:{kind:'video', url:'https://download.blender.org/durian/movies/sintel-1024-surround.mp4', subtitles:[]},
  },
  {
    id:'tearsofsteel', type:'movie',
    title:'Tears of Steel', titleAr:'دموع من فولاذ', originalTitle:'Tears of Steel', year:2012,
    rating:7.8, ageRating:'PG-13', genres:['Sci-Fi','Action'], country:'NL', language:'English',
    description:'In a future Amsterdam overrun by robots, a group of warriors and scientists gather to try to reverse history.',
    descriptionAr:'في أمستردام المستقبل التي اجتاحتها الروبوتات، تجتمع مجموعة من المحاربين والعلماء لمحاولة عكس مسار التاريخ.',
    poster:'https://mango.blender.org/wp-content/uploads/2012/06/tos1080.jpg',
    backdrop:'https://mango.blender.org/wp-content/uploads/2012/06/01_thom_celia_scaled.jpg',
    cast:['Derek de Lint','Sergio Hasselbaink','Rogier Schippers'], director:'Ian Hubert', runtime:12,
    trailer:null,
    // Demonstrates the M3U8/HLS direct-file path (adaptive streaming), same open-movie project, CC-licensed.
    source:{kind:'video', url:'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', subtitles:[]},
  },
  {
    id:'elephantsdream', type:'movie',
    title:"Elephants Dream", titleAr:'حلم الأفيال', originalTitle:"Elephants Dream", year:2006,
    rating:7.6, ageRating:'PG', genres:['Sci-Fi','Fantasy','Animation'], country:'NL', language:'English',
    description:'Two characters explore a strange mechanical world, and clash over their differing views of it.',
    descriptionAr:'شخصيتان تستكشفان عالمًا ميكانيكيًا غريبًا، وتختلفان حول رؤيتهما له.',
    poster:'https://upload.wikimedia.org/wikipedia/commons/2/28/Elephants_Dream_poster.jpg',
    backdrop:'https://upload.wikimedia.org/wikipedia/commons/e/e0/Elephants_Dream_s5_both.jpg',
    cast:['Cas Jansen','Tygo Gernandt'], director:'Bassam Kurdali', runtime:11,
    trailer:null,
    source:{kind:'video', url:'https://archive.org/download/ElephantsDream/ed_1024_512kb.mp4', subtitles:[]},
  },
  {
    id:'blender-anthology', type:'series',
    title:'Rioflix Open Studio', titleAr:'استوديو Rioflix المفتوح', originalTitle:'Rioflix Open Studio', year:2024,
    rating:8.2, ageRating:'PG', genres:['Animation','Sci-Fi','Fantasy'], country:'NL', language:'English',
    description:'An anthology of open, Creative-Commons short films — a demo series showing how Rioflix handles seasons, episodes and per-episode ratings.',
    descriptionAr:'مختارات من أفلام قصيرة مفتوحة المصدر (Creative Commons) — مسلسل تجريبي يوضح كيف يتعامل Rioflix مع المواسم والحلقات وتقييم كل حلقة على حدة.',
    poster:'https://peach.blender.org/wp-content/uploads/title_anouncement.jpg?x11217',
    backdrop:'https://mango.blender.org/wp-content/uploads/2012/06/01_thom_celia_scaled.jpg',
    cast:['Blender Foundation Artists'], creator:'Blender Foundation',
    seasons:[
      { number:1, episodes:[
        { id:'os_s1e1', number:1, title:'Big Buck Bunny', titleAr:'باك باني الكبير', description:'A giant rabbit deals with three bullying rodents.', descriptionAr:'أرنب عملاق يواجه ثلاثة قوارض متنمرة.', thumbnail:'https://peach.blender.org/wp-content/uploads/title_anouncement.jpg?x11217', runtime:10, releaseDate:'2008-04-10',
          source:{kind:'video', url:'https://download.blender.org/peach/bigbuckbunny_movies/BigBuckBunny_320x180.mp4', subtitles:[]} },
        { id:'os_s1e2', number:2, title:'Elephants Dream', titleAr:'حلم الأفيال', description:'Two characters explore a strange mechanical world.', descriptionAr:'شخصيتان تستكشفان عالمًا ميكانيكيًا غريبًا.', thumbnail:'https://upload.wikimedia.org/wikipedia/commons/2/28/Elephants_Dream_poster.jpg', runtime:11, releaseDate:'2006-03-24',
          source:{kind:'video', url:'https://archive.org/download/ElephantsDream/ed_1024_512kb.mp4', subtitles:[]} },
      ]},
      { number:2, episodes:[
        { id:'os_s2e1', number:1, title:'Sintel', titleAr:'سينتل', description:'A lonely young woman helps and befriends a baby dragon.', descriptionAr:'فتاة وحيدة تساعد تنينًا صغيرًا وتصبح صديقته.', thumbnail:'https://durian.blender.org/wp-content/uploads/2010/06/sintel_poster.jpg', runtime:15, releaseDate:'2010-09-30',
          source:{kind:'video', url:'https://download.blender.org/durian/movies/sintel-1024-surround.mp4', subtitles:[]} },
        { id:'os_s2e2', number:2, title:'Tears of Steel', titleAr:'دموع من فولاذ', description:'Warriors and scientists try to reverse history in future Amsterdam.', descriptionAr:'محاربون وعلماء يحاولون عكس مسار التاريخ في أمستردام المستقبل.', thumbnail:'https://mango.blender.org/wp-content/uploads/2012/06/tos1080.jpg', runtime:12, releaseDate:'2012-09-26',
          // Demonstrates the IFRAME EMBED path for an episode:
          source:{kind:'iframe', url:'https://archive.org/embed/tears-of-steel'} },
      ]},
    ],
  },
];

const SEED_PROFILES = [
  Object.assign(DB.newProfileTemplate('Ryoof'), {id:'p_owner', lang:'ar', avatarColor:'#FF5A2B'}),
];

const SEED_NOTIFS = [
  {id:'n1', textAr:'تمت إضافة فيلم جديد: Tears of Steel', textEn:'New movie added: Tears of Steel', read:false, at:Date.now()-3600000},
  {id:'n2', textAr:'مسلسل جديد بانتظارك: Rioflix Open Studio', textEn:'A new series awaits: Rioflix Open Studio', read:false, at:Date.now()-7200000},
];
