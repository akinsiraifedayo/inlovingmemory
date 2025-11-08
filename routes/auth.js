const express = require('express');
const router = express.Router();
const {
    getAdminCredentials,
    verifyPassword,
    createSession,
    deleteSession,
    verifySession
} = require('../config/auth');

// Login endpoint
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password required' });
    }

    const credentials = getAdminCredentials();

    if (username !== credentials.username || !verifyPassword(password, credentials.passwordHash)) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = createSession(username);
    res.json({ success: true, token });
});

// Logout endpoint
router.post('/logout', (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (token) {
        deleteSession(token);
    }
    res.json({ success: true });
});

// Verify session endpoint
router.get('/verify', (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token || !verifySession(token)) {
        return res.status(401).json({ error: 'Invalid or expired session' });
    }
    res.json({ success: true });
});

module.exports = router;
