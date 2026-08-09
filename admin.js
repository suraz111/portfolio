/**
 * Admin Dashboard — Suraj Portfolio
 * Client-side logic for authentication, CRUD operations, and analytics charts.
 */

(function () {
    'use strict';

    // ── Config ──
    const API_BASE = window.location.origin;
    let authToken = localStorage.getItem('admin_token') || null;
    let analyticsChart = null;

    // ── DOM Refs ──
    const loginScreen = document.getElementById('login-screen');
    const dashboard = document.getElementById('dashboard');
    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');
    const logoutBtn = document.getElementById('logout-btn');
    const pageTitle = document.getElementById('page-title');
    const adminName = document.getElementById('admin-name');

    // Nav
    const navItems = document.querySelectorAll('.nav-item[data-tab]');
    const tabPanels = document.querySelectorAll('.tab-panel');

    // ══════════════════════════════════════════
    // AUTH
    // ══════════════════════════════════════════

    function showLogin() {
        loginScreen.style.display = 'flex';
        dashboard.style.display = 'none';
    }

    function showDashboard() {
        loginScreen.style.display = 'none';
        dashboard.style.display = 'flex';
        const username = localStorage.getItem('admin_username') || 'admin';
        adminName.textContent = username;
        loadMessages();
    }

    // Check if already logged in
    if (authToken) {
        showDashboard();
    }

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('login-username').value.trim();
        const password = document.getElementById('login-password').value;
        const btn = document.getElementById('login-btn');

        btn.disabled = true;
        btn.querySelector('span:first-child').textContent = 'Signing in...';
        loginError.style.display = 'none';

        try {
            const res = await fetch(`${API_BASE}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Login failed');
            }

            authToken = data.token;
            localStorage.setItem('admin_token', data.token);
            localStorage.setItem('admin_username', data.username);
            showDashboard();
            toast('Welcome back!', 'success');
        } catch (err) {
            loginError.textContent = err.message;
            loginError.style.display = 'block';
        } finally {
            btn.disabled = false;
            btn.querySelector('span:first-child').textContent = 'Sign In';
        }
    });

    logoutBtn.addEventListener('click', () => {
        authToken = null;
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_username');
        showLogin();
    });

    // ══════════════════════════════════════════
    // NAVIGATION
    // ══════════════════════════════════════════

    const tabTitles = {
        messages: 'Messages',
        projects: 'Projects',
        blog: 'Blog Posts',
        analytics: 'Analytics'
    };

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const tab = item.dataset.tab;
            navItems.forEach(n => n.classList.remove('active'));
            item.classList.add('active');
            tabPanels.forEach(p => p.classList.remove('active'));
            document.getElementById(`panel-${tab}`).classList.add('active');
            pageTitle.textContent = tabTitles[tab] || tab;

            // Load data for tab
            if (tab === 'messages') loadMessages();
            if (tab === 'projects') loadProjects();
            if (tab === 'blog') loadBlogPosts();
            if (tab === 'analytics') loadAnalytics();
        });
    });

    // ══════════════════════════════════════════
    // API HELPERS
    // ══════════════════════════════════════════

    async function apiCall(endpoint, method = 'GET', body = null) {
        const headers = { 'Content-Type': 'application/json' };
        if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

        const opts = { method, headers };
        if (body) opts.body = JSON.stringify(body);

        const res = await fetch(`${API_BASE}${endpoint}`, opts);

        if (res.status === 401) {
            toast('Session expired. Please log in again.', 'error');
            logoutBtn.click();
            throw new Error('Unauthorized');
        }

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'API error');
        return data;
    }

    // ══════════════════════════════════════════
    // MESSAGES
    // ══════════════════════════════════════════

    async function loadMessages() {
        const tbody = document.getElementById('messages-body');
        tbody.innerHTML = '<tr><td colspan="5" class="empty-state">Loading...</td></tr>';

        try {
            const data = await apiCall('/api/contact');
            const messages = data.data || [];

            const badge = document.getElementById('msg-badge');
            const unread = messages.filter(m => !m.read).length;
            if (unread > 0) {
                badge.style.display = 'inline';
                badge.textContent = unread;
            } else {
                badge.style.display = 'none';
            }

            if (messages.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" class="empty-state">No messages yet.</td></tr>';
                return;
            }

            tbody.innerHTML = messages.map(m => `
                <tr>
                    <td><strong>${escapeHtml(m.name)}</strong></td>
                    <td><a href="mailto:${escapeHtml(m.email)}" style="color:var(--accent)">${escapeHtml(m.email)}</a></td>
                    <td title="${escapeHtml(m.message)}">${escapeHtml(m.message)}</td>
                    <td style="white-space:nowrap; color:var(--text-muted); font-family:var(--font-mono); font-size:0.8rem;">
                        ${new Date(m.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                        <button class="btn-danger" onclick="deleteMessage('${m._id}')">Delete</button>
                    </td>
                </tr>
            `).join('');
        } catch (err) {
            tbody.innerHTML = `<tr><td colspan="5" class="empty-state">Error: ${err.message}</td></tr>`;
        }
    }

    window.deleteMessage = async function (id) {
        if (!confirm('Delete this message?')) return;
        try {
            await apiCall(`/api/contact?id=${id}`, 'DELETE');
            toast('Message deleted.', 'success');
            loadMessages();
        } catch (err) {
            toast(err.message, 'error');
        }
    };

    document.getElementById('refresh-messages').addEventListener('click', loadMessages);

    // ══════════════════════════════════════════
    // PROJECTS
    // ══════════════════════════════════════════

    const projectFormCard = document.getElementById('project-form-card');
    const projectForm = document.getElementById('project-form');

    document.getElementById('add-project-btn').addEventListener('click', () => {
        projectForm.reset();
        document.getElementById('project-id').value = '';
        document.getElementById('project-form-title').textContent = 'New Project';
        projectFormCard.style.display = 'block';
    });

    document.getElementById('cancel-project').addEventListener('click', () => {
        projectFormCard.style.display = 'none';
    });

    projectForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('project-id').value;
        const body = {
            title: document.getElementById('proj-title').value,
            description: document.getElementById('proj-desc').value,
            imageUrl: document.getElementById('proj-image').value,
            tags: document.getElementById('proj-tags').value.split(',').map(t => t.trim()).filter(Boolean),
            projectUrl: document.getElementById('proj-url').value || '#',
            order: parseInt(document.getElementById('proj-order').value) || 0,
            featured: document.getElementById('proj-featured').checked
        };

        try {
            if (id) {
                await apiCall(`/api/projects?id=${id}`, 'PUT', body);
                toast('Project updated!', 'success');
            } else {
                await apiCall('/api/projects', 'POST', body);
                toast('Project created!', 'success');
            }
            projectFormCard.style.display = 'none';
            loadProjects();
        } catch (err) {
            toast(err.message, 'error');
        }
    });

    async function loadProjects() {
        const grid = document.getElementById('projects-grid');
        grid.innerHTML = '<p class="empty-state">Loading...</p>';

        try {
            const data = await apiCall('/api/projects');
            const projects = data.data || [];

            if (projects.length === 0) {
                grid.innerHTML = '<p class="empty-state">No projects yet. Click "Add Project" to create one.</p>';
                return;
            }

            grid.innerHTML = projects.map(p => `
                <div class="admin-card">
                    <h4>${escapeHtml(p.title)}</h4>
                    <p>${escapeHtml(p.description).substring(0, 120)}...</p>
                    <div class="tags-row">
                        ${(p.tags || []).map(t => `<span class="tag">${escapeHtml(t)}</span>`).join('')}
                    </div>
                    <div class="card-meta">
                        <span style="color:var(--text-muted); font-size:0.75rem; font-family:var(--font-mono);">
                            Order: ${p.order || 0}
                        </span>
                        <div class="card-actions">
                            <button class="btn-edit" onclick="editProject('${p._id}')">Edit</button>
                            <button class="btn-danger" onclick="deleteProject('${p._id}')">Delete</button>
                        </div>
                    </div>
                </div>
            `).join('');
        } catch (err) {
            grid.innerHTML = `<p class="empty-state">Error: ${err.message}</p>`;
        }
    }

    window.editProject = async function (id) {
        try {
            const data = await apiCall(`/api/projects?id=${id}`);
            const p = data.data;
            document.getElementById('project-id').value = p._id;
            document.getElementById('proj-title').value = p.title;
            document.getElementById('proj-desc').value = p.description;
            document.getElementById('proj-image').value = p.imageUrl || '';
            document.getElementById('proj-tags').value = (p.tags || []).join(', ');
            document.getElementById('proj-url').value = p.projectUrl || '';
            document.getElementById('proj-order').value = p.order || 0;
            document.getElementById('proj-featured').checked = p.featured;
            document.getElementById('project-form-title').textContent = 'Edit Project';
            projectFormCard.style.display = 'block';
        } catch (err) {
            toast(err.message, 'error');
        }
    };

    window.deleteProject = async function (id) {
        if (!confirm('Delete this project? This cannot be undone.')) return;
        try {
            await apiCall(`/api/projects?id=${id}`, 'DELETE');
            toast('Project deleted.', 'success');
            loadProjects();
        } catch (err) {
            toast(err.message, 'error');
        }
    };

    // ══════════════════════════════════════════
    // BLOG
    // ══════════════════════════════════════════

    const blogFormCard = document.getElementById('blog-form-card');
    const blogForm = document.getElementById('blog-form');

    document.getElementById('add-blog-btn').addEventListener('click', () => {
        blogForm.reset();
        document.getElementById('blog-id').value = '';
        document.getElementById('blog-form-title').textContent = 'New Blog Post';
        blogFormCard.style.display = 'block';
    });

    document.getElementById('cancel-blog').addEventListener('click', () => {
        blogFormCard.style.display = 'none';
    });

    blogForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('blog-id').value;
        const body = {
            title: document.getElementById('blog-title').value,
            slug: document.getElementById('blog-slug').value || undefined,
            excerpt: document.getElementById('blog-excerpt').value,
            content: document.getElementById('blog-content').value,
            published: document.getElementById('blog-published').checked
        };

        try {
            if (id) {
                await apiCall(`/api/blog?id=${id}`, 'PUT', body);
                toast('Post updated!', 'success');
            } else {
                await apiCall('/api/blog', 'POST', body);
                toast('Post created!', 'success');
            }
            blogFormCard.style.display = 'none';
            loadBlogPosts();
        } catch (err) {
            toast(err.message, 'error');
        }
    });

    async function loadBlogPosts() {
        const grid = document.getElementById('blog-grid');
        grid.innerHTML = '<p class="empty-state">Loading...</p>';

        try {
            const data = await apiCall('/api/blog?all=true');
            const posts = data.data || [];

            if (posts.length === 0) {
                grid.innerHTML = '<p class="empty-state">No blog posts yet. Click "New Post" to start writing.</p>';
                return;
            }

            grid.innerHTML = posts.map(p => `
                <div class="admin-card">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                        <h4>${escapeHtml(p.title)}</h4>
                        <span class="status-badge ${p.published ? 'published' : 'draft'}">${p.published ? 'Published' : 'Draft'}</span>
                    </div>
                    <p>${escapeHtml(p.excerpt || p.content?.substring(0, 120) || '')}...</p>
                    <div class="card-meta">
                        <span style="color:var(--text-muted); font-size:0.75rem; font-family:var(--font-mono);">
                            ${new Date(p.createdAt).toLocaleDateString()}
                        </span>
                        <div class="card-actions">
                            <button class="btn-edit" onclick="editBlogPost('${p._id}')">Edit</button>
                            <button class="btn-danger" onclick="deleteBlogPost('${p._id}')">Delete</button>
                        </div>
                    </div>
                </div>
            `).join('');
        } catch (err) {
            grid.innerHTML = `<p class="empty-state">Error: ${err.message}</p>`;
        }
    }

    window.editBlogPost = async function (id) {
        try {
            const data = await apiCall(`/api/blog?id=${id}`);
            const p = data.data;
            document.getElementById('blog-id').value = p._id;
            document.getElementById('blog-title').value = p.title;
            document.getElementById('blog-slug').value = p.slug || '';
            document.getElementById('blog-excerpt').value = p.excerpt || '';
            document.getElementById('blog-content').value = p.content;
            document.getElementById('blog-published').checked = p.published;
            document.getElementById('blog-form-title').textContent = 'Edit Post';
            blogFormCard.style.display = 'block';
        } catch (err) {
            toast(err.message, 'error');
        }
    };

    window.deleteBlogPost = async function (id) {
        if (!confirm('Delete this blog post?')) return;
        try {
            await apiCall(`/api/blog?id=${id}`, 'DELETE');
            toast('Post deleted.', 'success');
            loadBlogPosts();
        } catch (err) {
            toast(err.message, 'error');
        }
    };

    // ══════════════════════════════════════════
    // ANALYTICS
    // ══════════════════════════════════════════

    const analyticsRange = document.getElementById('analytics-range');
    analyticsRange.addEventListener('change', loadAnalytics);

    async function loadAnalytics() {
        const days = analyticsRange.value;

        try {
            const data = await apiCall(`/api/analytics?days=${days}`);
            const records = data.data || [];
            const summary = data.summary || {};

            document.getElementById('stat-views').textContent = (summary.totalViews || 0).toLocaleString();
            document.getElementById('stat-unique').textContent = (summary.totalUnique || 0).toLocaleString();
            document.getElementById('stat-days').textContent = summary.daysTracked || 0;

            renderChart(records.reverse());
        } catch (err) {
            document.getElementById('stat-views').textContent = '—';
            document.getElementById('stat-unique').textContent = '—';
            document.getElementById('stat-days').textContent = '—';
        }
    }

    function renderChart(records) {
        const canvas = document.getElementById('analytics-chart');
        const ctx = canvas.getContext('2d');

        if (analyticsChart) {
            analyticsChart.destroy();
        }

        const labels = records.map(r => r.date);
        const views = records.map(r => r.pageViews);
        const unique = records.map(r => r.uniqueVisitors);

        analyticsChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [
                    {
                        label: 'Page Views',
                        data: views,
                        borderColor: '#6366f1',
                        backgroundColor: 'rgba(99, 102, 241, 0.1)',
                        fill: true,
                        tension: 0.4,
                        pointRadius: 3,
                        pointBackgroundColor: '#6366f1'
                    },
                    {
                        label: 'Unique Visitors',
                        data: unique,
                        borderColor: '#22c55e',
                        backgroundColor: 'rgba(34, 197, 94, 0.1)',
                        fill: true,
                        tension: 0.4,
                        pointRadius: 3,
                        pointBackgroundColor: '#22c55e'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: '#8888a0',
                            font: { family: "'Inter', sans-serif", size: 12 }
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: { color: '#55556a', font: { size: 11 } },
                        grid: { color: 'rgba(255,255,255,0.04)' }
                    },
                    y: {
                        beginAtZero: true,
                        ticks: { color: '#55556a', font: { size: 11 } },
                        grid: { color: 'rgba(255,255,255,0.04)' }
                    }
                }
            }
        });
    }

    // ══════════════════════════════════════════
    // UTILITIES
    // ══════════════════════════════════════════

    function escapeHtml(str) {
        if (!str) return '';
        const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
        return String(str).replace(/[&<>"']/g, c => map[c]);
    }

    function toast(message, type = 'success') {
        // Remove existing toasts
        document.querySelectorAll('.toast').forEach(t => t.remove());

        const el = document.createElement('div');
        el.className = `toast ${type}`;
        el.innerHTML = `
            <span class="material-symbols-outlined">${type === 'success' ? 'check_circle' : 'error'}</span>
            <span>${message}</span>
        `;
        document.body.appendChild(el);

        requestAnimationFrame(() => {
            el.classList.add('show');
        });

        setTimeout(() => {
            el.classList.remove('show');
            setTimeout(() => el.remove(), 350);
        }, 3500);
    }

})();
