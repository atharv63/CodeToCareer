const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getMixedFeed } = require('../controllers/feedController');

router.get('/', protect, getMixedFeed);

module.exports = router;
