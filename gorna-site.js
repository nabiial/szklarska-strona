(() => {
  "use strict";
  const lang = ["pl","en","de"].includes(document.documentElement.lang) ? document.documentElement.lang : "pl";
  const ui = {
    pl: { previous:"Poprzednie zdjęcie", next:"Następne zdjęcie", placeholder:"Miejsce na zdjęcie", photo:"Zdjęcie" },
    en: { previous:"Previous photo", next:"Next photo", placeholder:"Photo placeholder", photo:"Photo" },
    de: { previous:"Vorheriges Foto", next:"Nächstes Foto", placeholder:"Platzhalter für Foto", photo:"Foto" }
  }[lang];

  function makePlaceholder(item, index) {
    const el = document.createElement("div");
    el.className = "gorna-slide-placeholder";
    const title = document.createElement("strong");
    title.textContent = item.alt?.[lang] || (ui.photo + " " + String(index + 1).padStart(2,"0"));
    const note = document.createElement("span");
    note.textContent = ui.placeholder;
    const path = document.createElement("code");
    path.textContent = item.src.replace(/^\//,"");
    el.append(title,note,path);
    return el;
  }

  function initGallery(config) {
    const root = document.querySelector("[data-gorna-gallery]");
    if (!root) return;
    const track = root.querySelector(".gorna-carousel-track");
    const counter = root.querySelector(".gorna-carousel-counter");
    const previous = root.querySelector(".gorna-carousel-prev");
    const next = root.querySelector(".gorna-carousel-next");
    const slides = Array.isArray(config.residenceGallery) ? config.residenceGallery : [];
    if (!track || !slides.length) return;
    previous.setAttribute("aria-label",ui.previous);
    next.setAttribute("aria-label",ui.next);
    track.replaceChildren();
    slides.forEach((item,index) => {
      const slide = document.createElement("div");
      slide.className = "gorna-carousel-slide";
      if (item.src) {
        const image = document.createElement("img");
        image.loading = index < 2 ? "eager" : "lazy";
        image.decoding = "async";
        image.alt = item.alt?.[lang] || (ui.photo + " " + (index + 1));
        image.addEventListener("error",() => {
          slide.replaceChildren(makePlaceholder(item,index));
        },{once:true});
        image.src = item.src;
        slide.appendChild(image);
      } else {
        slide.appendChild(makePlaceholder(item,index));
      }
      track.appendChild(slide);
    });
    let current = 0;
    const render = () => {
      track.style.transform = "translateX(-" + (current * 100) + "%)";
      if (counter) counter.textContent = (current + 1) + " / " + slides.length;
      previous.disabled = current === 0;
      next.disabled = current === slides.length - 1;
    };
    previous.addEventListener("click",() => { current = Math.max(0,current - 1); render(); });
    next.addEventListener("click",() => { current = Math.min(slides.length - 1,current + 1); render(); });
    render();
  }

  function initMap(config) {
    const image = document.getElementById("gorna-geoportal-image");
    const placeholder = document.getElementById("gorna-geoportal-placeholder");
    if (image && config.geoportalImage) {
      image.addEventListener("load",() => { image.hidden = false; if (placeholder) placeholder.hidden = true; },{once:true});
      image.addEventListener("error",() => { image.hidden = true; if (placeholder) placeholder.hidden = false; },{once:true});
      image.src = config.geoportalImage;
    }
    document.querySelectorAll("[data-gorna-link]").forEach(link => {
      const key = link.getAttribute("data-gorna-link");
      if (typeof config[key] === "string" && config[key]) link.href = config[key];
    });
  }

  fetch("/data/site-config.json",{cache:"no-cache"})
    .then(response => { if (!response.ok) throw new Error("Config unavailable"); return response.json(); })
    .then(config => { initGallery(config); initMap(config); })
    .catch(() => { /* The static placeholders remain available if config cannot be loaded. */ });
})();