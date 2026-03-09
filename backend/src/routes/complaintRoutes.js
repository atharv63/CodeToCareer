const express = require('express');
const router = express.Router();
const upload = require('../config/upload');
const { protect, authorize } = require('../middleware/auth');
const { 
    createComplaint, 
    getMyComplaints, 
    getAllComplaints, 
    assignComplaint, 
    getAssignedComplaints, 
    updateStatus,
    toggleUpvote
} = require('../controllers/complaintController');

// User Routes
router.post('/', protect, authorize('User'), upload.single('image'), createComplaint);
router.get('/me', protect, authorize('User'), getMyComplaints);
router.post('/:id/upvote', protect, authorize('User'), toggleUpvote);

// Public Feed / Admin View
router.get('/', protect, authorize('Admin', 'User'), getAllComplaints);
router.put('/:id/assign', protect, authorize('Admin'), assignComplaint);

// Staff Routes
router.get('/assigned', protect, authorize('Municipality Staff'), getAssignedComplaints);

// Staff & Admin Route (updating status and uploading proof)
router.put('/:id/status', protect, authorize('Admin', 'Municipality Staff'), upload.single('proofImage'), updateStatus);

module.exports = router;
