const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { connectDB } = require('../../lib/db');
const Admin = require('../../models/Admin');

module.exports = async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed. Use POST.' });
    }

    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required.' });
        }

        await connectDB();

        // Check if any admin exists, if not, create one from env vars
        const adminCount = await Admin.countDocuments();
        if (adminCount === 0) {
            const defaultUsername = process.env.ADMIN_USERNAME || 'admin';
            const defaultPassword = process.env.ADMIN_PASSWORD || 'admin123';
            const hash = await bcrypt.hash(defaultPassword, 12);
            await Admin.create({ username: defaultUsername, passwordHash: hash });
            console.log('Default admin user created.');
        }

        // Find admin by username
        const admin = await Admin.findOne({ username: username.toLowerCase() });
        if (!admin) {
            return res.status(401).json({ error: 'Invalid credentials.' });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, admin.passwordHash);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials.' });
        }

        // Generate JWT (expires in 24 hours)
        const token = jwt.sign(
            { id: admin._id, username: admin.username },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        return res.status(200).json({
            success: true,
            token,
            username: admin.username
        });

    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ error: 'Internal server error.' });
    }
};
