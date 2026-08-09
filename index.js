/* ==========================================
   Suraj - Interactivity & Visual Motion Logic
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
    initParticles();
    initAboutCanvas();
    initHeroCardParallax();
    initNavbarScroll();
    initActiveNavTracking();
    initMobileDrawer();
    initThemeToggler();
    initContactForm();
    trackPageView();
    initChatbot();
    initTextAnimations();
    initBackgroundMotion();
    initPhotoFilterSwitcher();
    initScrollytelling();
    initProjectModals();
});

/* ==========================================
   1. Main Background Particle Canvas
   ========================================== */
function initParticles() {
    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;
    let stars = [];
    let sparkles = [];
    
    let mouse = { x: null, y: null, active: false };

    // Track mouse on window
    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        mouse.active = true;

        // Generate stardust sparkles on movement
        const numSparks = Math.random() > 0.6 ? 2 : 1;
        for (let i = 0; i < numSparks; i++) {
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
            // Slightly larger dots for network nodes
            this.size = Math.random() * 2.0 + 1.0;
            this.baseOpacity = Math.random() * 0.4 + 0.2;
            this.opacity = this.baseOpacity;
            this.twinklePhase = Math.random() * Math.PI * 2;
            this.twinkleSpeed = Math.random() * 0.02 + 0.005;
            
            // Floating drift speeds
            this.vx = (Math.random() - 0.5) * 0.4;
            this.vy = (Math.random() - 0.5) * 0.4;
            
            this.offsetX = 0;
            this.offsetY = 0;
            this.colorType = Math.random();
        }

        update() {
            // Drift motion
            this.x += this.vx;
            this.y += this.vy;
            
            // Bouncing off boundary edges
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

                    // Pull particles toward the cursor (gravitational follow)
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
            // Render with dynamic offset position
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
            
            const cx = this.x;
            const cy = this.y;
            const s = this.size;
            
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
        if (hex.length === 3) {
            hex = hex.split('').map(char => char + char).join('');
        }
        const num = parseInt(hex, 16);
        const r = (num >> 16) & 255;
        const g = (num >> 8) & 255;
        const b = num & 255;
        return `${r}, ${g}, ${b}`;
    }

    function setup() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        stars = [];
        sparkles = [];
        
        const starCount = Math.floor((width * height) / 8000);
        const maxStars = 220;
        const finalCount = Math.min(starCount, maxStars);

        for (let i = 0; i < finalCount; i++) {
            stars.push(new Star());
        }
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);

        for (let i = 0; i < stars.length; i++) {
            stars[i].update();
            stars[i].draw();
        }

        // Draw global connecting network mesh lines
        const style = getComputedStyle(document.documentElement);
        const primaryRGB = style.getPropertyValue('--primary-rgb').trim() || '56, 189, 248';
        
        ctx.beginPath();
        for (let i = 0; i < stars.length; i++) {
            const s1 = stars[i];
            const p1X = s1.x + s1.offsetX;
            const p1Y = s1.y + s1.offsetY;
            
            for (let j = i + 1; j < stars.length; j++) {
                const s2 = stars[j];
                const p2X = s2.x + s2.offsetX;
                const p2Y = s2.y + s2.offsetY;

                const dx = p1X - p2X;
                const dy = p1Y - p2Y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 115) {
                    // Connection opacity scales with distance
                    let alpha = (115 - distance) / 115 * 0.07;
                    
                    // Pulling glow effects if near mouse cursor
                    if (mouse.active && mouse.x !== null && mouse.y !== null) {
                        const m1Dx = mouse.x - p1X;
                        const m1Dy = mouse.y - p1Y;
                        const m1Dist = Math.sqrt(m1Dx * m1Dx + m1Dy * m1Dy);
                        
                        const m2Dx = mouse.x - p2X;
                        const m2Dy = mouse.y - p2Y;
                        const m2Dist = Math.sqrt(m2Dx * m2Dx + m2Dy * m2Dy);
                        
                        const minMouseDist = Math.min(m1Dist, m2Dist);
                        if (minMouseDist < 180) {
                            const mouseBoost = (180 - minMouseDist) / 180;
                            alpha += mouseBoost * 0.18; // Make links shine near mouse!
                        }
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
            const s = sparkles[i];
            s.update();
            s.draw();
            
            if (s.alpha <= 0) {
                sparkles.splice(i, 1);
            }
        }

        requestAnimationFrame(animate);
    }

    window.addEventListener('resize', setup);
    setup();
    animate();
}

/* ==========================================
   2. Interactive Local About Canvas (No Image)
   ========================================== */
