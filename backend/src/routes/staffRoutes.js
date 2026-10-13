const express = require('express');
const router = express.Router();
// 👇 THE FIX: Destructure 'protect' exactly as it is exported in your auth.js
const { protect } = require('../middleware/auth'); 
const multer = require('multer');
const path = require('path');
const { 
    getAssignedComplaints, 
    updateComplaintStatus, 
    resolveComplaint 
} = require('../controllers/staffController');

// Set up local storage for Fix Report images
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// Routes (Now using 'protect' instead of 'auth')
router.get('/complaints', protect, getAssignedComplaints);
router.put('/complaints/:id/status', protect, updateComplaintStatus);
router.post('/complaints/:id/resolve', protect, upload.single('image'), resolveComplaint);

module.exports = router;