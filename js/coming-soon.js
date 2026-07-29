const comingSoonCopy={
  en:{title:'OOXME - Coming Soon',home:'Home',headlineFirst:'Much more',headlineSecond:'is coming.'},
  ar:{title:'أوكسمي - قريبًا',home:'الرئيسية',headlineFirst:'المزيد',headlineSecond:'قادم قريبًا.'}
};

let comingSoonLanguage='en';
try{comingSoonLanguage=localStorage.getItem('ooxme-language')==='ar'?'ar':'en'}catch(error){}

const activeCopy=comingSoonCopy[comingSoonLanguage];
document.documentElement.lang=comingSoonLanguage;
document.documentElement.dir=comingSoonLanguage==='ar'?'rtl':'ltr';
document.title=activeCopy.title;
document.querySelectorAll('[data-i18n]').forEach((element)=>{element.textContent=activeCopy[element.dataset.i18n]});
