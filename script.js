(function () {
  'use strict';

  /* ============================================================
     HOMEPAGE — Pleiades constellation (no intro, instant entry)
     ============================================================ */
  if (document.body.classList.contains('home')) {
    var stars = document.querySelectorAll('.p-star');
    var pleiades = document.querySelector('.pleiades');

    // Tight viewBox on both — zooms in on the cluster so it fills more screen.
    // Mobile uses a taller aspect so the SVG fills more of the portrait viewport
    // without changing cluster positions.
    var DESKTOP_VB = '78 110 700 360';
    var MOBILE_VB  = '130 40 600 480';
    function reframePleiades() {
      if (!pleiades) return;
      pleiades.setAttribute('viewBox', window.innerWidth <= 768 ? MOBILE_VB : DESKTOP_VB);
    }
    reframePleiades();
    window.addEventListener('resize', reframePleiades);

    // Accessible focus highlight (mirrors :hover) + touch-tap reveal labels
    stars.forEach(function (s) {
      s.addEventListener('focus', function () { s.classList.add('is-hover'); });
      s.addEventListener('blur',  function () { s.classList.remove('is-hover'); });
      s.addEventListener('touchstart', function () { s.classList.add('is-hover'); }, { passive: true });
    });

    return; // skip inner-page handlers
  }

  /* ============================================================
     INNER PAGES
     ============================================================ */

  // — Reveal-on-scroll —
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && reveals.length) {
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(function (f) { obs.observe(f); });
  } else {
    reveals.forEach(function (f) { f.classList.add('in'); });
  }

  // — Mobile burger menu —
  var burger = document.querySelector('.topbar__burger');
  var mm = document.querySelector('.mobile-menu');
  var mmClose = document.querySelector('.mobile-menu__close');
  function shut() { if (mm) mm.classList.remove('is-open'); document.body.style.overflow = ''; }
  function open() { if (mm) mm.classList.add('is-open'); document.body.style.overflow = 'hidden'; }
  if (burger) burger.addEventListener('click', open);
  if (mmClose) mmClose.addEventListener('click', shut);
  if (mm) mm.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', shut); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') shut(); });

  // — Sub-navigation smooth scroll + active state —
  var subLinks = document.querySelectorAll('.subnav__link[href^="#"]');
  subLinks.forEach(function (link) {
    link.addEventListener('click', function (e) {
      var id = link.getAttribute('href').slice(1);
      var t = document.getElementById(id);
      if (t) {
        e.preventDefault();
        var top = t.getBoundingClientRect().top + window.scrollY - 130;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
    });
  });

  // active subnav link via IntersectionObserver
  var sections = document.querySelectorAll('[data-section]');
  if ('IntersectionObserver' in window && sections.length && subLinks.length) {
    var subObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          var id = e.target.id;
          subLinks.forEach(function (l) {
            l.classList.toggle('is-active', l.getAttribute('href') === '#' + id);
          });
        }
      });
    }, { rootMargin: '-40% 0px -50% 0px' });
    sections.forEach(function (s) { subObs.observe(s); });
  }

  // — Cookies banner —
  var cookies = document.getElementById('cookies');
  var cookiesAccept = document.getElementById('cookiesAccept');
  var cookiesDecline = document.getElementById('cookiesDecline');
  if (cookies && !localStorage.getItem('or_cookies_choice')) {
    setTimeout(function () { cookies.classList.add('is-visible'); }, 600);
  }
  function setCookieChoice(v) {
    try { localStorage.setItem('or_cookies_choice', v); } catch (e) {}
    if (cookies) cookies.classList.remove('is-visible');
  }
  if (cookiesAccept) cookiesAccept.addEventListener('click', function () { setCookieChoice('accepted'); });
  if (cookiesDecline) cookiesDecline.addEventListener('click', function () { setCookieChoice('declined'); });
})();
