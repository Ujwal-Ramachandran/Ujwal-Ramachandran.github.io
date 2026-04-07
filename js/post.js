/* --- Matrix Canvas --- */
(function () {
    const canvas = document.getElementById('matrixCanvas');
    const ctx = canvas.getContext('2d');

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const katakana = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヂグズヅブペゥクスツヌフムユュルグスブヅプエェケセテネヘメレゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン';
    const latin = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const alphabet = katakana + latin;
    const fontSize = 16;
    const rainDrops = [];

    function initDrops() {
        const columns = Math.floor(canvas.width / fontSize);
        for (let x = 0; x < columns; x++) rainDrops[x] = 1;
    }
    initDrops();
    window.addEventListener('resize', initDrops);

    const draw = () => {
        ctx.fillStyle = 'rgba(13, 17, 23, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = fontSize + 'px monospace';
        for (let i = 0; i < rainDrops.length; i++) {
            const text = alphabet.charAt(Math.floor(Math.random() * alphabet.length));
            ctx.fillStyle = (Math.random() > 0.90) ? '#58a6ff' :
                (Math.random() > 0.70) ? '#00F' :
                (Math.random() > 0.50) ? '#0F0' :
                (Math.random() > 0.30) ? '#FFFF99' : '#FF6666';
            ctx.fillText(text, i * fontSize, rainDrops[i] * fontSize);
            if (rainDrops[i] * fontSize > canvas.height && Math.random() > 0.975) rainDrops[i] = 0;
            rainDrops[i]++;
        }
    };
    setInterval(draw, 30);
})();

/* --- Mobile Nav --- */
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    hamburger.classList.toggle('active');
});

document.querySelectorAll('.nav-links li').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        hamburger.classList.remove('active');
    });
});

document.addEventListener('click', (e) => {
    if (
        !hamburger.contains(e.target) &&
        !navLinks.contains(e.target) &&
        navLinks.classList.contains('active')
    ) {
        navLinks.classList.remove('active');
        hamburger.classList.remove('active');
    }
});

/* --- Reading Progress Bar --- */
window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    document.getElementById('reading-progress').style.width = progress + '%';
});

/* --- Load Post --- */
async function loadPost() {
    const params = new URLSearchParams(window.location.search);
    const postId = params.get('post');

    if (!postId) {
        window.location.href = 'blog.html';
        return;
    }

    // Fetch post registry
    const registryRes = await fetch('blog/posts.json');
    const posts = await registryRes.json();
    const meta = posts.find(p => p.id === postId);

    if (!meta) {
        window.location.href = 'blog.html';
        return;
    }

    // Page title
    document.title = `${meta.title} | Ujwal Ramachandran`;

    // Cover icon
    document.getElementById('cover-icon').innerHTML = `<i class="fa-solid ${meta.coverIcon}"></i>`;

    // Header text
    document.getElementById('post-title').textContent = meta.title;
    document.getElementById('post-subtitle').textContent = meta.subtitle || '';
    document.getElementById('meta-date').textContent = `| date: ${meta.date}`;
    document.getElementById('meta-read').textContent = `| read: ~${meta.readTime}`;

    // Breadcrumb
    if (meta.tags.length) {
        document.getElementById('breadcrumb-tag').textContent = `/ ${meta.tags[0]}`;
    }

    // Tags
    const tagsRow = document.getElementById('post-tags-row');
    meta.tags.forEach(tag => {
        const pill = document.createElement('span');
        pill.className = 'skill-pill';
        pill.textContent = tag;
        tagsRow.appendChild(pill);
    });

    // GitHub link
    if (meta.github) {
        const ghLink = document.getElementById('github-link');
        ghLink.href = meta.github;
        ghLink.style.display = 'inline-flex';
    }

    // Share buttons
    const pageUrl = encodeURIComponent(window.location.href);
    const pageTitle = encodeURIComponent(meta.title);

    document.getElementById('share-linkedin').addEventListener('click', () => {
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${pageUrl}`, '_blank', 'noopener');
    });

    document.getElementById('share-twitter').addEventListener('click', () => {
        window.open(`https://twitter.com/intent/tweet?url=${pageUrl}&text=${pageTitle}`, '_blank', 'noopener');
    });

    // Fetch markdown file
    const mdRes = await fetch(meta.file);
    if (!mdRes.ok) {
        document.getElementById('post-content').innerHTML = '<p style="color:var(--text-muted)">Could not load post content.</p>';
        return;
    }
    let mdText = await mdRes.text();

    // Strip front matter (title, authors, date block before first ---)
    const hrIndex = mdText.indexOf('\n---\n');
    if (hrIndex !== -1) {
        mdText = mdText.slice(hrIndex + 5).trim();
    }

    // Render markdown
    const contentEl = document.getElementById('post-content');
    contentEl.innerHTML = marked.parse(mdText);

    // Syntax highlighting on all code blocks
    contentEl.querySelectorAll('pre code').forEach(el => {
        hljs.highlightElement(el);
    });

    // Add copy buttons to code blocks
    contentEl.querySelectorAll('pre').forEach(pre => {
        const btn = document.createElement('button');
        btn.className = 'copy-btn';
        btn.textContent = 'copy';
        btn.addEventListener('click', () => {
            const code = pre.querySelector('code');
            navigator.clipboard.writeText(code.innerText).then(() => {
                btn.textContent = 'copied!';
                setTimeout(() => { btn.textContent = 'copy'; }, 2000);
            });
        });
        pre.appendChild(btn);
    });

    // Wrap images with captions and wire lightbox
    setupImages(contentEl);

    // Build Table of Contents
    buildToC(contentEl);
    observeHeadings();
}