function initAboutCanvas() {
    const canvas = document.getElementById('about-canvas');
    const container = document.getElementById('about-canvas-container');
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    let width = canvas.width = container.offsetWidth;
    let height = canvas.height = container.offsetHeight;
    let particles = [];
    
    // Mouse coordinates tracker
    let mouse = { x: null, y: null, radius: 140 };

    container.addEventListener('mousemove', (e) => {
        const rect = container.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
    });

    container.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
    });

    class AboutParticle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * 0.7;
            this.vy = (Math.random() - 0.5) * 0.7;
            this.radius = Math.random() * 2 + 1;
            this.baseX = this.x;
            this.baseY = this.y;
        }

        update() {
            // Interactive mouse attraction/push physics
            if (mouse.x !== null && mouse.y !== null) {
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < mouse.radius) {
                    // Gentle gravitational pull towards cursor
                    const force = (mouse.radius - dist) / mouse.radius;
                    const angle = Math.atan2(dy, dx);
                    this.x += Math.cos(angle) * force * 1.5;
                    this.y += Math.sin(angle) * force * 1.5;
                }
            }

            // Normal drifting movement
            this.x += this.vx;
            this.y += this.vy;

            // Bounce check
            if (this.x < 5 || this.x > width - 5) this.vx = -this.vx;
            if (this.y < 5 || this.y > height - 5) this.vy = -this.vy;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            
            const style = getComputedStyle(document.documentElement);
            const secondaryColor = style.getPropertyValue('--secondary-color').trim() || '#8b5cf6';
            ctx.fillStyle = secondaryColor + 'cc';
            ctx.fill();
        }
    }

    function setup() {
        width = canvas.width = container.offsetWidth;
        height = canvas.height = container.offsetHeight;
        particles = [];
        
        // Populate particles
        const numParticles = 40;
        for (let i = 0; i < numParticles; i++) {
            particles.push(new AboutParticle());
        }
    }

    function drawMesh() {
        ctx.clearRect(0, 0, width, height);

        const style = getComputedStyle(document.documentElement);
        const secondaryRGB = style.getPropertyValue('--secondary-rgb').trim() || '139, 92, 246';
        const primaryRGB = style.getPropertyValue('--primary-rgb').trim() || '46, 91, 255';
        
        // Draw mesh lines
        for (let i = 0; i < particles.length; i++) {
            const p1 = particles[i];
            p1.update();
            p1.draw();

            for (let j = i + 1; j < particles.length; j++) {
                const p2 = particles[j];
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 90) {
                    const alpha = (90 - distance) / 90 * 0.22;
                    ctx.strokeStyle = `rgba(${secondaryRGB}, ${alpha})`;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.stroke();
                }
            }

            // Draw line to cursor if close
            if (mouse.x !== null && mouse.y !== null) {
                const dx = mouse.x - p1.x;
                const dy = mouse.y - p1.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < mouse.radius) {
                    const alpha = (mouse.radius - distance) / mouse.radius * 0.35;
                    ctx.strokeStyle = `rgba(${primaryRGB}, ${alpha})`;
                    ctx.lineWidth = 1.2;
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(mouse.x, mouse.y);
                    ctx.stroke();
                }
            }
        }

        requestAnimationFrame(drawMesh);
    }

    // Handle container resize
    const resizeObserver = new ResizeObserver(() => {
        setup();
    });
    resizeObserver.observe(container);

    setup();
    drawMesh();
}

/* ==========================================
   3. Hero Content Card Parallax & Tilt
   ========================================== */
function initHeroCardParallax() {
    const card = document.getElementById('hero-card');
    const heroSection = document.getElementById('home');
    const portrait = document.getElementById('heroPortrait');
    if (!card || !heroSection) return;

    heroSection.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        
        // Relative mouse coordinates from card center
        const cardCenterX = rect.left + rect.width / 2;
        const cardCenterY = rect.top + rect.height / 2;
        
        const deltaX = e.clientX - cardCenterX;
        const deltaY = e.clientY - cardCenterY;

        // Calculate rotation degree limits (max 12deg for card)
        const rotY = (deltaX / (window.innerWidth / 2)) * 12;
        const rotX = -(deltaY / (window.innerHeight / 2)) * 12;

        // Pause standard float animation by toggling style
        card.style.animation = 'none';
        
        // Apply 3D perspective rotation
        card.style.transform = `rotateY(${rotY}deg) rotateX(${rotX}deg) translateY(-10px)`;
        
        // Photo bending effect: apply a separate, responsive rotation directly on the image element
        if (portrait) {
            // Calculate a local coordinate ratio on the card to bend the image
            const imgRotY = (deltaX / (rect.width / 2)) * 14; 
            const imgRotX = -(deltaY / (rect.height / 2)) * 14;
            portrait.style.animation = 'none'; // Pause base Ken Burns drift
            portrait.style.transform = `scale(1.08) rotateY(${imgRotY}deg) rotateX(${imgRotX}deg)`;
        }
    });

    heroSection.addEventListener('mouseleave', () => {
        // Reset card translation and rotation, then restart float animation
        card.style.transition = 'transform 0.8s ease';
        card.style.transform = 'rotateY(0deg) rotateX(0deg) translateY(0px)';
        
        if (portrait) {
            portrait.style.transition = 'transform 0.8s ease';
            portrait.style.transform = 'scale(1.02) rotateY(0deg) rotateX(0deg)';
        }
        
        setTimeout(() => {
            card.style.transition = '';
            card.style.animation = ''; // Restores CSS floats
            
            if (portrait) {
                portrait.style.transition = '';
                // Resume base Ken Burns pan
                portrait.style.animation = 'slowPan 25s ease-in-out infinite alternate';
            }
        }, 800);
    });
}

/* ==========================================
   4. Navbar Scroll Style Modification
   ========================================== */
function initNavbarScroll() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('navbar-scrolled');
        } else {
            navbar.classList.remove('navbar-scrolled');
        }
    });
}

/* ==========================================
   5. Active Navigation Section Tracking
   ========================================== */
