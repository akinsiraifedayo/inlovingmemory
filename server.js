const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');
const config = require('./config/config');
const messagesRouter = require('./routes/messages');
const authRouter = require('./routes/auth');

const app = express();

// Middleware
app.use(cors(config.cors));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security headers
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
});

// Logging middleware (development only)
if (config.nodeEnv === 'development') {
    app.use((req, res, next) => {
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
        next();
    });
}

// Serve static assets from public folder
app.use('/assets', express.static(path.join(__dirname, 'public', 'assets')));

// API routes
app.use('/api/auth', authRouter);
app.use('/api/messages', messagesRouter);

// Main routes - serve HTML without .html extension
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'admin.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        environment: config.nodeEnv
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        error: config.nodeEnv === 'production'
            ? 'Internal server error'
            : err.message
    });
});

// Initialize messages file if it doesn't exist
async function initializeMessagesFile() {
    try {
        await fs.access(config.messagesFile);
        console.log('✓ Messages file found');
    } catch {
        await fs.writeFile(config.messagesFile, JSON.stringify([], null, 2));
        console.log('✓ Created messages file');
    }
}

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('\n⚠️  SIGTERM received, shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('\n⚠️  SIGINT received, shutting down gracefully...');
    process.exit(0);
});

// Start server
async function startServer() {
    try {
        await initializeMessagesFile();

        app.listen(config.port, () => {
            console.log('\n' + '═'.repeat(60));
            console.log(`✨ ${config.appName} - Server Running ✨`);
            console.log('═'.repeat(60));
            console.log(`\n📍 Environment: ${config.nodeEnv}`);
            console.log(`📍 Main Site:   http://localhost:${config.port}/`);
            console.log(`📊 Admin Panel: http://localhost:${config.port}/admin`);
            console.log(`💾 Messages:    ${config.messagesFile}`);
            console.log(`🏥 Health:      http://localhost:${config.port}/health`);
            console.log(`\n🛑 Press Ctrl+C to stop the server\n`);
            console.log('═'.repeat(60) + '\n');
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();

module.exports = app;
