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
});

/* --- Language Toggle --- */
function initLanguageToggle() {
  const btn = document.getElementById('lang-toggle');
  if (!btn) return;

  const langs = ['es', 'en', 'fr'];

  btn.addEventListener('click', () => {
    const current = langs.find(l => document.body.classList.contains(`lang-${l}`)) || 'es';
    const next = langs[(langs.indexOf(current) + 1) % langs.length];

    document.body.classList.remove('lang-es', 'lang-en', 'lang-fr');
    document.body.classList.add(`lang-${next}`);
    document.documentElement.lang = next;
  });
}

/* --- Particles System --- */
function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;
  
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
      
      const colors = [
        { r: 201, g: 168, b: 76 },  // gold
        { r: 74, g: 158, b: 255 },  // blue
        { r: 123, g: 94, b: 167 },  // purple
        { r: 232, g: 232, b: 226 }, // white
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
    span.style.animationDelay = `${0.8 + i * 0.1}s`;
    span.style.animation = `fadeInUp 0.6s ease ${0.8 + i * 0.1}s forwards`;
    title.appendChild(span);
  });
}
