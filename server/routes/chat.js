const express = require('express')
const router = express.Router()

const {
    // newChatSession,
    getMessagesHistory,
    replyMessage,
    sendMessage
} = require('../controllers/chat')

// Create a new chat session
// router.post('/:id', newChatSession)

// Send a message in a chat session
router.post('/send', sendMessage)

// Reply to a message
router.put('/reply/:sessionId', replyMessage)

// Get message history
router.get('/:userId/:receiverId', getMessagesHistory)
// router.get('/:receiverId', getMessagesHistory)

module.exports = router
