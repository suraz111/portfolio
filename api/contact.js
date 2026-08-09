const { connectDB } = require('../lib/db');
const Contact = require('../models/Contact');
const { verifyAuth } = require('./middleware/auth');

module.exports = async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // ── POST: Submit a new contact message (public) ──
    if (req.method === 'POST') {
        try {
            let body = req.body;
            if (typeof body === 'string') {
                try {
                    body = JSON.parse(body);
                } catch (e) {
                    body = {};
                }
            }
            body = body || {};

            const { name, email, message } = body;

            if (!name || !email || !message) {
                return res.status(400).json({ error: 'Name, email, and message are all required.' });
            }

            await connectDB();

            const contact = await Contact.create({
                name: String(name).trim(),
                email: String(email).trim(),
                message: String(message).trim()
            });

            return res.status(201).json({
                success: true,
                message: 'Thank you! Your message has been received.',
                id: contact._id
            });
        } catch (error) {
            console.error('Contact POST error:', error);

            if (error.name === 'ValidationError') {
                const messages = Object.values(error.errors).map(e => e.message);
                return res.status(400).json({ error: messages.join(', ') });
            }

            if (error.message && error.message.includes('MONGODB_URI')) {
                return res.status(500).json({ error: 'Database configuration missing. Please verify MONGODB_URI on Vercel.' });
            }

            return res.status(500).json({ error: error.message || 'Failed to submit message.' });
        }
    }

    // ── GET: List all messages (admin only) ──
    if (req.method === 'GET') {
        const auth = verifyAuth(req, res);
        if (!auth) return;

        try {
            await connectDB();
            const messages = await Contact.find().sort({ createdAt: -1 }).lean();
            return res.status(200).json({ success: true, data: messages });
        } catch (error) {
            console.error('Contact GET error:', error);
            return res.status(500).json({ error: 'Failed to fetch messages.' });
        }
    }

    // ── DELETE: Delete a message (admin only) ──
    if (req.method === 'DELETE') {
        const auth = verifyAuth(req, res);
        if (!auth) return;

        try {
            const { id } = req.query;
            if (!id) {
                return res.status(400).json({ error: 'Message ID is required.' });
            }

            await connectDB();
            await Contact.findByIdAndDelete(id);
            return res.status(200).json({ success: true, message: 'Message deleted.' });
        } catch (error) {
            console.error('Contact DELETE error:', error);
            return res.status(500).json({ error: 'Failed to delete message.' });
        }
    }

    return res.status(405).json({ error: 'Method not allowed.' });
};

