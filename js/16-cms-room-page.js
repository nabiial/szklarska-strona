(function(){
  'use strict';
  var params = new URLSearchParams(location.search);
  var lang = (params.get('lang') || document.documentElement.lang || 'pl').toLowerCase();
  if (!['pl','en','de'].includes(lang)) lang = 'pl';
  function routeSlug(slug){var s=String(slug||'').toLowerCase().replace(/ł/g,'l');try{s=s.normalize('NFKD').replace(/[\u0300-\u036f]/g,'')}catch(e){}return s.replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').replace(/-+/g,'-')}
  var currentRoute = decodeURIComponent(location.pathname.split('/').filter(Boolean).pop() || 'basen');
  function t(obj,key){var k=key+(lang==='en'?'_en':lang==='de'?'_de':'');return obj[k]||obj[key]||''}
  function floorLabel(f){var all={pl:{parter:'Parter',pietro:'Piętro',poddasze:'Poddasze'},en:{parter:'Ground floor',pietro:'First floor',poddasze:'Attic'},de:{parter:'Erdgeschoss',pietro:'Obergeschoss',poddasze:'Dachgeschoss'}};return (all[lang]||all.pl)[f]||f||''}
  function asset(p){if(!p)return ''; if(/^(https?:|data:|blob:)/i.test(p))return p; return p.charAt(0)==='/'?p:'/'+p.replace(/^\.\//,'')}
  function escape(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  function unique(list){var out=[];list.forEach(function(p){if(p&&out.indexOf(p)===-1)out.push(p)});return out}
  var T={pl:{kicker:'POMIESZCZENIE / GALERIA SZCZEGÓŁOWA',photos:'zdjęć',photo:'Zdjęcie',empty:'Galeria zostanie uzupełniona kolejnymi fotografiami.',notFound:'Nie znaleziono tego pomieszczenia w bibliotece zdjęć.',back:'Dom',plans:'Rzuty',location:'Lokalizacja',potential:'Potencjał',contact:'Kontakt',disclaimer:'Prezentacja nieruchomości · Informacje i fotografie pomieszczenia można uzupełniać w bibliotece zdjęć.'},en:{kicker:'ROOM / DETAILED GALLERY',photos:'photos',photo:'Photo',empty:'More photos will be added to this gallery.',notFound:'This room was not found in the photo library.',back:'Property',plans:'Floor plans',location:'Location',potential:'Potential',contact:'Contact',disclaimer:'Property presentation · Room information and photographs can be updated in the photo library.'},de:{kicker:'RAUM / DETAILGALERIE',photos:'Fotos',photo:'Foto',empty:'Weitere Fotos werden dieser Galerie hinzugefügt.',notFound:'Dieser Raum wurde in der Fotobibliothek nicht gefunden.',back:'Immobilie',plans:'Grundrisse',location:'Lage',potential:'Potenzial',contact:'Kontakt',disclaimer:'Immobilienpräsentation · Raumdaten und Fotos können in der Fotobibliothek aktualisiert werden.'}}[lang];
  function init(){
    var container=document.querySelector('.framer-u05v26');
    var titleEl=document.querySelector('.framer-8r6alk h1');
    var kickerEl=document.querySelector('.framer-1xgx2d6 p');
    var descEl=document.querySelector('.framer-1mh0fzy p');
    if(!container)return;
    var normalizedRoute=routeSlug(currentRoute);
    fetch('/data/rooms.json',{cache:'no-store'}).then(function(r){if(!r.ok)throw new Error('HTTP '+r.status);return r.json()}).then(function(rooms){
      var room=rooms.find(function(x){return routeSlug(x.slug)===normalizedRoute && x.visible!==false});
      if(!room){container.innerHTML='<div class="cms-room-error">'+escape(T.notFound)+'</div>';return}
      document.documentElement.lang=lang;
      var title=t(room,'title')||room.slug;
      var description=t(room,'description')||'';
      document.title=title+' | Górna 22A, Szklarska Poręba';
      if(titleEl)titleEl.textContent=title;
      if(kickerEl)kickerEl.textContent=floorLabel(room.floor).toLocaleUpperCase(lang==='pl'?'pl-PL':lang==='de'?'de-DE':'en-US')+' · '+T.kicker;
      if(descEl)descEl.textContent=description;
      var photoList=unique([room.cover].concat(Array.isArray(room.gallery)?room.gallery:[]).filter(Boolean).map(asset));
      var cover=asset(room.cover||(photoList[0]||''));
      container.innerHTML='';
      var gallery=document.createElement('div');gallery.className='cms-room-gallery';
      var toolbar=document.createElement('div');toolbar.className='cms-room-gallery__toolbar';
      toolbar.innerHTML='<span>'+escape(T.kicker)+'</span><span>'+photoList.length+' '+escape(T.photos)+'</span>';
      gallery.appendChild(toolbar);
      if(cover){var featured=document.createElement('button');featured.type='button';featured.className='cms-room-gallery__featured';featured.setAttribute('data-cms-photo-index','0');featured.setAttribute('aria-label',T.photo+' 1');featured.innerHTML='<img src="'+escape(cover)+'" alt="'+escape(title)+'" loading="eager"><span class="cms-room-gallery__featured-label">01 / '+escape(title)+'</span>';gallery.appendChild(featured)}
      var grid=document.createElement('div');grid.className='cms-room-gallery__grid';
      var others=photoList.filter(function(p){return asset(p)!==cover});
      others.forEach(function(path,i){var b=document.createElement('button');b.type='button';b.className='cms-room-gallery__item';b.setAttribute('data-cms-photo-index',String(photoList.indexOf(path)));b.setAttribute('aria-label',T.photo+' '+(i+2));b.innerHTML='<img src="'+escape(asset(path))+'" alt="'+escape(title)+' — '+(i+2)+'" loading="lazy"><span>'+String(i+2).padStart(2,'0')+' / '+String(photoList.length).padStart(2,'0')+'</span>';grid.appendChild(b)});
      if(others.length)gallery.appendChild(grid);
      if(!others.length){var empty=document.createElement('div');empty.className='cms-room-gallery__empty';empty.textContent=T.empty;gallery.appendChild(empty)}
      container.appendChild(gallery);
      // Ensure navigation and disclaimer use localized text and return to the main site anchors.
      var nav=[['.framer-2c9i21 a','',T.back],['.framer-1e43qci a','/#plans',T.plans],['.framer-rqvmn1 a','/#location',T.location],['.framer-15213yg a','/#potencjal',T.potential],['.framer-1i0cpt3 a','/#contact',T.contact]];
      nav.forEach(function(n){var a=document.querySelector(n[0]);if(a){if(n[1])a.href=n[1];else a.href='/';a.textContent=n[2]}});
      var brand=document.querySelector('.framer-a44mph a');if(brand)brand.href='/';
      var disclaimer=document.querySelector('.framer-xrqur4 p');if(disclaimer)disclaimer.textContent=T.disclaimer;
      // Lightbox with keyboard and arrow controls.
      var lb=document.createElement('div');lb.className='cms-room-lightbox';lb.setAttribute('aria-hidden','true');lb.innerHTML='<button type="button" class="cms-room-lightbox__btn cms-room-lightbox__close" aria-label="Close">×</button><button type="button" class="cms-room-lightbox__btn cms-room-lightbox__prev" aria-label="Previous">‹</button><img class="cms-room-lightbox__image" alt=""><button type="button" class="cms-room-lightbox__btn cms-room-lightbox__next" aria-label="Next">›</button><span class="cms-room-lightbox__counter"></span>';
      document.body.appendChild(lb);var lbImg=lb.querySelector('img'),counter=lb.querySelector('.cms-room-lightbox__counter'),index=0;
      function render(){if(!photoList.length)return;index=(index+photoList.length)%photoList.length;lbImg.src=asset(photoList[index]);lbImg.alt=title+' — '+(index+1);counter.textContent=(index+1)+' / '+photoList.length}
      function open(i){if(!photoList.length)return;index=i;render();lb.classList.add('is-open');lb.setAttribute('aria-hidden','false');document.body.style.overflow='hidden'}
      function close(){lb.classList.remove('is-open');lb.setAttribute('aria-hidden','true');lbImg.removeAttribute('src');document.body.style.overflow=''}
      container.querySelectorAll('[data-cms-photo-index]').forEach(function(btn){btn.addEventListener('click',function(){open(Number(btn.getAttribute('data-cms-photo-index'))||0)})});
      lb.querySelector('.cms-room-lightbox__close').addEventListener('click',close);lb.querySelector('.cms-room-lightbox__prev').addEventListener('click',function(){index--;render()});lb.querySelector('.cms-room-lightbox__next').addEventListener('click',function(){index++;render()});lb.addEventListener('click',function(e){if(e.target===lb)close()});document.addEventListener('keydown',function(e){if(!lb.classList.contains('is-open'))return;if(e.key==='Escape')close();if(e.key==='ArrowLeft'){index--;render()}if(e.key==='ArrowRight'){index++;render()}});
    }).catch(function(err){console.error('[Room gallery]',err);container.innerHTML='<div class="cms-room-error">'+escape(T.notFound)+'</div>'});
  }
  if(document.readyState==='complete'){setTimeout(init,40)}else{window.addEventListener('load',function(){setTimeout(init,40)},{once:true})}
})();
