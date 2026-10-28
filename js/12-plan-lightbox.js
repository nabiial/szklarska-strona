(function () {
  'use strict';
  var dialog = document.getElementById('demo-plan-lightbox');
  if (!dialog || dialog.dataset.initialized === 'true') return;

  var plans = Array.prototype.slice.call(document.querySelectorAll('.demo-plan-image'));
  if (!plans.length) return;

  var documentFrame = dialog.querySelector('[data-lightbox-pdf]');
  var title = dialog.querySelector('[data-lightbox-title]');
  var counter = dialog.querySelector('[data-lightbox-counter]');
  var closeButton = dialog.querySelector('[data-lightbox-close]');
  var prevButton = dialog.querySelector('[data-lightbox-prev]');
  var nextButton = dialog.querySelector('[data-lightbox-next]');
  if (!documentFrame || !title || !counter || !closeButton || !prevButton || !nextButton) return;

  dialog.dataset.initialized = 'true';
  var activeIndex = 0;
  var previouslyFocused = null;
  var previousOverflow = '';
  var language = (document.documentElement.getAttribute('lang') || 'pl').slice(0, 2).toLowerCase();
  var labels = {
    pl: { zoom: ' — kliknij, aby powiększyć', floor: 'Rzut kondygnacji', close: 'Zamknij powiększenie', previous: 'Poprzedni rzut', next: 'Następny rzut', frame: 'Wektorowy podgląd rzutu w PDF' },
    en: { zoom: ' — select to enlarge', floor: 'Floor plan', close: 'Close enlarged plan', previous: 'Previous floor plan', next: 'Next floor plan', frame: 'Vector floor plan PDF preview' },
    de: { zoom: ' — zum Vergrößern auswählen', floor: 'Grundriss', close: 'Vergrößerung schließen', previous: 'Vorheriger Grundriss', next: 'Nächster Grundriss', frame: 'Vektor-Grundriss als PDF' }
  }[language] || { zoom: ' — select to enlarge', floor: 'Floor plan', close: 'Close enlarged plan', previous: 'Previous floor plan', next: 'Next floor plan', frame: 'Vector floor plan PDF preview' };

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

  function renderPlan(index) {
    activeIndex = (index + plans.length) % plans.length;
    var thumb = plans[activeIndex];
    var card = thumb.closest('.demo-plan-card');
    var heading = card ? card.querySelector('h3') : null;
    var planTitle = heading ? heading.textContent.trim() : labels.floor;
    title.textContent = planTitle;
    counter.textContent = (activeIndex + 1) + ' / ' + plans.length;
    documentFrame.title = planTitle + ' — ' + labels.frame;
    documentFrame.src = '/assets/library/floorplans/gorna-22a-floor-plans.pdf#page=' + (activeIndex + 1) + '&zoom=page-width';
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
    documentFrame.src = 'about:blank';
    document.body.style.overflow = previousOverflow;
    if (previouslyFocused && typeof previouslyFocused.focus === 'function') previouslyFocused.focus();
  }

  dialog.setAttribute('aria-label', labels.floor);
  closeButton.setAttribute('aria-label', labels.close);
  prevButton.setAttribute('aria-label', labels.previous);
  nextButton.setAttribute('aria-label', labels.next);
  closeButton.addEventListener('click', closePlan);
  prevButton.addEventListener('click', function () { renderPlan(activeIndex - 1); });
  nextButton.addEventListener('click', function () { renderPlan(activeIndex + 1); });
  dialog.addEventListener('click', function (event) {
    if (event.target === dialog) closePlan();
  });
  document.addEventListener('keydown', function (event) {
    if (!dialog.classList.contains('is-open')) return;
    if (event.key === 'Escape') { event.preventDefault(); closePlan(); }
    else if (event.key === 'ArrowLeft') { event.preventDefault(); renderPlan(activeIndex - 1); }
    else if (event.key === 'ArrowRight') { event.preventDefault(); renderPlan(activeIndex + 1); }
  });
})();
