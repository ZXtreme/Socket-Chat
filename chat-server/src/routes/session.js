const express = require('express');
const router = express.Router();

const { getSessionList, resetUnread } = require('../controllers/session')

router.get('/get_session_list', getSessionList);
router.get('/reset_unread', resetUnread);

module.exports = router;