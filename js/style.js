//Smooth Scroller
// Smooth scroll with soft easing (Apple-like)
function smoothScrollTo(targetY, duration = 800) {
    const startY = window.pageYOffset;
    const distance = targetY - startY;
    const startTime = performance.now();
  
    // Ease in-out cubic
    function easeInOutCubic(t) {
      return t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }
  
    function animation(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeInOutCubic(progress);
  
      window.scrollTo(0, startY + distance * eased);
  
      if (elapsed < duration) {
        requestAnimationFrame(animation);
      }
    }
  
    requestAnimationFrame(animation);
  }
  
  // Attach to nav links
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
  
      // Only handle in-page anchors like #journey
      if (!href || !href.startsWith('#')) return;
  
      const targetEl = document.querySelector(href);
      if (!targetEl) return;
  
      e.preventDefault();
  
      const nav = document.querySelector('.glass-nav');
      const navHeight = nav ? nav.offsetHeight : 0;
  
      const elementTop = targetEl.getBoundingClientRect().top + window.pageYOffset;
      const offsetTop = elementTop - navHeight - 16; // extra 16px breathing room
  
      smoothScrollTo(offsetTop, 800); // 800ms = nice, soft scroll
    });
  });

// Apply smooth scrolling to ANY link with an anchor href (e.g., #journey)
document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (!href || href === '#') return;
  
      const target = document.querySelector(href);
      if (!target) return;
  
      e.preventDefault();
  
      const nav = document.querySelector('.glass-nav');
      const navHeight = nav ? nav.offsetHeight : 0;
  
      const elementTop = target.getBoundingClientRect().top + window.scrollY;
      const offsetTop = elementTop - navHeight - 16;
  
      smoothScrollTo(offsetTop, 900); // CTA can be slightly slower for drama
    });
  });
  
// Nav in mobile
/* --- Mobile Navigation Logic --- */
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
const links = document.querySelectorAll('.nav-links li');

// Toggle Menu
hamburger.addEventListener('click', () => {
    // Toggle active classes
    navLinks.classList.toggle('active');
    hamburger.classList.toggle('active');
});

// Close menu when a link is clicked
links.forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        hamburger.classList.remove('active');
    });
});

// Close menu when clicking outside (optional polish)
document.addEventListener('click', (e) => {
    if (!hamburger.contains(e.target) && !navLinks.contains(e.target) && navLinks.classList.contains('active')) {
        navLinks.classList.remove('active');
        hamburger.classList.remove('active');
    }
});
/* --- 1. Matrix Code Rain Effect --- */
const canvas = document.getElementById('matrixCanvas');
const ctx = canvas.getContext('2d');

// Set canvas to full screen
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Matrix Characters (Katakana + Latin)
const katakana = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヂグズヅブペゥクスツヌフムユュルグスブヅプエェケセテネヘメレゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン';
const latin = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const alphabet = katakana + latin;

const fontSize = 16;
const columns = canvas.width / fontSize;

const rainDrops = [];
// Initialize drops at y=0 or 1
for (let x = 0; x < columns; x++) {
    rainDrops[x] = 1;
}

const drawMatrix = () => {
    // Translucent black fade to create trails
    ctx.fillStyle = 'rgba(13, 17, 23, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#0F0'; // Green text
    ctx.font = fontSize + 'px monospace';

    for (let i = 0; i < rainDrops.length; i++) {
        // Random character
        const text = alphabet.charAt(Math.floor(Math.random() * alphabet.length));
        
        // Render
        // Alternating colors for cyberpunk feel
        ctx.fillStyle = (Math.random() > 0.90) ? '#58a6ff' : 
                (Math.random() > 0.70) ? '#00F' : 
                (Math.random() > 0.50) ? '#0F0' : 
                (Math.random() > 0.30) ? '#FFFF99' : 
                '#FF6666';

        ctx.fillText(text, i * fontSize, rainDrops[i] * fontSize);

        // Reset drop to top randomly
        if (rainDrops[i] * fontSize > canvas.height && Math.random() > 0.975) {
            rainDrops[i] = 0;
        }
        rainDrops[i]++;
    }
};

setInterval(drawMatrix, 30);


/* --- 2. Typewriter Effect --- */
class TypeWriter {
    constructor(txtElement, words, wait = 3000) {
        this.txtElement = txtElement;
        this.words = words;
        this.txt = '';
        this.wordIndex = 0;
        this.wait = parseInt(wait, 10);
        this.type();
        this.isDeleting = false;
    }

