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

/* --- Card click navigates to post --- */
document.querySelectorAll('.post-card').forEach(card => {
    card.addEventListener('click', (e) => {
        const link = card.querySelector('.post-read-link');
        if (link && !e.target.closest('.post-read-link')) {
            window.location.href = link.href;
        }
    });
});

/* --- Tag Filtering --- */
document.querySelectorAll('.tag-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tag-filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const tag = btn.dataset.tag;
        const cards = document.querySelectorAll('.post-card');
        let visible = 0;

        cards.forEach(card => {
            const cardTags = card.dataset.tags;
            const show = tag === 'all' || cardTags.includes(tag);
            card.style.display = show ? '' : 'none';
            if (show) visible++;
        });

        document.getElementById('no-posts').style.display = visible === 0 ? 'block' : 'none';
    });
});
