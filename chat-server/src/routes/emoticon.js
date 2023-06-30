const express = require('express');
const router = express.Router();

const { getEmoticonList, addEmoticon } = require('../controllers/emoticon')

router.get('/get_emoticon_list', getEmoticonList);
router.get('/add_emoticon', addEmoticon);

module.exports = router;