// ============ RIOFLIX i18n ============
const I18N = {
  ar: {
    dir:'rtl',
    whosWatching:"من يشاهد؟", addProfile:"إضافة ملف شخصي", manageProfiles:"إدارة الملفات الشخصية",
    home:"الرئيسية", movies:"أفلام", series:"مسلسلات", categories:"التصنيفات", newPopular:"جديد ورائج", myList:"قائمتي",
    search:"بحث", notifications:"الإشعارات", profile:"الملف الشخصي", newTab:"جديد",
    play:"تشغيل", moreInfo:"مزيد من المعلومات", addToList:"أضف إلى قائمتي", removeFromList:"إزالة من القائمة",
    like:"إعجاب", dislike:"عدم إعجاب", share:"مشاركة",
    continueWatching:"متابعة المشاهدة", trendingNow:"الأكثر رواجًا الآن", top10:"الأفضل 10 على Rioflix",
    newOnRioflix:"جديد على Rioflix", recentlyAdded:"أضيف مؤخرًا", popularMovies:"أفلام رائجة", popularSeries:"مسلسلات رائجة",
    arabicMovies:"أفلام عربية", arabicSeries:"مسلسلات عربية", becauseYouWatched:"لأنك شاهدت",
    recommendedForYou:"موصى به لك", moreLikeThis:"أعمال مشابهة", yourNextWatch:"ما تشاهده تاليًا",
    season:"الموسم", episode:"الحلقة", episodes:"الحلقات", seasons:"المواسم", cast:"طاقم التمثيل", director:"المخرج", creator:"صانع العمل",
    languages:"اللغات", subtitles:"الترجمة", quality:"الجودة", runtime:"المدة", genres:"الأنواع",
    rateThis:"قيّم هذا العمل", yourRating:"تقييمك", overallRating:"التقييم العام", rateEpisode:"قيّم الحلقة",
    myListEmpty:"قائمتك فارغة", myListEmptySub:"أضف أفلامًا ومسلسلات لمشاهدتها لاحقًا.",
    noResults:"لم نجد نتائج مطابقة", noResultsSub:"جرّب كلمات بحث أخرى أو تصفح التصنيفات.",
    searchPlaceholder:"ابحث عن أفلام، مسلسلات، ممثلين...",
    settings:"الإعدادات", account:"الحساب", playback:"التشغيل", audio:"الصوت", parentalControls:"الرقابة الأبوية",
    viewingHistory:"سجل المشاهدة", devices:"الأجهزة", pin:"الرمز السري", language:"اللغة",
    resumeFrom:"استئناف من", nextEpisodeIn:"الحلقة التالية بعد", playNow:"تشغيل الآن", cancel:"إلغاء", nextEpisode:"الحلقة التالية",
    kidsMode:"وضع الأطفال", addName:"الاسم", save:"حفظ", delete:"حذف", edit:"تعديل", close:"إغلاق",
    myFolders:"ملفاتي", createFolder:"إنشاء ملف", folderName:"اسم الملف", addToFolder:"أضف إلى ملف",
    admin:"لوحة التحكم", totalMovies:"إجمالي الأفلام", totalSeries:"إجمالي المسلسلات", totalEpisodes:"إجمالي الحلقات",
    addMovie:"إضافة فيلم", addSeries:"إضافة مسلسل", videoSource:"مصدر الفيديو", embedIframe:"رابط سيرفر مضمّن (Iframe)",
    directFile:"ملف فيديو مباشر (MP4 / M3U8)", errorGeneric:"حدث خطأ، حاول مرة أخرى.", retry:"إعادة المحاولة",
    madeBy:"صنع بواسطة ريوف", ageRating:"التصنيف العمري", year:"السنة", allCat:"الكل",
    watchedS_E:"الموسم {s} • الحلقة {e}",
  },
  en: {
    dir:'ltr',
    whosWatching:"Who's watching?", addProfile:"Add Profile", manageProfiles:"Manage Profiles",
    home:"Home", movies:"Movies", series:"Series", categories:"Categories", newPopular:"New & Popular", myList:"My List",
    search:"Search", notifications:"Notifications", profile:"Profile", newTab:"New",
    play:"Play", moreInfo:"More Info", addToList:"Add to My List", removeFromList:"Remove from List",
    like:"Like", dislike:"Dislike", share:"Share",
    continueWatching:"Continue Watching", trendingNow:"Trending Now", top10:"Top 10 on Rioflix",
    newOnRioflix:"New on Rioflix", recentlyAdded:"Recently Added", popularMovies:"Popular Movies", popularSeries:"Popular Series",
    arabicMovies:"Arabic Movies", arabicSeries:"Arabic Series", becauseYouWatched:"Because You Watched",
    recommendedForYou:"Recommended For You", moreLikeThis:"More Like This", yourNextWatch:"Your Next Watch",
    season:"Season", episode:"Episode", episodes:"Episodes", seasons:"Seasons", cast:"Cast", director:"Director", creator:"Creator",
    languages:"Languages", subtitles:"Subtitles", quality:"Quality", runtime:"Runtime", genres:"Genres",
    rateThis:"Rate this title", yourRating:"Your rating", overallRating:"Overall Rating", rateEpisode:"Rate Episode",
    myListEmpty:"Your list is empty", myListEmptySub:"Add movies and shows to watch later.",
    noResults:"No matches found", noResultsSub:"Try different keywords or browse categories.",
    searchPlaceholder:"Search movies, shows, actors...",
    settings:"Settings", account:"Account", playback:"Playback", audio:"Audio", parentalControls:"Parental Controls",
    viewingHistory:"Viewing History", devices:"Devices", pin:"PIN", language:"Language",
    resumeFrom:"Resume from", nextEpisodeIn:"Next episode in", playNow:"Play Now", cancel:"Cancel", nextEpisode:"Next Episode",
    kidsMode:"Kids Mode", addName:"Name", save:"Save", delete:"Delete", edit:"Edit", close:"Close",
    myFolders:"My Folders", createFolder:"Create Folder", folderName:"Folder name", addToFolder:"Add to Folder",
    admin:"Admin", totalMovies:"Total Movies", totalSeries:"Total Series", totalEpisodes:"Total Episodes",
    addMovie:"Add Movie", addSeries:"Add Series", videoSource:"Video Source", embedIframe:"Embed Server Link (Iframe)",
    directFile:"Direct Video File (MP4 / M3U8)", errorGeneric:"Something went wrong. Please try again.", retry:"Retry",
    madeBy:"Made by Rioof", ageRating:"Age Rating", year:"Year", allCat:"All",
    watchedS_E:"S{s} • E{e}",
  }
};

function currentLang(){
  const p = DB.getActiveProfile();
  return (p && p.lang) || localStorage.getItem('rioflix_lang') || 'ar';
}
function t(key, vars){
  const lang = currentLang();
  let str = (I18N[lang] && I18N[lang][key]) || I18N.ar[key] || key;
  if(vars){ Object.keys(vars).forEach(k=>{ str = str.replace('{'+k+'}', vars[k]); }); }
  return str;
}
function applyDirection(){
  const lang = currentLang();
  document.documentElement.lang = lang;
  document.documentElement.dir = I18N[lang].dir;
}
