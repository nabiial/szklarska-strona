(function(){
  'use strict';
  var lang=(document.documentElement.lang||'pl').toLowerCase();
  if(!['pl','en','de'].includes(lang))lang='pl';
  var T={
    pl:{heading:'Dodatkowe zdjęcia domu',card:'Galeria domu',count:'zdjęć',open:'Otwórz galerię zdjęć domu'},
    en:{heading:'Additional house photos',card:'House gallery',count:'photos',open:'Open the house photo gallery'},
    de:{heading:'Weitere Hausfotos',card:'Hausgalerie',count:'Fotos',open:'Hausfotogalerie öffnen'}
  }[lang];
  function asset(p){if(!p)return '';if(/^(https?:|data:|blob:)/i.test(p))return p;return p.charAt(0)==='/'?p:'/'+p.replace(/^\.\//,'');}
  function init(){
    var floor=document.querySelector('#floor-2');
    var roomGrid=floor&&floor.querySelector('.framer-lgwkta');
    if(!floor||!roomGrid||floor.querySelector('.cms-home-property-gallery'))return;
    fetch('/data/property-detail-gallery.json',{cache:'no-store'}).then(function(r){if(!r.ok)throw new Error('HTTP '+r.status);return r.json();}).then(function(data){
      var cover=asset(data.cover||'');
      var normal=(Array.isArray(data.normal)?data.normal:[]).filter(function(x){return x&&x.visible!==false&&x.image;});
      var closeups=(Array.isArray(data.closeup)?data.closeup:[]).filter(function(x){return x&&x.visible!==false&&x.image;});
      if(!cover&&normal.length)cover=asset(normal.shift().image);
      if(!cover)return;
      var count=(cover?1:0)+normal.length+closeups.length;
      var section=document.createElement('section');
      section.className='cms-home-property-gallery';
      section.setAttribute('aria-label',T.heading);
      var title=document.createElement('h2');
      title.className='cms-home-property-gallery__title';
      title.textContent=T.heading;
      section.appendChild(title);

      var cards=document.createElement('div');
      cards.className='cms-home-property-gallery__cards';
      var wrap=document.createElement('div');wrap.className='framer-g64o0s-container';
      var link=document.createElement('a');
      link.className='framer-TpXiW framer-KZiQC framer-2xqcxj framer-v-2xqcxj framer-1x7qxw4';
      link.href='/rooms/house-gallery/?lang='+lang;
      link.setAttribute('data-framer-name','Default');
      link.setAttribute('aria-label',T.open);
      link.style.backgroundColor='var(--token-fc16edd0-affb-456f-8870-2d4b031d5ef8)';
      link.style.width='100%';

      var media=document.createElement('div');media.className='framer-2m9q60';media.setAttribute('data-framer-name','Room Photograph');
      var imageWrap=document.createElement('div');imageWrap.setAttribute('data-framer-background-image-wrapper','true');
      imageWrap.style.cssText='position:absolute;border-radius:inherit;top:0;right:0;bottom:0;left:0';
      var img=document.createElement('img');img.src=cover;img.alt=T.card;img.loading='lazy';img.decoding='async';
      img.style.cssText='display:block;width:100%;height:100%;border-radius:inherit;object-fit:cover;object-position:center';
      imageWrap.appendChild(img);media.appendChild(imageWrap);link.appendChild(media);

      var caption=document.createElement('div');caption.className='framer-i9qj0';caption.setAttribute('data-border','true');caption.setAttribute('data-framer-name','Room Caption');
      caption.style.cssText='--border-bottom-width:1px;--border-color:var(--token-24623156-2355-46f6-ad64-fee3da428f3f);--border-left-width:0px;--border-right-width:0px;--border-style:solid;--border-top-width:0px';
      var nameWrap=document.createElement('div');nameWrap.className='framer-10bhym2';
      nameWrap.setAttribute('data-framer-component-type','RichTextContainer');
      var name=document.createElement('p');name.className='framer-text';name.dir='auto';name.textContent=T.card;
      name.style.cssText='--font-selector:RlM7TWFucm9wZS1yZWd1bGFy;--framer-font-family:"Manrope","Manrope Placeholder",sans-serif;--framer-font-size:22px;--framer-text-color:var(--token-a6bdeedf-9a67-47f1-9ad3-200b97319385)';
      nameWrap.appendChild(name);
      var countWrap=document.createElement('div');countWrap.className='framer-nqtl28';countWrap.setAttribute('data-framer-component-type','RichTextContainer');
      var countText=document.createElement('p');countText.className='framer-text framer-styles-preset-1yn8miw';countText.setAttribute('data-styles-preset','hsXT0T6eW');countText.dir='auto';countText.textContent=count+' '+T.count;
      countWrap.appendChild(countText);
      var arrow=document.createElementNS('http://www.w3.org/2000/svg','svg');arrow.setAttribute('class','framer-HfmfX framer-87klu4');arrow.setAttribute('role','presentation');arrow.setAttribute('viewBox','0 0 24 24');
      var use=document.createElementNS('http://www.w3.org/2000/svg','use');use.setAttribute('href','#1475982494');arrow.appendChild(use);
      caption.appendChild(nameWrap);caption.appendChild(countWrap);caption.appendChild(arrow);
      link.appendChild(caption);wrap.appendChild(link);cards.appendChild(wrap);section.appendChild(cards);
      roomGrid.insertAdjacentElement('afterend',section);
    }).catch(function(err){console.error('[Homepage property gallery]',err);});
  }
  if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',function(){setTimeout(init,30);},{once:true});}else{setTimeout(init,30);}
})();