function initActiveNavTracking() {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');
    
    if (!sections.length || !navLinks.length) return;

    window.addEventListener('scroll', () => {
        let currentSectionId = '';
        const scrollPosition = window.scrollY + 120; 

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;

            if (scrollPosition >= sectionTop && scrollPosition < (sectionTop + sectionHeight)) {
                currentSectionId = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSectionId}`) {
                link.classList.add('active');
            }
        });
    });
}

/* ==========================================
   6. Mobile Slide-out Drawer Menus
   ========================================== */
function initMobileDrawer() {
    const hamburger = document.getElementById('hamburger-menu');
    const closeBtn = document.getElementById('close-drawer');
    const drawer = document.getElementById('mobile-drawer');

    if (!hamburger || !drawer) return;

    function openDrawer() {
        drawer.classList.add('open');
        hamburger.style.opacity = '0';
    }

    function closeDrawer() {
        drawer.classList.remove('open');
        hamburger.style.opacity = '1';
    }

    hamburger.addEventListener('click', openDrawer);
    if (closeBtn) closeBtn.addEventListener('click', closeDrawer);

    document.addEventListener('click', (e) => {
        if (drawer.classList.contains('open') && 
            !drawer.contains(e.target) && 
            !hamburger.contains(e.target) && 
            (!closeBtn || !closeBtn.contains(e.target))) {
            closeDrawer();
        }
    });
}

window.toggleDrawer = function() {
    const drawer = document.getElementById('mobile-drawer');
    const hamburger = document.getElementById('hamburger-menu');
    if (drawer) drawer.classList.remove('open');
    if (hamburger) hamburger.style.opacity = '1';
};

/* ==========================================
   7. Theme Switcher (Obsidian vs Lumina)
   ========================================== */
function initThemeToggler() {
    const swatches = document.querySelectorAll('.swatch-btn');
    const body = document.body;
    if (!swatches.length) return;

    swatches.forEach(swatch => {
        swatch.addEventListener('click', () => {
            swatches.forEach(s => s.classList.remove('active'));
            swatch.classList.add('active');

            const theme = swatch.getAttribute('data-theme');
            
            if (theme === 'default') {
                body.classList.remove('theme-lumina', 'theme-black');
            } else if (theme === 'nebula') {
                body.classList.remove('theme-black');
                body.classList.add('theme-lumina');
            } else if (theme === 'void') {
                body.classList.remove('theme-lumina');
                body.classList.add('theme-black');
            }

            swatch.style.transform = 'scale(0.8)';
            setTimeout(() => {
                swatch.style.transform = '';
            }, 150);
        });
    });
}

/* ==========================================
   8. Contact Form Submission Simulation
   ========================================== */
function initContactForm() {
    const contactForm = document.getElementById('contact-form');
    if (!contactForm) return;

    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalContent = submitBtn.innerHTML;

        submitBtn.disabled = true;
        submitBtn.innerHTML = `Sending... <span class="material-symbols-outlined animate-spin" style="font-size: 1.15rem;">sync</span>`;

        setTimeout(() => {
            submitBtn.style.background = 'var(--tertiary-color)';
            submitBtn.style.color = '#000000';
            submitBtn.innerHTML = `Message Sent! <span class="material-symbols-outlined">done</span>`;

            contactForm.reset();

            setTimeout(() => {
                submitBtn.disabled = false;
                submitBtn.style.background = '';
                submitBtn.style.color = '';
                submitBtn.innerHTML = originalContent;
            }, 3000);

        }, 1500);
    });
}

/* ==========================================
   9. AI Chatbot Assistant (सु.Ai)
   ========================================== */
function initChatbot() {
    const chatbotToggle = document.getElementById('chatbot-toggle');
    const chatbotContainer = document.getElementById('chatbot-container');
    const chatClose = document.getElementById('chat-close');
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const chatMessages = document.getElementById('chat-messages');
    const chatChips = document.getElementById('chat-chips');
    const chatWindow = document.getElementById('chat-window');

    if (!chatbotToggle || !chatWindow) return;

    let conversationHistory = [];
    let isProcessing = false;

    // Toggle chat window open/close
    chatbotToggle.addEventListener('click', () => {
        chatWindow.classList.toggle('open');
        const pulse = chatbotToggle.querySelector('.chat-pulse');
        if (pulse) pulse.style.display = 'none';
        
        if (chatWindow.classList.contains('open')) {
            setTimeout(() => {
                chatInput.focus();
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }, 200);
        }
    });

    chatClose.addEventListener('click', () => {
        chatWindow.classList.remove('open');
    });

    document.addEventListener('click', (e) => {
        if (!chatbotContainer.contains(e.target) && chatWindow.classList.contains('open')) {
            chatWindow.classList.remove('open');
        }
    });

    function formatMarkdown(text) {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`([^`]+)`/g, '<code style="background:rgba(255,255,255,0.1);padding:2px 5px;border-radius:4px;font-family:var(--font-mono);font-size:0.85em;">$1</code>')
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" style="color:var(--primary-color);text-decoration:underline;font-weight:500;">$1</a>')
            .replace(/\n\s*-\s+(.*)/g, '<li style="margin-left:14px;margin-bottom:4px;">$1</li>')
            .replace(/\n\s*(\d+)\.\s+(.*)/g, '<li style="margin-left:14px;margin-bottom:4px;" value="$1">$2</li>')
            .replace(/\n/g, '<br>');
    }

    function appendMessage(text, isBot = true) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `chat-msg ${isBot ? 'bot-msg' : 'user-msg'}`;
        
        const formatted = formatMarkdown(text);
        msgDiv.innerHTML = `<p>${formatted}</p>`;
        chatMessages.appendChild(msgDiv);
        
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function showTypingIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'chat-msg bot-msg typing-indicator-msg';
        indicator.id = 'typing-indicator';
        indicator.innerHTML = `<p style="display:flex;gap:6px;align-items:center;margin:0;">
            <span style="font-size:0.85rem;color:var(--text-muted);">सु.Ai is typing</span>
            <span class="material-symbols-outlined animate-spin" style="font-size:0.95rem;color:var(--primary-color);">sync</span>
        </p>`;
        chatMessages.appendChild(indicator);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function removeTypingIndicator() {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) indicator.remove();
    }

    async function processQuery(query) {
        if (isProcessing) return;
        isProcessing = true;
        showTypingIndicator();

        const sendBtn = chatForm.querySelector('.chat-send-btn');
        if (sendBtn) sendBtn.disabled = true;

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 12000);

            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: query,
                    history: conversationHistory
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);
            removeTypingIndicator();

            if (res.ok) {
                const data = await res.json();
                const reply = data.reply || "I'm ready to answer any questions about Suraj's projects, technical skills, or background!";
                appendMessage(reply, true);

                // Update conversation history
                conversationHistory.push({ role: 'user', text: query });
                conversationHistory.push({ role: 'model', text: reply });

                // Keep history trimmed to last 8 turns
                if (conversationHistory.length > 8) {
                    conversationHistory = conversationHistory.slice(-8);
                }
            } else {
                throw new Error(`API returned status ${res.status}`);
            }
        } catch (err) {
            removeTypingIndicator();
            console.warn('AI Chat API fallback activated:', err.message);

            // Client-side quick fallback response
            let fallback = `Suraj is a passionate full-stack engineer and creative developer specializing in performant web applications, modern UI/UX, and robust databases.`;
            const lower = query.toLowerCase();

            if (lower.includes('project') || lower.includes('work') || lower.includes('app')) {
                fallback = `Suraj has built 3 key showcase projects:
1. 🍱 **Mess App for Hostel Student** (Android/Java/SQLite)
2. 🗺️ **Travel App for Trip** (JS/Map API/CSS3)
3. 🩸 **Blood Donation Record Keeping** (Node.js/SQL/Express)

Click any project card on this page to explore their full details & architecture!`;
            } else if (lower.includes('skill') || lower.includes('tech') || lower.includes('stack')) {
                fallback = `Suraj's technical toolkit includes:
- **Languages**: JavaScript (ES6+), Python, Java, SQL, HTML5/CSS3
- **Backend**: Node.js, Express REST APIs, MongoDB, SQLite, PostgreSQL
- **Frontend**: Canvas simulations, GSAP scrollytelling, Glassmorphic UI/UX`;
            } else if (lower.includes('contact') || lower.includes('email') || lower.includes('reach')) {
                fallback = `You can reach Suraj via:
- **Email**: [thakursuraz7@gmail.com](mailto:thakursuraz7@gmail.com)
- **LinkedIn**: [linkedin.com/in/suraj-t-b942812b5](https://www.linkedin.com/in/suraj-t-b942812b5)
- **GitHub**: [github.com/suraz111](https://github.com/suraz111)
Or submit the **Let's Connect** form below!`;
            }

            appendMessage(fallback, true);
        } finally {
            isProcessing = false;
            if (sendBtn) sendBtn.disabled = false;
            chatInput.focus();
        }
    }

    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = chatInput.value.trim();
        if (!text || isProcessing) return;

        appendMessage(text, false);
        chatInput.value = '';
        processQuery(text);
    });

    chatChips.addEventListener('click', (e) => {
        const chip = e.target.closest('.chip-btn');
        if (!chip || isProcessing) return;

        const query = chip.getAttribute('data-query');
        appendMessage(query, false);
        processQuery(query);
    });
}

