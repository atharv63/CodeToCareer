const mongoose = require('mongoose');

const municipalitySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    cityId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'City',
        required: true
    },
    departments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department'
    }]
}, { timestamps: true });

module.exports = mongoose.model('Municipality', municipalitySchema);
