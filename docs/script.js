/* ============================================
   EMOTIA — Interactive Scripts
   Particles, Scroll Reveals, Navigation
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  initParticles();
  initScrollReveal();
  initNavigation();
  initHeroLetters();
  initLanguageToggle();
  initThemeToggle();
  initKickstarter();
  initReading();
});

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* --- Language Toggle --- */
// Remembers the reader's choice; on a first visit, follows the browser language.
function initLanguageToggle() {
  const btn = document.getElementById('lang-toggle');
  const langs = ['es', 'en', 'fr'];

  function setLang(lang) {
    document.body.classList.remove('lang-es', 'lang-en', 'lang-fr');
    document.body.classList.add(`lang-${lang}`);
    document.documentElement.lang = lang;
    try { localStorage.setItem('emotia-lang', lang); } catch (e) { /* storage unavailable */ }
  }

  let saved = null;
  try { saved = localStorage.getItem('emotia-lang'); } catch (e) { /* storage unavailable */ }
  const browser = (navigator.language || 'es').slice(0, 2).toLowerCase();
  const initial = langs.includes(saved) ? saved : (langs.includes(browser) ? browser : 'es');
  if (initial !== 'es') setLang(initial);

  if (!btn) return;
  btn.addEventListener('click', () => {
    const current = langs.find(l => document.body.classList.contains(`lang-${l}`)) || 'es';
    setLang(langs[(langs.indexOf(current) + 1) % langs.length]);
  });
}

/* --- Theme Toggle --- */
// The <head> script already set data-theme before paint; this keeps it in sync.
const THEME_COLORS = { dark: '#06060e', light: '#ffffff' };

function currentTheme() {
  return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
}

function initThemeToggle() {
  const root = document.documentElement;
  const btn = document.getElementById('theme-toggle');
  const meta = document.querySelector('meta[name="theme-color"]');

  // Instant switch: the gradient overlays can't be animated, so a fade would flash.
  function apply(theme) {
    root.setAttribute('data-theme', theme);
    if (meta) meta.setAttribute('content', THEME_COLORS[theme]);
    if (btn) btn.setAttribute('aria-pressed', theme === 'light' ? 'true' : 'false');
  }

  apply(currentTheme());

  // Follow the system setting until the reader picks a theme.
  let saved = null;
  try { saved = localStorage.getItem('emotia-theme'); } catch (e) { /* storage unavailable */ }
  if (!saved && window.matchMedia) {
    const mq = window.matchMedia('(prefers-color-scheme: light)');
    const onChange = (e) => {
      let chosen = null;
      try { chosen = localStorage.getItem('emotia-theme'); } catch (err) { /* storage unavailable */ }
      if (!chosen) apply(e.matches ? 'light' : 'dark');
    };
    if (mq.addEventListener) mq.addEventListener('change', onChange);
  }

  if (!btn) return;
  btn.addEventListener('click', () => {
    const next = currentTheme() === 'light' ? 'dark' : 'light';
    apply(next);
    try { localStorage.setItem('emotia-theme', next); } catch (e) { /* storage unavailable */ }
  });
}

/* --- Kickstarter button --- */
// While the campaign URL is empty, show "coming soon" instead of a dead link.
function initKickstarter() {
  const btn = document.getElementById('kickstarter-btn');
  if (!btn) return;
  const url = (btn.getAttribute('href') || '').trim();
  if (url && url !== '#') return;
  btn.removeAttribute('href');
  btn.removeAttribute('target');
  btn.classList.add('is-soon');
  btn.setAttribute('aria-disabled', 'true');
}

/* --- Reading: La profecía --- */
function initReading() {
  const text = document.getElementById('reading-text');
  const btn = document.getElementById('reading-toggle');
  const fade = document.getElementById('reading-fade');
  if (!text || !btn) return;
  btn.addEventListener('click', () => {
    text.classList.add('open');
    if (fade) fade.classList.add('hidden');
    btn.setAttribute('aria-expanded', 'true');
    btn.parentElement.style.display = 'none';
    if (typeof gtag === 'function') gtag('event', 'read-prophecy_expand', { page_location: window.location.href });
  });
}