/* ==========================================
   10. Premium Kinetic Typography & Text Scrambler
   ========================================== */

class TextScrambler {
    constructor(el) {
        this.el = el;
        this.chars = '!<>-_\\/[]{}—=+*^?#________';
        this.update = this.update.bind(this);
    }
    setText(newText) {
        const oldText = this.el.textContent;
        const length = Math.max(oldText.length, newText.length);
        const promise = new Promise((resolve) => this.resolve = resolve);
        this.queue = [];
        for (let i = 0; i < length; i++) {
            const from = oldText[i] || '';
            const to = newText[i] || '';
            const start = Math.floor(Math.random() * 16);
            const end = start + Math.floor(Math.random() * 20) + 14;
            this.queue.push({ from, to, start, end, char: '' });
        }
        cancelAnimationFrame(this.frameRequest);
        this.frame = 0;
        this.update();
        return promise;
    }
    update() {
        let output = '';
        let complete = 0;
        for (let i = 0, n = this.queue.length; i < n; i++) {
            let { from, to, start, end, char } = this.queue[i];
            if (this.frame >= end) {
                complete++;
                output += to;
            } else if (this.frame >= start) {
                if (!char || Math.random() < 0.28) {
                    char = this.randomChar();
                    this.queue[i].char = char;
                }
                output += `<span class="scramble-char active">${char}</span>`;
            } else {
                output += from;
            }
        }
        this.el.innerHTML = output;
        if (complete === this.queue.length) {
            this.resolve();
        } else {
            this.frameRequest = requestAnimationFrame(this.update);
            this.frame++;
        }
    }
    randomChar() {
        return this.chars[Math.floor(Math.random() * this.chars.length)];
    }
}

function initScrambling() {
    // 1. Wrap bare text inside drawer links
    document.querySelectorAll('.drawer-link').forEach(link => {
        link.childNodes.forEach(node => {
            if (node.nodeType === Node.TEXT_NODE && node.textContent.trim() !== '') {
                const span = document.createElement('span');
                span.className = 'drawer-text';
                span.textContent = node.textContent.trim();
                link.replaceChild(span, node);
            }
        });
    });

    // 2. Logo scramble
    const logoEng = document.querySelector('.logo-eng');
    const logoNep = document.querySelector('.logo-nep');
    if (logoEng) setupScrambleOnHover(logoEng);
    if (logoNep) setupScrambleOnHover(logoNep);

    // 3. Navigation and drawer links scramble
    document.querySelectorAll('.nav-link .nav-text').forEach(setupScrambleOnHover);
    document.querySelectorAll('.drawer-link .drawer-text').forEach(setupScrambleOnHover);

    // 4. Tags, Badges & Dates scramble on hover
    document.querySelectorAll('.tag, .timeline-date, .stat-num').forEach(setupScrambleOnHover);

    // 5. Section titles, numbers & headers hover scramble
    document.querySelectorAll('.section-title, .section-num, .skill-cat-title, .project-title, .collab-card-title, .timeline-title, .contact-info-title').forEach(setupScrambleOnHover);
}

function setupScrambleOnHover(el) {
    const originalText = el.textContent.trim();
    const scrambler = new TextScrambler(el);
    let isScrambling = false;

    el.addEventListener('mouseenter', () => {
        if (isScrambling || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        isScrambling = true;
        scrambler.setText(originalText).then(() => {
            isScrambling = false;
            el.textContent = originalText;
        });
    });
}

function triggerScramble(el) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return Promise.resolve();
    const originalText = el.textContent.trim();
    const scrambler = new TextScrambler(el);
    return scrambler.setText(originalText).then(() => {
        el.textContent = originalText;
    });
}

function initSequencedSectionReveals() {
    const sections = document.querySelectorAll('section');
    
    sections.forEach(section => {
        if (section.id === 'home' || section.id === 'projects') return;
        
        // Find body information elements inside this section
        const infoItems = section.querySelectorAll('.about-bio, .stat-card, .skill-category, .collab-card, .timeline-item, .contact-method, .contact-form-card');
        
        // Add content-reveal-item class to enable slow, graceful CSS transitions
        infoItems.forEach(item => item.classList.add('content-reveal-item'));
        
        // Setup observer for this section
        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const title = section.querySelector('.section-title');
                    const num = section.querySelector('.section-num');
                    
                    // 1. First: Animate Section Number and Title text
                    if (num) triggerScramble(num);
                    const titlePromise = title ? triggerScramble(title) : Promise.resolve();
                    
                    // 2. Right after the text animation finishes: Animate the section information with slow, smooth stagger
                    titlePromise.then(() => {
                        infoItems.forEach((item, index) => {
                            setTimeout(() => {
                                item.classList.add('revealed');
                            }, index * 160);
                        });
                    });
                    
                    sectionObserver.unobserve(section);
                }
            });
        }, { threshold: 0.15 });
        
        sectionObserver.observe(section);
    });
}

