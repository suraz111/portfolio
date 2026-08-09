/**
 * Blog Page — Suraj Portfolio
 * Handles fetching published blog posts, rendering the post grid,
 * single-post detail view, theme toggler, particles, and scroll UX.
 */

(function () {
    'use strict';

    const API_BASE = window.location.origin;

    // ── DOM Refs ──
    const listView = document.getElementById('blog-list-view');
    const singleView = document.getElementById('blog-single-view');
    const postsGrid = document.getElementById('blog-posts-grid');
    const postCountBadge = document.getElementById('blog-post-count');
    const postCountText = document.getElementById('post-count-text');
    const postTitle = document.getElementById('post-title');
    const postMetaRow = document.getElementById('post-meta-row');
    const postProse = document.getElementById('post-prose');
    const postBackBtn = document.getElementById('post-back-btn');
    const scrollTopBtn = document.getElementById('blog-scroll-top');

    let allPosts = [];

    // ══════════════════════════════════════════
    // INIT
    // ══════════════════════════════════════════
    document.addEventListener('DOMContentLoaded', () => {
        initParticles();
        initNavbarScroll();
        initThemeToggler();
        initScrollToTop();
        initBackgroundMotion();
        fetchBlogPosts();
        handleRouting();
    });

    // ══════════════════════════════════════════
    // FETCH BLOG POSTS
    // ══════════════════════════════════════════
    async function fetchBlogPosts() {
        try {
            const res = await fetch(`${API_BASE}/api/blog`);
            const json = await res.json();

            if (!res.ok || !json.success) {
                throw new Error(json.error || 'Failed to fetch posts');
            }

            allPosts = json.data || [];
            renderPostGrid(allPosts);
        } catch (err) {
            console.error('Blog fetch error:', err);
            renderPostGrid([]);
        }
    }

    // ══════════════════════════════════════════
    // RENDER POST GRID
    // ══════════════════════════════════════════
    function renderPostGrid(posts) {
        postsGrid.innerHTML = '';

        // Update post count badge
        if (posts.length > 0) {
            postCountText.textContent = `${posts.length} post${posts.length !== 1 ? 's' : ''} published`;
            postCountBadge.style.display = 'inline-flex';
        } else {
            postCountBadge.style.display = 'none';
        }

        if (posts.length === 0) {
            postsGrid.innerHTML = `
                <div class="blog-empty-state">
                    <span class="material-symbols-outlined blog-empty-icon">edit_note</span>
                    <h3 class="blog-empty-title">No posts yet</h3>
                    <p class="blog-empty-desc">Engineering notes are on the way. Check back soon.</p>
                </div>
            `;
            return;
        }

        posts.forEach((post, index) => {
            const card = createPostCard(post, index);
            postsGrid.appendChild(card);
        });

        // Stagger entrance animation
        requestAnimationFrame(() => {
            const cards = postsGrid.querySelectorAll('.blog-card');
            cards.forEach((card, i) => {
                setTimeout(() => {
                    card.classList.add('blog-entered');
                }, i * 100);
            });
        });
    }

    function createPostCard(post, index) {
        const card = document.createElement('article');
        card.className = 'blog-card';
        card.setAttribute('data-slug', post.slug);
        card.setAttribute('data-id', post._id);

        const date = formatDate(post.createdAt);
        const readTime = estimateReadTime(post.excerpt || post.content || '');
        const excerpt = post.excerpt || (post.content ? post.content.substring(0, 200) + '...' : '');

        card.innerHTML = `
            <div class="blog-card-header">
                <div class="blog-card-accent"></div>
                <div class="blog-card-date">
                    <span class="material-symbols-outlined">calendar_today</span>
                    ${date}
                </div>
            </div>
            <div class="blog-card-body">
                <h3 class="blog-card-title">${escapeHtml(post.title)}</h3>
                <p class="blog-card-excerpt">${escapeHtml(excerpt)}</p>
            </div>
            <div class="blog-card-footer">
                <span class="blog-read-more">
                    Read More
                    <span class="material-symbols-outlined">arrow_forward</span>
                </span>
                <span class="blog-read-time">
                    <span class="material-symbols-outlined">schedule</span>
                    ${readTime} min read
                </span>
            </div>
        `;

        card.addEventListener('click', () => {
            openPost(post.slug || post._id);
        });

        return card;
    }

    // ══════════════════════════════════════════
    // SINGLE POST VIEW
    // ══════════════════════════════════════════
    async function openPost(slugOrId) {
        // Try to find in cached list first
        let post = allPosts.find(p => p.slug === slugOrId || p._id === slugOrId);

        if (!post) {
            // Fetch from server
            try {
                const param = slugOrId.match(/^[0-9a-fA-F]{24}$/) ? `id=${slugOrId}` : `slug=${slugOrId}`;
                const res = await fetch(`${API_BASE}/api/blog?${param}`);
                const json = await res.json();
                if (json.success && json.data) {
                    post = json.data;
                }
            } catch (err) {
                console.error('Failed to load post:', err);
            }
        }

        if (!post) {
            // Post not found — go back to list
            showListView();
            return;
        }

        // Update URL without refresh
        const url = new URL(window.location);
        url.searchParams.set('post', post.slug || post._id);
        window.history.pushState({ post: post.slug }, '', url);

        renderSinglePost(post);
        showSingleView();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function renderSinglePost(post) {
        const date = formatDate(post.createdAt);
        const readTime = estimateReadTime(post.content || '');

        // Meta row
        postMetaRow.innerHTML = `
            <span class="post-date-badge">
                <span class="material-symbols-outlined">calendar_today</span>
                ${date}
            </span>
            <span class="post-read-badge">
                <span class="material-symbols-outlined">schedule</span>
                ${readTime} min read
            </span>
        `;

        // Title
        postTitle.textContent = post.title;

        // Content — render basic markdown-like formatting
        postProse.innerHTML = renderContent(post.content || '');

        // Update page title
        document.title = `${post.title} | Blog — Suraj`;
    }

    function showSingleView() {
        listView.classList.add('hidden');
        singleView.classList.add('active');
    }

    function showListView() {
        singleView.classList.remove('active');
        listView.classList.remove('hidden');
        document.title = 'Blog | Suraj';

        const url = new URL(window.location);
        url.searchParams.delete('post');
        window.history.pushState({}, '', url);
    }

    // Back button
    if (postBackBtn) {
        postBackBtn.addEventListener('click', () => {
            showListView();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // Browser back/forward
    window.addEventListener('popstate', () => {
        handleRouting();
    });

    function handleRouting() {
        const params = new URLSearchParams(window.location.search);
        const postSlug = params.get('post');

        if (postSlug) {
            openPost(postSlug);
        } else {
            showListView();
        }
    }

    // ══════════════════════════════════════════
    // CONTENT RENDERER (Basic Markdown → HTML)
    // ══════════════════════════════════════════
    function renderContent(content) {
        if (!content) return '<p>No content available.</p>';

        // If content already contains HTML tags, render as-is
        if (/<[a-z][\s\S]*>/i.test(content)) {
            return content;
        }

        // Basic markdown-like conversion
        let html = escapeHtml(content);

        // Headers
        html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
        html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
        html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

        // Bold and italic
        html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

        // Inline code
        html = html.replace(/`(.+?)`/g, '<code>$1</code>');

        // Blockquotes
        html = html.replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>');

        // Horizontal rules
        html = html.replace(/^---$/gm, '<hr>');

        // Links
        html = html.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

        // Unordered lists
        html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
        html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');

        // Paragraphs — wrap remaining lines
        html = html.split('\n\n').map(block => {
            block = block.trim();
            if (!block) return '';
            // Don't wrap elements that are already block-level
            if (/^<(h[1-6]|ul|ol|blockquote|hr|pre|div)/.test(block)) {
                return block;
            }
            return `<p>${block.replace(/\n/g, '<br>')}</p>`;
        }).join('\n');

        return html;
    }

    // ══════════════════════════════════════════
    // UTILITIES
    // ══════════════════════════════════════════
    function formatDate(dateStr) {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    function estimateReadTime(text) {
        const words = text.split(/\s+/).length;
        return Math.max(1, Math.ceil(words / 200));
    }

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // ══════════════════════════════════════════
    // PARTICLE CANVAS (Same as main site)
    // ══════════════════════════════════════════
    function initParticles() {
        const canvas = document.getElementById('particle-canvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;
        let stars = [];
        let sparkles = [];

        let mouse = { x: null, y: null, active: false };

        window.addEventListener('mousemove', (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
            mouse.active = true;

            if (Math.random() > 0.6) {
                sparkles.push(new Sparkle(mouse.x, mouse.y));
            }
        });

        window.addEventListener('mouseleave', () => {
            mouse.active = false;
        });

        class Star {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.size = Math.random() * 2.0 + 1.0;
                this.baseOpacity = Math.random() * 0.4 + 0.2;
                this.opacity = this.baseOpacity;
                this.twinklePhase = Math.random() * Math.PI * 2;
                this.twinkleSpeed = Math.random() * 0.02 + 0.005;
                this.vx = (Math.random() - 0.5) * 0.4;
                this.vy = (Math.random() - 0.5) * 0.4;
                this.offsetX = 0;
                this.offsetY = 0;
                this.colorType = Math.random();
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;
                if (this.x < 0 || this.x > width) this.vx *= -1;
                if (this.y < 0 || this.y > height) this.vy *= -1;

                this.twinklePhase += this.twinkleSpeed;
                this.opacity = this.baseOpacity + Math.sin(this.twinklePhase) * 0.15;
                this.opacity = Math.max(0.08, Math.min(1.0, this.opacity));

                if (mouse.active && mouse.x !== null && mouse.y !== null) {
                    const dx = mouse.x - this.x;
                    const dy = mouse.y - this.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 200) {
                        const factor = (200 - dist) / 200;
                        this.opacity += factor * 0.6;
                        this.opacity = Math.min(1.0, this.opacity);
                        const pullForce = factor * 0.35;
                        this.offsetX += (dx * pullForce - this.offsetX) * 0.08;
                        this.offsetY += (dy * pullForce - this.offsetY) * 0.08;
                    } else {
                        this.offsetX += (0 - this.offsetX) * 0.05;
                        this.offsetY += (0 - this.offsetY) * 0.05;
                    }
                } else {
                    this.offsetX += (0 - this.offsetX) * 0.05;
                    this.offsetY += (0 - this.offsetY) * 0.05;
                }
            }

            draw() {
                ctx.beginPath();
                const posX = this.x + this.offsetX;
                const posY = this.y + this.offsetY;
                ctx.arc(posX, posY, this.size, 0, Math.PI * 2);

                const style = getComputedStyle(document.documentElement);
                const primaryColor = style.getPropertyValue('--primary-color').trim() || '#38bdf8';
                const tertiaryColor = style.getPropertyValue('--tertiary-color').trim() || '#fbbf24';
                const baseColorRGB = style.getPropertyValue('--particle-color').trim() || '255, 255, 255';

                let color = `rgba(${baseColorRGB}, ${this.opacity})`;
                if (this.colorType > 0.85) {
                    color = `rgba(${hexToRgb(primaryColor)}, ${this.opacity})`;
                } else if (this.colorType > 0.7) {
                    color = `rgba(${hexToRgb(tertiaryColor)}, ${this.opacity})`;
                }

                ctx.fillStyle = color;
                ctx.fill();
            }
        }

        class Sparkle {
            constructor(x, y) {
                this.x = x;
                this.y = y;
                this.vx = (Math.random() - 0.5) * 1.5;
                this.vy = (Math.random() * 0.8) + 0.2;
                this.size = Math.random() * 2 + 1;
                this.alpha = 1.0;
                this.fadeSpeed = Math.random() * 0.02 + 0.015;
                this.isGold = Math.random() > 0.6;
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;
                this.alpha -= this.fadeSpeed;
            }

            draw() {
                if (this.alpha <= 0) return;
                const style = getComputedStyle(document.documentElement);
                const primaryColor = style.getPropertyValue('--primary-color').trim() || '#38bdf8';
                const tertiaryColor = style.getPropertyValue('--tertiary-color').trim() || '#fbbf24';
                const colorRGB = this.isGold ? hexToRgb(tertiaryColor) : hexToRgb(primaryColor);

                ctx.save();
                ctx.beginPath();
                const cx = this.x, cy = this.y, s = this.size;
                ctx.moveTo(cx, cy - s);
                ctx.lineTo(cx + s/3, cy - s/3);
                ctx.lineTo(cx + s, cy);
                ctx.lineTo(cx + s/3, cy + s/3);
                ctx.lineTo(cx, cy + s);
                ctx.lineTo(cx - s/3, cy + s/3);
                ctx.lineTo(cx - s, cy);
                ctx.lineTo(cx - s/3, cy - s/3);
                ctx.closePath();
                ctx.fillStyle = `rgba(${colorRGB}, ${this.alpha})`;
                ctx.shadowBlur = 4;
                ctx.shadowColor = this.isGold ? tertiaryColor : primaryColor;
                ctx.fill();
                ctx.restore();
            }
        }

        function hexToRgb(hex) {
            hex = hex.replace('#', '');
            if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
            const num = parseInt(hex, 16);
            return `${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}`;
        }

        function setup() {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            stars = [];
            sparkles = [];
            const starCount = Math.floor((width * height) / 8000);
            const finalCount = Math.min(starCount, 220);
            for (let i = 0; i < finalCount; i++) stars.push(new Star());
        }

        function animate() {
            ctx.clearRect(0, 0, width, height);
            for (const star of stars) { star.update(); star.draw(); }

            const style = getComputedStyle(document.documentElement);
            const primaryRGB = style.getPropertyValue('--primary-rgb').trim() || '56, 189, 248';

            ctx.beginPath();
            for (let i = 0; i < stars.length; i++) {
                const s1 = stars[i];
                const p1X = s1.x + s1.offsetX, p1Y = s1.y + s1.offsetY;
                for (let j = i + 1; j < stars.length; j++) {
                    const s2 = stars[j];
                    const p2X = s2.x + s2.offsetX, p2Y = s2.y + s2.offsetY;
                    const dx = p1X - p2X, dy = p1Y - p2Y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < 115) {
                        let alpha = (115 - distance) / 115 * 0.07;
                        if (mouse.active && mouse.x !== null) {
                            const m1 = Math.sqrt((mouse.x-p1X)**2 + (mouse.y-p1Y)**2);
                            const m2 = Math.sqrt((mouse.x-p2X)**2 + (mouse.y-p2Y)**2);
                            const minD = Math.min(m1, m2);
                            if (minD < 180) alpha += ((180-minD)/180) * 0.18;
                        }
                        ctx.strokeStyle = `rgba(${primaryRGB}, ${alpha})`;
                        ctx.lineWidth = alpha > 0.12 ? 1.0 : 0.6;
                        ctx.moveTo(p1X, p1Y);
                        ctx.lineTo(p2X, p2Y);
                    }
                }
            }
            ctx.stroke();

            for (let i = sparkles.length - 1; i >= 0; i--) {
                sparkles[i].update();
                sparkles[i].draw();
                if (sparkles[i].alpha <= 0) sparkles.splice(i, 1);
            }

            requestAnimationFrame(animate);
        }

        window.addEventListener('resize', setup);
        setup();
        animate();
    }

    // ══════════════════════════════════════════
    // NAVBAR SCROLL
    // ══════════════════════════════════════════
    function initNavbarScroll() {
        const navbar = document.getElementById('navbar');
        if (!navbar) return;
        window.addEventListener('scroll', () => {
            navbar.classList.toggle('navbar-scrolled', window.scrollY > 50);
        });
    }

    // ══════════════════════════════════════════
    // THEME TOGGLER (Matches main site)
    // ══════════════════════════════════════════
    function initThemeToggler() {
        const swatches = document.querySelectorAll('.swatch-btn');
        const body = document.body;
        if (!swatches.length) return;

        // Restore saved theme
        const savedTheme = localStorage.getItem('portfolio_theme');
        if (savedTheme) {
            applyTheme(savedTheme);
            swatches.forEach(s => {
                s.classList.toggle('active', s.getAttribute('data-theme') === savedTheme);
            });
        }

        swatches.forEach(swatch => {
            swatch.addEventListener('click', () => {
                swatches.forEach(s => s.classList.remove('active'));
                swatch.classList.add('active');
                const theme = swatch.getAttribute('data-theme');
                applyTheme(theme);
                localStorage.setItem('portfolio_theme', theme);

                swatch.style.transform = 'scale(0.8)';
                setTimeout(() => { swatch.style.transform = ''; }, 150);
            });
        });

        function applyTheme(theme) {
            if (theme === 'default') {
                body.classList.remove('theme-lumina', 'theme-black');
            } else if (theme === 'nebula') {
                body.classList.remove('theme-black');
                body.classList.add('theme-lumina');
            } else if (theme === 'void') {
                body.classList.remove('theme-lumina');
                body.classList.add('theme-black');
            }
        }
    }

    // ══════════════════════════════════════════
    // SCROLL TO TOP
    // ══════════════════════════════════════════
    function initScrollToTop() {
        if (!scrollTopBtn) return;

        window.addEventListener('scroll', () => {
            scrollTopBtn.classList.toggle('visible', window.scrollY > 400);
        });

        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // ══════════════════════════════════════════
    // BACKGROUND MOTION (Grid follows mouse)
    // ══════════════════════════════════════════
    function initBackgroundMotion() {
        let rafId;
        window.addEventListener('mousemove', (e) => {
            if (rafId) return;
            rafId = requestAnimationFrame(() => {
                const xOffset = (e.clientX / window.innerWidth - 0.5) * 12;
                const yOffset = (e.clientY / window.innerHeight - 0.5) * 12;
                document.documentElement.style.setProperty('--grid-x', `${xOffset}px`);
                document.documentElement.style.setProperty('--grid-y', `${yOffset}px`);
                rafId = null;
            });
        });
    }

})();