function setupImages(contentEl) {
    const lightbox     = document.getElementById('img-lightbox');
    const lightboxImg  = document.getElementById('lightbox-img');
    const lightboxCap  = document.getElementById('lightbox-caption');
    const lightboxClose = document.getElementById('lightbox-close');

    contentEl.querySelectorAll('img').forEach(img => {
        // Inject caption from alt text
        if (img.alt) {
            const cap = document.createElement('span');
            cap.className = 'img-caption';
            cap.textContent = img.alt;
            img.insertAdjacentElement('afterend', cap);
        }

        // Open lightbox on click
        img.addEventListener('click', () => {
            lightboxImg.src = img.src;
            lightboxImg.alt = img.alt;
            lightboxCap.textContent = img.alt;
            lightbox.classList.add('open');
            document.body.style.overflow = 'hidden';
        });
    });

    // Close lightbox
    function closeLightbox() {
        lightbox.classList.remove('open');
        document.body.style.overflow = '';
    }

    lightboxClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeLightbox();
    });
}

function buildToC(contentEl) {
    const toc = document.getElementById('toc');
    const tocSidebar = document.getElementById('toc-sidebar');
    const headings = contentEl.querySelectorAll('h2, h3');

    if (headings.length < 3) {
        tocSidebar.style.display = 'none';
        return;
    }

    const navOffset = (document.querySelector('.glass-nav')?.offsetHeight || 70) + 20;

    headings.forEach((h, i) => {
        const id = `heading-${i}`;
        h.id = id;

        const a = document.createElement('a');
        a.href = `#${id}`;
        a.textContent = h.textContent.replace(/^[\d.]+\s/, ''); // strip leading numbers like "1. "
        a.className = h.tagName === 'H3' ? 'toc-h3' : 'toc-h2';

        a.addEventListener('click', (e) => {
            e.preventDefault();
            const top = h.getBoundingClientRect().top + window.scrollY - navOffset;
            window.scrollTo({ top, behavior: 'smooth' });
        });

        toc.appendChild(a);
    });
}

function observeHeadings() {
    const tocLinks = document.querySelectorAll('#toc a');
    if (!tocLinks.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                tocLinks.forEach(l => l.classList.remove('active'));
                const active = document.querySelector(`#toc a[href="#${entry.target.id}"]`);
                if (active) {
                    active.classList.add('active');
                    // Scroll the ToC sidebar to keep active link visible
                    active.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
                }
            }
        });
    }, { rootMargin: '-70px 0px -55% 0px', threshold: 0 });

    document.querySelectorAll('#post-content h2, #post-content h3').forEach(h => observer.observe(h));
}

loadPost();
