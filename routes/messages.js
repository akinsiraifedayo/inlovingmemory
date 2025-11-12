const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const crypto = require('crypto');
const config = require('../config/config');
const { verifySession } = require('../config/auth');

// Generate a unique token for message ownership
function generateSubmitterToken() {
    return crypto.randomBytes(32).toString('hex');
}

// Check if message is within 6-month edit window
function isWithinEditWindow(timestamp) {
    const sixMonthsInMs = 6 * 30 * 24 * 60 * 60 * 1000; // Approximate 6 months
    return (Date.now() - timestamp) < sixMonthsInMs;
}

// Middleware to verify admin authentication
function requireAuth(req, res, next) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token || !verifySession(token)) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
}

// Middleware to verify message ownership or admin
function requireOwnership(req, res, next) {
    const adminToken = req.headers.authorization?.replace('Bearer ', '');
    const submitterToken = req.headers['x-submitter-token'];

    // Allow if admin
    if (adminToken && verifySession(adminToken)) {
        req.isAdmin = true;
        return next();
    }

    // Allow if has submitter token
    if (submitterToken) {
        req.submitterToken = submitterToken;
        req.isAdmin = false;
        return next();
    }

    return res.status(401).json({ error: 'Unauthorized' });
}

// GET all messages with pagination
router.get('/', async (req, res) => {
    try {
        const data = await fs.readFile(config.messagesFile, 'utf8');
        const allMessages = JSON.parse(data);

        // Pagination parameters
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;

        const paginatedMessages = allMessages.slice(startIndex, endIndex);

        // Remove submitterToken from responses (security)
        const sanitizedMessages = paginatedMessages.map(msg => {
            const { submitterToken, ...publicMessage } = msg;
            return publicMessage;
        });

        res.json({
            messages: sanitizedMessages,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(allMessages.length / limit),
                totalMessages: allMessages.length,
                hasNext: endIndex < allMessages.length,
                hasPrev: page > 1
            }
        });
    } catch (error) {
        console.error('Error reading messages:', error);
        res.status(500).json({ error: 'Failed to read messages' });
    }
});

// POST new message
router.post('/', async (req, res) => {
    try {
        const { name, message } = req.body;

        if (!name || !message) {
            return res.status(400).json({ error: 'Name and message are required' });
        }

        // Validate input lengths
        if (name.trim().length > 100) {
            return res.status(400).json({ error: 'Name is too long (max 100 characters)' });
        }

        if (message.trim().length > 2000) {
            return res.status(400).json({ error: 'Message is too long (max 2000 characters)' });
        }

        // Read existing messages
        const data = await fs.readFile(config.messagesFile, 'utf8');
        const messages = JSON.parse(data);

        // Generate submitter token for edit/delete capability
        const submitterToken = generateSubmitterToken();

        // Create new message object
        const newMessage = {
            id: Date.now(),
            name: name.trim(),
            message: message.trim(),
            date: new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }),
            timestamp: Date.now(),
            submitterToken: submitterToken // Store token with message
        };

        // Add to beginning of array
        messages.unshift(newMessage);

        // Save back to file
        await fs.writeFile(config.messagesFile, JSON.stringify(messages, null, 2));

        console.log(`New message from ${name}`);

        // Return message with token (for client storage)
        res.status(201).json({
            ...newMessage,
            token: submitterToken // Return token separately for client
        });
    } catch (error) {
        console.error('Error saving message:', error);
        res.status(500).json({ error: 'Failed to save message' });
    }
});

// PUT edit message (requires ownership or admin)
router.put('/:id', requireOwnership, async (req, res) => {
    try {
        const messageId = parseInt(req.params.id);
        const { message } = req.body;

        if (!message || message.trim().length === 0) {
            return res.status(400).json({ error: 'Message cannot be empty' });
        }

        if (message.trim().length > 2000) {
            return res.status(400).json({ error: 'Message is too long (max 2000 characters)' });
        }

        // Read existing messages
        const data = await fs.readFile(config.messagesFile, 'utf8');
        const messages = JSON.parse(data);

        // Find the message
        const messageIndex = messages.findIndex(msg => msg.id === messageId);

        if (messageIndex === -1) {
            return res.status(404).json({ error: 'Message not found' });
        }

        const existingMessage = messages[messageIndex];

        // If not admin, verify ownership and edit window
        if (!req.isAdmin) {
            if (existingMessage.submitterToken !== req.submitterToken) {
                return res.status(403).json({ error: 'You can only edit your own messages' });
            }

            if (!isWithinEditWindow(existingMessage.timestamp)) {
                return res.status(403).json({ error: 'Edit window has expired (6 months)' });
            }
        }

        // Update the message
        messages[messageIndex] = {
            ...existingMessage,
            message: message.trim(),
            edited: true,
            editedAt: new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })
        };

        // Save back to file
        await fs.writeFile(config.messagesFile, JSON.stringify(messages, null, 2));

        console.log(`Edited message ID: ${messageId} by ${existingMessage.name}`);
        res.json({ success: true, message: messages[messageIndex] });
    } catch (error) {
        console.error('Error editing message:', error);
        res.status(500).json({ error: 'Failed to edit message' });
    }
});

// DELETE message (requires ownership or admin)
router.delete('/:id', requireOwnership, async (req, res) => {
    try {
        const messageId = parseInt(req.params.id);

        // Read existing messages
        const data = await fs.readFile(config.messagesFile, 'utf8');
        const messages = JSON.parse(data);

        // Find the message
        const messageIndex = messages.findIndex(msg => msg.id === messageId);

        if (messageIndex === -1) {
            return res.status(404).json({ error: 'Message not found' });
        }

        const existingMessage = messages[messageIndex];

        // If not admin, verify ownership and edit window
        if (!req.isAdmin) {
            if (existingMessage.submitterToken !== req.submitterToken) {
                return res.status(403).json({ error: 'You can only delete your own messages' });
            }

            if (!isWithinEditWindow(existingMessage.timestamp)) {
                return res.status(403).json({ error: 'Delete window has expired (6 months)' });
            }
        }

        // Remove the message
        const deletedMessage = messages.splice(messageIndex, 1)[0];

        // Save back to file
        await fs.writeFile(config.messagesFile, JSON.stringify(messages, null, 2));

        console.log(`Deleted message ID: ${messageId} from ${deletedMessage.name} (Admin: ${req.isAdmin})`);
        res.json({ success: true, message: 'Message deleted successfully' });
    } catch (error) {
        console.error('Error deleting message:', error);
        res.status(500).json({ error: 'Failed to delete message' });
    }
});

module.exports = router;
