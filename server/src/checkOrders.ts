import mongoose from 'mongoose';
import Order from './models/Order';
import dotenv from 'dotenv';
dotenv.config();

async function checkOrders() {
    await mongoose.connect('mongodb://localhost:27017/ecommDB');
    
    const orders = await Order.find({}).lean();
    console.log("TOTAL ORDERS:", orders.length);
    for (const order of orders) {
        console.log(`Order ${order._id}: status=${order.status}`);
        order.items.forEach((item, i) => {
            console.log(`  Item ${i}: product=${item.product}, seller=${item.seller}`);
        });
    }
    
    process.exit(0);
}

checkOrders();
