const crypto = require('crypto');

// Simple hash function for password comparison
function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

// Verify password
function verifyPassword(inputPassword, storedHash) {
    const inputHash = hashPassword(inputPassword);
    return inputHash === storedHash;
}

// Get credentials from environment or use defaults
function getAdminCredentials() {
    return {
        username: process.env.ADMIN_USERNAME || 'admin',
        // Default password: 'VeryVerySecure!' (hashed)
        passwordHash: process.env.ADMIN_PASSWORD_HASH || hashPassword('VeryVerySecure!')
    };
}

// Simple session store (in-memory)
const sessions = new Map();

// Generate session token
function generateSessionToken() {
    return crypto.randomBytes(32).toString('hex');
}

// Create session
function createSession(username) {
    const token = generateSessionToken();
    sessions.set(token, {
        username,
        createdAt: Date.now(),
        expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
    });
    return token;
}

// Verify session
function verifySession(token) {
    const session = sessions.get(token);
    if (!session) return false;

    if (Date.now() > session.expiresAt) {
        sessions.delete(token);
        return false;
    }

    return true;
}

// Delete session
function deleteSession(token) {
    sessions.delete(token);
}

// Clean expired sessions periodically
setInterval(() => {
    const now = Date.now();
    for (const [token, session] of sessions.entries()) {
        if (now > session.expiresAt) {
            sessions.delete(token);
        }
    }
}, 60 * 60 * 1000); // Clean every hour

module.exports = {
    hashPassword,
    verifyPassword,
    getAdminCredentials,
    createSession,
    verifySession,
    deleteSession
};
