const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  listConversations,
  createConversation,
  listMessages,
  sendMessage,
} = require('../controllers/messageController');

router.get('/conversations', protect, listConversations);
router.post('/conversations', protect, createConversation);
router.get('/conversations/:conversationId', protect, listMessages);
router.post('/', protect, sendMessage);

module.exports = router;
