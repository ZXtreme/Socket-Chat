const express = require('express');
const router = express.Router();

const { getNotificationList } = require('../controllers/notification')

router.get('/get_noti_list', getNotificationList);

module.exports = router;