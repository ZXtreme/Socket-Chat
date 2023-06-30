const express = require('express');
const router = express.Router();

const { getFileList, uploadFile } = require('../controllers/file')

router.get('/get_file_list', getFileList);
router.post('/upload_file', uploadFile);

module.exports = router;