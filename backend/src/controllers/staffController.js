const Complaint = require('../models/Complaint');
const FixReport = require('../models/FixReport');

// 1. Get all complaints that are actionable by staff
exports.getAssignedComplaints = async (req, res) => {
    try {
        // Fetch complaints that are Assigned, In Progress, or Resolved
        const complaints = await Complaint.find({
            status: { $in: ['Assigned', 'In Progress', 'Resolved'] },
            municipalityId: req.user.municipalityId // Only show complaints for THEIR municipality
        })
        .populate('userId', 'name email')
        .populate('municipalityId', 'name')
        .sort({ createdAt: -1 });

        res.json(complaints);
    } catch (error) {
        console.error("Error fetching staff complaints:", error);
        res.status(500).json({ message: 'Server error' });
    }
};

// 2. Update the status of a complaint (e.g., Assigned -> In Progress)
exports.updateComplaintStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const complaint = await Complaint.findByIdAndUpdate(
            id, 
            { status }, 
            { new: true }
        );

        if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

        res.json(complaint);
    } catch (error) {
        console.error("Error updating status:", error);
        res.status(500).json({ message: 'Server error' });
    }
};

// 3. Resolve a complaint by uploading a Fix Report
exports.resolveComplaint = async (req, res) => {
    try {
        const { id } = req.params;
        const { description } = req.body;

        // Ensure an image was uploaded
        if (!req.file) {
            return res.status(400).json({ message: 'Proof of fix (image) is required' });
        }

        const fixImageURL = `http://localhost:5000/uploads/${req.file.filename}`;

        // Find the original complaint to get its location and municipality
        const complaint = await Complaint.findById(id);
        if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

        // Create the Fix Report
        const fixReport = await FixReport.create({
            municipalityId: complaint.municipalityId,
            relatedComplaintId: complaint._id,
            description: description || "Issue has been resolved by municipality staff.",
            fixImageURL: fixImageURL,
            location: complaint.location
        });

        // Update the complaint status to Resolved
        complaint.status = 'Resolved';
        // Add the image to proofImages array
        complaint.proofImages.push(fixImageURL);
        await complaint.save();

        res.status(201).json({ message: 'Issue resolved successfully', fixReport, complaint });
    } catch (error) {
        console.error("Error resolving complaint:", error);
        res.status(500).json({ message: 'Server error while resolving' });
    }
};