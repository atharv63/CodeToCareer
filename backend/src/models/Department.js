const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    municipalityId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Municipality',
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Department', departmentSchema);
