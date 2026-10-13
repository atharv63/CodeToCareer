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
    profileImage: {
        type: String,
        default: '' 
    },
    bannerImage: {
        type: String,
        default: '' 
    },
    bio: {
        type: String,
        default: 'Citizen of Goa | Reporting for a better city'
    },
    cityId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'City'
    },
    departmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department'
    },
    municipalityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Municipality',
    required: function() { 
        return this.role === 'Municipality Staff'; // Only required if staff, not for citizens!
    },
    set: v => v === "" ? undefined : v // Automatically turn empty strings into undefined
}
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);