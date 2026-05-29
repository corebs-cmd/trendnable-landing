/* ============================================================
   Trendnable — Landing interactions
   ============================================================ */
(function () {
  "use strict";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Nav scrolled state ---------- */
  const nav = document.getElementById("nav");
  const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 12);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Theme toggle ---------- */
  const root = document.documentElement;
  const themeBtn = document.getElementById("themeToggle");
  const themeIcon = document.getElementById("themeIcon");
  const sunSvg = '<circle cx="12" cy="12" r="4"></circle><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"></path>';
  const moonSvg = '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"></path>';
  function applyTheme(t) {
    root.setAttribute("data-theme", t);
    themeIcon.innerHTML = t === "dark" ? sunSvg : moonSvg;
    try { localStorage.setItem("tn-theme", t); } catch (e) {}
  }
  let stored = "dark";
  try { stored = localStorage.getItem("tn-theme") || "dark"; } catch (e) {}
  applyTheme(stored);
  themeBtn.addEventListener("click", () => {
    applyTheme(root.getAttribute("data-theme") === "dark" ? "light" : "dark");
  });

  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll(".reveal:not(.in)");
  if (reduceMotion) {
    revealEls.forEach((el) => el.classList.add("in"));
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  }

  /* ---------- Hot Score count-up + ring ---------- */
  const scoreNum = document.getElementById("scoreNum");
  const scoreArc = document.getElementById("scoreArc");
  const TARGET = 94;
  const CIRC = 2 * Math.PI * 88; // 552.9
  let scoreDone = false;
  function animateScore() {
    if (scoreDone) return;
    scoreDone = true;
    if (reduceMotion) {
      scoreNum.textContent = TARGET;
      scoreArc.style.strokeDashoffset = CIRC * (1 - TARGET / 100);
      return;
    }
    const dur = 1500, start = performance.now();
    function tick(now) {
      const p = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      scoreNum.textContent = Math.round(eased * TARGET);
      scoreArc.style.transition = "none";
      scoreArc.style.strokeDashoffset = CIRC * (1 - (eased * TARGET) / 100);
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  const scoreRing = document.getElementById("scoreRing");
  if (scoreRing) {
    const so = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { animateScore(); so.disconnect(); } });
    }, { threshold: 0.4 });
    so.observe(scoreRing);
  }

  /* ---------- Sparkline (draw-on-scroll) ---------- */
  const data = [148, 152, 150, 158, 156, 163, 161, 170, 168, 176, 174, 188, 182, 196];
  const svg = document.getElementById("sparkSvg");
  if (svg) {
    const W = 520, H = 160, pad = 8;
    const min = Math.min(...data), max = Math.max(...data);
    const pts = data.map((v, i) => {
      const x = pad + (i / (data.length - 1)) * (W - pad * 2);
      const y = pad + (1 - (v - min) / (max - min)) * (H - pad * 2);
      return [x, y];
    });
    let d = `M ${pts[0][0]} ${pts[0][1]}`;
    for (let i = 1; i < pts.length; i++) {
      const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
      const cx = (x0 + x1) / 2;
      d += ` C ${cx} ${y0}, ${cx} ${y1}, ${x1} ${y1}`;
    }
    const path = document.getElementById("sparkPath");
    const area = document.getElementById("sparkArea");
    const dot = document.getElementById("sparkDot");
    path.setAttribute("d", d);
    area.setAttribute("d", d + ` L ${pts[pts.length - 1][0]} ${H} L ${pts[0][0]} ${H} Z`);
    dot.setAttribute("cx", pts[pts.length - 1][0]);
    dot.setAttribute("cy", pts[pts.length - 1][1]);

    const len = path.getTotalLength();
    path.style.strokeDasharray = len;
    path.style.strokeDashoffset = reduceMotion ? 0 : len;
    area.style.opacity = reduceMotion ? 1 : 0;
    dot.style.opacity = reduceMotion ? 1 : 0;

    if (!reduceMotion) {
      const po = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            path.style.transition = "stroke-dashoffset 1.8s cubic-bezier(.2,.8,.2,1)";
            path.style.strokeDashoffset = 0;
            area.style.transition = "opacity 1.2s ease 0.6s";
            area.style.opacity = 1;
            dot.style.transition = "opacity 0.5s ease 1.4s";
            dot.style.opacity = 1;
            po.disconnect();
          }
        });
      }, { threshold: 0.4 });
      po.observe(svg);
    }
  }

  /* ---------- Categories ---------- */
  const categories = [
    { name: "Funko Pop", desc: "Chases & exclusives", count: "Largest category", glyph: "🎯", tint: "#161C3E", ink: "#4D9FFF" },
    { name: "Trading Cards", desc: "Raw & graded · PSA/BGS", count: "TCG", glyph: "🃏", tint: "#131A40", ink: "#9B7DFF" },
    { name: "Pop Mart", desc: "Labubu & blind boxes", count: "Designer vinyl", glyph: "🧸", tint: "#17133C", ink: "#FF5FA0" },
    { name: "Hot Toys", desc: "1/6-scale premium", count: "Movie figures", glyph: "🎬", tint: "#0F1C3E", ink: "#5B9BFF" },
    { name: "NECA", desc: "Cult horror & pop", count: "Collector figures", glyph: "👹", tint: "#0E1D36", ink: "#FF5A4D" },
    { name: "Hot Wheels", desc: "Chases & treasure hunts", count: "Die-cast", glyph: "🏎️", tint: "#131624", ink: "#FFE13A" },
    { name: "Signed", desc: "Authenticated memorabilia", count: "Autographed", glyph: "✍️", tint: "#260020", ink: "#E84FCB" },
    { name: "ThrillJoy", desc: "Emerging designer toys", count: "New brands", glyph: "✨", tint: "#0C2010", ink: "#6FE85F" }
  ];
  const catGrid = document.getElementById("catGrid");
  if (catGrid) {
    categories.forEach((c, i) => {
      const el = document.createElement("div");
      el.className = "cat reveal" + (i % 4 === 1 ? " d1" : i % 4 === 2 ? " d2" : i % 4 === 3 ? " d3" : "");
      el.style.background = `radial-gradient(120% 120% at 100% 0%, ${hexA(c.ink, 0.18)}, transparent 55%), ${c.tint}`;
      el.style.borderColor = hexA(c.ink, 0.22);
      el.innerHTML =
        `<div class="glyph">${c.glyph}</div>` +
        `<div><div class="cname" style="color:${c.ink}">${c.name}</div>` +
        `<div class="cdesc" style="color:var(--text)">${c.desc}</div>` +
        `<div class="ccount" style="color:${c.ink}; margin-top:10px;">${c.count}</div></div>`;
      catGrid.appendChild(el);
    });
    if (!reduceMotion) {
      const io2 = new IntersectionObserver((entries) => {
        entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io2.unobserve(e.target); } });
      }, { threshold: 0.12 });
      catGrid.querySelectorAll(".reveal").forEach((el) => io2.observe(el));
    } else {
      catGrid.querySelectorAll(".reveal").forEach((el) => el.classList.add("in"));
    }
  }

  function hexA(hex, a) {
    const n = parseInt(hex.slice(1), 16);
    return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
  }

  /* ---------- Fandoms ---------- */
  const fandoms = ["One Piece", "Demon Slayer", "Star Wars", "Pokémon", "Marvel", "Anime", "Labubu", "Disney", "TMNT", "Pop Culture"];
  const fandomRow = document.getElementById("fandomRow");
  if (fandomRow) {
    fandomRow.innerHTML = fandoms.map((f) => `<span class="fandom-chip">${f}</span>`).join("");
  }

  /* ---------- Ticker ---------- */
  const tickerItems = [
    ["Labubu BIE", "94", "+8%", "up", "🧸"],
    ["Charizard PSA10", "88", "+5%", "up", "🃏"],
    ["Iron Man Mk85", "72", "+1%", "flat", "🎬"],
    ["Pennywise NECA", "61", "−4%", "down", "👹"],
    ["Treasure Hunt '24", "83", "+11%", "up", "🏎️"],
    ["Funko GITD", "76", "−3%", "down", "🎯"],
    ["Luffy Gear 5", "91", "+9%", "up", "🏴‍☠️"],
    ["Skullpanda V3", "79", "+6%", "up", "✨"]
  ];
  const ticker = document.getElementById("ticker");
  if (ticker) {
    const makeChip = (it) => {
      const cls = it[3] === "up" ? "var(--pos)" : it[3] === "down" ? "var(--neg)" : "var(--muted)";
      const arrow = it[3] === "up" ? "▲" : it[3] === "down" ? "▼" : "■";
      const scoreCls = parseInt(it[1]) >= 80 ? "hot" : parseInt(it[1]) >= 70 ? "warm" : "cool";
      return `<div style="display:flex; align-items:center; gap:10px; padding:11px 16px; border:1px solid var(--hairline); border-radius:14px; background:var(--surface); white-space:nowrap;">
        <span style="font-size:18px;">${it[4]}</span>
        <span style="font-weight:700; font-size:14px;">${it[0]}</span>
        <span class="score-pill ${scoreCls}" style="font-size:11px; padding:3px 7px;">${scoreCls === "hot" ? "🔥 " : ""}${it[1]}</span>
        <span class="mono" style="color:${cls}; font-weight:600; font-size:13px;">${arrow} ${it[2]}</span>
      </div>`;
    };
    const set = tickerItems.map(makeChip).join("");
    ticker.innerHTML = set + set; // duplicate for seamless loop
    if (!reduceMotion) {
      ticker.style.animation = "ticker 38s linear infinite";
    }
  }
})();
