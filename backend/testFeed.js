const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Complaint = require('./src/models/Complaint');
const FixReport = require('./src/models/FixReport');
const User = require('./src/models/User');
const Municipality = require('./src/models/Municipality');
const Department = require('./src/models/Department');

dotenv.config();

const testFeed = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB...');

        const complaints = await Complaint.find({ status: { $ne: 'Resolved' } })
            .populate('userId', 'name')
            .lean();
        
        console.log(`Found ${complaints.length} complaints.`);

        const fixes = await FixReport.find()
            .populate('municipalityId', 'name')
            .populate('departmentId', 'name')
            .populate({
                path: 'relatedComplaintId',
                select: 'userImageURL description userId',
                populate: { path: 'userId', select: 'name' }
            })
            .lean();

        console.log(`Found ${fixes.length} fixes.`);

        const combinedFeed = [...complaints, ...fixes].sort((a, b) => {
            return new Date(b.createdAt) - new Date(a.createdAt);
        });

        console.log('Successfully combined feed!');
        process.exit(0);
    } catch (error) {
        console.error('DIAGNOSTIC ERROR:', error);
        process.exit(1);
    }
};

testFeed();
