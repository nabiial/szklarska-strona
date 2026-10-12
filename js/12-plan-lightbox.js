(function () {
  var dialog = document.getElementById('demo-plan-lightbox');
  if (!dialog || dialog.dataset.initialized === 'true') return;
  dialog.dataset.initialized = 'true';
  var plans = Array.prototype.slice.call(document.querySelectorAll('.demo-plan-image'));
  if (!plans.length) return;
  var largeImage = dialog.querySelector('[data-lightbox-image]');
  var title = dialog.querySelector('[data-lightbox-title]');
  var counter = dialog.querySelector('[data-lightbox-counter]');
  var closeButton = dialog.querySelector('[data-lightbox-close]');
  var prevButton = dialog.querySelector('[data-lightbox-prev]');
  var nextButton = dialog.querySelector('[data-lightbox-next]');
  var activeIndex = 0;
  var previouslyFocused = null;
  var previousOverflow = '';

  plans.forEach(function (plan, index) {
    plan.setAttribute('role', 'button');
    plan.setAttribute('tabindex', '0');
    plan.setAttribute('aria-haspopup', 'dialog');
    plan.setAttribute('aria-label', (plan.closest('.demo-plan-card') && plan.closest('.demo-plan-card').querySelector('h3') ? plan.closest('.demo-plan-card').querySelector('h3').textContent.trim() : 'Rzut kondygnacji') + ' — kliknij, aby powiększyć');
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
    largeImage.src = thumb.currentSrc || thumb.src;
    largeImage.alt = thumb.alt || (heading ? heading.textContent.trim() : 'Rzut kondygnacji');
    title.textContent = heading ? heading.textContent.trim() : 'Rzut kondygnacji';
    counter.textContent = (activeIndex + 1) + ' / ' + plans.length;
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
