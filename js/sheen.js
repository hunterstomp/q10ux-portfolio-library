(() => {
  const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) return;

  const links = Array.from(document.querySelectorAll('.case-card-link'));
  if (!links.length) return;

  links.forEach(a => {
    if (a.querySelector('.q10-sheen-rare')) return;

    const s = document.createElement('span');
    s.className = 'q10-sheen-rare';
    a.appendChild(s);

    a.addEventListener('mouseenter', () => {
      // 1 in 3 hovers: rare, slower sweep
      if (Math.random() < 0.34) {
        a.classList.add('q10-rare-sweep');
        window.setTimeout(() => a.classList.remove('q10-rare-sweep'), 1400);
      }
    }, { passive: true });
  });
})();