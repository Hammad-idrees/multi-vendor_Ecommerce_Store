import mongoose from 'mongoose';
import Order from './models/Order';
import User from './models/User';
import dotenv from 'dotenv';
dotenv.config();

async function checkApiOrder() {
    await mongoose.connect('mongodb://localhost:27017/ecommDB');
    
    // We will hardcode the seller user id to test
    const sellerId = '69fa6b279fe14f042541acc1';
    
    const filter: any = { 'items.seller': sellerId };
    console.log("Filter: ", filter);
    const orders = await Order.find(filter).lean();

    const total = await Order.countDocuments(filter);
    
    console.log("Found orders: ", orders.length);
    console.log("Total matched count: ", total);
    
    process.exit(0);
}

checkApiOrder();
