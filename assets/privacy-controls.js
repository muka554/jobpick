(function(){
  'use strict';
  var KEY='jobhub_privacy_choice_v1', GA='G-HP8NJBF7K8';
  var state;
  var COPY={
    en:{dialog:'Privacy choices',title:'Your privacy choices',body:'We load optional analytics only if you choose to allow it. JobPick does not currently serve ads, and this choice is not used for advertising. You can continue with essential site functions only and change this choice at any time.',policy:'Read the Privacy Policy',essential:'Essential only',accept:'Accept optional analytics',settings:'Privacy choices',settingsAria:'Change privacy choices'},
    ar:{dialog:'خيارات الخصوصية',title:'خيارات الخصوصية الخاصة بك',body:'نحمّل التحليلات الاختيارية فقط إذا اخترت السماح بها. لا يعرض JobPick إعلانات حاليًا ولا يُستخدم هذا الاختيار للإعلانات. يمكنك الاستمرار باستخدام وظائف الموقع الأساسية فقط وتغيير هذا الاختيار في أي وقت.',policy:'اقرأ سياسة الخصوصية',essential:'الأساسية فقط',accept:'قبول التحليلات الاختيارية',settings:'خيارات الخصوصية',settingsAria:'تغيير خيارات الخصوصية'},
    hi:{dialog:'गोपनीयता विकल्प',title:'आपके गोपनीयता विकल्प',body:'हम वैकल्पिक एनालिटिक्स केवल आपकी अनुमति पर लोड करते हैं। JobPick वर्तमान में विज्ञापन नहीं दिखाता और इस विकल्प का उपयोग विज्ञापन के लिए नहीं होता। आप केवल आवश्यक साइट सुविधाओं के साथ जारी रख सकते हैं और इस विकल्प को कभी भी बदल सकते हैं।',policy:'गोपनीयता नीति पढ़ें',essential:'केवल आवश्यक',accept:'वैकल्पिक एनालिटिक्स स्वीकार करें',settings:'गोपनीयता विकल्प',settingsAria:'गोपनीयता विकल्प बदलें'},
    ur:{dialog:'رازداری کے اختیارات',title:'آپ کے رازداری کے اختیارات',body:'ہم اختیاری تجزیات صرف آپ کی اجازت پر لوڈ کرتے ہیں۔ JobPick فی الحال اشتہارات نہیں دکھاتا اور یہ انتخاب اشتہارات کے لیے استعمال نہیں ہوتا۔ آپ صرف ضروری سائٹ خصوصیات کے ساتھ جاری رہ سکتے ہیں اور اس انتخاب کو کسی بھی وقت تبدیل کر سکتے ہیں۔',policy:'رازداری کی پالیسی پڑھیں',essential:'صرف ضروری',accept:'اختیاری تجزیات قبول کریں',settings:'رازداری کے اختیارات',settingsAria:'رازداری کے اختیارات تبدیل کریں'}
  };
  try{state=localStorage.getItem(KEY);}catch(e){state=null;}

  function language(){return COPY[document.documentElement.lang]?document.documentElement.lang:'en';}
  function copy(){return COPY[language()]||COPY.en;}
  function setClass(){
    document.documentElement.classList.toggle('jobhub-consent-granted',state==='accepted');
    document.documentElement.classList.toggle('jobhub-consent-essential',state!=='accepted');
  }
  function loadScript(src){
    return new Promise(function(resolve){
      if(document.querySelector('script[src="'+src+'"]'))return resolve();
      var s=document.createElement('script');
      s.src=src;s.async=true;s.onload=s.onerror=resolve;document.head.appendChild(s);
    });
  }
  function runAnalytics(){
    if(window.__jobhubAnalytics)return;
    window.__jobhubAnalytics=true;window.dataLayer=window.dataLayer||[];
    window.gtag=function(){window.dataLayer.push(arguments);};
    window.gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'granted'});
    loadScript('https://www.googletagmanager.com/gtag/js?id='+GA).then(function(){window.gtag('js',new Date());window.gtag('config',GA,{anonymize_ip:true});});
  }
  function removeBanner(){var el=document.getElementById('jobhub-consent-banner');if(el)el.remove();var settingsButton=document.getElementById('jobhub-privacy-settings');if(settingsButton)settingsButton.hidden=false;}
  function decide(value){state=value;try{localStorage.setItem(KEY,value);}catch(e){}setClass();removeBanner();if(state==='accepted')runAnalytics();}
  function banner(){
    if(state)return;
    removeBanner();
    var t=copy(),el=document.createElement('section');
    el.id='jobhub-consent-banner';el.setAttribute('role','dialog');el.setAttribute('aria-modal','false');el.setAttribute('aria-label',t.dialog);var settingsButton=document.getElementById('jobhub-privacy-settings');if(settingsButton)settingsButton.hidden=true;
    el.innerHTML='<div><strong>'+t.title+'</strong><p>'+t.body+'</p><a href="/privacy-policy/">'+t.policy+'</a></div><div class="jobhub-consent-actions"><button type="button" data-choice="essential">'+t.essential+'</button><button type="button" class="jobhub-accept" data-choice="accepted">'+t.accept+'</button></div>';
    document.body.appendChild(el);
    el.querySelectorAll('button[data-choice]').forEach(function(b){b.addEventListener('click',function(){decide(b.dataset.choice);});});
  }
  function settings(){
    var t=copy(),b=document.getElementById('jobhub-privacy-settings');
    if(!b){
      b=document.createElement('button');b.type='button';b.id='jobhub-privacy-settings';
      b.addEventListener('click',function(){try{localStorage.removeItem(KEY);}catch(e){}state=null;setClass();banner();var first=document.querySelector('#jobhub-consent-banner button');if(first)first.focus();});
      document.body.appendChild(b);
    }
    b.textContent=t.settings;b.setAttribute('aria-label',t.settingsAria);b.hidden=!state;
  }
  function refreshLanguage(){settings();if(!state)banner();}
  var style=document.createElement('style');
  style.textContent='#jobhub-consent-banner{position:fixed;z-index:9999;left:max(14px,env(safe-area-inset-left));right:max(14px,env(safe-area-inset-right));bottom:max(14px,env(safe-area-inset-bottom));max-width:760px;margin:auto;background:#101820;color:#ECE8DE;border:1px solid #2DD9C0;border-radius:12px;box-shadow:0 16px 44px rgba(0,0,0,.5);padding:18px;display:flex;gap:18px;align-items:center;justify-content:space-between;font:14px/1.5 Inter,Arial,sans-serif}#jobhub-consent-banner strong{font:700 16px Manrope,Arial,sans-serif}#jobhub-consent-banner p{margin:5px 0;color:#C6CFD8}#jobhub-consent-banner a{color:#FFB020}.jobhub-consent-actions{display:flex;gap:9px;flex-wrap:wrap;justify-content:flex-end}.jobhub-consent-actions button,#jobhub-privacy-settings{font:700 13px Inter,Arial,sans-serif;border-radius:7px;padding:10px 13px;cursor:pointer}.jobhub-consent-actions button{border:1px solid #536171;background:#151F29;color:#ECE8DE}.jobhub-consent-actions .jobhub-accept{background:#2DD9C0;color:#062420;border-color:#2DD9C0}#jobhub-privacy-settings{position:fixed;z-index:9998;right:14px;bottom:14px;border:1px solid #FFB020;background:#101820;color:#FFB020;box-shadow:0 5px 16px rgba(0,0,0,.35)}.site-rtl #jobhub-consent-banner{direction:rtl;text-align:right}.site-rtl .jobhub-consent-actions{justify-content:flex-start}.site-rtl #jobhub-privacy-settings{left:14px;right:auto}@media(max-width:620px){#jobhub-consent-banner{align-items:flex-start;flex-direction:column}.jobhub-consent-actions{justify-content:flex-start}#jobhub-privacy-settings{bottom:10px;right:10px}.site-rtl #jobhub-privacy-settings{left:10px;right:auto}}@media(prefers-reduced-motion:reduce){#jobhub-consent-banner,#jobhub-privacy-settings{transition:none!important}}';
  document.head.appendChild(style);
  window.JobHubTrack=function(eventName,params){if(state!=='accepted'||typeof window.gtag!=='function')return;var safeParams=params&&typeof params==='object'?params:{};window.gtag('event',eventName,safeParams);};
  window.JobHubPrivacy={choice:function(){return state;},openSettings:function(){try{localStorage.removeItem(KEY);}catch(e){}state=null;setClass();banner();}};
  setClass();document.addEventListener('jobhub:languagechange',refreshLanguage);document.addEventListener('DOMContentLoaded',function(){settings();banner();if(state==='accepted')runAnalytics();});
})();
