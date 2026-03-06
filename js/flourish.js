
/*
  Flourish v2:
  - Thicker, brush-like tapered feel.
  - Full-bleed (100vw) background wash that can extend beyond content rails.
  - Scroll-driven reveal: "ink drop in clear water" slow diffusion.
*/
(() => {
  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ViewBox is 0 0 1200 160
  const PATHS = {
    // primary flourish stroke
    main: "M40,104 C150,58 240,54 330,78 C420,102 470,128 560,112 C650,96 690,44 790,52 C900,60 930,112 1010,118 C1090,124 1140,96 1160,74",
    // secondary echo stroke
    echo: "M60,110 C170,70 250,68 330,84 C410,100 460,118 545,106 C630,94 675,54 780,60 C890,66 920,106 1000,112 C1080,118 1128,98 1148,86",
    // curls
    curlL: "M130,128 C170,148 218,152 260,142 C304,132 328,112 338,92 C348,72 332,52 304,48 C274,44 246,64 246,88 C246,112 270,126 292,130",
    curlR: "M1070,128 C1030,148 982,152 940,142 C896,132 872,112 862,92 C852,72 868,52 896,48 C926,44 954,64 954,88 C954,112 930,126 908,130",
    hair: "M120,112 C240,94 360,92 480,102 C600,112 720,92 840,94 C960,96 1080,110 1160,98"
  };

  // A filled "brush wash" ribbon (used as semi-opaque background behind text)
  // Built as a closed shape around the main curve for a painterly taper.
  const BRUSH = {
    ribbon:
      "M40,112 C150,52 240,44 330,68 C420,92 480,140 565,120 C650,100 700,36 792,44 C902,52 930,122 1010,128 C1090,134 1140,100 1160,72 " +
      "L1160,96 C1140,118 1090,152 1002,146 C914,140 882,82 790,78 C698,74 650,130 556,146 C462,162 408,126 326,108 C244,90 150,92 40,132 Z"
  };

  function clamp(v, a, b){ return Math.max(a, Math.min(b, v)); }

  function createSvg(idx){
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("class", "flourish-svg");
    svg.setAttribute("viewBox", "0 0 1200 160");
    svg.setAttribute("aria-hidden", "true");

    const defs = document.createElementNS(svgNS, "defs");

    // Gradient for brush fill
    const grad = document.createElementNS(svgNS, "linearGradient");
    grad.setAttribute("id", `brush-grad-${idx}`);
    grad.setAttribute("x1", "0%");
    grad.setAttribute("y1", "0%");
    grad.setAttribute("x2", "100%");
    grad.setAttribute("y2", "0%");
    const stops = [
      ["0%", "rgba(0,245,212,0.0)"],
      ["22%", "rgba(0,245,212,0.55)"],
      ["55%", "rgba(255,111,216,0.40)"],
      ["78%", "rgba(0,245,212,0.38)"],
      ["100%", "rgba(0,245,212,0.0)"],
    ];
    stops.forEach(([off, col]) => {
      const s = document.createElementNS(svgNS, "stop");
      s.setAttribute("offset", off);
      s.setAttribute("stop-color", col);
      grad.appendChild(s);
    });
    defs.appendChild(grad);

    // ClipPath reveal (rect width animated with scroll)
    const clip = document.createElementNS(svgNS, "clipPath");
    clip.setAttribute("id", `reveal-${idx}`);
    const rect = document.createElementNS(svgNS, "rect");
    rect.setAttribute("x", "0");
    rect.setAttribute("y", "0");
    rect.setAttribute("width", "0");
    rect.setAttribute("height", "160");
    clip.appendChild(rect);
    defs.appendChild(clip);

    // Ink diffusion filter
    const filter = document.createElementNS(svgNS, "filter");
    filter.setAttribute("id", `ink-${idx}`);
    filter.setAttribute("x", "-10%");
    filter.setAttribute("y", "-35%");
    filter.setAttribute("width", "120%");
    filter.setAttribute("height", "170%");
    filter.setAttribute("color-interpolation-filters", "sRGB");

    const turb = document.createElementNS(svgNS, "feTurbulence");
    turb.setAttribute("type", "fractalNoise");
    turb.setAttribute("baseFrequency", "0.006 0.016");
    turb.setAttribute("numOctaves", "2");
    turb.setAttribute("seed", String(20 + (idx % 11)));
    turb.setAttribute("result", "noise");

    const disp = document.createElementNS(svgNS, "feDisplacementMap");
    disp.setAttribute("in", "SourceGraphic");
    disp.setAttribute("in2", "noise");
    disp.setAttribute("scale", "0");
    disp.setAttribute("xChannelSelector", "R");
    disp.setAttribute("yChannelSelector", "G");
    disp.setAttribute("result", "displaced");

    const blur = document.createElementNS(svgNS, "feGaussianBlur");
    blur.setAttribute("in", "displaced");
    blur.setAttribute("stdDeviation", "0");
    blur.setAttribute("result", "blurred");

    filter.appendChild(turb);
    filter.appendChild(disp);
    filter.appendChild(blur);
    defs.appendChild(filter);

    svg.appendChild(defs);

    const g = document.createElementNS(svgNS, "g");
    g.setAttribute("class", "flourish-group");
    g.setAttribute("clip-path", `url(#reveal-${idx})`);
    g.setAttribute("filter", `url(#ink-${idx})`);

    // Brush fill (background wash)
    const fill = document.createElementNS(svgNS, "path");
    fill.setAttribute("d", BRUSH.ribbon);
    fill.setAttribute("class", "brush-fill");
    fill.setAttribute("fill", `url(#brush-grad-${idx})`);
    g.appendChild(fill);

    // Strokes
    function addPath(d, cls){
      const p = document.createElementNS(svgNS, "path");
      p.setAttribute("d", d);
      p.setAttribute("class", cls);
      p.setAttribute("fill", "none");
      g.appendChild(p);
      return p;
    }

    const pMain = addPath(PATHS.main, "flourish-stroke");
    const pEcho = addPath(PATHS.echo, "flourish-stroke alt");
    const pCurlL = addPath(PATHS.curlL, "flourish-stroke");
    const pCurlR = addPath(PATHS.curlR, "flourish-stroke");
    const pHair  = addPath(PATHS.hair, "flourish-stroke hair");

    // Center dot
    const dot = document.createElementNS(svgNS, "circle");
    dot.setAttribute("cx", "600");
    dot.setAttribute("cy", "96");
    dot.setAttribute("r", "3.0");
    dot.setAttribute("class", "flourish-dot");
    g.appendChild(dot);

    svg.appendChild(g);

    return { svg, rect, paths:[pMain,pEcho,pCurlL,pCurlR,pHair], filterNodes:{turb, disp, blur}, dot, fill };
  }

  function prepDash(paths){
    paths.forEach(p => {
      try{
        const len = p.getTotalLength();
        p.style.strokeDasharray = `${len}`;
        p.style.strokeDashoffset = `${len}`;
      }catch(e){}
    });
  }

  const dividers = Array.from(document.querySelectorAll(".flourish-divider"));
  if (!dividers.length) return;

  dividers.forEach((el, i) => {
    const idx = i+1;
    const f = createSvg(idx);
    el.appendChild(f.svg);

    // alternate direction left/right
    const fromRight = (idx % 2 === 0);
    el.dataset.from = fromRight ? "right" : "left";
    if (fromRight) {
      // flip group horizontally for right-origin feel
      f.svg.style.transformOrigin = "50% 50%";
      f.svg.style.transform = "scaleX(-1)";
    }

    prepDash(f.paths);
    el.__flourish = f;
  });

  if (prefersReduced){
    dividers.forEach(el => {
      const f = el.__flourish;
      if (!f) return;
      f.rect.setAttribute("width","1200");
      f.paths.forEach(p => p.style.strokeDashoffset = "0");
      f.filterNodes.disp.setAttribute("scale","0");
      f.filterNodes.blur.setAttribute("stdDeviation","0");
      f.fill.style.opacity = "0.18";
    });
    return;
  }

  function getProgress(el){
    const r = el.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;
    const start = vh * 0.92;
    const end   = vh * 0.18;
    const mid = r.top + r.height * 0.55;
    return clamp((start - mid) / (start - end), 0, 1);
  }

  let ticking = false;

  function update(){
    ticking = false;
    dividers.forEach(el => {
      const f = el.__flourish;
      if (!f) return;

      const p = getProgress(el);

      // Clip reveal (ink spreads across)
      const w = 1200 * (0.12 + p * 0.88);
      f.rect.setAttribute("width", w.toFixed(1));

      // Stroke reveal
      f.paths.forEach((path, j) => {
        let len = 1;
        try { len = path.getTotalLength(); } catch(e){}
        const local = clamp((p * 1.06) - (j * 0.05), 0, 1);
        path.style.strokeDashoffset = String((1 - local) * len);
        path.style.opacity = String(0.18 + local * 0.82);
      });

      // Ink diffusion feel
      const dispScale = p * 14;        // stronger than v1
      const blurStd   = p * 1.4;       // soft halo
      f.filterNodes.disp.setAttribute("scale", dispScale.toFixed(2));
      f.filterNodes.blur.setAttribute("stdDeviation", blurStd.toFixed(2));

      const bfX = 0.005 + p * 0.012;
      const bfY = 0.014 + p * 0.022;
      f.filterNodes.turb.setAttribute("baseFrequency", `${bfX.toFixed(3)} ${bfY.toFixed(3)}`);

      // Brush wash opacity (serves as background behind text)
      f.fill.style.opacity = String(0.10 + p * 0.22);

      // Center dot bloom
      f.dot.setAttribute("r", (2.2 + p * 1.9).toFixed(2));
      f.dot.style.opacity = String(0.25 + p * 0.65);
    });
  }

  function requestUpdate(){
    if (!ticking){
      ticking = true;
      requestAnimationFrame(update);
    }
  }

  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);
  requestUpdate();
})();
