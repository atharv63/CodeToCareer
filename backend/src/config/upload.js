const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const isCloudinaryConfigured = process.env.CLOUDINARY_NAME && 
                               process.env.CLOUDINARY_NAME !== 'your_cloudinary_name';

let storage;

if (isCloudinaryConfigured) {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });

    storage = new CloudinaryStorage({
        cloudinary: cloudinary,
        params: {
            folder: 'hackathon_complaints',
            allowedFormats: ['jpg', 'png', 'jpeg'],
        },
    });
    console.log('Using Cloudinary Storage');
} else {
    // Local storage fallback for hackathon stability
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir);
    }

    storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
            cb(null, `${Date.now()}-${file.originalname}`);
        }
    });
    console.log('Using Local Disk Storage (Fallback)');
}

const upload = multer({ storage });

module.exports = upload;
