const repairLocalizedText=window.repairLocalizedText||(window.repairLocalizedText=(root=document.body)=>{const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let node;while(node=walker.nextNode()){const value=node.nodeValue;if(/[ÃÂØÙâ]/.test(value)){try{node.nodeValue=decodeURIComponent(escape(value))}catch(error){}}}});
new MutationObserver(()=>repairLocalizedText()).observe(document.body,{childList:true,subtree:true,characterData:true});
repairLocalizedText();
const comingSoonCopy={
  en:{title:'OOXME - Coming Soon',home:'Home',headlineFirst:'Much more',headlineSecond:'is coming.',languageAria:'Switch to Arabic'},
  ar:{title:'أوكسمي - قريبًا',home:'الرئيسية',headlineFirst:'المزيد',headlineSecond:'قادم قريبًا.',languageAria:'التبديل إلى الإنجليزية'}
};

let comingSoonLanguage='en';
try{comingSoonLanguage=localStorage.getItem('ooxme-language')==='ar'?'ar':'en'}catch(error){}

const comingSoonLanguageButton=document.querySelector('.language-toggle');

function setComingSoonLanguage(next){
  comingSoonLanguage=next;
  const activeCopy=comingSoonCopy[next];
  document.documentElement.lang=next;
  document.documentElement.dir=next==='ar'?'rtl':'ltr';
  document.title=activeCopy.title;
  document.querySelectorAll('[data-i18n]').forEach((element)=>{element.textContent=activeCopy[element.dataset.i18n]});
  comingSoonLanguageButton.setAttribute('aria-label',activeCopy.languageAria);
  try{localStorage.setItem('ooxme-language',next)}catch(error){}
}

comingSoonLanguageButton.addEventListener('click',()=>setComingSoonLanguage(comingSoonLanguage==='en'?'ar':'en'));
setComingSoonLanguage(comingSoonLanguage);