/* --- Particles System --- */
function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas || prefersReducedMotion) return;
  
  const ctx = canvas.getContext('2d');
  let particles = [];
  let animationFrame;
  
  function resize() {
    canvas.width = canvas.parentElement.offsetWidth;
    canvas.height = canvas.parentElement.offsetHeight;
  }
  
  resize();
  window.addEventListener('resize', resize);
  
  class Particle {
    constructor() {
      this.reset();
    }
    
    reset() {
      this.x = Math.random() * canvas.width;
      this.y = canvas.height + 10;
      this.size = Math.random() * 2.5 + 0.5;
      this.speedY = -(Math.random() * 0.5 + 0.15);
      this.speedX = (Math.random() - 0.5) * 0.3;
      this.opacity = Math.random() * 0.5 + 0.1;
      this.fadeSpeed = Math.random() * 0.002 + 0.001;
      this.pulse = Math.random() * Math.PI * 2;
      this.pulseSpeed = Math.random() * 0.02 + 0.005;
      
      // Dark: gold flame plus the four threads of the book's emblem.
      // Light: only golds, like the book's interior (gold, golddim, goldlight).
      const colors = currentTheme() === 'light'
        ? [
            { r: 201, g: 168, b: 76 },  // gold
            { r: 201, g: 168, b: 76 },
            { r: 138, g: 114, b: 51 },  // golddim
            { r: 232, g: 210, b: 138 }, // goldlight
          ]
        : [
            { r: 201, g: 168, b: 76 },  // gold (the lamp)
            { r: 201, g: 168, b: 76 },
            { r: 86, g: 146, b: 224 },  // blue thread
            { r: 206, g: 74, b: 70 },   // red thread
            { r: 92, g: 176, b: 120 },  // green thread
            { r: 236, g: 234, b: 226 }, // white thread
          ];
      this.color = colors[Math.floor(Math.random() * colors.length)];
    }
    
    update() {
      this.y += this.speedY;
      this.x += this.speedX + Math.sin(this.pulse) * 0.1;
      this.pulse += this.pulseSpeed;
      this.opacity -= this.fadeSpeed;
      
      if (this.y < -10 || this.opacity <= 0) {
        this.reset();
      }
    }
    
    draw() {
      const { r, g, b } = this.color;
      const pulsedOpacity = this.opacity * (0.7 + 0.3 * Math.sin(this.pulse));
      
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${pulsedOpacity})`;
      ctx.fill();
      
      // Glow
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${pulsedOpacity * 0.15})`;
      ctx.fill();
    }
  }
  
  // Create particles
  const particleCount = Math.min(80, Math.floor(canvas.width * canvas.height / 15000));
  for (let i = 0; i < particleCount; i++) {
    const p = new Particle();
    p.y = Math.random() * canvas.height; // Start distributed
    particles.push(p);
  }
  
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    particles.forEach(p => {
      p.update();
      p.draw();
    });
    
    animationFrame = requestAnimationFrame(animate);
  }
  
  // Only animate when hero is visible
  const heroObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animate();
      } else {
        cancelAnimationFrame(animationFrame);
      }
    });
  }, { threshold: 0 });
  
  heroObserver.observe(canvas.closest('.hero'));
  animate();
}

/* --- Scroll Reveal --- */
function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });
  
  reveals.forEach(el => observer.observe(el));
}

/* --- Navigation --- */
function initNavigation() {
  const nav = document.querySelector('.nav');
  const hamburger = document.querySelector('.nav-hamburger');
  const navLinks = document.querySelector('.nav-links');
  
  // Scroll effect
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 80) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
    
    lastScroll = currentScroll;
  });
  
  // Hamburger
  if (hamburger) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      navLinks.classList.toggle('open');
      document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
    });
    
    // Close on link click
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        navLinks.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }
  
  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        const offset = 80;
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}

/* --- Hero Letter Animation --- */
function initHeroLetters() {
  const title = document.querySelector('.hero-title');
  if (!title) return;
  
  const text = title.textContent;
  title.innerHTML = '';
  
  text.split('').forEach((char, i) => {
    const span = document.createElement('span');
    span.className = 'letter';
    span.textContent = char === ' ' ? '\u00A0' : char;
    const delay = prefersReducedMotion ? 0 : 0.25 + i * 0.06;
    span.style.animation = `fadeInUp 0.6s ease ${delay}s forwards`;
    title.appendChild(span);
  });
}
