const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['User', 'Admin', 'Municipality Staff'],
        default: 'User'
    },
    // Optional fields for Staff
    cityId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'City'
    },
    departmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department'
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
