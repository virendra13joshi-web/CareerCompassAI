const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const authMiddleware = require('../middlewares/authMiddleware');

// All chat routes require authentication
router.post('/message', authMiddleware, chatController.sendMessage);
router.get('/conversations', authMiddleware, chatController.getConversations);
router.get('/conversations/:id/messages', authMiddleware, chatController.getMessages);
router.delete('/conversations/:id', authMiddleware, chatController.deleteConversation);

module.exports = router;
