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


// Game start sequence
// Global counter you can use later
window.missionClickCount = window.missionClickCount || 0;

const missionStatusEl = document.getElementById('mission-status');

if (missionStatusEl) {
  missionStatusEl.addEventListener('click', () => {
    window.missionClickCount += 1;
    console.log('Mission Status clicked:', window.missionClickCount);
  });
}
