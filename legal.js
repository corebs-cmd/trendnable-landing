/* Trendnable — legal page interactions (theme, nav, TOC scrollspy) */
(function () {
  "use strict";
  const root = document.documentElement;

  /* Theme (shared with landing via localStorage) */
  const themeBtn = document.getElementById("themeToggle");
  const themeIcon = document.getElementById("themeIcon");
  const sun = '<circle cx="12" cy="12" r="4"></circle><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"></path>';
  const moon = '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"></path>';
  function applyTheme(t) {
    root.setAttribute("data-theme", t);
    if (themeIcon) themeIcon.innerHTML = t === "dark" ? sun : moon;
    try { localStorage.setItem("tn-theme", t); } catch (e) {}
  }
  let stored = "dark";
  try { stored = localStorage.getItem("tn-theme") || "dark"; } catch (e) {}
  applyTheme(stored);
  if (themeBtn) themeBtn.addEventListener("click", () => {
    applyTheme(root.getAttribute("data-theme") === "dark" ? "light" : "dark");
  });

  /* Nav scrolled state */
  const nav = document.getElementById("nav");
  const onScroll = () => nav && nav.classList.toggle("scrolled", window.scrollY > 12);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* TOC scrollspy */
  const links = Array.from(document.querySelectorAll("#tocNav a"));
  const sections = links
    .map((a) => document.getElementById(a.getAttribute("href").slice(1)))
    .filter(Boolean);
  if (sections.length) {
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const id = e.target.id;
            links.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + id));
          }
        });
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
    );
    sections.forEach((s) => spy.observe(s));
  }
})();
