const express = require('express');
const router = express.Router();

const { getChatList } = require('../controllers/chat')

router.get('/get_chat_list', getChatList);

module.exports = router;