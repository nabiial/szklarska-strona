(function () {
  'use strict';
  var lang = (document.documentElement.lang || 'pl').toLowerCase();
  if (lang.startsWith('en')) lang = 'en'; else if (lang.startsWith('de')) lang = 'de'; else lang = 'pl';
  var t = {
    pl: { photos:function(n){return n===1?'1 zdjęcie':n+' zdjęć';}, see:'Zobacz zdjęcia', photo:'Zdjęcie demonstracyjne — do podmiany', map:'Pokaż w Google Maps ↗', concept:'WIZUALIZACJA KONCEPCYJNA', loading:'Ładowanie zdjęć…' },
    en: { photos:function(n){return n===1?'1 photo':n+' photos';}, see:'View photos', photo:'Sample image — replace before publishing', map:'Open in Google Maps ↗', concept:'CONCEPT VISUALIZATION', loading:'Loading photos…' },
    de: { photos:function(n){return n===1?'1 Foto':n+' Fotos';}, see:'Fotos ansehen', photo:'Beispielbild — vor Veröffentlichung ersetzen', map:'In Google Maps öffnen ↗', concept:'KONZEPTVISUALISIERUNG', loading:'Bilder werden geladen…' }
  }[lang];
  var dataUrl = '/data/';
  function fetchJson(name) { return fetch(dataUrl + name, { cache: 'no-store' }).then(function(r){ if(!r.ok) throw new Error('HTTP '+r.status+' for '+name); return r.json(); }); }
  function routeSlug(slug) { var s=String(slug||'').toLowerCase().replace(/ł/g,'l'); try { s=s.normalize('NFKD').replace(/[\u0300-\u036f]/g,''); } catch(e) {} return s.replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').replace(/-+/g,'-'); }
  function asset(path) { if (!path) return ''; if (/^(https?:|data:|blob:)/i.test(path)) return path; return path.charAt(0)==='/' ? path : '/'+path.replace(/^\.\//,''); }
  function uniquePhotos(room) { var list=[]; [room.cover].concat(Array.isArray(room.gallery)?room.gallery:[], Array.isArray(room.closeup_gallery)?room.closeup_gallery:[]).forEach(function(p){if(p && list.indexOf(p)===-1) list.push(p);}); return list; }
  function photoLabel(n) { return t.photos(n); }
  function escapeHtml(v) { return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];}); }
  function roomTitle(r) { return r[lang==='en'?'title_en':lang==='de'?'title_de':'title'] || r.title || r.slug; }
  function roomDescription(r) { return r[lang==='en'?'description_en':lang==='de'?'description_de':'description'] || r.description || ''; }
  function renderRooms(rooms) {
    var floors = [
      {id:'floor-0', key:'parter'}, {id:'floor-1', key:'pietro'}, {id:'floor-2', key:'poddasze'}
    ];
    floors.forEach(function(floor){
      var section=document.getElementById(floor.id); if(!section) return;
      var container=section.querySelector('[data-framer-name$="Rooms"]') || section.querySelector('.framer-1b433tt,.framer-il3pfo,.framer-lgwkta');
      if(!container) return;
      var items=rooms.filter(function(r){return r.visible!==false && r.floor===floor.key;}).sort(function(a,b){return (Number(a.sort_order)||0)-(Number(b.sort_order)||0);});
      container.classList.add('cms-room-grid');
      container.setAttribute('data-cms-library','rooms');
      container.innerHTML=items.map(function(r){
        var href='/rooms/'+routeSlug(r.slug)+'/?lang='+encodeURIComponent(lang);
        var cover=asset(r.cover || (r.gallery||[])[0]);
        var count=uniquePhotos(r).length;
        return '<a class="cms-room-card" href="'+escapeHtml(href)+'" data-room-slug="'+escapeHtml(r.slug)+'">'+
          '<span class="cms-room-card__media"><img src="'+escapeHtml(cover)+'" alt="'+escapeHtml(roomTitle(r))+'" loading="lazy"></span>'+
          '<span class="cms-room-card__caption"><span><span class="cms-room-card__name">'+escapeHtml(roomTitle(r))+'</span><span class="cms-room-card__count">'+escapeHtml(photoLabel(count))+'</span></span><span class="cms-room-card__arrow" aria-hidden="true">↗</span></span></a>';
      }).join('');
      if (!items.length) container.innerHTML='<p class="library-empty">'+escapeHtml(lang==='en'?'No rooms added yet.':'Nie dodano jeszcze pomieszczeń.')+'</p>';
    });
  }
  function renderPropertyGallery(items) {
    var container=document.querySelector('#residence .framer-ifj41t'); if(!container) return;
    items=items.filter(function(x){return x.visible!==false && x.image;}).sort(function(a,b){return (Number(a.sort_order)||0)-(Number(b.sort_order)||0);});
    container.classList.add('cms-property-gallery-grid');
    container.innerHTML=items.map(function(x,i){var title=x[lang==='en'?'title_en':lang==='de'?'title_de':'title']||x.title||'';return '<figure class="cms-property-photo"><img class="cms-property-photo__image" data-library-lightbox src="'+escapeHtml(asset(x.image))+'" alt="'+escapeHtml(x.alt||title||t.photo)+'" loading="lazy" data-gallery-index="'+i+'"><figcaption>'+escapeHtml(title)+'</figcaption></figure>';}).join('');
    initSimpleLightbox(container);
  }
  function renderPlans(plans) {
    var cards=Array.prototype.slice.call(document.querySelectorAll('#plans .demo-plan-card'));
    plans=plans.filter(function(x){return x.visible!==false && x.image;}).sort(function(a,b){return (Number(a.sort_order)||0)-(Number(b.sort_order)||0);});
    cards.forEach(function(card,i){var p=plans[i]; if(!p) {card.hidden=true; return;} card.hidden=false;
      var title=p[lang==='en'?'title_en':lang==='de'?'title_de':'title']||p.title||'';
      var subtitle=p[lang==='en'?'subtitle_en':lang==='de'?'subtitle_de':'subtitle']||p.subtitle||'';
      var detail=p[lang==='en'?'detail_en':lang==='de'?'detail_de':'detail']||p.detail||'';
      var number=card.querySelector('.demo-plan-number'), h=card.querySelector('h3'), code=card.querySelector('.demo-plan-size'), foot=card.querySelector('.demo-plan-footer span');
      if(number) number.textContent=String(i+1).padStart(2,'0')+' / '+title.toLocaleUpperCase(lang==='pl'?'pl-PL':lang==='de'?'de-DE':'en-US');
      if(h) h.textContent=subtitle;
      if(code) code.textContent=p.code||('RZUT '+String.fromCharCode(65+i));
      if(foot) foot.textContent=detail;
      var img=card.querySelector('.demo-plan-image'); if(img){img.src=asset(p.image);img.removeAttribute('srcset');img.alt=subtitle+' — '+detail;img.dataset.libraryPlanSlug=p.slug||'';}
    });
  }
  function renderConceptCards(concepts) {
    var section=document.getElementById('potencjal'); if(!section) return;
    var items={}; concepts.filter(function(c){return c.visible!==false;}).forEach(function(c){items[c.slug]=c;});
    section.querySelectorAll('a[href*="koncepcje/"]').forEach(function(a){
      var m=(a.getAttribute('href')||'').match(/koncepcje\/([^/?#]+)/); if(!m) return;
      var slug=decodeURIComponent(m[1]); var c=items[slug]; if(!c) return;
      var title=c[lang==='en'?'title_en':lang==='de'?'title_de':'title']||c.title||slug;
      var desc=c[lang==='en'?'description_en':lang==='de'?'description_de':'description']||c.description||'';
      var img=a.querySelector('img'); if(img&&c.cover){img.src=asset(c.cover);img.removeAttribute('srcset');img.alt=title+' — '+t.concept;}
      var number=a.querySelector('.framer-d85z2q p'); if(number) number.textContent=c.number||'';
      var heading=a.querySelector('.framer-1hg9ltj h3'); if(heading) heading.textContent=title;
      var description=a.querySelector('.framer-1lhfqbv p'); if(description) description.textContent=desc;
      var label=a.querySelector('.framer-14xi77w p'); if(label) label.textContent=t.concept;
      try { var u=new URL(a.href,location.href); u.searchParams.set('lang',lang); a.href=u.href; } catch(e){}
    });
  }
  function syncSettings(settings) {
    if(!settings) return;
    var propertyName=settings[lang==='en'?'property_name_en':lang==='de'?'property_name_de':'property_name']||settings.property_name;
    var address=settings[lang==='en'?'address_en':lang==='de'?'address_de':'address']||settings.address;
    if(propertyName){ document.querySelectorAll('.framer-a44mph a').forEach(function(a){a.textContent=propertyName.toLocaleUpperCase(lang==='pl'?'pl-PL':lang==='de'?'de-DE':'en-US');}); var h=document.querySelector('.framer-pj9xhg h1'); if(h) h.textContent=propertyName; }
    if(address){
      var place=document.querySelector('.framer-1vovmdp p'); if(place) place.textContent=address;
      var locationLead=document.querySelector('#location p.framer-text');
      if(locationLead){
        var note=lang==='en'?'The map below is illustrative; replace it with a verified location map before publishing.':lang==='de'?'Die Karte unten ist nur ein Schema; ersetzen Sie sie vor der Veröffentlichung durch eine geprüfte Karte.':'Poniższa mapa jest schematyczna — przed publikacją zastąp ją zweryfikowaną mapą lokalizacji.';
        locationLead.textContent=address+' · '+note;
      }
    }
    var map=document.getElementById('google-maps-link'); if(map && settings.google_maps_url) map.href=settings.google_maps_url;
    var geo=Array.prototype.slice.call(document.querySelectorAll('a[href*="geoportal.gov.pl"]')); if(settings.geoportal_url) geo.forEach(function(a){a.href=settings.geoportal_url;});
  }
  function initSimpleLightbox(container) {
    var imgs=Array.prototype.slice.call(container.querySelectorAll('[data-library-lightbox]')); if(!imgs.length) return;
    var overlay=document.getElementById('library-simple-lightbox');
    if(!overlay){
      overlay=document.createElement('div');overlay.id='library-simple-lightbox';overlay.className='library-lightbox';overlay.setAttribute('aria-hidden','true');
      overlay.innerHTML='<button class="library-lightbox__close" type="button" aria-label="Close">×</button><button class="library-lightbox__prev" type="button" aria-label="Previous">‹</button><img class="library-lightbox__image" alt=""><button class="library-lightbox__next" type="button" aria-label="Next">›</button><span class="library-lightbox__counter"></span>';
      document.body.appendChild(overlay);
    }
    if(overlay.dataset.bound==='true') { overlay._gallery=imgs; return; }
    overlay.dataset.bound='true'; overlay._gallery=imgs; var idx=0, image=overlay.querySelector('img'), counter=overlay.querySelector('.library-lightbox__counter');
    function render(){var list=overlay._gallery||imgs; if(!list.length)return;idx=(idx+list.length)%list.length;image.src=list[idx].currentSrc||list[idx].src;image.alt=list[idx].alt||'';counter.textContent=(idx+1)+' / '+list.length;}
    function open(i){overlay._gallery=imgs;idx=i;render();overlay.classList.add('is-open');overlay.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';}
    function close(){overlay.classList.remove('is-open');overlay.setAttribute('aria-hidden','true');document.body.style.overflow='';image.removeAttribute('src');}
    imgs.forEach(function(im,i){im.addEventListener('click',function(){open(i);});});
    overlay.querySelector('.library-lightbox__close').addEventListener('click',close);
    overlay.querySelector('.library-lightbox__prev').addEventListener('click',function(){idx--;render();});
    overlay.querySelector('.library-lightbox__next').addEventListener('click',function(){idx++;render();});
    overlay.addEventListener('click',function(e){if(e.target===overlay)close();});
    document.addEventListener('keydown',function(e){if(!overlay.classList.contains('is-open'))return;if(e.key==='Escape')close();if(e.key==='ArrowLeft'){idx--;render();}if(e.key==='ArrowRight'){idx++;render();}});
  }
  Promise.all([
    fetchJson('rooms.json').then(renderRooms),
    fetchJson('property-gallery.json').then(renderPropertyGallery),
    fetchJson('floor-plans.json').then(renderPlans),
    fetchJson('concepts.json').then(renderConceptCards),
    fetchJson('site-settings.json').then(syncSettings)
  ]).catch(function(err){console.warn('[Photo library] Could not load one or more CMS files. Use a local web server or check data/*.json.',err);});
})();
