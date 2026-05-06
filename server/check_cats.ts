import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from './src/models/Category';

dotenv.config();

const checkCategories = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ecommDB');
        const count = await Category.countDocuments();
        console.log(`Category count: ${count}`);
        const cats = await Category.find();
        console.log('Categories:', JSON.stringify(cats, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkCategories();
