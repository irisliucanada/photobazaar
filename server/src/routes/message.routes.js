const express = require('express');
const router = express.Router();
const MessageController = require('../controllers/message.controller');

const messageController = new MessageController()

router.post('/', messageController.createMessage)

router.get('/', messageController.getUserMessages)

router.patch('/:messageId', messageController.markMessageAsRead)

//for dev only
router.delete('/', messageController.deleteAllMessages)
//for dev only
router.delete('/:messageId', messageController.deleteMessage)

module.exports = router;
