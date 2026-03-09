const mongoose = require('mongoose');

const fixReportSchema = new mongoose.Schema({
    departmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        required: true
    },
    municipalityId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Municipality',
        required: true
    },
    relatedComplaintId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Complaint',
        required: true
    },
    description: {
        type: String,
        required: true
    },
    fixImageURL: {
        type: String,
        required: true
    },
    location: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true }
    },
    timeOfFix: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('FixReport', fixReportSchema);
