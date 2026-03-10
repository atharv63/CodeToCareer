const Complaint = require('../models/Complaint');

// @desc    Create a new complaint
// @route   POST /api/complaints
// @access  Private (User)
exports.createComplaint = async (req, res) => {
    try {
        const { description, lat, lng } = req.body;
        
        let userImageURL = '';
        if (req.file) {
            // Handle image upload path (Cloudinary returns URL, Local returns filename)
            userImageURL = req.file.path.includes('http') 
                ? req.file.path 
                : `http://localhost:5000/${req.file.path.replace(/\\/g, '/')}`;
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
        const filter = { departmentId: req.user.departmentId };
        
        if (req.query.status) {
            filter.status = req.query.status;
        }
        
        const complaints = await Complaint.find(filter).sort({ createdAt: -1 });
            
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

// @desc    Toggle Upvote for a complaint
// @route   POST /api/complaints/:id/upvote
// @access  Private (User)
exports.toggleUpvote = async (req, res) => {
    try {
        const complaint = await Complaint.findById(req.params.id);

        if (!complaint) {
            return res.status(404).json({ message: 'Complaint not found' });
        }

        const upvoteIndex = complaint.upvotes.indexOf(req.user.id);

        if (upvoteIndex > -1) {
            complaint.upvotes.splice(upvoteIndex, 1);
        } else {
            complaint.upvotes.push(req.user.id);
        }

        await complaint.save();
        res.status(200).json(complaint.upvotes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add a comment to a complaint
// @route   POST /api/complaints/:id/comments
// @access  Private (All authenticated users)
exports.addComment = async (req, res) => {
    try {
        const { text, userName } = req.body;
        const complaint = await Complaint.findById(req.params.id);

        if (!complaint) {
            return res.status(404).json({ message: 'Complaint not found' });
        }

        const newComment = {
            user: req.user.id,
            name: userName || 'Citizen', // Grab the name sent from frontend
            text: text
        };

        complaint.comments.push(newComment);
        await complaint.save();
        
        // Return the updated comments array
        res.status(201).json(complaint.comments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};