function initTextAnimations() {
    // 1. Reveal Hero Title and Accents
    initHeroTitleReveal();
    initHeroRotator();

    // 2. Setup Kinetic Hacker Scramble across all section titles and text
    initScrambling();

    // 3. Sequenced Text Scramble -> Slower Section Information Reveal
    initSequencedSectionReveals();
}

function initHeroTitleReveal() {
    const staticPart = document.querySelector('.hero-title-static');
    const rotatorPart = document.querySelector('.hero-accent-rotator');
    if (staticPart) {
        setTimeout(() => {
            staticPart.classList.add('visible');
        }, 150);
    }
    if (rotatorPart) {
        setTimeout(() => {
            rotatorPart.classList.add('visible');
        }, 450);
    }
}

function initHeroRotator() {
    const rotator = document.getElementById('heroRotator');
    if (!rotator) return;
    
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    
    const words = ['Intelligence', 'Algorithms', 'Data Science', 'Impact', 'Automation'];
    const scrambler = new TextScrambler(rotator);
    let index = 0;
    
    function loop() {
        index = (index + 1) % words.length;
        scrambler.setText(words[index]).then(() => {
            setTimeout(loop, 2200);
        });
    }
    
    setTimeout(loop, 2200);
}

/* ==========================================
   Background Grid & Parallax Motion (Inspired by motion.dev)
   ========================================== */
function initBackgroundMotion() {
    let targetX = 0, targetY = 0;
    let currentX = 0, currentY = 0;
    
    window.addEventListener('mousemove', (e) => {
        // Normalized coordinates from -35px to 35px
        targetX = (e.clientX / window.innerWidth - 0.5) * 35;
        targetY = (e.clientY / window.innerHeight - 0.5) * 35;
    });
    
    // Smooth interpolation update loop
    function update() {
        currentX += (targetX - currentX) * 0.08;
        currentY += (targetY - currentY) * 0.08;
        
        document.documentElement.style.setProperty('--grid-x', `${currentX}px`);
        document.documentElement.style.setProperty('--grid-y', `${currentY}px`);
        
        // Parallax translate the ambient background lights
        const ambient1 = document.querySelector('.ambient-light-1');
        const ambient2 = document.querySelector('.ambient-light-2');
        const ambient3 = document.querySelector('.ambient-light-3');
        
        if (ambient1) ambient1.style.transform = `translate(${currentX * 1.2}px, ${currentY * 1.2}px)`;
        if (ambient2) ambient2.style.transform = `translate(${currentX * -1.0}px, ${currentY * -1.0}px)`;
        if (ambient3) ambient3.style.transform = `translate(${currentX * 0.7}px, ${currentY * 0.7}px)`;
        
        requestAnimationFrame(update);
    }
    update();
}

/* ==========================================
   Playful Photo Filter Switcher (Inspired by Nandini Chowdhary)
   ========================================== */
function initPhotoFilterSwitcher() {
    const switcher = document.querySelector('.filter-switcher');
    if (!switcher) return;
    
    const container = document.getElementById('photoContainer');
    const buttons = switcher.querySelectorAll('.filter-btn');
    if (!container || buttons.length === 0) return;
    
    // Set default mode class on container
    container.classList.add('mode-normal');
    
    buttons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // Avoid triggering card tilt parallax
            
            // Remove active class from all buttons
            buttons.forEach(b => b.classList.remove('active'));
            
            // Add active class to clicked button
            btn.classList.add('active');
            
            // Get selected mode
            const mode = btn.getAttribute('data-mode');
            
            // Remove all existing mode classes
            container.classList.remove('mode-normal', 'mode-crt', 'mode-matrix', 'mode-cyber');
            
            // Add selected mode class
            container.classList.add(`mode-${mode}`);
            
            // Add a small bounce/glitch animation to stickers on switch
            document.querySelectorAll('.photo-sticker').forEach(sticker => {
                sticker.style.transform = 'scale(1.25) rotate(20deg)';
                setTimeout(() => {
                    sticker.style.transform = '';
                }, 300);
            });
        });
    });
}

/* ==========================================
   Horizontal Scrollytelling (GSAP + ScrollTrigger with Vanilla JS Fallback)
   ========================================== */
