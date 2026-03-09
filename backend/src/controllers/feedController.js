const Complaint = require('../models/Complaint');
const FixReport = require('../models/FixReport');
const User = require('../models/User');
const Municipality = require('../models/Municipality');
const Department = require('../models/Department');

// @desc    Get mixed social feed (Complaints + Official Fixes)
// @route   GET /api/feed
// @access  Private
exports.getMixedFeed = async (req, res) => {
    try {
        // 1. Fetch complaints (Pending, Assigned, In Progress)
        // We exclude Resolved ones here because they are represented by FixReports
        const complaints = await Complaint.find({ status: { $ne: 'Resolved' } })
            .populate('userId', 'name')
            .lean();
        
        // Add type for frontend identification
        const complaintItems = complaints.map(c => ({ ...c, feedItemType: 'complaint' }));

        // 2. Fetch Official Fix Reports (The success stories)
        const fixes = await FixReport.find()
            .populate('municipalityId', 'name')
            .populate('departmentId', 'name')
            .populate({
                path: 'relatedComplaintId',
                select: 'userImageURL description userId',
                populate: { path: 'userId', select: 'name' }
            })
            .lean();

        const fixItems = fixes.map(f => ({ ...f, feedItemType: 'fix' }));

        // 3. Combine and sort by createdAt descending
        const combinedFeed = [...complaintItems, ...fixItems].sort((a, b) => {
            return new Date(b.createdAt) - new Date(a.createdAt);
        });

        res.json(combinedFeed);
    } catch (error) {
        console.error('Mixed Feed API Error:', error);
        res.status(500).json({ message: error.message });
    }
};
