(function () {
  'use strict';
  var dialog = document.getElementById('demo-plan-lightbox');
  if (!dialog || dialog.dataset.initialized === 'true') return;

  var plans = Array.prototype.slice.call(document.querySelectorAll('.demo-plan-image'));
  if (!plans.length) return;

  var viewer = dialog.querySelector('[data-lightbox-viewer]');
  var largeImage = dialog.querySelector('[data-lightbox-image]');
  var title = dialog.querySelector('[data-lightbox-title]');
  var counter = dialog.querySelector('[data-lightbox-counter]');
  var closeButton = dialog.querySelector('[data-lightbox-close]');
  var prevButton = dialog.querySelector('[data-lightbox-prev]');
  var nextButton = dialog.querySelector('[data-lightbox-next]');
  var zoomOutButton = dialog.querySelector('[data-lightbox-zoom-out]');
  var zoomInButton = dialog.querySelector('[data-lightbox-zoom-in]');
  var zoomFitButton = dialog.querySelector('[data-lightbox-zoom-fit]');
  var zoomLabel = dialog.querySelector('[data-lightbox-zoom-level]');
  if (!viewer || !largeImage || !title || !counter || !closeButton || !prevButton || !nextButton ||
      !zoomOutButton || !zoomInButton || !zoomFitButton || !zoomLabel) return;

  dialog.dataset.initialized = 'true';
  var activeIndex = 0;
  var zoom = 1.25;
  var previouslyFocused = null;
  var previousOverflow = '';
  var language = (document.documentElement.getAttribute('lang') || 'pl').slice(0, 2).toLowerCase();
  var labels = {
    pl: { zoom: ' — kliknij, aby powiększyć', floor: 'Rzut kondygnacji', close: 'Zamknij powiększenie', previous: 'Poprzedni rzut', next: 'Następny rzut', fit: 'Dopasuj' },
    en: { zoom: ' — select to enlarge', floor: 'Floor plan', close: 'Close enlarged plan', previous: 'Previous floor plan', next: 'Next floor plan', fit: 'Fit' },
    de: { zoom: ' — zum Vergrößern auswählen', floor: 'Grundriss', close: 'Vergrößerung schließen', previous: 'Vorheriger Grundriss', next: 'Nächster Grundriss', fit: 'Anpassen' }
  }[language] || { zoom: ' — select to enlarge', floor: 'Floor plan', close: 'Close enlarged plan', previous: 'Previous floor plan', next: 'Next floor plan', fit: 'Fit' };

  plans.forEach(function (plan, index) {
    plan.setAttribute('role', 'button');
    plan.setAttribute('tabindex', '0');
    plan.setAttribute('aria-haspopup', 'dialog');
    plan.setAttribute('aria-label', (plan.closest('.demo-plan-card') && plan.closest('.demo-plan-card').querySelector('h3') ? plan.closest('.demo-plan-card').querySelector('h3').textContent.trim() : labels.floor) + labels.zoom);
    plan.addEventListener('click', function () { openPlan(index); });
    plan.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openPlan(index);
      }
    });
  });

  function renderZoom() {
    largeImage.style.width = (zoom * 100) + '%';
    zoomLabel.textContent = Math.round(zoom * 100) + '%';
    zoomOutButton.disabled = zoom <= 0.75;
    zoomInButton.disabled = zoom >= 3;
  }

  function setZoom(value) {
    var oldWidth = viewer.scrollWidth;
    var oldHeight = viewer.scrollHeight;
    var ratioX = oldWidth ? (viewer.scrollLeft + viewer.clientWidth / 2) / oldWidth : 0.5;
    var ratioY = oldHeight ? (viewer.scrollTop + viewer.clientHeight / 2) / oldHeight : 0.5;
    zoom = Math.max(0.75, Math.min(3, Math.round(value * 4) / 4));
    renderZoom();
    requestAnimationFrame(function () {
      viewer.scrollLeft = Math.max(0, ratioX * viewer.scrollWidth - viewer.clientWidth / 2);
      viewer.scrollTop = Math.max(0, ratioY * viewer.scrollHeight - viewer.clientHeight / 2);
    });
  }

  function renderPlan(index) {
    activeIndex = (index + plans.length) % plans.length;
    var thumb = plans[activeIndex];
    var card = thumb.closest('.demo-plan-card');
    var heading = card ? card.querySelector('h3') : null;
    largeImage.src = thumb.currentSrc || thumb.src;
    largeImage.alt = thumb.alt || (heading ? heading.textContent.trim() : labels.floor);
    title.textContent = heading ? heading.textContent.trim() : labels.floor;
    counter.textContent = (activeIndex + 1) + ' / ' + plans.length;
    viewer.scrollTop = 0;
    viewer.scrollLeft = 0;
    zoom = 1.25;
    renderZoom();
    prevButton.hidden = plans.length < 2;
    nextButton.hidden = plans.length < 2;
  }

  function openPlan(index) {
    previouslyFocused = document.activeElement;
    previousOverflow = document.body.style.overflow;
    renderPlan(index);
    dialog.classList.add('is-open');
    dialog.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    closeButton.focus();
  }

  function closePlan() {
    dialog.classList.remove('is-open');
    dialog.setAttribute('aria-hidden', 'true');
    largeImage.removeAttribute('src');
    document.body.style.overflow = previousOverflow;
    if (previouslyFocused && typeof previouslyFocused.focus === 'function') previouslyFocused.focus();
  }

  dialog.setAttribute('aria-label', labels.floor);
  closeButton.setAttribute('aria-label', labels.close);
  prevButton.setAttribute('aria-label', labels.previous);
  nextButton.setAttribute('aria-label', labels.next);
  zoomFitButton.textContent = labels.fit;
  closeButton.addEventListener('click', closePlan);
  prevButton.addEventListener('click', function () { renderPlan(activeIndex - 1); });
  nextButton.addEventListener('click', function () { renderPlan(activeIndex + 1); });
  zoomOutButton.addEventListener('click', function () { setZoom(zoom - 0.25); });
  zoomInButton.addEventListener('click', function () { setZoom(zoom + 0.25); });
  zoomFitButton.addEventListener('click', function () { setZoom(1); });
  viewer.addEventListener('wheel', function (event) {
    if (event.ctrlKey || event.metaKey) {
      event.preventDefault();
      setZoom(zoom + (event.deltaY < 0 ? 0.25 : -0.25));
    }
  }, { passive: false });
  dialog.addEventListener('click', function (event) {
    if (event.target === dialog) closePlan();
  });
  document.addEventListener('keydown', function (event) {
    if (!dialog.classList.contains('is-open')) return;
    if (event.key === 'Escape') { event.preventDefault(); closePlan(); }
    else if (event.key === 'ArrowLeft') { event.preventDefault(); renderPlan(activeIndex - 1); }
    else if (event.key === 'ArrowRight') { event.preventDefault(); renderPlan(activeIndex + 1); }
    else if (event.key === '+' || event.key === '=') { event.preventDefault(); setZoom(zoom + 0.25); }
    else if (event.key === '-') { event.preventDefault(); setZoom(zoom - 0.25); }
  });
})();
