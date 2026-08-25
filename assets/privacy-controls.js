(function(){
  'use strict';
  var KEY='jobhub_privacy_choice_v1', GA='G-HP8NJBF7K8';
  var state;
  try{state=localStorage.getItem(KEY);}catch(e){state=null;}

  function setClass(){
    document.documentElement.classList.toggle('jobhub-consent-granted',state==='accepted');
    document.documentElement.classList.toggle('jobhub-consent-essential',state!=='accepted');
  }

  function loadScript(src){
    return new Promise(function(resolve){
      if(document.querySelector('script[src="'+src+'"]'))return resolve();
      var s=document.createElement('script');
      s.src=src;
      s.async=true;
      s.onload=s.onerror=resolve;
      document.head.appendChild(s);
    });
  }

  function runAnalytics(){
    if(window.__jobhubAnalytics)return;
    window.__jobhubAnalytics=true;
    window.dataLayer=window.dataLayer||[];
    window.gtag=function(){window.dataLayer.push(arguments);};
    window.gtag('consent','default',{
      ad_storage:'denied',
      ad_user_data:'denied',
      ad_personalization:'denied',
      analytics_storage:'granted'
    });
    loadScript('https://www.googletagmanager.com/gtag/js?id='+GA).then(function(){
      window.gtag('js',new Date());
      window.gtag('config',GA,{anonymize_ip:true});
    });
  }

  function removeBanner(){
    var el=document.getElementById('jobhub-consent-banner');
    if(el)el.remove();
  }

  function decide(value){
    state=value;
    try{localStorage.setItem(KEY,value);}catch(e){}
    setClass();
    removeBanner();
    if(state==='accepted')runAnalytics();
  }

  function banner(){
    if(state)return;
    var el=document.createElement('section');
    el.id='jobhub-consent-banner';
    el.setAttribute('role','dialog');
    el.setAttribute('aria-modal','false');
    el.setAttribute('aria-label','Privacy choices');
    el.innerHTML='<div><strong>Your privacy choices</strong><p>We load optional analytics only if you choose to allow it. You can continue with essential site functions only and change this choice at any time.</p><a href="/privacy-policy/">Read the Privacy Policy</a></div><div class="jobhub-consent-actions"><button type="button" data-choice="essential">Essential only</button><button type="button" class="jobhub-accept" data-choice="accepted">Accept optional analytics</button></div>';
    document.body.appendChild(el);
    el.querySelectorAll('button[data-choice]').forEach(function(b){
      b.addEventListener('click',function(){decide(b.dataset.choice);});
    });
  }

  function settings(){
    var b=document.createElement('button');
    b.type='button';
    b.id='jobhub-privacy-settings';
    b.textContent='Privacy choices';
    b.setAttribute('aria-label','Change privacy choices');
    b.addEventListener('click',function(){
      try{localStorage.removeItem(KEY);}catch(e){}
      state=null;
      setClass();
      banner();
      var first=document.querySelector('#jobhub-consent-banner button');
      if(first)first.focus();
    });
    document.body.appendChild(b);
  }

  var style=document.createElement('style');
  style.textContent='#jobhub-consent-banner{position:fixed;z-index:9999;left:max(14px,env(safe-area-inset-left));right:max(14px,env(safe-area-inset-right));bottom:max(14px,env(safe-area-inset-bottom));max-width:760px;margin:auto;background:#101820;color:#ECE8DE;border:1px solid #2DD9C0;border-radius:12px;box-shadow:0 16px 44px rgba(0,0,0,.5);padding:18px;display:flex;gap:18px;align-items:center;justify-content:space-between;font:14px/1.5 Inter,Arial,sans-serif}#jobhub-consent-banner strong{font:700 16px Manrope,Arial,sans-serif}#jobhub-consent-banner p{margin:5px 0;color:#C6CFD8}#jobhub-consent-banner a{color:#FFB020}.jobhub-consent-actions{display:flex;gap:9px;flex-wrap:wrap;justify-content:flex-end}.jobhub-consent-actions button,#jobhub-privacy-settings{font:700 13px Inter,Arial,sans-serif;border-radius:7px;padding:10px 13px;cursor:pointer}.jobhub-consent-actions button{border:1px solid #536171;background:#151F29;color:#ECE8DE}.jobhub-consent-actions .jobhub-accept{background:#2DD9C0;color:#062420;border-color:#2DD9C0}#jobhub-privacy-settings{position:fixed;z-index:9998;right:14px;bottom:14px;border:1px solid #FFB020;background:#101820;color:#FFB020;box-shadow:0 5px 16px rgba(0,0,0,.35)}@media(max-width:620px){#jobhub-consent-banner{align-items:flex-start;flex-direction:column}.jobhub-consent-actions{justify-content:flex-start}#jobhub-privacy-settings{bottom:10px;right:10px}}@media(prefers-reduced-motion:reduce){#jobhub-consent-banner,#jobhub-privacy-settings{transition:none!important}}';
  document.head.appendChild(style);

  window.JobHubPrivacy={
    choice:function(){return state;},
    openSettings:function(){
      try{localStorage.removeItem(KEY);}catch(e){}
      state=null;
      setClass();
      banner();
    }
  };

  setClass();
  document.addEventListener('DOMContentLoaded',function(){
    settings();
    banner();
    if(state==='accepted')runAnalytics();
  });
})();
