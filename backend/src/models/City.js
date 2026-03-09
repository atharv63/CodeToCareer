const mongoose = require('mongoose');

const citySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    municipalities: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Municipality'
    }]
}, { timestamps: true });

module.exports = mongoose.model('City', citySchema);
