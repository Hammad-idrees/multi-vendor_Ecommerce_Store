import mongoose from 'mongoose';
import User from './models/User';
import dotenv from 'dotenv';
dotenv.config();

async function checkUsers() {
    await mongoose.connect('mongodb://localhost:27017/ecommDB');
    
    const users = await User.find({ role: 'seller' }).lean();
    console.log("SELLER USERS:");
    for (const user of users) {
        console.log(`User ${user._id}: email=${user.email}, name=${user.name}`);
    }
    
    process.exit(0);
}

checkUsers();
