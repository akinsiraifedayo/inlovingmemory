const path = require('path');
require('dotenv').config();

module.exports = {
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
    appName: process.env.APP_NAME || 'Mrs Grace Akinsira Memorial',
    messagesFile: path.isAbsolute(process.env.MESSAGES_FILE || '')
        ? process.env.MESSAGES_FILE
        : path.join(__dirname, '..', process.env.MESSAGES_FILE || './data/messages.json'),

    // Security settings
    cors: {
        origin: process.env.NODE_ENV === 'production'
            ? process.env.ALLOWED_ORIGINS?.split(',') || []
            : '*'
    },

    // Rate limiting (optional for production)
    rateLimit: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100 // limit each IP to 100 requests per windowMs
    }
};
