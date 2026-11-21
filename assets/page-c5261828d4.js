/* Script visiteur non destructif : ne réécrit JAMAIS vos textes, titres, prix ou liens modifiés. */
(function(){
  // 1. Mini-diagnostic interactif
  (function(){
    var groups=[
      {ids:[1,2],t:'Le cadre : lieu, horaire, matériel, règles de la maison',p:'Partie 2 du guide (pages 6 à 8)'},
      {ids:[5,6],t:'Concentration, méthode et mémoire, et « même si vous avez peu étudié »',p:'Parties 5 et 7 du guide (pages 15, 16 et 18)'}
    ];
    var boxes=Array.prototype.slice.call(document.querySelectorAll('#dlist input'));
    var out=document.getElementById('dres');
    if(!out || !boxes.length) return; document.getElementById('dlist').hidden=false; out.hidden=false;
    function calc(){
      var on=new Set(boxes.filter(function(b){return b.checked;}).map(function(b){return +b.dataset.n;}));
      if(!on.size){ out.className='dres'; out.textContent='Cochez au moins une phrase pour voir par où commencer.'; return; }
      var sc=groups.map(function(g){return {g:g,r:g.ids.filter(function(i){return on.has(i);}).length/g.ids.length};})
        .filter(function(x){return x.r>0;}).sort(function(a,b){return b.r-a.r;});
      var top=sc.filter(function(x){return x.r>=.5;}); if(!top.length) top=[sc[0]];
      out.className='dres on';
      out.innerHTML='<b>Vous avez coché '+on.size+' phrase'+(on.size>1?'s':'')+'.</b> Dans le kit, commencez par : '+top.map(function(x){return '<br>• <b>'+x.g.t+'</b> ('+x.g.p+')';}).join('')+'<br>Un seul changement à la fois suffit pour démarrer.';
    }
    boxes.forEach(function(b){b.addEventListener('change',calc);});
  })();

  // Minuteur local : il ne fixe ni le prix ni l’échéance commerciale de Chariow.
  (function(){
    var cd=document.getElementById('cd');if(!cd)return;
    var mode=cd.dataset.countdownMode||'visiteur',now=Date.now(),end=NaN;
    if(mode==='visiteur'){
      var key='kee_start_v2',start=NaN;try{start=parseInt(sessionStorage.getItem(key),10);}catch(_){}
      if(!Number.isFinite(start)||start>now){start=now;try{sessionStorage.setItem(key,String(start));}catch(_){}}
      end=start+(parseInt(cd.dataset.countdownMinutes,10)||35)*60000;
    }else if(mode==='date'&&cd.dataset.countdownEnd){var iso=cd.dataset.countdownEnd.trim().replace(' ','T');if(/^\d{4}-\d{2}-\d{2}$/.test(iso))iso+='T23:59:59';if(!/(Z|[+-]\d{2}:?\d{2})$/i.test(iso))iso+=cd.dataset.countdownTz||'+00:00';end=Date.parse(iso);}
    if(!Number.isFinite(end))return;
    var cells=Array.from(cd.querySelectorAll('[data-cd]')),top=document.querySelector('.urg-cd'),topText=document.querySelector('.cd-text'),mini=document.querySelector('.cd-mini'),job=0;
    function set(el,s){if(el&&el.textContent!==s)el.textContent=s;}
    function pad(v){return String(v).padStart(2,'0');}
    function tick(){clearTimeout(job);if(document.hidden)return;var t=Math.max(0,Math.ceil((end-Date.now())/1000));cd.hidden=!t;if(top)top.hidden=!t;
      if(!t){set(mini,'');return;}var v={j:Math.floor(t/86400),h:Math.floor(t/3600)%24,m:Math.floor(t/60)%60,s:t%60};cells.forEach(function(el){set(el,pad(v[el.dataset.cd]));});
      var time=(v.j?v.j+' j ':'')+(v.h?pad(v.h)+' h ':'')+pad(v.m)+' min '+pad(v.s)+' s';set(topText,time);set(mini,time);job=setTimeout(tick,Math.max(120,(end-Date.now())%1000+20));}
    document.addEventListener('visibilitychange',tick);window.addEventListener('pageshow',tick);window.addEventListener('pagehide',function(){clearTimeout(job);});tick();
  })();

  // Barre d’achat : uniquement entre l’accueil et le pied de page, et hors de l’offre principale.
  (function(){var bar=document.getElementById('sticky'),hero=document.querySelector('.hero'),offre=document.getElementById('offre'),foot=document.querySelector('footer');if(!bar||!hero||!offre||!foot||!window.IntersectionObserver)return;
    var media=matchMedia('(max-width:899px) and (min-height:411px)'),her=true,off=false,end=false,ctaVisibles=new Set(),zones=new Set(),fermee=false;try{fermee=sessionStorage.getItem('kee_barre_fermee')==='1';}catch(_){}
    function sync(){var on=media.matches&&!fermee&&!her&&!off&&!end&&!ctaVisibles.size&&!zones.size;bar.classList.toggle('on',on);document.documentElement.style.setProperty('--barre-hauteur',on?bar.offsetHeight+'px':'0px');}
    var obs=new IntersectionObserver(function(es){es.forEach(function(e){if(e.target===hero)her=e.isIntersecting;else if(e.target===offre)off=e.isIntersecting;else end=e.isIntersecting;});sync();});[hero,offre,foot].forEach(function(e){obs.observe(e);});
    // Pas de barre devant les champs du diagnostic, la FAQ, le portrait ou les captures à lire.
    var lecture=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting)zones.add(e.target);else zones.delete(e.target);});sync();});document.querySelectorAll('#diagnostic,#faq,#auteur,#preuves').forEach(function(e){lecture.observe(e);});
    var fermer=bar.querySelector('button');if(fermer)fermer.addEventListener('click',function(){fermee=true;try{sessionStorage.setItem('kee_barre_fermee','1');}catch(_){}sync();var el=document.elementFromPoint(innerWidth/2,innerHeight*.4),sec=el&&el.closest('section,header'),h=sec&&sec.querySelector('h2,h1');if(h){h.setAttribute('tabindex','-1');h.focus({preventScroll:true});h.addEventListener('blur',function retire(){h.removeAttribute('tabindex');h.removeEventListener('blur',retire);});}});
    var boutons=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting&&e.intersectionRatio>.55)ctaVisibles.add(e.target);else ctaVisibles.delete(e.target);});sync();},{threshold:[0,.56,1]});document.querySelectorAll('main a[data-cta]').forEach(function(x){boutons.observe(x);});
    window.addEventListener('focusin',function(e){if(!bar.classList.contains('on')||bar.contains(e.target)||!e.target.matches(':focus-visible'))return;requestAnimationFrame(function(){var y=e.target.getBoundingClientRect().bottom-bar.getBoundingClientRect().top+8;if(y>0&&y<innerHeight)window.scrollBy({top:y,behavior:'instant'});});});
    if(media.addEventListener)media.addEventListener('change',sync);else if(media.addListener)media.addListener(sync);if(window.ResizeObserver)new ResizeObserver(sync).observe(bar);sync();
  })();

})();

