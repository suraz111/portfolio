# ⚡ Suraj — Developer Portfolio & Digital Showcase

[![Vercel Deployment](https://img.shields.io/badge/Deployed%20with-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com)
[![Node.js Version](https://img.shields.io/badge/Node.js-%3E%3D18.0.0-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB%20Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

A modern, high-performance **Full-Stack Developer Portfolio, Engineering Blog, and Content Management System** built with a tech-noir / cyberpunk aesthetic, kinetic typography, 3D interactive animations, an integrated Gemini AI assistant (**सु.Ai**), and a secure serverless backend on **Vercel** with **MongoDB Atlas**.

---

## 🌟 Key Features

### 🎨 Frontend & Creative Engineering
- **Cyberpunk / Tech-Noir Aesthetics:** Clean dark mode palette with neon accents, glassmorphic card overlays, and subtle grid textures.
- **Developer Typography Pairing:** Space Grotesk & Geist/Inter for crisp headings and body copy, accented with **JetBrains Mono** across all technical UI, buttons, counters, and badges.
- **Kinetic Text & Decrypt Scrambler:** Custom `TextScrambler` cipher effect on navigation links, section titles, and tags, with word-splitting spring entrance animations.
- **Interactive 3D Portrait with Shader Modes:** Responsive cursor-following 3D tilt perspective with a live render mode switcher:
  - `Normal`: High-contrast, clean studio look.
  - `CRT`: Scanlines with phosphor grid sweep.
  - `Matrix`: Monochromatic green phosphor glow with digital noise.
  - `Cyber`: Saturated synthwave magenta & cyan duotone.
- **Horizontal Scrollytelling Project Deck:** Sticky 3D stacked card deck powered by GSAP ScrollTrigger with a native JS fallback and scroll progress bar.
- **AI Virtual Profile Assistant (सु.Ai):** Conversational AI chatbot powered by the **Google Gemini API** (with offline context fallback) to answer recruiter questions, showcase technical projects, and provide direct contact links.
- **Responsive & Accessible:** Fully responsive across mobile, tablet, and ultra-wide screens with full support for `prefers-reduced-motion`.

---

### 📝 Integrated Blog Platform ("Engineering Notes")
- Dedicated technical blog with article listing, category/tag filtering, search, and reading time calculation.
- Clean markdown-ready reader view with syntax-friendly styling.
- Public read access for published articles with draft preview support for the administrator.

---

### 🛡️ Admin Dashboard & CMS
- **Secure Authentication:** JWT-based session tokens with `bcryptjs` password hashing and auto-provisioning of the initial admin user.
- **Project Manager:** Create, update, toggle visibility, reorder, and delete featured projects.
- **Blog Publisher:** Write and edit articles, manage draft/published status, slugs, and tags.
- **Inquiry Inbox:** Read, mark as read/unread, and delete incoming contact form messages with timestamp tracking.
- **Privacy-First Analytics:** Real-time metrics tracking page views, unique visitors (using SHA-256 hashed IP + UserAgent signatures), and referrer sources without tracking private personal data.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | Vanilla HTML5, CSS3 (Modern Custom Properties, Glassmorphism, 3D Transforms), JavaScript (ES6+), GSAP & ScrollTrigger |
| **Backend / API** | Node.js Serverless Functions (`/api`), Express-style request handlers, JWT (`jsonwebtoken`), Bcrypt (`bcryptjs`) |
| **Database** | MongoDB Atlas, Mongoose ODM |
| **AI Integration** | Google Gemini Generative AI API (`@google/genai` / REST) |
| **Hosting & Infra** | Vercel (Static Assets + Serverless Node.js Functions) |

---

## 📁 Project Structure

```text
suraj-portfolio/
├── admin.html             # Admin Dashboard UI
├── admin.css              # Admin Dashboard Styles
├── admin.js               # Admin Dashboard Logic & API Client
├── blog.html              # Engineering Notes Blog Page
├── blog.css               # Blog Page Styles
├── blog.js                # Blog Dynamic Rendering & Filter Logic
├── index.html             # Main Portfolio Page
├── index.css              # Main Theme, Typography & Animations
├── index.js               # Scrollytelling, 3D Tilt, Scramble & Chat
├── vercel.json            # Vercel Serverless & Static Build Routing
├── package.json           # Project Metadata and Dependencies
├── .env.example           # Environment Variable Template
│
├── api/                   # Serverless API Endpoints (Vercel Node.js)
│   ├── analytics.js       # Page view & unique visitor tracker
│   ├── blog.js            # Blog CRUD operations
│   ├── chat.js            # Gemini AI Chatbot (सु.Ai) backend
│   ├── contact.js         # Contact message handling
│   ├── projects.js        # Dynamic project management
│   ├── auth/
│   │   └── login.js       # Admin login & JWT issuing
│   └── middleware/
│       └── auth.js        # JWT verification middleware
│
├── lib/
│   └── db.js              # Cached MongoDB connection handler
│
└── models/                # Mongoose Data Models
    ├── Admin.js           # Admin credentials model
    ├── Analytics.js       # Daily visitor metrics model
    ├── BlogPost.js        # Blog posts model
    ├── Contact.js         # Contact inquiries model
    └── Project.js         # Portfolio projects model
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) `>= 18.0.0`
- [npm](https://www.npmjs.com/) or [pnpm](https://pnpm.io/)
- [Vercel CLI](https://vercel.com/cli) (`npm i -g vercel`)
- A [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) Cluster (Free M0 tier works great)
- *(Optional)* A [Google Gemini API Key](https://aistudio.google.com/) for live AI chatbot responses.

---

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/suraz111/portfolio.git
cd portfolio
npm install
```

---

### 2. Configure Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` and configure your credentials:

```env
# MongoDB Connection String
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/suraj-portfolio?retryWrites=true&w=majority

# JWT Signing Secret (Generate a strong random string)
JWT_SECRET=your_super_secret_jwt_key_here

# Initial Admin Credentials (Created on first login attempt if DB is empty)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password

# Gemini AI API Key (Optional — fallback responses enabled if blank)
GEMINI_API_KEY=your_gemini_api_key_here
```

---

### 3. Run Locally

Start the local development server with Vercel CLI (which handles both static files and `/api` serverless routes):

```bash
npm run dev
# or
npx vercel dev
```

Visit the application in your browser:
- **Main Portfolio:** `http://localhost:3000`
- **Blog:** `http://localhost:3000/blog`
- **Admin Dashboard:** `http://localhost:3000/admin`

---

## 📡 API Reference

### Authentication
- `POST /api/auth/login` — Authenticate admin and receive JWT token.

### Projects
- `GET /api/projects` — Fetch featured projects (Public).
- `GET /api/projects?id=<id>` — Fetch a single project.
- `POST /api/projects` — Create a new project *(Admin only)*.
- `PUT /api/projects` — Update an existing project *(Admin only)*.
- `DELETE /api/projects?id=<id>` — Delete a project *(Admin only)*.

### Blog
- `GET /api/blog` — Fetch published articles (Public).
- `GET /api/blog?slug=<slug>` — Fetch article by slug.
- `GET /api/blog?all=true` — Fetch all articles including drafts *(Admin only)*.
- `POST /api/blog` — Create a new article *(Admin only)*.
- `PUT /api/blog` — Update an article *(Admin only)*.
- `DELETE /api/blog?id=<id>` — Delete an article *(Admin only)*.

### Contact & Messages
- `POST /api/contact` — Submit a message via contact form (Public).
- `GET /api/contact` — Retrieve all inbox messages *(Admin only)*.
- `PUT /api/contact` — Mark message as read/unread *(Admin only)*.
- `DELETE /api/contact?id=<id>` — Delete a message *(Admin only)*.

### Analytics
- `POST /api/analytics` — Record a page view with hashed privacy signature (Public).
- `GET /api/analytics?period=30d` — Retrieve analytics summary and charts *(Admin only)*.

### AI Chatbot (सु.Ai)
- `POST /api/chat` — Send user message and receive AI / contextual response.

---

## ☁️ Deployment to Vercel

1. Push your repository to GitHub / GitLab / Bitbucket.
2. Import the project into your [Vercel Dashboard](https://vercel.com/new).
3. Add the environment variables from `.env` in **Project Settings > Environment Variables**:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `ADMIN_USERNAME`
   - `ADMIN_PASSWORD`
   - `GEMINI_API_KEY`
4. Click **Deploy**. Vercel will automatically detect `vercel.json` and deploy both the static frontend and serverless API functions.

---

## 👤 Author & Connect

**Suraj**

- **GitHub:** [@suraz111](https://github.com/suraz111)
- **LinkedIn:** [Suraj](https://www.linkedin.com/in/suraj-t-b942812b5)
- **Email:** [thakursuraz7@gmail.com](mailto:thakursuraz7@gmail.com)

---

## 📄 License

This project is licensed under the [MIT License](LICENSE). Feel free to customize and use it for your own portfolio!
