const jwt = require('jsonwebtoken');

/**
 * Verifies JWT token from Authorization header.
 * Returns decoded payload if valid, sends 401 if not.
 */
function verifyAuth(req, res) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Unauthorized — no token provided.' });
        return null;
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return decoded;
    } catch (err) {
        res.status(401).json({ error: 'Unauthorized — invalid or expired token.' });
        return null;
    }
}

module.exports = { verifyAuth };