/* Captures de S25 : trois images originales en boucle, sans duplication de repères ni commande de paiement. */
(function(){
  'use strict';
  var fen=document.querySelector('#preuves .captures-fenetre');
  if(!fen || !window.requestAnimationFrame || !window.matchMedia) return;
  var bande=fen.querySelector('.captures-piste'), cartes=Array.from(bande.querySelectorAll('figure'));
  if(cartes.length!==3) return;
  var pref=matchMedia('(prefers-reduced-motion: reduce)'), doigts=new Set(),pointeurs=new Set(),precharge=false;
  var actif=false,visible=false,clavier=false,pointage=false,frame=0,precedent=null,pas=0,phase=0,inset=0,vitesse=0;
  function stop(){if(frame) cancelAnimationFrame(frame);frame=0;precedent=null;}
  function autorise(){return actif && visible && !document.hidden && !clavier && !doigts.size && !pointeurs.size && pas>0;}
  function peindre(){
    var x=phase*pas;
    cartes.forEach(function(c,i){
      // Un élément ne repart à droite qu’après sa sortie complète du bord gauche.
      var d=inset-x+(inset+i*pas-x <= -pas ? cartes.length*pas:0);
      c.style.transform='translate3d('+d.toFixed(3)+'px,0,0)';
    });
  }
  function avancer(t){frame=0;if(!autorise()){precedent=null;return;}
    if(precedent!==null) phase=(phase+Math.min(75,t-precedent)*vitesse/pas)%cartes.length;
    precedent=t;peindre();frame=requestAnimationFrame(avancer);
  }
  function etat(){if(!autorise()) stop();else if(!frame)frame=requestAnimationFrame(avancer);}
  function mesurer(){if(!actif)return;var gap=parseFloat(getComputedStyle(bande).columnGap)||0;
    pas=cartes[0].getBoundingClientRect().width+gap;inset=Math.min(9,gap*.5);vitesse=fen.clientWidth<550?.022:.031;peindre();etat();
  }
  function changer(){stop();actif=!pref.matches;clavier=false;doigts.clear();pointeurs.clear();
    if(actif){fen.setAttribute('data-defile','');fen.tabIndex=0;fen.setAttribute('aria-describedby','captures-mode-emploi');mesurer();}
    else{fen.removeAttribute('data-defile');fen.removeAttribute('tabindex');fen.removeAttribute('aria-describedby');phase=0;cartes.forEach(function(c){c.style.removeProperty('transform');});}
  }
  function relacher(){doigts.clear();pointeurs.clear();etat();}
  function presser(e){if(!actif || (e.button!=null && e.button!==0))return;pointage=true;clavier=false;pointeurs.add(e.pointerId);etat();
    // La capture reste sur l’élément touché : le clic de l’atelier peut toujours sélectionner l’image.
    try{if(e.target.setPointerCapture)e.target.setPointerCapture(e.pointerId);}catch(_){}
  }
  function lever(e){pointeurs.delete(e.pointerId);etat();}
  if('PointerEvent' in window){fen.addEventListener('pointerdown',presser,{passive:true});
    window.addEventListener('pointerup',lever,true);window.addEventListener('pointercancel',lever,true);fen.addEventListener('lostpointercapture',lever,true);
  }else{fen.addEventListener('mousedown',presser);window.addEventListener('mouseup',lever,true);}
  // Conserver la pause d’un vrai contact même si le navigateur reprend le geste pour faire défiler la page.
  fen.addEventListener('touchstart',function(e){if(!actif)return;pointage=true;clavier=false;Array.from(e.changedTouches).forEach(function(t){doigts.add(t.identifier);});etat();},{passive:true});
  function finContact(e){Array.from(e.changedTouches).forEach(function(t){doigts.delete(t.identifier);});etat();}
  window.addEventListener('touchend',finContact,{passive:true,capture:true});window.addEventListener('touchcancel',finContact,{passive:true,capture:true});
  fen.addEventListener('contextmenu',function(e){if(actif && e.target.closest('.capture-carte'))e.preventDefault();});
  // Sur écran tactile, la mise au point synthétique peut suivre touchend. Seul un accès clavier fige la lecture au focus.
  window.addEventListener('keydown',function(e){if(e.key==='Tab')pointage=false;},true);
  fen.addEventListener('focus',function(){clavier=!pointage && !pointeurs.size && !doigts.size;etat();});
  fen.addEventListener('blur',function(){clavier=false;etat();});
  fen.addEventListener('keydown',function(e){if(!actif || e.target!==fen)return;
    var n=cartes.length;if(e.key==='ArrowRight')phase=(Math.floor(phase+.001)+1)%n;else if(e.key==='ArrowLeft')phase=(Math.ceil(phase-.001)+n-1)%n;else if(e.key==='Home')phase=0;else if(e.key==='End')phase=n-1;else return;
    e.preventDefault();clavier=true;etat();peindre();
  });
  function enVue(ok){visible=ok;
    // Les fichiers sont intégrés : dès l’arrivée dans la galerie, préparer aussi les images encore hors du cadre.
    if(ok && !precharge){precharge=true;cartes.forEach(function(c){c.querySelector('img').loading='eager';});}etat();
  }
  function vue(){var r=fen.getBoundingClientRect();enVue(r.bottom>0 && r.top<innerHeight);}
  if('IntersectionObserver' in window){new IntersectionObserver(function(entries){enVue(entries[0].isIntersecting);}).observe(fen);}else{window.addEventListener('scroll',vue,{passive:true});vue();}
  if('ResizeObserver' in window){var ro=new ResizeObserver(mesurer);ro.observe(fen);ro.observe(cartes[0]);}
  window.addEventListener('resize',mesurer,{passive:true});window.addEventListener('blur',relacher);
  document.addEventListener('visibilitychange',function(){if(document.hidden)relacher();etat();});window.addEventListener('pagehide',function(){stop();doigts.clear();pointeurs.clear();});
  window.addEventListener('pageshow',function(){mesurer();vue();});if(pref.addEventListener)pref.addEventListener('change',changer);else if(pref.addListener)pref.addListener(changer);changer();
})();

