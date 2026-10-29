(function(){
  'use strict';
  var lang=(document.documentElement.lang||'pl').toLowerCase();
  if(!['pl','en','de'].includes(lang))lang='pl';
  var T={
    pl:{heading:'Dodatkowe zdjęcia domu',kicker:'GALERIA NIERUCHOMOŚCI',photos:'zdjęć',photo:'Zdjęcie',closeups:'Detale i zbliżenia',close:'Zamknij',previous:'Poprzednie zdjęcie',next:'Następne zdjęcie'},
    en:{heading:'Additional house photos',kicker:'PROPERTY GALLERY',photos:'photos',photo:'Photo',closeups:'Details and close-ups',close:'Close',previous:'Previous photo',next:'Next photo'},
    de:{heading:'Weitere Hausfotos',kicker:'IMMOBILIENGALERIE',photos:'Fotos',photo:'Foto',closeups:'Details und Nahaufnahmen',close:'Schließen',previous:'Vorheriges Foto',next:'Nächstes Foto'}
  }[lang];
  function asset(p){if(!p)return '';if(/^(https?:|data:|blob:)/i.test(p))return p;return p.charAt(0)==='/'?p:'/'+p.replace(/^\.\//,'');}
  function escape(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function unique(list){var out=[];list.forEach(function(p){if(p&&out.indexOf(p)===-1)out.push(p);});return out;}
  function init(){
    var floor=document.querySelector('#floor-2');
    var roomGrid=floor&&floor.querySelector('.framer-lgwkta');
    if(!floor||!roomGrid||floor.querySelector('.cms-home-property-gallery'))return;
    fetch('/data/property-detail-gallery.json',{cache:'no-store'}).then(function(r){if(!r.ok)throw new Error('HTTP '+r.status);return r.json();}).then(function(data){
      var cover=asset(data.cover||'');
      var normal=unique((Array.isArray(data.normal)?data.normal:[]).filter(function(x){return x&&x.visible!==false&&x.image;}).map(function(x){return asset(x.image);}));
      var closeups=unique((Array.isArray(data.closeup)?data.closeup:[]).filter(function(x){return x&&x.visible!==false&&x.image;}).map(function(x){return asset(x.image);}));
      if(!cover&&normal.length)cover=normal.shift();
      var mainPhotos=unique((cover?[cover]:[]).concat(normal));
      var photos=unique(mainPhotos.concat(closeups));
      if(!photos.length)return;

      var section=document.createElement('section');
      section.className='cms-home-property-gallery cms-room-gallery';
      section.setAttribute('aria-label',T.heading);
      var title=document.createElement('h2');
      title.className='cms-home-property-gallery__title';
      title.textContent=T.heading;
      section.appendChild(title);

      var toolbar=document.createElement('div');toolbar.className='cms-room-gallery__toolbar';
      toolbar.innerHTML='<span>'+escape(T.kicker)+'</span><span>'+photos.length+' '+escape(T.photos)+'</span>';
      section.appendChild(toolbar);

      var featured=document.createElement('button');featured.type='button';featured.className='cms-room-gallery__featured';featured.setAttribute('data-home-property-index','0');featured.setAttribute('aria-label',T.photo+' 1');
      featured.innerHTML='<img src="'+escape(mainPhotos[0])+'" alt="'+escape(T.heading)+'" loading="lazy"><span class="cms-room-gallery__featured-label">01 / '+escape(T.heading)+'</span>';
      section.appendChild(featured);

      if(mainPhotos.length>1){
        var mainGrid=document.createElement('div');mainGrid.className='cms-room-gallery__grid';
        mainPhotos.slice(1).forEach(function(photo,i){
          var n=i+1,btn=document.createElement('button');btn.type='button';btn.className='cms-room-gallery__item';btn.setAttribute('data-home-property-index',String(n));btn.setAttribute('aria-label',T.photo+' '+(n+1));
          btn.innerHTML='<img src="'+escape(photo)+'" alt="'+escape(T.heading)+' — '+(n+1)+'" loading="lazy"><span>'+String(n+1).padStart(2,'0')+' / '+String(photos.length).padStart(2,'0')+'</span>';
          mainGrid.appendChild(btn);
        });
        section.appendChild(mainGrid);
      }

      if(closeups.length){
        var closeHeading=document.createElement('div');closeHeading.className='cms-room-gallery__section-title';
        closeHeading.innerHTML='<span>02 /</span> '+escape(T.closeups);
        section.appendChild(closeHeading);
        var closeGrid=document.createElement('div');closeGrid.className='cms-room-gallery__grid';
        closeups.forEach(function(photo,i){
          var n=mainPhotos.length+i,btn=document.createElement('button');btn.type='button';btn.className='cms-room-gallery__item';btn.setAttribute('data-home-property-index',String(n));btn.setAttribute('aria-label',T.photo+' '+(n+1));
          btn.innerHTML='<img src="'+escape(photo)+'" alt="'+escape(T.closeups)+' — '+(n+1)+'" loading="lazy"><span>'+String(n+1).padStart(2,'0')+' / '+String(photos.length).padStart(2,'0')+'</span>';
          closeGrid.appendChild(btn);
        });
        section.appendChild(closeGrid);
      }
      roomGrid.insertAdjacentElement('afterend',section);

      var lb=document.createElement('div');lb.className='cms-room-lightbox';lb.setAttribute('aria-hidden','true');
      lb.innerHTML='<button type="button" class="cms-room-lightbox__btn cms-room-lightbox__close" aria-label="'+escape(T.close)+'">×</button><button type="button" class="cms-room-lightbox__btn cms-room-lightbox__prev" aria-label="'+escape(T.previous)+'">‹</button><img class="cms-room-lightbox__image" alt=""><button type="button" class="cms-room-lightbox__btn cms-room-lightbox__next" aria-label="'+escape(T.next)+'">›</button><span class="cms-room-lightbox__counter"></span>';
      document.body.appendChild(lb);
      var lbImg=lb.querySelector('img'),counter=lb.querySelector('.cms-room-lightbox__counter'),index=0;
      function render(){index=(index+photos.length)%photos.length;lbImg.src=photos[index];lbImg.alt=T.heading+' — '+(index+1);counter.textContent=(index+1)+' / '+photos.length;}
      function open(i){index=i;render();lb.classList.add('is-open');lb.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';}
      function close(){lb.classList.remove('is-open');lb.setAttribute('aria-hidden','true');lbImg.removeAttribute('src');document.body.style.overflow='';}
      section.addEventListener('click',function(e){var btn=e.target.closest('[data-home-property-index]');if(btn)open(Number(btn.getAttribute('data-home-property-index'))||0);});
      lb.querySelector('.cms-room-lightbox__close').addEventListener('click',close);
      lb.querySelector('.cms-room-lightbox__prev').addEventListener('click',function(){index--;render();});
      lb.querySelector('.cms-room-lightbox__next').addEventListener('click',function(){index++;render();});
      lb.addEventListener('click',function(e){if(e.target===lb)close();});
      document.addEventListener('keydown',function(e){if(!lb.classList.contains('is-open'))return;if(e.key==='Escape')close();if(e.key==='ArrowLeft'){index--;render();}if(e.key==='ArrowRight'){index++;render();}});
    }).catch(function(err){console.error('[Homepage property gallery]',err);});
  }
  if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',function(){setTimeout(init,30);},{once:true});}else{setTimeout(init,30);}
})();