function initScrollytelling() {
    const section = document.getElementById('projects');
    const stackContainer = document.getElementById('projectsStack');
    const progressFill = document.getElementById('projectProgress');
    if (!section || !stackContainer) return;

    const cards = Array.from(stackContainer.querySelectorAll('.scrolly-stack-card'));
    if (cards.length === 0) return;

    // Check if GSAP and ScrollTrigger are loaded
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);

        ScrollTrigger.matchMedia({
            // Desktop 3D Card Stack Revealer
            "(min-width: 992px)": function() {
                // Ensure initial state: only card 1 is interactive
                gsap.set(cards, { opacity: 0, y: 80, z: -100, rotateX: 10, pointerEvents: "none" });
                gsap.set(cards[0], { opacity: 1, y: 0, z: 0, rotateX: 0, pointerEvents: "auto" });

                // Create pinning timeline
                const tl = gsap.timeline({
                    scrollTrigger: {
                        trigger: "#projects",
                        pin: true,
                        scrub: 1,
                        start: "top top",
                        end: "+=2400", // Scroll space
                        invalidateOnRefresh: true,
                        onUpdate: (self) => {
                            if (progressFill) {
                                progressFill.style.width = `${self.progress * 100}%`;
                            }
                        }
                    }
                });

                // Sequence card transitions: Card 1 fades out, Card 2 slides in
                tl.to(cards[0], { opacity: 0.15, y: -40, z: -50, scale: 0.95, pointerEvents: "none", ease: "none", duration: 1 });
                tl.to(cards[1], { opacity: 1, y: 0, z: 0, rotateX: 0, pointerEvents: "auto", ease: "none", duration: 1 }, "<");

                // Card 2 fades out, Card 3 slides in
                tl.to(cards[1], { opacity: 0.15, y: -40, z: -50, scale: 0.95, pointerEvents: "none", ease: "none", duration: 1 }, "+=0.3");
                tl.to(cards[2], { opacity: 1, y: 0, z: 0, rotateX: 0, pointerEvents: "auto", ease: "none", duration: 1 }, "<");
                
                // Keep final slide visible for a brief moment at the end
                tl.to({}, { duration: 0.3 });

                return () => {
                    // Cleanup timeline
                    tl.scrollTrigger.kill();
                    cards.forEach(card => gsap.set(card, { clearProps: "all" }));
                };
            },

            // Mobile Stack Layout Cleanup
            "(max-width: 991px)": function() {
                cards.forEach(card => gsap.set(card, { clearProps: "all" }));
                if (progressFill) progressFill.style.width = '0%';
            }
        });
    } else {
        // Fallback: Performant Native JS stacked card reveal logic with pointer-events
        const stickyFallback = () => {
            if (window.innerWidth < 992) {
                cards.forEach(card => {
                    card.style.opacity = '';
                    card.style.transform = '';
                    card.style.pointerEvents = '';
                });
                if (progressFill) progressFill.style.width = '0%';
                return;
            }

            const scrollStart = section.offsetTop;
            const scrollEnd = scrollStart + (section.offsetHeight - window.innerHeight);
            const scrollTop = window.scrollY;

            if (scrollTop < scrollStart) {
                cards.forEach((card, idx) => {
                    card.style.opacity = idx === 0 ? '1' : '0';
                    card.style.transform = idx === 0 ? 'translate3d(0, 0px, 0px)' : 'translate3d(0, 80px, -100px) rotateX(10deg)';
                    card.style.pointerEvents = idx === 0 ? 'auto' : 'none';
                });
                if (progressFill) progressFill.style.width = '0%';
            } else if (scrollTop >= scrollStart && scrollTop <= scrollEnd) {
                const progress = (scrollTop - scrollStart) / (scrollEnd - scrollStart);
                if (progressFill) progressFill.style.width = `${progress * 100}%`;
                
                const segmentCount = cards.length - 1;
                const segment = progress * segmentCount;
                
                cards.forEach((card, idx) => {
                    if (idx < Math.floor(segment)) {
                        // Previous card: slide up/out slightly, fade and scale down
                        card.style.opacity = '0.15';
                        card.style.transform = 'translate3d(0, -40px, -50px) scale(0.95)';
                        card.style.pointerEvents = 'none';
                    } else if (idx === Math.floor(segment)) {
                        // Active card sliding out
                        const subProgress = segment - idx;
                        const opacity = 1 - subProgress * 0.85;
                        const y = -subProgress * 40;
                        const z = -subProgress * 50;
                        const scale = 1 - subProgress * 0.05;
                        card.style.opacity = opacity;
                        card.style.transform = `translate3d(0, ${y}px, ${z}px) scale(${scale})`;
                        card.style.pointerEvents = subProgress < 0.5 ? 'auto' : 'none';
                    } else if (idx === Math.floor(segment) + 1) {
                        // Incoming card sliding in
                        const subProgress = segment - (idx - 1);
                        const opacity = subProgress;
                        const y = 80 - subProgress * 80;
                        const z = -100 + subProgress * 100;
                        const rotX = 10 - subProgress * 10;
                        card.style.opacity = opacity;
                        card.style.transform = `translate3d(0, ${y}px, ${z}px) rotateX(${rotX}deg)`;
                        card.style.pointerEvents = subProgress >= 0.5 ? 'auto' : 'none';
                    } else {
                        // Future card: locked at bottom
                        card.style.opacity = '0';
                        card.style.transform = 'translate3d(0, 80px, -100px) rotateX(10deg)';
                        card.style.pointerEvents = 'none';
                    }
                });
            } else if (scrollTop > scrollEnd) {
                cards.forEach((card, idx) => {
                    if (idx < cards.length - 1) {
                        card.style.opacity = '0.15';
                        card.style.transform = 'translate3d(0, -40px, -50px) scale(0.95)';
                        card.style.pointerEvents = 'none';
                    } else {
                        card.style.opacity = '1';
                        card.style.transform = 'translate3d(0, 0px, 0px)';
                        card.style.pointerEvents = 'auto';
                    }
                });
                if (progressFill) progressFill.style.width = '100%';
            }
        };

        window.addEventListener('scroll', stickyFallback);
        window.addEventListener('resize', stickyFallback);
        stickyFallback(); // Run on startup
    }
}

/* ==========================================
   Contact Form — Backend Integration
   ========================================== */
function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('form-name').value.trim();
        const email = document.getElementById('form-email').value.trim();
        const message = document.getElementById('form-message').value.trim();
        const submitBtn = form.querySelector('button[type="submit"]');

        if (!name || !email || !message) return;

        // Disable button and show loading state
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Sending... <span class="material-symbols-outlined">hourglass_empty</span>';

        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, message })
            });

            const data = await res.json().catch(() => ({}));

            if (res.ok && data.success) {
                // Success feedback
                submitBtn.innerHTML = 'Message Sent! <span class="material-symbols-outlined">check_circle</span>';
                submitBtn.style.background = '#22c55e';
                form.reset();

                setTimeout(() => {
                    submitBtn.innerHTML = originalText;
                    submitBtn.style.background = '';
                    submitBtn.disabled = false;
                }, 3500);
            } else {
                throw new Error(data.error || 'Failed to send message. Please try again.');
            }
        } catch (err) {
            console.error('Contact form submission error:', err);
            const isDbErr = err.message && (err.message.includes('Database') || err.message.includes('MONGODB_URI'));
            submitBtn.innerHTML = isDbErr 
                ? 'DB connecting — try again <span class="material-symbols-outlined">sync_problem</span>' 
                : 'Error — try again <span class="material-symbols-outlined">error</span>';
            submitBtn.style.background = '#ef4444';

            setTimeout(() => {
                submitBtn.innerHTML = originalText;
                submitBtn.style.background = '';
                submitBtn.disabled = false;
            }, 3500);
        }
    });
}

