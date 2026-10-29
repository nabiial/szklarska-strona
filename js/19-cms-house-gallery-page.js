(function(){
  'use strict';
  var params=new URLSearchParams(location.search);
  var lang=(params.get('lang')||document.documentElement.lang||'pl').toLowerCase();
  if(!['pl','en','de'].includes(lang))lang='pl';
  var T={
    pl:{kicker:'GALERIA NIERUCHOMOŚCI',title:'Dodatkowe zdjęcia domu',description:'Zdjęcia domu — ujęcia ogólne oraz detale i zbliżenia.',photos:'zdjęć',photo:'Zdjęcie',normal:'Zdjęcia domu',closeups:'Detale i zbliżenia',home:'Dom',plans:'Rzuty',location:'Lokalizacja',potential:'Potencjał',contact:'Kontakt',disclaimer:'Galeria fotograficzna domu Górna 22A.'},
    en:{kicker:'PROPERTY GALLERY',title:'Additional house photos',description:'House photos — general views, details and close-ups.',photos:'photos',photo:'Photo',normal:'House photos',closeups:'Details and close-ups',home:'Property',plans:'Floor plans',location:'Location',potential:'Potential',contact:'Contact',disclaimer:'Photo gallery of Górna 22A.'},
    de:{kicker:'IMMOBILIENGALERIE',title:'Weitere Hausfotos',description:'Hausfotos — Gesamtansichten, Details und Nahaufnahmen.',photos:'Fotos',photo:'Foto',normal:'Hausfotos',closeups:'Details und Nahaufnahmen',home:'Immobilie',plans:'Grundrisse',location:'Lage',potential:'Potenzial',contact:'Kontakt',disclaimer:'Fotogalerie des Hauses Górna 22A.'}
  }[lang];
  function asset(p){if(!p)return '';if(/^(https?:|data:|blob:)/i.test(p))return p;return p.charAt(0)==='/'?p:'/'+p.replace(/^\.\//,'');}
  function escape(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function unique(list){var out=[];list.forEach(function(p){if(p&&out.indexOf(p)===-1)out.push(p);});return out;}
  function init(){
    var container=document.querySelector('.framer-u05v26');
    var titleEl=document.querySelector('.framer-8r6alk h1');
    var kickerEl=document.querySelector('.framer-1xgx2d6 p');
    var descEl=document.querySelector('.framer-1mh0fzy p');
    if(!container)return;
    document.documentElement.lang=lang;
    document.title=T.title+' | Górna 22A, Szklarska Poręba';
    if(titleEl)titleEl.textContent=T.title;
    if(kickerEl)kickerEl.textContent=T.kicker;
    if(descEl)descEl.textContent=T.description;
    var homePath=lang==='en'?'/en/':lang==='de'?'/de/':'/';
    var nav=[['.framer-2c9i21 a',homePath,T.home],['.framer-1e43qci a',homePath+'#plans',T.plans],['.framer-rqvmn1 a',homePath+'#location',T.location],['.framer-15213yg a',homePath+'#potencjal',T.potential],['.framer-1i0cpt3 a',homePath+'#contact',T.contact]];
    nav.forEach(function(n){var a=document.querySelector(n[0]);if(a){a.href=n[1];a.textContent=n[2];}});
    var brand=document.querySelector('.framer-a44mph a');if(brand){brand.href=homePath;brand.textContent='GÓRNA / 22A';}
    var disclaimer=document.querySelector('.framer-xrqur4 p');if(disclaimer)disclaimer.textContent=T.disclaimer;

    fetch('/data/property-detail-gallery.json',{cache:'no-store'}).then(function(r){if(!r.ok)throw new Error('HTTP '+r.status);return r.json();}).then(function(data){
      var cover=asset(data.cover||'');
      var normal=unique((Array.isArray(data.normal)?data.normal:[]).filter(function(x){return x&&x.visible!==false&&x.image;}).map(function(x){return asset(x.image);}));
      var closeups=unique((Array.isArray(data.closeup)?data.closeup:[]).filter(function(x){return x&&x.visible!==false&&x.image;}).map(function(x){return asset(x.image);}));
      if(!cover&&normal.length)cover=normal.shift();
      var mainPhotos=unique((cover?[cover]:[]).concat(normal));
      var photos=unique(mainPhotos.concat(closeups));
      if(!photos.length)throw new Error('No property photos are available');
      var gallery=document.createElement('div');gallery.className='cms-room-gallery cms-property-gallery';
      var toolbar=document.createElement('div');toolbar.className='cms-room-gallery__toolbar';
      toolbar.innerHTML='<span>'+escape(T.kicker)+'</span><span>'+photos.length+' '+escape(T.photos)+'</span>';
      gallery.appendChild(toolbar);
      if(cover){
        var featured=document.createElement('button');featured.type='button';featured.className='cms-room-gallery__featured';featured.setAttribute('data-property-index','0');featured.setAttribute('aria-label',T.photo+' 1');
        featured.innerHTML='<img src="'+escape(cover)+'" alt="'+escape(T.title)+'" loading="eager"><span class="cms-room-gallery__featured-label">01 / '+escape(T.title)+'</span>';
        gallery.appendChild(featured);
      }
      if(normal.length){
        var normalHeading=document.createElement('div');normalHeading.className='cms-room-gallery__section-title';
        normalHeading.innerHTML='<span>02 /</span> '+escape(T.normal);
        gallery.appendChild(normalHeading);
        var normalGrid=document.createElement('div');normalGrid.className='cms-room-gallery__grid';
        normal.forEach(function(photo,i){
          var n=(cover?1:0)+i,btn=document.createElement('button');btn.type='button';btn.className='cms-room-gallery__item';btn.setAttribute('data-property-index',String(n));btn.setAttribute('aria-label',T.photo+' '+(n+1));
          btn.innerHTML='<img src="'+escape(photo)+'" alt="'+escape(T.normal)+' — '+(n+1)+'" loading="lazy"><span>'+String(n+1).padStart(2,'0')+' / '+String(photos.length).padStart(2,'0')+'</span>';
          normalGrid.appendChild(btn);
        });
        gallery.appendChild(normalGrid);
      }
      if(closeups.length){
        var closeHeading=document.createElement('div');closeHeading.className='cms-room-gallery__section-title';
        closeHeading.innerHTML='<span>03 /</span> '+escape(T.closeups);
        gallery.appendChild(closeHeading);
        var closeGrid=document.createElement('div');closeGrid.className='cms-room-gallery__grid';
        closeups.forEach(function(photo,i){
          var n=mainPhotos.length+i,btn=document.createElement('button');btn.type='button';btn.className='cms-room-gallery__item';btn.setAttribute('data-property-index',String(n));btn.setAttribute('aria-label',T.photo+' '+(n+1));
          btn.innerHTML='<img src="'+escape(photo)+'" alt="'+escape(T.closeups)+' — '+(n+1)+'" loading="lazy"><span>'+String(n+1).padStart(2,'0')+' / '+String(photos.length).padStart(2,'0')+'</span>';
          closeGrid.appendChild(btn);
        });
        gallery.appendChild(closeGrid);
      }
      container.innerHTML='';container.appendChild(gallery);

      var lb=document.createElement('div');lb.className='cms-room-lightbox';lb.setAttribute('aria-hidden','true');
      lb.innerHTML='<button type="button" class="cms-room-lightbox__btn cms-room-lightbox__close" aria-label="Close">×</button><button type="button" class="cms-room-lightbox__btn cms-room-lightbox__prev" aria-label="Previous">‹</button><img class="cms-room-lightbox__image" alt=""><button type="button" class="cms-room-lightbox__btn cms-room-lightbox__next" aria-label="Next">›</button><span class="cms-room-lightbox__counter"></span>';
      document.body.appendChild(lb);
      var lbImg=lb.querySelector('img'),counter=lb.querySelector('.cms-room-lightbox__counter'),index=0;
      function render(){index=(index+photos.length)%photos.length;lbImg.src=photos[index];lbImg.alt=T.title+' — '+(index+1);counter.textContent=(index+1)+' / '+photos.length;}
      function open(i){index=i;render();lb.classList.add('is-open');lb.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';}
      function close(){lb.classList.remove('is-open');lb.setAttribute('aria-hidden','true');lbImg.removeAttribute('src');document.body.style.overflow='';}
      container.addEventListener('click',function(e){var btn=e.target.closest('[data-property-index]');if(btn)open(Number(btn.getAttribute('data-property-index'))||0);});
      lb.querySelector('.cms-room-lightbox__close').addEventListener('click',close);
      lb.querySelector('.cms-room-lightbox__prev').addEventListener('click',function(){index--;render();});
      lb.querySelector('.cms-room-lightbox__next').addEventListener('click',function(){index++;render();});
      lb.addEventListener('click',function(e){if(e.target===lb)close();});
      document.addEventListener('keydown',function(e){if(!lb.classList.contains('is-open'))return;if(e.key==='Escape')close();if(e.key==='ArrowLeft'){index--;render();}if(e.key==='ArrowRight'){index++;render();}});
    }).catch(function(err){console.error('[Property gallery]',err);container.innerHTML='<div class="cms-room-error">'+escape(err.message||'Gallery could not be loaded.')+'</div>';});
  }
  if(document.readyState==='complete'){setTimeout(init,40);}else{window.addEventListener('load',function(){setTimeout(init,40);},{once:true});}
})();