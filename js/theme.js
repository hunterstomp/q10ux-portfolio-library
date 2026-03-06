
(() => {
  const STORAGE_KEY = "q10ux_theme";
  const root = document.documentElement;

  function getPreferred(){
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "dark" || saved === "light") return saved;
    // follow OS
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  }

  function apply(theme){
    root.setAttribute("data-theme", theme);
    // update toggle label/icon mood
    document.querySelectorAll(".theme-toggle").forEach(btn => {
      btn.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
      const label = btn.querySelector(".label");
      if (label) label.textContent = theme === "dark" ? "Dark" : "Light";
    });
  }

  function toggle(){
    const current = root.getAttribute("data-theme") || getPreferred();
    const next = current === "dark" ? "light" : "dark";
    localStorage.setItem(STORAGE_KEY, next);
    apply(next);
  }

  // init
  apply(getPreferred());

  // bind
  window.addEventListener("click", (e) => {
    const btn = e.target && e.target.closest ? e.target.closest(".theme-toggle") : null;
    if (!btn) return;
    e.preventDefault();
    toggle();
  });

  // if no saved value, react to OS changes
  const mq = window.matchMedia ? window.matchMedia("(prefers-color-scheme: light)") : null;
  if (mq && mq.addEventListener){
    mq.addEventListener("change", () => {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return;
      apply(getPreferred());
    });
  }
})();
