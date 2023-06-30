const express = require('express');
const router = express.Router();

const { addFriend, getFriendList, deleteFriend } = require('../controllers/friend')

router.get('/add_friend', addFriend);
router.get('/get_friend_list', getFriendList);
router.get('/delete_friend', deleteFriend);

module.exports = router;