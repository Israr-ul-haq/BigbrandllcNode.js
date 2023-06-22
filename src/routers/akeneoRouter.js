const express = require('express');
const router = express.Router();
const { getToken, getTableColumns } = require("../controllers/akeneoController");
router.post('/token', getToken);
router.get('/tables', getTableColumns);
module.exports = router;