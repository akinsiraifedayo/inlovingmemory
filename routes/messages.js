const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const config = require('../config/config');
const { verifySession } = require('../config/auth');

// Middleware to verify admin authentication
function requireAuth(req, res, next) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token || !verifySession(token)) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
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

        res.json({
            messages: paginatedMessages,
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
            timestamp: Date.now()
        };

        // Add to beginning of array
        messages.unshift(newMessage);

        // Save back to file
        await fs.writeFile(config.messagesFile, JSON.stringify(messages, null, 2));

        console.log(`New message from ${name}`);
        res.status(201).json(newMessage);
    } catch (error) {
        console.error('Error saving message:', error);
        res.status(500).json({ error: 'Failed to save message' });
    }
});

// DELETE message (requires authentication)
router.delete('/:id', requireAuth, async (req, res) => {
    try {
        const messageId = parseInt(req.params.id);

        // Read existing messages
        const data = await fs.readFile(config.messagesFile, 'utf8');
        const messages = JSON.parse(data);

        // Find and remove the message
        const messageIndex = messages.findIndex(msg => msg.id === messageId);

        if (messageIndex === -1) {
            return res.status(404).json({ error: 'Message not found' });
        }

        const deletedMessage = messages.splice(messageIndex, 1)[0];

        // Save back to file
        await fs.writeFile(config.messagesFile, JSON.stringify(messages, null, 2));

        console.log(`Deleted message ID: ${messageId} from ${deletedMessage.name}`);
        res.json({ success: true, message: 'Message deleted successfully' });
    } catch (error) {
        console.error('Error deleting message:', error);
        res.status(500).json({ error: 'Failed to delete message' });
    }
});

module.exports = router;
