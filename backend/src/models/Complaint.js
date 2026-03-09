const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    description: {
        type: String,
        required: true
    },
    userImageURL: {
        type: String,
        required: true // initial photo from user
    },
    location: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true }
    },
    status: {
        type: String,
        enum: ['Pending', 'Verified', 'Assigned', 'In Progress', 'Resolved', 'Spam'],
        default: 'Pending'
    },
    cityId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'City'
    },
    municipalityId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Municipality'
    },
    departmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department'
    },
    beforeImageURL: {
        type: String
    },
    proofImages: [{
        type: String // after photos
    }],
    remarks: [{
        by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User' // Staff or Admin ID
        },
        text: String,
        timestamp: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

module.exports = mongoose.model('Complaint', complaintSchema);
