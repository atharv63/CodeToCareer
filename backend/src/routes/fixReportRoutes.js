const express = require('express');
const router = express.Router();
const upload = require('../config/upload');
const { protect, authorize } = require('../middleware/auth');
const FixReport = require('../models/FixReport');
const Complaint = require('../models/Complaint');

// @desc    Create an official fix report
// @route   POST /api/fixes
// @access  Private (Municipality Staff / Admin)
router.post('/', protect, authorize('Admin', 'Municipality Staff'), upload.single('fixImage'), async (req, res) => {
    try {
        const { relatedComplaintId, description, lat, lng } = req.body;

        if (!req.file) return res.status(400).json({ message: 'Fix proof image is required' });

        const fixReport = await FixReport.create({
            departmentId: req.user.departmentId,
            municipalityId: req.user.municipalityId,
            relatedComplaintId,
            description,
            fixImageURL: req.file.path,
            location: { lat: parseFloat(lat), lng: parseFloat(lng) }
        });

        // Link the complaint to this fix and mark as resolved
        await Complaint.findByIdAndUpdate(relatedComplaintId, {
            status: 'Resolved',
            relatedFixPost: fixReport._id
        });

        res.status(201).json(fixReport);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get all fix reports
// @route   GET /api/fixes
// @access  Public
router.get('/', async (req, res) => {
    try {
        const fixes = await FixReport.find().populate('municipalityId departmentId').sort('-createdAt');
        res.json(fixes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
