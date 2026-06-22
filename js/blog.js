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

/* --- Dynamic Blog Loader --- */
async function loadBlog() {
    const grid = document.getElementById('posts-grid');
    const filterBar = document.getElementById('tag-filter-bar');
    const noPostsEl = document.getElementById('no-posts');

    let posts;
    try {
        const res = await fetch('blog/posts.json');
        posts = await res.json();
    } catch (e) {
        grid.innerHTML = '<p style="color:var(--text-muted);text-align:center;">Failed to load posts.</p>';
        return;
    }

    // Build tag filter buttons from all unique tags across posts
    const allTags = new Set();
    posts.forEach(p => p.tags.forEach(t => allTags.add(t)));

    allTags.forEach(tag => {
        const btn = document.createElement('button');
        btn.className = 'tag-filter-btn';
        btn.dataset.tag = tag;
        btn.textContent = tag;
        filterBar.appendChild(btn);
    });

    // Render post cards
    grid.innerHTML = posts.map(post => {
        const tagsAttr = post.tags.join('|');
        const tagsHtml = post.tags.map(t => `<span class="skill-pill">${t}</span>`).join('');
        return `
            <div class="post-card" data-tags="${tagsAttr}">
                <div class="post-card-cover">
                    <i class="fa-solid ${post.coverIcon} cover-icon-large"></i>
                </div>
                <div class="post-card-body">
                    <div class="post-card-meta">
                        <span><i class="fa-regular fa-calendar"></i>${post.date}</span>
                        <span><i class="fa-regular fa-clock"></i>${post.readTime} read</span>
                    </div>
                    <h2 class="post-card-title">${post.title}</h2>
                    <p class="post-card-excerpt">${post.excerpt}</p>
                    <div class="post-card-tags">${tagsHtml}</div>
                </div>
                <div class="post-card-footer">
                    <a href="post.html?post=${post.id}" class="post-read-link">Read Post &rarr;</a>
                </div>
            </div>
        `;
    }).join('');

    // Card click navigates to post
    grid.querySelectorAll('.post-card').forEach(card => {
        card.addEventListener('click', (e) => {
            const link = card.querySelector('.post-read-link');
            if (link && !e.target.closest('.post-read-link')) {
                window.location.href = link.href;
            }
        });
    });

    // Tag filtering
    filterBar.querySelectorAll('.tag-filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            filterBar.querySelectorAll('.tag-filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const tag = btn.dataset.tag;
            const cards = grid.querySelectorAll('.post-card');
            let visible = 0;

            cards.forEach(card => {
                const show = tag === 'all' || card.dataset.tags.includes(tag);
                card.style.display = show ? '' : 'none';
                if (show) visible++;
            });

            noPostsEl.style.display = visible === 0 ? 'block' : 'none';
        });
    });
}

loadBlog();
