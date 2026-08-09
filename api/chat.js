// Serverless API endpoint for AI Chatbot (सु.Ai)
// Supports Google Gemini API with smart fallback for offline/local development

const SYSTEM_INSTRUCTION = `You are "सु.Ai" (Su.Ai), the intelligent virtual profile assistant for Suraj's portfolio website.
Your goal is to represent Suraj professionally, warmly, and concisely to recruiters, clients, and fellow engineers.

Core Profile:
- Name: Suraj
- Role: Full-Stack Engineer, Creative Developer & Problem Solver
- Core Tech Stack: JavaScript (ES6+), Python, Java, Node.js, Express, HTML5/CSS3 Canvas animations, SQLite, PostgreSQL/SQL, MongoDB, Responsive UI/UX, REST APIs.
- Education: Strong academic foundation in Computer Systems, Algorithms, Database Architecture, and Web Development.

Key Projects Built:
1. "Mess App for Hostel Student" (Android / Java / SQLite):
   - Solves hostel kitchen food wastage by over 30%.
   - Features automated meal push reminders, digital token opt-outs, and real-time dining attendance analytics.
2. "Travel App for Trip" (JavaScript / HTML5 Canvas / Map API / CSS3):
   - Interactive route & waypoint mapping with real-time ETAs.
   - Day-by-day milestone itinerary builder, dynamic multi-currency expense splitter, and offline cached guides.
3. "Blood Donation Record Keeping App" (Node.js / Express / SQL / DBMS):
   - High-reliability donor registry with ABO & Rh factor compatibility matrix indexing.
   - Geographical radius matching to connect nearby verified donors with urgent hospital requests.

Portfolio Features & Collaboration:
- Blog: "Engineering Notes" section with articles on web performance, systems, and modern UI.
- Open for: Freelancing, consulting, startup prototyping, and open-source collaborations.

Contact Channels:
- Email: thakursuraz7@gmail.com
- LinkedIn: https://www.linkedin.com/in/suraj-t-b942812b5
- GitHub: https://github.com/suraz111
- "Let's Connect" form at the bottom of the homepage.

Guidelines:
- Keep answers concise (2 to 4 sentences or a clean bullet list) so they look great inside a chat bubble.
- Use markdown formatting (bold words, links where helpful).
- If the user asks something completely unrelated to tech/career/Suraj, politely pivot back to Suraj's work or how to contact him.`;

