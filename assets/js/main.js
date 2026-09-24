/* Dataflec — main script (vanilla, no dependencies) */
(function () {
  "use strict";
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* header */
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () { header.classList.toggle("is-scrolled", window.scrollY > 10); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* mobile nav */
  var toggle = document.querySelector(".nav__toggle");
  var menu = document.querySelector(".nav__menu");
  if (toggle && menu) {
    var setMenu = function (open) {
      menu.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    };
    toggle.addEventListener("click", function () { setMenu(!menu.classList.contains("is-open")); });
    menu.addEventListener("click", function (e) { if (e.target.closest("a")) setMenu(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });
    document.addEventListener("click", function (e) {
      if (!menu.classList.contains("is-open")) return;
      if (!menu.contains(e.target) && !toggle.contains(e.target)) setMenu(false);
    });
    window.addEventListener("resize", function () { if (window.innerWidth > 860) setMenu(false); });
  }

  /* reveal */
  var revealables = document.querySelectorAll("[data-reveal]");
  if (revealables.length) {
    if (reduceMotion || !("IntersectionObserver" in window)) {
      revealables.forEach(function (el) { el.classList.add("is-visible"); });
    } else {
      var ro = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          ro.unobserve(entry.target);
        });
      }, { threshold: 0.1, rootMargin: "0px 0px -6% 0px" });
      revealables.forEach(function (el) { ro.observe(el); });
    }
  }

  /* counters + progress bars */
  var animate = function (el) {
    var raw = el.getAttribute("data-count");
    var target = parseFloat(raw);
    if (isNaN(target)) return;
    var decimals = (raw.split(".")[1] || "").length;
    var duration = 1500, start = null;
    var step = function (ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * eased).toFixed(decimals);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  var counted = document.querySelectorAll("[data-count]");
  var bars = document.querySelectorAll(".bar i[data-value]");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    counted.forEach(function (el) { el.textContent = el.getAttribute("data-count"); });
    bars.forEach(function (el) { el.style.width = el.getAttribute("data-value") + "%"; });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var el = entry.target;
        if (el.hasAttribute("data-count")) animate(el);
        if (el.matches(".bar i[data-value]")) el.style.width = el.getAttribute("data-value") + "%";
        io.unobserve(el);
      });
    }, { threshold: 0.4 });
    counted.forEach(function (el) { io.observe(el); });
    bars.forEach(function (el) { io.observe(el); });
  }

  /* year */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  /* back to top */
  var toTop = document.querySelector(".to-top");
  if (toTop) {
    var toggleTop = function () { toTop.classList.toggle("is-visible", window.scrollY > 700); };
    toggleTop();
    window.addEventListener("scroll", toggleTop, { passive: true });
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
  }

  /* static forms -> mailto */
  document.querySelectorAll("form[data-mailto]").forEach(function (form) {
    var status = form.querySelector(".form__status");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      var to = form.getAttribute("data-mailto");
      var subject = form.getAttribute("data-subject") || "Website enquiry";
      var lines = [];
      new FormData(form).forEach(function (value, key) {
        if (String(value).trim() === "") return;
        lines.push(key + ": " + value);
      });
      window.location.href = "mailto:" + to + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(lines.join("\n"));
      if (status) {
        status.className = "form__status form__status--ok is-visible";
        status.textContent = "Your email app should now open with the message ready to send. If nothing happens, email " + to + " directly.";
      }
    });
  });
})();
