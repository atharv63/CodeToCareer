const express = require('express');
const router = express.Router();
const upload = require('../config/upload'); // Your multer config
const { 
    register, 
    login, 
    getMe, 
    getUserStats, 
    updateProfile // 👇 Added this missing import
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Public Routes
router.post('/register', register);
router.post('/login', login);

// Private Routes (Require Token)
router.get('/me', protect, getMe);
router.get('/stats', protect, getUserStats);

// 👇 The Complete Multiple-File Route 👇
// This matches exactly what your frontend 'handleSaveProfile' sends
router.put('/profile', protect, upload.fields([
    { name: 'profileImage', maxCount: 1 },
    { name: 'bannerImage', maxCount: 1 }
]), updateProfile);

module.exports = router;