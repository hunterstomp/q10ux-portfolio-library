// Flow step filtering (chips) — scoped per case section
// Looks for .flow-filters + a sibling .flow-rail gallery.
// Each .flow-step must have data-tags="happy edge error recovery ..." etc.

function initFlowFilters() {
  const filterGroups = document.querySelectorAll('.flow-filters');
  filterGroups.forEach((group) => {
    const section = group.closest('.case-section') || document;
    const rail = section.querySelector('.flow-rail');
    if (!rail) return;

    const chips = Array.from(group.querySelectorAll('[data-flow-filter]'));
    const steps = Array.from(rail.querySelectorAll('.flow-step'));

    const setActive = (filter) => {
      chips.forEach((c) => c.classList.toggle('active', c.dataset.flowFilter === filter));
      steps.forEach((step) => {
        const tags = (step.getAttribute('data-tags') || '').split(/\s+/).filter(Boolean);
        const show = (filter === 'all') || tags.includes(filter);
        step.classList.toggle('is-hidden', !show);
      });

      const story = section.querySelector('.flow-story');
      if (story) {
        const messages = {
          all: "Skim the full journey: inputs, decision points, failure states, and how the system resolves back to safety.",
          happy: "Happy path: the intended route when data is clean and the user’s intent is clear. This is where speed and confidence matter.",
          edge: "Edge cases: account states, eligibility quirks, unusual combinations, and the “yes, but…” scenarios that break simplistic flows.",
          error: "Errors: moments where the system can’t do what the user expects. The goal is clear cause, clear next step, minimal blame.",
          recovery: "Recovery: getting someone back on track after an error or a wrong turn, without forcing them to restart or re-enter everything."
        };
        story.textContent = messages[filter] || messages.all;
      }
      // nudge scroll back to start so it feels intentional
      rail.scrollTo({ left: 0, behavior: 'smooth' });
    };

    chips.forEach((chip) => {
      chip.addEventListener('click', () => setActive(chip.dataset.flowFilter));
    });

    // default
    setActive('all');
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initFlowFilters);
} else {
  initFlowFilters();
}
