(() => {
  "use strict";

  const lang = ["pl", "en", "de"].includes(document.documentElement.lang)
    ? document.documentElement.lang : "pl";
  const ui = {
    pl: {
      previous: "Poprzednie zdjęcie", next: "Następne zdjęcie",
      close: "Zamknij zdjęcie", placeholder: "Miejsce na zdjęcie", photo: "Zdjęcie"
    },
    en: {
      previous: "Previous photo", next: "Next photo",
      close: "Close photo", placeholder: "Photo placeholder", photo: "Photo"
    },
    de: {
      previous: "Vorheriges Foto", next: "Nächstes Foto",
      close: "Foto schließen", placeholder: "Platzhalter für Foto", photo: "Foto"
    }
  }[lang];

  function makePlaceholder(item, index) {
    const el = document.createElement("div");
    el.className = "gorna-slide-placeholder";
    const title = document.createElement("strong");
    title.textContent = item.alt?.[lang] || (ui.photo + " " + String(index + 1).padStart(2, "0"));
    const note = document.createElement("span");
    note.textContent = ui.placeholder;
    const path = document.createElement("code");
    path.textContent = String(item.src || "").replace(/^\//, "");
    el.append(title, note, path);
    return el;
  }

  function createLightbox(slides) {
    const dialog = document.createElement("div");
    dialog.className = "gorna-image-lightbox";
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("aria-modal", "true");
    dialog.setAttribute("aria-label", ui.photo);
    dialog.setAttribute("aria-hidden", "true");

    const image = document.createElement("img");
    image.className = "gorna-image-lightbox__image";
    image.alt = "";

    const close = document.createElement("button");
    close.className = "gorna-image-lightbox__button gorna-image-lightbox__close";
    close.type = "button";
    close.textContent = "×";
    close.setAttribute("aria-label", ui.close);

    const previous = document.createElement("button");
    previous.className = "gorna-image-lightbox__button gorna-image-lightbox__previous";
    previous.type = "button";
    previous.textContent = "‹";
    previous.setAttribute("aria-label", ui.previous);

    const next = document.createElement("button");
    next.className = "gorna-image-lightbox__button gorna-image-lightbox__next";
    next.type = "button";
    next.textContent = "›";
    next.setAttribute("aria-label", ui.next);

    const counter = document.createElement("span");
    counter.className = "gorna-image-lightbox__counter";

    dialog.append(image, close, previous, next, counter);
    document.body.appendChild(dialog);

    let active = 0;
    let returnFocus = null;
    let oldOverflow = "";

    function render() {
      active = (active + slides.length) % slides.length;
      const item = slides[active];
      image.src = item.src;
      image.alt = item.alt?.[lang] || (ui.photo + " " + (active + 1));
      counter.textContent = (active + 1) + " / " + slides.length;
    }

    function open(index, trigger) {
      returnFocus = trigger || document.activeElement;
      oldOverflow = document.body.style.overflow;
      active = index;
      render();
      dialog.classList.add("is-open");
      dialog.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      close.focus();
    }

    function shut() {
      dialog.classList.remove("is-open");
      dialog.setAttribute("aria-hidden", "true");
      image.removeAttribute("src");
      document.body.style.overflow = oldOverflow;
      if (returnFocus && typeof returnFocus.focus === "function") returnFocus.focus();
    }

    close.addEventListener("click", shut);
    previous.addEventListener("click", () => { active--; render(); });
    next.addEventListener("click", () => { active++; render(); });
    dialog.addEventListener("click", event => {
      if (event.target === dialog) shut();
    });
    document.addEventListener("keydown", event => {
      if (!dialog.classList.contains("is-open")) return;
      if (event.key === "Escape") { event.preventDefault(); shut(); }
      else if (event.key === "ArrowLeft") { event.preventDefault(); active--; render(); }
      else if (event.key === "ArrowRight") { event.preventDefault(); active++; render(); }
    });

    return { open };
  }

  function initGallery(config) {
    const root = document.querySelector("[data-gorna-gallery]");
    if (!root) return;

    const track = root.querySelector(".gorna-carousel-track");
    const counter = root.querySelector(".gorna-carousel-counter");
    const previous = root.querySelector(".gorna-carousel-prev");
    const next = root.querySelector(".gorna-carousel-next");
    const slides = Array.isArray(config.residenceGallery) ? config.residenceGallery.filter(x => x && x.src) : [];
    if (!track || !previous || !next || !slides.length) return;

    previous.setAttribute("aria-label", ui.previous);
    next.setAttribute("aria-label", ui.next);
    track.replaceChildren();

    const lightbox = createLightbox(slides);
    slides.forEach((item, index) => {
      const slide = document.createElement("div");
      slide.className = "gorna-carousel-slide";

      const image = document.createElement("img");
      image.loading = "eager";
      image.decoding = "async";
      image.alt = item.alt?.[lang] || (ui.photo + " " + (index + 1));
      image.tabIndex = 0;
      image.setAttribute("role", "button");
      image.setAttribute("aria-label", image.alt + " — " + ui.photo);
      image.addEventListener("error", () => {
        slide.replaceChildren(makePlaceholder(item, index));
      }, { once: true });
      image.addEventListener("click", () => lightbox.open(index, image));
      image.addEventListener("keydown", event => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          lightbox.open(index, image);
        }
      });
      image.src = item.src;
      slide.appendChild(image);
      track.appendChild(slide);
    });

    let current = 0;
    const render = () => {
      track.style.transform = "translate3d(-" + (current * 100) + "%,0,0)";
      if (counter) counter.textContent = (current + 1) + " / " + slides.length;
      previous.disabled = current === 0;
      next.disabled = current === slides.length - 1;
    };

    previous.addEventListener("click", () => { current = Math.max(0, current - 1); render(); });
    next.addEventListener("click", () => { current = Math.min(slides.length - 1, current + 1); render(); });
    render();
  }

  function initMap(config) {
    const image = document.getElementById("gorna-geoportal-image");
    const placeholder = document.getElementById("gorna-geoportal-placeholder");
    if (image && config.geoportalImage) {
      image.addEventListener("load", () => {
        image.hidden = false;
        if (placeholder) placeholder.hidden = true;
      }, { once: true });
      image.addEventListener("error", () => {
        image.hidden = true;
        if (placeholder) placeholder.hidden = false;
      }, { once: true });
      image.src = config.geoportalImage;
    }
    document.querySelectorAll("[data-gorna-link]").forEach(link => {
      const key = link.getAttribute("data-gorna-link");
      if (typeof config[key] === "string" && config[key]) link.href = config[key];
    });
  }

  function fallbackGallery() {
    const track = document.querySelector("[data-gorna-gallery] .gorna-carousel-track");
    if (!track) return;
    const slides = Array.from(track.querySelectorAll("img")).map(img => ({
      src: img.getAttribute("src"),
      alt: {
        pl: img.getAttribute("alt") || "",
        en: img.getAttribute("data-alt-en") || img.getAttribute("alt") || "",
        de: img.getAttribute("data-alt-de") || img.getAttribute("alt") || ""
      }
    })).filter(item => item.src);
    if (slides.length) initGallery({ residenceGallery: slides });
  }

  fetch("/data/site-config.json?v=20261025d", { cache: "no-store" })
    .then(response => {
      if (!response.ok) throw new Error("Config unavailable: HTTP " + response.status);
      return response.json();
    })
    .then(config => { initGallery(config); initMap(config); })
    .catch(error => {
      console.error("[Gorna 22] Could not load site configuration.", error);
      fallbackGallery();
      initMap({});
    });
})();
