(function(){
  'use strict';
  var lang=(document.documentElement.lang||'pl').toLowerCase();
  if(!['pl','en','de'].includes(lang))lang='pl';
  var T={
    pl:{
      kicker:'06 / POTENCJAŁ',heading:'Dwie wizje rozwoju nieruchomości',
      intro:'Dwa możliwe kierunki wykorzystania nieruchomości. Każda wizja ma charakter koncepcyjny i wymaga osobnej analizy formalnej, technicznej oraz ekonomicznej.',
      concept:'WIZJA KONCEPCYJNA',photos:'zdjęć',photo:'Zdjęcie',
      previous:'Poprzednie zdjęcie',next:'Następne zdjęcie',close:'Zamknij zdjęcie',
      placeholder:'Miejsce na zdjęcie',missing:'Plik zostanie wyświetlony po dodaniu go do biblioteki zdjęć.',
      note:'Wizja poglądowa — nie stanowi zatwierdzonego projektu.',
      visions:[
        {title:'Prywatna posiadłość',description:'Wariant zakłada wykorzystanie nieruchomości jako prywatnej posiadłości, zapewniającej właścicielom i ich bliskim komfort, prywatność oraz przestrzeń do wypoczynku.',folder:'private-estate',count:2},
        {title:'Pensjonat z basenem i spa',description:'Alternatywny scenariusz zakłada kameralny pensjonat z basenem i strefą spa, przygotowany z myślą o całorocznym wypoczynku gości.',folder:'pension-spa',count:5}
      ]
    },
    en:{
      kicker:'06 / POTENTIAL',heading:'Two visions for the property',
      intro:'Two possible directions for the future use of the property. Each vision is conceptual and requires separate planning, technical and economic assessment.',
      concept:'CONCEPT VISION',photos:'photos',photo:'Photo',
      previous:'Previous photo',next:'Next photo',close:'Close photo',
      placeholder:'Photo placeholder',missing:'This image will appear once it is added to the photo library.',
      note:'Concept only — not an approved project.',
      visions:[
        {title:'Private estate',description:'This option presents the property as a private estate, offering owners and their family comfort, privacy and space to relax.',folder:'private-estate',count:2},
        {title:'Guesthouse with pool and spa',description:'An alternative scenario explores an intimate guesthouse with a swimming pool and spa area, designed for year-round guest stays.',folder:'pension-spa',count:5}
      ]
    },
    de:{
      kicker:'06 / POTENZIAL',heading:'Zwei Nutzungsperspektiven für die Immobilie',
      intro:'Zwei mögliche Richtungen für die zukünftige Nutzung der Immobilie. Beide Visionen sind konzeptionell und erfordern eine gesonderte planungsrechtliche, technische und wirtschaftliche Prüfung.',
      concept:'KONZEPTVISION',photos:'Fotos',photo:'Foto',
      previous:'Vorheriges Foto',next:'Nächstes Foto',close:'Foto schließen',
      placeholder:'Platzhalter für ein Foto',missing:'Dieses Bild wird angezeigt, sobald es zur Fotobibliothek hinzugefügt wurde.',
      note:'Konzeptidee — kein genehmigtes Projekt.',
      visions:[
        {title:'Privates Anwesen',description:'Diese Variante zeigt die Immobilie als privates Anwesen, das Eigentümern und ihrer Familie Komfort, Privatsphäre und Raum zur Erholung bietet.',folder:'private-estate',count:2},
        {title:'Pension mit Pool und Spa',description:'Ein alternatives Szenario sieht eine gemütliche Pension mit Schwimmbad und Spa-Bereich vor, die auf ganzjährige Aufenthalte ausgerichtet ist.',folder:'pension-spa',count:5}
      ]
    }
  }[lang];
  function element(tag,className,text){var el=document.createElement(tag);if(className)el.className=className;if(text!==undefined)el.textContent=text;return el;}
  function makePlaceholder(index,src){
    var box=element('div','gorna-slide-placeholder');
    box.appendChild(element('strong',null,T.placeholder+' '+String(index+1).padStart(2,'0')));
    box.appendChild(element('span',null,T.missing));
    box.appendChild(element('code',null,src.replace(/^\//,'')));
    return box;
  }
  function createLightbox(){
    var dialog=element('div','gorna-image-lightbox');
    dialog.setAttribute('role','dialog');dialog.setAttribute('aria-modal','true');dialog.setAttribute('aria-hidden','true');
    var image=element('img','gorna-image-lightbox__image');image.alt='';
    var close=element('button','gorna-image-lightbox__button gorna-image-lightbox__close','×');
    close.type='button';close.setAttribute('aria-label',T.close);
    var prev=element('button','gorna-image-lightbox__button gorna-image-lightbox__previous','‹');
    prev.type='button';prev.setAttribute('aria-label',T.previous);
    var next=element('button','gorna-image-lightbox__button gorna-image-lightbox__next','›');
    next.type='button';next.setAttribute('aria-label',T.next);
    var counter=element('span','gorna-image-lightbox__counter');
    dialog.append(image,close,prev,next,counter);document.body.appendChild(dialog);
    var items=[],index=0,returnFocus=null,oldOverflow='';
    function render(){if(!items.length)return;index=(index+items.length)%items.length;image.src=items[index].src;image.alt=items[index].alt;counter.textContent=(index+1)+' / '+items.length;}
    function open(list,i,trigger){items=list;index=i;returnFocus=trigger||document.activeElement;oldOverflow=document.body.style.overflow;render();dialog.classList.add('is-open');dialog.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';close.focus();}
    function shut(){dialog.classList.remove('is-open');dialog.setAttribute('aria-hidden','true');image.removeAttribute('src');document.body.style.overflow=oldOverflow;if(returnFocus&&typeof returnFocus.focus==='function')returnFocus.focus();}
    close.addEventListener('click',shut);prev.addEventListener('click',function(){index--;render();});next.addEventListener('click',function(){index++;render();});
    dialog.addEventListener('click',function(e){if(e.target===dialog)shut();});
    document.addEventListener('keydown',function(e){if(!dialog.classList.contains('is-open'))return;if(e.key==='Escape'){e.preventDefault();shut();}else if(e.key==='ArrowLeft'){e.preventDefault();index--;render();}else if(e.key==='ArrowRight'){e.preventDefault();index++;render();}});
    return {open:open};
  }
  function buildVision(vision,number,lightbox){
    var article=element('article','gorna-potential-vision');
    var head=element('div','gorna-potential-vision__header');
    var identity=element('div','gorna-potential-vision__identity');
    identity.appendChild(element('div','gorna-potential-vision__kicker',T.concept+' / '+String(number).padStart(2,'0')));
    identity.appendChild(element('h3','gorna-potential-vision__title',vision.title));
    head.appendChild(identity);head.appendChild(element('span','gorna-potential-vision__count',vision.count+' '+T.photos));
    article.appendChild(head);
    article.appendChild(element('p','gorna-potential-vision__description',vision.description));
    article.appendChild(element('p','gorna-potential-vision__note',T.note));

    var carousel=element('div','gorna-potential-carousel');carousel.setAttribute('aria-label',vision.title);
    var viewport=element('div','gorna-carousel-viewport');
    var track=element('div','gorna-carousel-track');
    var entries=[];
    for(var i=0;i<vision.count;i++){
      var src='/assets/library/concepts/'+vision.folder+'/photo-'+String(i+1).padStart(2,'0')+'.webp';
      var slide=element('div','gorna-carousel-slide');
      var entry={src:src,alt:vision.title+' — '+T.photo+' '+(i+1),loaded:false,image:null,slide:slide,index:i};
      var img=element('img','gorna-potential-slide-image');
      img.alt=entry.alt;img.loading=i===0?'eager':'lazy';img.decoding='async';img.tabIndex=-1;
      img.addEventListener('load',function(e){
        var im=e.currentTarget;im.closest('.gorna-carousel-slide').classList.toggle('is-portrait',im.naturalHeight>im.naturalWidth);
        im.tabIndex=0;im.setAttribute('role','button');im.setAttribute('aria-label',im.alt+' — '+T.photo);
        var found=entries.find(function(x){return x.image===im;});if(found)found.loaded=true;
      });
      img.addEventListener('error',function(e){
        var im=e.currentTarget,found=entries.find(function(x){return x.image===im;});
        if(found){found.loaded=false;found.slide.replaceChildren(makePlaceholder(found.index,found.src));}
      },{once:true});
      img.addEventListener('click',function(e){
        var im=e.currentTarget,entry=entries.find(function(x){return x.image===im;});
        if(!entry||!entry.loaded)return;
        var loaded=entries.filter(function(x){return x.loaded;}).map(function(x){return {src:x.src,alt:x.alt};});
        var idx=loaded.findIndex(function(x){return x.src===entry.src;});
        if(idx>=0)lightbox.open(loaded,idx,im);
      });
      img.addEventListener('keydown',function(e){if((e.key==='Enter'||e.key===' ')&&e.currentTarget.tabIndex===0){e.preventDefault();e.currentTarget.click();}});
      entry.image=img;entries.push(entry);slide.appendChild(img);track.appendChild(slide);img.src=src;
    }
    viewport.appendChild(track);
    var prev=element('button','gorna-carousel-arrow gorna-carousel-prev','‹');prev.type='button';prev.setAttribute('aria-label',T.previous);
    var next=element('button','gorna-carousel-arrow gorna-carousel-next','›');next.type='button';next.setAttribute('aria-label',T.next);
    var counter=element('div','gorna-carousel-counter');counter.setAttribute('aria-live','polite');
    var current=0;
    function render(){track.style.transform='translate3d(-'+(current*100)+'%,0,0)';counter.textContent=(current+1)+' / '+vision.count;prev.disabled=current===0;next.disabled=current===vision.count-1;}
    prev.addEventListener('click',function(){current=Math.max(0,current-1);render();});
    next.addEventListener('click',function(){current=Math.min(vision.count-1,current+1);render();});
    carousel.append(viewport,prev,next,counter);article.appendChild(carousel);render();
    return article;
  }
  function init(){
    var mount=document.querySelector('[data-gorna-potential-content]');
    if(!mount||mount.dataset.initialized==='true')return;
    mount.dataset.initialized='true';
    var shell=element('div','gorna-potential-inner');
    var header=element('header','gorna-potential-intro');
    header.appendChild(element('div','gorna-potential-section-kicker',T.kicker));
    header.appendChild(element('h2','gorna-potential-section-title',T.heading));
    header.appendChild(element('p','gorna-potential-section-lead',T.intro));
    shell.appendChild(header);
    var visions=element('div','gorna-potential-visions');
    var lightbox=createLightbox();
    T.visions.forEach(function(vision,i){visions.appendChild(buildVision(vision,i+1,lightbox));});
    shell.appendChild(visions);mount.replaceChildren(shell);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();