// Contextual fallback response generator (used when no API key is set or on API network error)
function generateFallbackResponse(query) {
    const q = query.toLowerCase();

    if (q.includes('project') || q.includes('built') || q.includes('work') || q.includes('portfolio') || q.includes('app')) {
        return `Suraj has engineered 3 major showcase applications:
1. 🍱 **Mess App for Hostel Student** (Java/Android Studio/SQLite) — Meal scheduling & food waste reduction.
2. 🗺️ **Travel App for Trip** (JS/HTML5/Map API) — Custom route mapping & itinerary planner.
3. 🩸 **Blood Donation Record Keeping** (Node.js/SQL/Express) — ABO/Rh compatibility & geo-radius matching.

Click any project card on the homepage to explore interactive capabilities & architecture!`;
    }

    if (q.includes('skill') || q.includes('stack') || q.includes('tech') || q.includes('language') || q.includes('framework')) {
        return `Suraj's core technical toolkit includes:
- **Languages**: JavaScript (ES6+), Python, Java, SQL, HTML5/CSS3.
- **Backend & APIs**: Node.js, Express.js, RESTful microservices, MongoDB, SQLite, PostgreSQL.
- **Frontend & Creative**: Glassmorphic UI/UX, HTML5 Canvas simulations, GSAP scrollytelling, CSS Grid & Flexbox.`;
    }

    if (q.includes('collaborat') || q.includes('partner') || q.includes('hire') || q.includes('freelance') || q.includes('contract') || q.includes('job')) {
        return `Yes! Suraj is actively open to:
- 🚀 **Freelance UI/Full-Stack Development**
- 🤝 **Open-source Canvas & Web Tooling**
- 💡 **Startup MVP Prototyping**

Feel free to scroll down to the **Let's Connect** form or email him directly at [thakursuraz7@gmail.com](mailto:thakursuraz7@gmail.com)!`;
    }

    if (q.includes('contact') || q.includes('email') || q.includes('reach') || q.includes('phone') || q.includes('message') || q.includes('linkedin') || q.includes('github')) {
        return `You can connect with Suraj across:
- **Email**: [thakursuraz7@gmail.com](mailto:thakursuraz7@gmail.com)
- **LinkedIn**: [linkedin.com/in/suraj-t-b942812b5](https://www.linkedin.com/in/suraj-t-b942812b5)
- **GitHub**: [github.com/suraz111](https://github.com/suraz111)
- **Contact Form**: Available at the bottom of this page.`;
    }

    if (q.includes('mess') || q.includes('hostel') || q.includes('meal') || q.includes('food')) {
        return `The **Mess App for Hostel Student** is an Android/SQLite app that automates meal schedules, manages digital tokens, and provides real-time headcounts to hostel managers, cutting food wastage by over 30%!`;
    }

    if (q.includes('travel') || q.includes('trip') || q.includes('map') || q.includes('itinerary')) {
        return `The **Travel App for Trip** is an interactive travel companion featuring waypoint route mapping, custom day-by-day itineraries, group expense splitting, and offline cached city guides.`;
    }

    if (q.includes('blood') || q.includes('donor') || q.includes('hospital') || q.includes('donation')) {
        return `The **Blood Donation Hub** is a Node.js + SQL platform featuring algorithmic ABO/Rh compatibility matching and radius-based geographical filters for emergency blood coordination.`;
    }

    if (q.includes('educat') || q.includes('college') || q.includes('school') || q.includes('degree') || q.includes('study')) {
        return `Suraj completed his academic foundation in Computer Science, mastering core concepts in data structures, relational databases, systems engineering, and web architecture.`;
    }

    if (q.includes('blog') || q.includes('article') || q.includes('write') || q.includes('post')) {
        return `Check out Suraj's [Blog](/blog) ("Engineering Notes") for insightful deep-dives on web engineering, systems, and creative design!`;
    }

    if (q.includes('hello') || q.includes('hi') || q.includes('hey') || q.includes('who are you') || q.includes('namaste')) {
        return `Hello! 👋 I am **सु.Ai**, Suraj's AI assistant. I can tell you all about his **projects**, **skills**, **education**, or help you get in touch with him for collaborations! What would you like to know?`;
    }

    return `Thanks for asking! Suraj is a passionate full-stack engineer and creative developer specializing in performant web applications and sleek user interfaces.

Would you like details on his **projects**, **tech stack**, or **how to collaborate**?`;
}

module.exports = async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed. Use POST.' });
    }

    try {
        const { message, history = [] } = req.body || {};

        if (!message || typeof message !== 'string' || !message.trim()) {
            return res.status(400).json({ error: 'A valid message string is required.' });
        }

        const cleanMessage = message.trim().slice(0, 500); // Safety limit length
        const apiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY;

        // If Gemini API Key is configured, make real AI call
        if (apiKey) {
            try {
                // Build Gemini contents payload with history
                const contents = [];

                // Convert history (max last 6 turns to keep fast and concise)
                const recentHistory = Array.isArray(history) ? history.slice(-6) : [];
                for (const turn of recentHistory) {
                    if (turn && turn.text) {
                        contents.push({
                            role: turn.role === 'user' ? 'user' : 'model',
                            parts: [{ text: String(turn.text).slice(0, 500) }]
                        });
                    }
                }

                // Append current user message
                contents.push({
                    role: 'user',
                    parts: [{ text: cleanMessage }]
                });

                const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

                const apiResponse = await fetch(geminiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        systemInstruction: {
                            parts: [{ text: SYSTEM_INSTRUCTION }]
                        },
                        contents,
                        generationConfig: {
                            maxOutputTokens: 350,
                            temperature: 0.7
                        }
                    })
                });

                if (apiResponse.ok) {
                    const data = await apiResponse.json();
                    const aiReply = data.candidates?.[0]?.content?.parts?.[0]?.text;
                    if (aiReply && aiReply.trim()) {
                        return res.status(200).json({
                            success: true,
                            reply: aiReply.trim(),
                            source: 'gemini'
                        });
                    }
                } else {
                    const errorText = await apiResponse.text();
                    console.warn('Gemini API call returned non-200:', apiResponse.status, errorText);
                }
            } catch (apiErr) {
                console.warn('Gemini API error, falling back to local engine:', apiErr.message);
            }
        }

        // Contextual smart fallback
        const fallbackReply = generateFallbackResponse(cleanMessage);
        return res.status(200).json({
            success: true,
            reply: fallbackReply,
            source: 'assistant-fallback'
        });

    } catch (err) {
        console.error('Chat API handler error:', err);
        return res.status(500).json({
            success: false,
            reply: "I encountered a minor glitch processing your request. Please feel free to email Suraj directly at thakursuraz7@gmail.com!",
            error: err.message
        });
    }
};
