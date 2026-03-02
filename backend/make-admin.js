const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const connectDB = require('./config/db');

dotenv.config();

const makeAdmin = async () => {
    const email = process.argv[2];

    if (!email) {
        console.error('Please provide a user email. Usage: node backend/make-admin.js user@example.com');
        process.exit(1);
    }

    try {
        await connectDB();

        const user = await User.findOne({ email });

        if (!user) {
            console.error(`User with email ${email} not found.`);
            process.exit(1);
        }

        user.role = 'admin';
        await user.save();

        console.log(`\nSUCCESS: ${email} has been promoted to ADMIN.\n`);
        process.exit(0);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

makeAdmin();