/* Défilement des informations de l’accueil : aucune duplication du contenu, aucun stockage. */
(function () {
  'use strict';
  var ligne = document.querySelector('.hero .hero-grid > .reassure');
  if (!ligne || !window.requestAnimationFrame) return;
  var rail = document.createElement('div'), commande = document.createElement('button');
  rail.className = 'kit-infos-rail';
  commande.type = 'button'; commande.className = 'kit-infos-commande'; commande.hidden = true;
  ligne.id = ligne.id || 'kit-infos-accueil'; commande.setAttribute('aria-controls', ligne.id);
  ligne.parentNode.insertBefore(rail, ligne); rail.appendChild(ligne); rail.appendChild(commande);
  var pref = window.matchMedia('(prefers-reduced-motion: reduce)');
  var lecture = !pref.matches, deborde = false, visible = false, toucher = false, clavier = false;
  var frame = 0, delai = 0, dernier = 0, position = 0, sens = 1, limite = 0;
  function arreter() {
    clearTimeout(delai); cancelAnimationFrame(frame); delai = frame = dernier = 0;
  }
  function autorise() { return lecture && deborde && visible && !document.hidden && !toucher && !clavier; }
  function libelle() {
    var action = lecture ? 'Mettre le défilement des informations en pause' : 'Lancer le défilement automatique des informations';
    commande.setAttribute('aria-label', action); commande.title = action;
    commande.dataset.lecture = lecture ? 'oui' : 'non';
  }
  function programmer(pause) {
    arreter();
    if (!autorise()) return;
    delai = window.setTimeout(function () {
      if (!autorise()) return;
      position = ligne.scrollLeft;
      if (position <= 0.5) sens = 1; else if (position >= limite - 0.5) sens = -1;
      frame = requestAnimationFrame(avancer);
    }, pause);
  }
  function avancer(t) {
    frame = 0;
    if (!autorise()) return;
    // 32 pixels/seconde : indépendant du taux de rafraîchissement, y compris à 120 Hz.
    if (dernier) position += sens * Math.min(80, t - dernier) * 0.032;
    dernier = t;
    var auBout = sens > 0 ? position >= limite : position <= 0;
    position = Math.max(0, Math.min(limite, position)); ligne.scrollLeft = position;
    if (auBout) { sens *= -1; programmer(1600); }
    else frame = requestAnimationFrame(avancer);
  }
  function mesurer() {
    // Mesurer contre la largeur complète : le bouton ne doit pas provoquer lui-même un débordement.
    var requis = ligne.scrollWidth > rail.clientWidth + 1, change = requis !== deborde;
    deborde = requis; commande.hidden = !requis;
    var max = Math.max(0, ligne.scrollWidth - ligne.clientWidth);
    if (!requis) { arreter(); ligne.scrollLeft = 0; sens = 1; limite = 0; return; }
    if (change || limite !== max) { limite = max; programmer(850); }
  }
  function disponibilite(v) { if (visible !== v) { visible = v; programmer(850); } }
  function testerVisibilite() { var r = rail.getBoundingClientRect(); disponibilite(r.bottom > 0 && r.top < innerHeight); }
  commande.addEventListener('click', function () { lecture = !lecture; libelle(); programmer(140); });
  // Une manipulation manuelle ne lutte jamais contre l’animation.
  function appui() { toucher = true; arreter(); }
  function relache() { if (toucher) { toucher = false; programmer(1500); } }
  if ('PointerEvent' in window) {
    ligne.addEventListener('pointerdown', appui, {passive:true});
    window.addEventListener('pointerup', relache, true); window.addEventListener('pointercancel', relache, true);
  } else {
    ligne.addEventListener('touchstart', appui, {passive:true});
    window.addEventListener('touchend', relache, true); window.addEventListener('touchcancel', relache, true);
  }
  ligne.addEventListener('wheel', function () { programmer(1500); }, {passive:true});
  ligne.addEventListener('focus', function () {
    try { clavier = ligne.matches(':focus-visible'); } catch (_) { clavier = !toucher; }
    if (clavier) arreter();
  });
  ligne.addEventListener('keydown', function (e) {
    if (/^(ArrowLeft|ArrowRight|Home|End)$/.test(e.key)) { clavier = true; arreter(); }
  });
  ligne.addEventListener('blur', function () { clavier = false; programmer(800); });
  function preference(e) { lecture = !e.matches; libelle(); programmer(850); }
  if (pref.addEventListener) pref.addEventListener('change', preference); else if (pref.addListener) pref.addListener(preference);
  document.addEventListener('visibilitychange', function () { programmer(850); });
  window.addEventListener('pagehide', arreter); window.addEventListener('pageshow', function () { mesurer(); programmer(850); });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entrees) { disponibilite(entrees[0].isIntersecting); }).observe(rail);
  } else { window.addEventListener('scroll', testerVisibilite, {passive:true}); testerVisibilite(); }
  if ('ResizeObserver' in window) {
    var tailles = new ResizeObserver(mesurer); tailles.observe(rail);
    Array.prototype.forEach.call(ligne.children, function (info) { tailles.observe(info); });
  }
  window.addEventListener('resize', function () { mesurer(); if (!('IntersectionObserver' in window)) testerVisibilite(); }, {passive:true});
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(mesurer);
  libelle(); mesurer();
})();
