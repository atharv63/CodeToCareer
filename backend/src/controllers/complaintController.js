const Complaint = require('../models/Complaint');

// @desc    Create a new complaint
// @route   POST /api/complaints
// @access  Private (User)
exports.createComplaint = async (req, res) => {
    try {
        const { description, lat, lng } = req.body;
        
        // Handle image upload from Cloudinary
        let userImageURL = '';
        if (req.file) {
            userImageURL = req.file.path; // Cloudinary returns URL in path
        } else {
            return res.status(400).json({ message: 'Image proof is required' });
        }

        const complaint = await Complaint.create({
            userId: req.user.id,
            description,
            userImageURL,
            location: { lat, lng }
        });

        res.status(201).json(complaint);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user's complaints
// @route   GET /api/complaints/me
// @access  Private (User)
exports.getMyComplaints = async (req, res) => {
    try {
        const complaints = await Complaint.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json(complaints);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all complaints (Admin View)
// @route   GET /api/complaints
// @access  Private (Admin)
exports.getAllComplaints = async (req, res) => {
    try {
        // Can add query filters based on city, status here later
        const filter = {};
        if (req.query.status) filter.status = req.query.status;
        if (req.query.cityId) filter.cityId = req.query.cityId;
        
        const complaints = await Complaint.find(filter)
            .populate('userId', 'name email')
            .populate('cityId', 'name')
            .populate('municipalityId', 'name')
            .populate('departmentId', 'name')
            .sort({ createdAt: -1 });
            
        res.json(complaints);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Assign complaint to department
// @route   PUT /api/complaints/:id/assign
// @access  Private (Admin)
exports.assignComplaint = async (req, res) => {
    try {
        const { cityId, municipalityId, departmentId } = req.body;
        
        const complaint = await Complaint.findByIdAndUpdate(
            req.params.id,
            { cityId, municipalityId, departmentId, status: 'Assigned' },
            { new: true }
        );
        
        if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
        res.json(complaint);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get assigned complaints for staff
// @route   GET /api/complaints/assigned
// @access  Private (Municipality Staff)
exports.getAssignedComplaints = async (req, res) => {
    try {
        // Find complaints matching the staff's department
        const filter = { departmentId: req.user.departmentId };
        
        if (req.query.status) {
            filter.status = req.query.status; // Get only Pending/Resolved assigned to this dept
        }
        
        const complaints = await Complaint.find(filter)
            .sort({ createdAt: -1 });
            
        res.json(complaints);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update complaint status & proof (Staff)
// @route   PUT /api/complaints/:id/status
// @access  Private (Municipality Staff/Admin)
exports.updateStatus = async (req, res) => {
    try {
        const { status, remarksText } = req.body;
        let complaint = await Complaint.findById(req.params.id);
        
        if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
        
        // Handle optional after image upload
        if (req.file) {
             complaint.proofImages.push(req.file.path);
        }
        
        if (status) complaint.status = status;
        
        if (remarksText) {
            complaint.remarks.push({
                by: req.user.id,
                text: remarksText
            });
        }
        
        await complaint.save();
        
        res.json(complaint);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
