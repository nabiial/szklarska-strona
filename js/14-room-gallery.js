(function () {
  'use strict';
  var params = new URLSearchParams(location.search);
  var slug = params.get('slug') || '';
  var lang = (params.get('lang') || document.documentElement.lang || 'pl').toLowerCase();
  if (!['pl','en','de'].includes(lang)) lang='pl';
  var T = {
    pl:{floor:{parter:'Parter',pietro:'Piętro',poddasze:'Poddasze'},back:'← Wróć do pomieszczeń',kicker:'POMIESZCZENIE / SZCZEGÓŁOWA GALERIA',photos:'Zdjęcia',empty:'Dodaj pozostałe fotografie w panelu Pages CMS, w kolekcji „Pomieszczenia i galerie”.',home:'Nieruchomość',error:'Nie znaleziono pomieszczenia. Sprawdź identyfikator w data/rooms.json.',sample:'Zdjęcie główne / do podmiany'},
    en:{floor:{parter:'Ground floor',pietro:'First floor',poddasze:'Attic'},back:'← Back to rooms',kicker:'ROOM / DETAILED GALLERY',photos:'Photos',empty:'Add the remaining photos in Pages CMS under “Rooms and galleries”.',home:'Property',error:'Room not found. Check the slug in data/rooms.json.',sample:'Cover image / replace'},
    de:{floor:{parter:'Erdgeschoss',pietro:'Obergeschoss',poddasze:'Dachgeschoss'},back:'← Zurück zu den Räumen',kicker:'RAUM / DETAILGALERIE',photos:'Fotos',empty:'Weitere Fotos im Pages-CMS unter „Räume und Galerien“ hinzufügen.',home:'Immobilie',error:'Raum nicht gefunden. Bitte den Slug in data/rooms.json prüfen.',sample:'Titelbild / ersetzen'}
  }[lang];
  function asset(path){if(!path)return '';if(/^(https?:|data:|blob:)/i.test(path))return path;return path.charAt(0)==='/'?path:'/'+path.replace(/^\.\//,'');}
  function labelCount(n){if(lang==='pl')return n===1?'1 zdjęcie':n+' zdjęć';if(lang==='de')return n===1?'1 Foto':n+' Fotos';return n===1?'1 photo':n+' photos';}
  function text(obj,key){var localized=key+(lang==='en'?'_en':lang==='de'?'_de':'');return obj[localized]||obj[key]||'';}
  function dedupe(values){var result=[];values.forEach(function(v){if(v && result.indexOf(v)===-1)result.push(v);});return result;}
  var title=document.querySelector('[data-room-title]'), description=document.querySelector('[data-room-description]'), floorLabel=document.querySelector('[data-room-floor]'), coverImg=document.querySelector('[data-room-cover]'), countEl=document.querySelector('[data-room-count]'), gallery=document.getElementById('room-gallery'), empty=document.getElementById('room-gallery-empty'), back=document.querySelector('[data-room-back]'), lightbox=document.getElementById('room-lightbox');
  function showError(){if(title)title.textContent=T.error;if(description)description.textContent='';if(gallery)gallery.innerHTML='';if(empty)empty.hidden=false;}
  fetch('../data/rooms.json',{cache:'no-store'}).then(function(r){if(!r.ok)throw new Error('Could not load rooms.json');return r.json();}).then(function(rooms){
    var room=rooms.find(function(r){return r.slug===slug && r.visible!==false;}); if(!room){showError();return;}
    var name=text(room,'title'), desc=text(room,'description'), floor=T.floor[room.floor]||room.floor||'';
    document.documentElement.lang=lang; document.title=name+' — '+T.home;
    if(title)title.textContent=name;if(description)description.textContent=desc;
    if(floorLabel)floorLabel.textContent=floor.toLocaleUpperCase(lang==='pl'?'pl-PL':lang==='de'?'de-DE':'en-US')+' / '+T.kicker;
    var photoList=dedupe([room.cover].concat(Array.isArray(room.gallery)?room.gallery:[]));
    if(!photoList.length){showError();return;}
    var cover=asset(room.cover||photoList[0]);
    if(coverImg){coverImg.src=cover;coverImg.alt=name+' — '+T.sample;coverImg.addEventListener('click',function(){openLightbox(0);});}
    document.querySelectorAll('[data-room-count]').forEach(function(el){el.textContent=labelCount(photoList.length);});
    if(back)back.href=(lang==='en'?'../en/index.html':'../index.html')+'#'+(room.floor==='parter'?'floor-0':room.floor==='pietro'?'floor-1':'floor-2');
    var thumbs=photoList.filter(function(p){return asset(p)!==cover;});
    if(gallery){gallery.innerHTML=thumbs.map(function(path,i){return '<button type="button" class="library-photo-button" data-photo-index="'+(photoList.indexOf(path))+'" aria-label="'+(lang==='pl'?'Powiększ zdjęcie ':lang==='de'?'Foto vergrößern ':'Enlarge photo ')+(i+2)+'"><img src="'+asset(path)+'" alt="'+name+' — '+(i+2)+'" loading="lazy"></button>';}).join('');}
    if(empty){empty.hidden=thumbs.length>0;empty.textContent=T.empty;}
    var lbImage=lightbox.querySelector('img'), counter=lightbox.querySelector('.library-lightbox__counter'), idx=0;
    function renderLb(){idx=(idx+photoList.length)%photoList.length;lbImage.src=asset(photoList[idx]);lbImage.alt=name+' — '+(idx+1);counter.textContent=(idx+1)+' / '+photoList.length;}
    function openLightbox(i){idx=i;renderLb();lightbox.classList.add('is-open');lightbox.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';}
    function closeLightbox(){lightbox.classList.remove('is-open');lightbox.setAttribute('aria-hidden','true');lbImage.removeAttribute('src');document.body.style.overflow='';}
    gallery.querySelectorAll('[data-photo-index]').forEach(function(button){button.addEventListener('click',function(){openLightbox(Number(button.dataset.photoIndex));});});
    lightbox.querySelector('.library-lightbox__close').addEventListener('click',closeLightbox);
    lightbox.querySelector('.library-lightbox__prev').addEventListener('click',function(){idx--;renderLb();});
    lightbox.querySelector('.library-lightbox__next').addEventListener('click',function(){idx++;renderLb();});
    lightbox.addEventListener('click',function(e){if(e.target===lightbox)closeLightbox();});
    document.addEventListener('keydown',function(e){if(!lightbox.classList.contains('is-open'))return;if(e.key==='Escape')closeLightbox();if(e.key==='ArrowLeft'){idx--;renderLb();}if(e.key==='ArrowRight'){idx++;renderLb();}});
  }).catch(function(err){console.error(err);showError();});
})();