/* ==========================================
   Analytics — Page View Tracker
   ========================================== */
function trackPageView() {
    // Fire-and-forget: no user impact if it fails
    try {
        const referrer = document.referrer || 'direct';
        fetch('/api/analytics', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ referrer })
        }).catch(() => { /* silent fail */ });
    } catch (e) {
        // Analytics should never break the site
    }
}

/* ==========================================
   Project Detail Modal Logic & Data
   ========================================== */
const PROJECT_DETAILS = {
    'mess-app': {
        title: 'Mess App for Hostel Student',
        subtitle: 'Automated meal scheduling, token booking, & mess analytics designed to eliminate student dining chaos and food waste.',
        category: 'Mobile Application',
        status: 'Completed & Field-Tested',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCpkThHCIJrV_NL1-XwDvies4ITYhHa0eIy515-6uT5E7pDzkm8vYgqlNd2ga6Ok5BgonfXGPl-d84z5jqUDgjI2O_mB4Peq3qP_ZnDMIYjPEKmFlX3QSEdVVLDfEYH1J0ZhqlP453tf3oHaFzDpw6NCc6ZJCjILF9NPAbY7y3ylBsg1ODCcztnaAqtprGm7xb8zNc_G19iJa3T64CGBW5fbhdZwtJach4vaCSi_nI4OQcKz9mSwfEZ5Q',
        overview: 'Developed specifically for college hostels to replace chaotic paper registers and reduce food over-preparation. The app provides push notifications for meal menus, digital token check-ins, and accurate headcounts before kitchen preparation.',
        features: [
            {
                icon: 'notifications_active',
                title: 'Smart Meal Push Reminders',
                desc: 'Automated notification alerts dispatched 45 minutes prior to meal lock-in windows so students can plan ahead.'
            },
            {
                icon: 'confirmation_number',
                title: 'Digital Token Booking & Opt-Out',
                desc: '1-tap meal cancellation allowing mess kitchen staff to calculate precise prep portions hours before cooking.'
            },
            {
                icon: 'query_stats',
                title: 'Live Headcount Analytics',
                desc: 'Real-time dining dashboard presenting breakfast, lunch, and dinner attendance projections to hostel administrators.'
            },
            {
                icon: 'signal_cellular_connected_no_internet_4_bar',
                title: 'Offline-First SQLite Cache',
                desc: 'Stores student profile and token records locally so hostel check-in works seamlessly during network outages.'
            }
        ],
        techStack: ['Java', 'Android Studio', 'SQLite', 'XML / Material UI', 'BroadcastReceiver', 'AlarmManager', 'Git'],
        impact: 'Reduced estimated daily hostel meal wastage by over 30% and eliminated manual physical register reconciliations.',
        inquiryTopic: 'Hostel Mess App System'
    },
    'travel-app': {
        title: 'Travel App for Trip',
        subtitle: 'Fluid travel planning, interactive itinerary builder, and dynamic multi-currency expense tracker.',
        category: 'Web Application',
        status: 'Active Prototype',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDqkMJd-m6N3qsDkwVAhW8By19CYv-odtsLrxl_HC7Z29ICw8ZCw4Ddi1f-V7ATfSp7YmM0OeDNdy7NNB2tf0noUZ9yp_bIAhc6dSrWgE7yfA1wBsbLDNlfiDeS-EFEobZSVrwPH49-KZio1J-30IpiDsX1lRWpuqQTDRZCMoaSd_u4iQZFXOX0-kOCPX4GSOjOWXT7YwrvoWmwP3U_xLIIZLBRqb8mLOvIIvSD82RYBvVYK88JmgidkA',
        overview: 'Designed for solo and group travelers seeking a lightweight, aesthetic itinerary organizer. Integrates map routing, interactive waypoint markers, and offline cached guides to streamline travel logistics.',
        features: [
            {
                icon: 'map',
                title: 'Interactive Route & Waypoint Mapping',
                desc: 'Visual trip mapping with customizable markers, distance estimations, and real-time turn checkpoints.'
            },
            {
                icon: 'calendar_month',
                title: 'Day-by-Day Milestone Builder',
                desc: 'Drag-and-drop itinerary sequencing with timed alerts, venue hours, and reservation details.'
            },
            {
                icon: 'payments',
                title: 'Dynamic Expense Splitter',
                desc: 'Shared group expense management with automated balance settlements across multiple currencies.'
            },
            {
                icon: 'cloud_off',
                title: 'Offline Destination Guides',
                desc: 'Locally cached travel guides and emergency contacts accessible without cellular roaming data.'
            }
        ],
        techStack: ['JavaScript (ES6+)', 'HTML5 Canvas', 'CSS3 Glassmorphism', 'Mapbox / OpenStreetMap API', 'LocalStorage API'],
        impact: 'Provides sub-second interaction latency with zero heavy runtime dependencies and seamless touch responsiveness.',
        inquiryTopic: 'Travel Trip Planning App'
    },
    'blood-app': {
        title: 'Blood Donation Record Keeping App',
        subtitle: 'Geo-coordinated donor registry and emergency compatibility matching engine for clinics & donation drives.',
        category: 'Full-Stack Web Platform',
        status: 'Production-Ready Architecture',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD_rTdgWbMCRs-XDt32wHHPTYI1kpJ2P0Zd2JBz-SAr-PvcI_wcvm_C9dXfGAry0Xk1bIAtxiCTnMv22Wv_zP3icFkZ8ThfUCH5u2g7UCHU0sghtn9dikoChpw0UcYGQEmR2Mxmz-gVTTgYnVEbO7_-T02rDJJAG5pAUoTfSczgZJZTBRFkWLRZ7HpR2WjUOFQgtW7rTWrueRhXKCH0Yu4G7iDz8HB46ZakEEy19LESu3QN0dzmh0gJSg',
        overview: 'A high-reliability registry platform designed to connect hospitals and blood banks with nearby verified donors during critical shortage windows through algorithmic ABO and Rh factor compatibility indexing.',
        features: [
            {
                icon: 'bloodtype',
                title: 'ABO / Rh Compatibility Indexing',
                desc: 'Algorithmic matrix that checks universal donor compatibility (O-, AB+, etc.) to find candidate pools rapidly.'
            },
            {
                icon: 'near_me',
                title: 'Geographical Radius Matching',
                desc: 'Filters donors within specific kilometer radiuses of the requesting medical facility to minimize transit delays.'
            },
            {
                icon: 'lock',
                title: 'Confidentiality & Privacy Safeguards',
                desc: 'Encrypted donor contact numbers with privacy proxies to prevent unsolicited outreach.'
            },
            {
                icon: 'inventory_2',
                title: 'Donation Camp Ledger & Expiry Tracker',
                desc: 'Tracks unit collection volumes, blood component breakdown (plasma, platelets), and shelf-life expiration timers.'
            }
        ],
        techStack: ['Node.js', 'Express REST API', 'Relational DBMS (PostgreSQL/SQL)', 'JWT Security', 'Leaflet Geo Queries'],
        impact: 'Cuts emergency donor coordination turnaround from several hours to minutes, significantly expediting patient care.',
        inquiryTopic: 'Blood Donation Registry App'
    }
};

