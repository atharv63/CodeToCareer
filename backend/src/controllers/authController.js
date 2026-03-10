const User = require('../models/User');
const Complaint = require('../models/Complaint');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Helper to generate JWT
const generateToken = (id, role, cityId, departmentId) => {
    return jwt.sign({ id, role, cityId, departmentId }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
    try {
        const { name, email, password, role, cityId, departmentId } = req.body;

        // Check if user exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: role || 'User',
            cityId,
            departmentId
        });

        res.status(201).json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id, user.role, user.cityId, user.departmentId),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check for user email
        const user = await User.findOne({ email });

        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                profileImage: user.profileImage,
                bannerImage: user.bannerImage,
                bio: user.bio,
                token: generateToken(user._id, user.role, user.cityId, user.departmentId),
            });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get current user data
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user statistics & achievements
// @route   GET /api/auth/stats
// @access  Private
exports.getUserStats = async (req, res) => {
    try {
        const complaints = await Complaint.find({ userId: req.user.id });
        
        const totalReports = complaints.length;
        const impactScore = complaints.reduce((sum, c) => sum + (c.upvotes?.length || 0), 0);
        const resolvedCount = complaints.filter(c => c.status === 'Resolved').length;

        // Gamification logic for profile badges
        let badges = [];
        if (totalReports >= 1) badges.push({ type: 'Reporter', icon: '🛡️', title: 'First Responder' });
        if (impactScore >= 5) badges.push({ type: 'Helper', icon: '🤝', title: 'Community Pillar' });
        if (resolvedCount >= 1) badges.push({ type: 'Fixer', icon: '✅', title: 'Problem Solver' });

        res.json({
            totalReports,
            impactScore,
            resolvedCount,
            badges
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user profile (Name, Bio, Multiple Images)
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Update text fields
        if (req.body.name) user.name = req.body.name;
        if (req.body.bio) user.bio = req.body.bio;

        // Handle profile and banner images from Multer (req.files)
        if (req.files) {
            if (req.files.profileImage) {
                const path = req.files.profileImage[0].path;
                // Prepend localhost if it's a local storage path, otherwise use Cloudinary URL
                user.profileImage = path.includes('http') 
                    ? path 
                    : `http://localhost:5000/${path.replace(/\\/g, '/')}`;
            }
            if (req.files.bannerImage) {
                const path = req.files.bannerImage[0].path;
                user.bannerImage = path.includes('http') 
                    ? path 
                    : `http://localhost:5000/${path.replace(/\\/g, '/')}`;
            }
        }

        await user.save();

        // Return updated user without password
        const updatedUser = await User.findById(user._id).select('-password');
        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};