    type() {
        // Current index of word
        const current = this.wordIndex % this.words.length;
        const fullTxt = this.words[current];

        // Check if deleting
        if (this.isDeleting) {
            // Remove char
            this.txt = fullTxt.substring(0, this.txt.length - 1);
        } else {
            // Add char
            this.txt = fullTxt.substring(0, this.txt.length + 1);
        }

        // Insert into element
        this.txtElement.innerHTML = `<span class="txt">${this.txt}</span>`;

        // Type Speed
        let typeSpeed = 100;

        if (this.isDeleting) {
            typeSpeed /= 2;
        }

        // If word is complete
        if (!this.isDeleting && this.txt === fullTxt) {
            typeSpeed = this.wait; // Pause at end
            this.isDeleting = true;
        } else if (this.isDeleting && this.txt === '') {
            this.isDeleting = false;
            this.wordIndex++;
            typeSpeed = 500; // Pause before typing new word
        }

        setTimeout(() => this.type(), typeSpeed);
    }
}

// Init Typewriter on DOM Load
document.addEventListener('DOMContentLoaded', init);

function init() {
    const txtElement = document.querySelector('.txt-type');
    const words = JSON.parse(txtElement.getAttribute('data-words'));
    const wait = txtElement.getAttribute('data-wait');
    new TypeWriter(txtElement, words, wait);
}


/* --- 3. Scroll Reveal Animation --- */
const observerOptions = {
    threshold: 0.15 // Trigger when 15% visible
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible-section');
            observer.unobserve(entry.target); // Only animate once
        }
    });
}, observerOptions);

document.querySelectorAll('.hidden-section').forEach(section => {
    observer.observe(section);
});


  (function() {
    const cards = document.querySelectorAll('.gallery-card');
    const modal = document.getElementById('gallery-modal');
    if (!modal) return;

    const modalImg      = modal.querySelector('.gallery-modal-image-wrap img');
    const modalTitle    = modal.querySelector('.gallery-modal-text h3');
    const modalCaption  = modal.querySelector('.gallery-modal-text p');
    const closeBtn      = modal.querySelector('.gallery-modal-close');
    const backdrop      = modal.querySelector('.gallery-modal-backdrop');

    function openModal(card) {
      const imgEl   = card.querySelector('img');
      const titleEl = card.querySelector('h4');
      const textEl  = card.querySelector('p');

      modalImg.src = imgEl.src;
      modalImg.alt = imgEl.alt || titleEl.textContent;
      modalTitle.textContent = titleEl.textContent;
      modalCaption.textContent = textEl.textContent;

      modal.classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    function closeModal() {
      modal.classList.remove('open');
      document.body.style.overflow = '';
    }

    cards.forEach(card => {
      card.addEventListener('click', function(e) {
        e.preventDefault();         // stop navigation to gallery.html
        openModal(card);
      });
    });

    closeBtn.addEventListener('click', closeModal);
    backdrop.addEventListener('click', closeModal);

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && modal.classList.contains('open')) {
        closeModal();
      }
    });
  })();


// Game start sequence
// Global counter
window.missionClickCount = window.missionClickCount || 0;

const missionStatusEl = document.getElementById('mission-status');

if (missionStatusEl) {
  missionStatusEl.addEventListener('click', () => {
    window.missionClickCount += 1;
    console.log('Mission Status clicked:', window.missionClickCount);
  });
}

// Game start
window.missionClickCount = window.missionClickCount || 0;

const systemStatusEl = document.querySelector('.system-status');
const warningEl = document.getElementById('activity-warning');
const overlayEl = document.getElementById('screen-overlay');

let warningTimeoutId = null;

if (systemStatusEl) {
  systemStatusEl.addEventListener('click', () => {
    const count = window.missionClickCount || 0;

    if (count < 6) {
      // Show warning toast
      if (warningEl) {
        warningEl.classList.add('visible');

        // Reset auto-hide timer
        if (warningTimeoutId) {
          clearTimeout(warningTimeoutId);
        }
        warningTimeoutId = setTimeout(() => {
          warningEl.classList.remove('visible');
        }, 2500);
      }
    } else {
      // Unlock: fade screen to black and redirect
      if (overlayEl) {
        overlayEl.classList.add('fade-in');

        setTimeout(() => {
          // Change this if your game lives somewhere else
          window.location.href = 'game.html';
        }, 1000); // match CSS transition 1s
      } else {
        // Fallback: just redirect
        window.location.href = 'game.html';
      }
    }
  });
}