function initProjectModals() {
    const modalBackdrop = document.getElementById('projectModal');
    const modalContent = document.getElementById('projectModalContent');
    const modalCloseBtn = document.getElementById('projectModalClose');

    if (!modalBackdrop || !modalContent) return;

    function openModal(projectId) {
        const data = PROJECT_DETAILS[projectId];
        if (!data) return;

        // Build Features HTML
        const featuresHtml = data.features.map(f => `
            <div class="modal-feature-card">
                <div class="modal-feature-header">
                    <span class="material-symbols-outlined">${f.icon}</span>
                    <span>${f.title}</span>
                </div>
                <p class="modal-feature-desc">${f.desc}</p>
            </div>
        `).join('');

        // Build Tech Stack HTML
        const techHtml = data.techStack.map(tech => `
            <span class="modal-tech-chip">${tech}</span>
        `).join('');

        // Populate Modal HTML
        modalContent.innerHTML = `
            <div class="project-modal-banner">
                <img src="${data.image}" alt="${data.title} Screenshot">
                <div class="project-modal-banner-overlay"></div>
                <div class="project-modal-badges">
                    <span class="modal-category-badge">${data.category}</span>
                    <span class="modal-status-badge">${data.status}</span>
                </div>
            </div>

            <div class="project-modal-body">
                <div>
                    <h2 class="project-modal-title" id="modalProjectTitle">${data.title}</h2>
                    <p class="project-modal-subtitle">${data.subtitle}</p>
                </div>

                <div>
                    <h3 class="modal-section-title">
                        <span class="material-symbols-outlined">info</span> Project Overview
                    </h3>
                    <p style="color: var(--text-color); font-size: 0.95rem; line-height: 1.7; margin: 0;">
                        ${data.overview}
                    </p>
                </div>

                <div>
                    <h3 class="modal-section-title">
                        <span class="material-symbols-outlined">featured_play_list</span> Key Capabilities & Architecture
                    </h3>
                    <div class="modal-features-grid">
                        ${featuresHtml}
                    </div>
                </div>

                <div>
                    <h3 class="modal-section-title">
                        <span class="material-symbols-outlined">code</span> Tech Stack & Tools
                    </h3>
                    <div class="modal-tech-chips">
                        ${techHtml}
                    </div>
                </div>

                <div class="modal-impact-box">
                    <span class="material-symbols-outlined">verified</span>
                    <p class="modal-impact-text">
                        <strong>Results & Impact:</strong> ${data.impact}
                    </p>
                </div>

                <div class="project-modal-actions">
                    <button type="button" class="btn btn-secondary btn-sm" id="modalCloseActionBtn">
                        Close Preview
                    </button>
                    <a href="https://github.com/suraz111" target="_blank" class="btn btn-secondary btn-sm" style="display:inline-flex; align-items:center; gap:6px;">
                        <svg style="width:16px; height:16px; fill:currentColor;" viewBox="0 0 24 24">
                            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                        </svg>
                        GitHub Profile
                    </a>
                    <a href="#contact" class="btn btn-primary btn-sm" id="modalInquireBtn" style="display:inline-flex; align-items:center; gap:6px;">
                        <span>Inquire About Project</span>
                        <span class="material-symbols-outlined" style="font-size:1.1rem;">arrow_forward</span>
                    </a>
                </div>
            </div>
        `;

        // Wire Inquire Action
        const inquireBtn = modalContent.querySelector('#modalInquireBtn');
        if (inquireBtn) {
            inquireBtn.addEventListener('click', (e) => {
                closeModal();
                // Optionally pre-fill contact form message
                const msgInput = document.getElementById('contact-message');
                if (msgInput) {
                    msgInput.value = `Hi Suraj, I am interested in discussing your project: ${data.title}.`;
                }
            });
        }

        // Wire Close Action Button inside footer
        const closeActionBtn = modalContent.querySelector('#modalCloseActionBtn');
        if (closeActionBtn) {
            closeActionBtn.addEventListener('click', closeModal);
        }

        // Show Modal
        modalBackdrop.classList.add('is-open');
        modalBackdrop.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden'; // Lock background scroll
    }

    function closeModal() {
        modalBackdrop.classList.remove('is-open');
        modalBackdrop.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = ''; // Restore background scroll
    }

    // Attach Click Handlers to all triggers & cards
    const triggers = document.querySelectorAll('.project-modal-trigger, [data-project]');
    triggers.forEach(el => {
        el.addEventListener('click', (e) => {
            // Find project ID from this element or closest parent
            const projectId = el.getAttribute('data-project') || el.closest('[data-project]')?.getAttribute('data-project');
            if (projectId) {
                e.preventDefault();
                e.stopPropagation();
                openModal(projectId);
            }
        });
    });

    // Close Button Event
    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', closeModal);
    }

    // Close on Click Outside Dialog
    modalBackdrop.addEventListener('click', (e) => {
        if (e.target === modalBackdrop) {
            closeModal();
        }
    });

    // Keyboard ESC to Close
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalBackdrop.classList.contains('is-open')) {
            closeModal();
        }
    });
}

