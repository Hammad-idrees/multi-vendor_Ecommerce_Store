import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/User';
import Product from './models/Product';
import Order from './models/Order';
import Category from './models/Category';
import Coupon from './models/Coupon';
import { connectDB } from './config/database';

dotenv.config();

// NOTE: Category names MUST match the frontend static data in client/src/data/categories.ts
const SEED_CATEGORIES = [
    {
        name: 'Electronics',
        subs: ['Mobile Phones', 'Laptops & Computers', 'Tablets', 'Audio & Wearables', 'Gaming', 'Cameras', 'Networking & Accessories'],
    },
    {
        name: 'Fashion & Apparel',
        subs: ['Men', 'Women', 'Kids', 'Footwear', 'Accessories', 'Traditional Wear'],
    },
    {
        name: 'Home & Living',
        subs: ['Furniture', 'Home Decor', 'Kitchen & Dining', 'Bedding', 'Storage & Organization', 'Home Appliances'],
    },
    {
        name: 'Beauty & Personal Care',
        subs: ['Skincare', 'Hair Care', 'Makeup', 'Fragrances', 'Grooming', 'Personal Hygiene'],
    },
    {
        name: 'Health & Wellness',
        subs: ['Supplements', 'Medical Equipment', 'Fitness & Exercise', 'Wellness Devices', 'Health Monitoring'],
    },
    {
        name: 'Sports & Outdoors',
        subs: ['Sports Equipment', 'Outdoor Gear', 'Cycling', 'Camping & Hiking', 'Fitness Accessories'],
    },
    {
        name: 'Grocery & Essentials',
        subs: ['Fresh Food', 'Packaged Food', 'Beverages', 'Household Supplies', 'Baby Essentials', 'Pet Supplies'],
    },
    {
        name: 'Books, Stationery & Media',
        subs: ['Books', 'Stationery', 'Magazines', 'Music', 'Movies'],
    },
    {
        name: 'Automotive',
        subs: ['Car Accessories', 'Bike Accessories', 'Tools & Equipment', 'Oils & Fluids', 'Safety Products'],
    },
    {
        name: 'Toys, Kids, Baby & Mother',
        subs: ['Toys', 'Kids Clothing', 'Baby Care', 'Baby Gear', 'School & Learning'],
    },
];

const importData = async () => {
    try {
        await connectDB();

        // Give a moment for connection to stabilize
        await new Promise(resolve => setTimeout(resolve, 1000));

        // ✅ FULLY SAFE: Never delete user data.
        // Categories are upserted by name (IDs preserved → existing product refs stay valid).
        // Only seed products for subcategories that have ZERO products already.
        console.log('🔄 Running safe seed (no data will be deleted)...');

        // ✅ Create demo users only if they don't already exist
        console.log('👥 Ensuring demo accounts exist...');

        const createIfNotExists = async (userData: any) => {
            const existing = await User.findOne({ email: userData.email });
            if (existing) {
                console.log(`  ℹ️  Demo user already exists: ${userData.email}`);
                return existing;
            }
            const created = await User.create(userData);
            console.log(`  ✅ Created demo user: ${userData.email}`);
            return created;
        };

        const adminUser = await createIfNotExists({
            name: 'Admin User',
            email: 'admin@martify.com',
            password: '123456',
            role: 'admin',
        });
        const seller1 = await createIfNotExists({
            name: 'Ali Electronics',
            email: 'ali@martify.com',
            password: '123456',
            role: 'seller',
            shopName: 'Ali Electronics Hub',
            shopDescription: 'Best electronics in Pakistan',
        });
        const seller2 = await createIfNotExists({
            name: 'Sara Fashion',
            email: 'sara@martify.com',
            password: '123456',
            role: 'seller',
            shopName: 'Sara Fashion Store',
            shopDescription: 'Trendy fashion for everyone',
        });
        const seller3 = await createIfNotExists({
            name: 'Ahmed Tech',
            email: 'ahmed@martify.com',
            password: '123456',
            role: 'seller',
            shopName: 'Ahmed Tech World',
            shopDescription: 'Latest tech gadgets',
        });
        await createIfNotExists({
            name: 'Buyer User',
            email: 'buyer@martify.com',
            password: '123456',
            role: 'buyer',
        });

        const sellers = [seller1, seller2, seller3];

        console.log('\n📦 Seeding Categories and Products (upsert — existing data preserved)...');

        for (const cat of SEED_CATEGORIES) {
            // Upsert parent category by name — preserves _id if already exists
            const parentCategory = await Category.findOneAndUpdate(
                { name: cat.name, parent: null },
                {
                    $setOnInsert: {
                        name: cat.name,
                        description: `All ${cat.name} products`,
                        image: `https://picsum.photos/seed/${cat.name.replace(/[^a-zA-Z]/g, '').toLowerCase()}/400/300`,
                    },
                },
                { upsert: true, new: true }
            );

            for (const subName of cat.subs) {
                // Upsert subcategory by name + parent — preserves _id if already exists
                const subCategory = await Category.findOneAndUpdate(
                    { name: subName, parent: parentCategory!._id },
                    {
                        $setOnInsert: {
                            name: subName,
                            description: `${subName} products`,
                            image: `https://picsum.photos/seed/${subName.replace(/[^a-zA-Z]/g, '').toLowerCase()}/400/300`,
                            parent: parentCategory!._id,
                        },
                    },
                    { upsert: true, new: true }
                );

                // Only seed products if this subcategory has NONE yet
                const existingCount = await Product.countDocuments({ category: subCategory!._id });
                if (existingCount > 0) {
                    console.log(`  ⏭️  Skipping "${subName}" — ${existingCount} product(s) already exist`);
                    continue;
                }

                // Insert 4 sample products for this subcategory
                const productNames = ['Premium', 'Pro', 'Essential', 'Ultra'];
                const products = [];
                for (let i = 0; i < 4; i++) {
                    const seller = sellers[i % sellers.length];
                    const basePrice = Math.floor(Math.random() * 500) + 20;
                    products.push({
                        name: `${subName} ${productNames[i]}`,
                        description: `High-quality ${subName} product featuring premium materials, excellent durability, and modern design. Perfect for everyday use with superior performance and exceptional value.`,
                        price: basePrice,
                        comparePrice: basePrice + Math.floor(Math.random() * 100) + 20,
                        category: subCategory!._id,
                        seller: seller._id,
                        images: [
                            `https://picsum.photos/seed/${subName.replace(/[^a-zA-Z]/g, '')}-${i + 1}a/800/600`,
                            `https://picsum.photos/seed/${subName.replace(/[^a-zA-Z]/g, '')}-${i + 1}b/800/600`,
                        ],
                        variants: [
                            { size: 'S', color: 'Black', stock: 10 },
                            { size: 'M', color: 'White', stock: 15 },
                            { size: 'L', color: 'Blue', stock: 8 },
                        ],
                        stock: 30,
                        averageRating: Number((Math.random() * 2 + 3).toFixed(1)),
                        numReviews: Math.floor(Math.random() * 50),
                        isApproved: true,
                        isFeatured: Math.random() > 0.7,
                        tags: [subName.toLowerCase(), cat.name.toLowerCase(), 'trending'],
                    });
                }
                await Product.insertMany(products);
                console.log(`  ✓ ${products.length} products → ${subName}`);
            }
            console.log(`✅ Category "${cat.name}" complete`);
        }


        // Seed sample coupons only if they don't exist
        const existingCoupon = await Coupon.findOne({ code: 'WELCOME10' });
        if (!existingCoupon) {
            await Coupon.create([
                {
                    code: 'WELCOME10',
                    discountType: 'percentage',
                    discountValue: 10,
                    minOrderAmount: 50,
                    maxUses: 1000,
                    expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
                    createdBy: adminUser._id,
                },
                {
                    code: 'FLAT20',
                    discountType: 'fixed',
                    discountValue: 20,
                    minOrderAmount: 100,
                    maxUses: 500,
                    expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
                    createdBy: adminUser._id,
                },
            ]);
            console.log('✅ Coupons seeded');
        } else {
            console.log('ℹ️  Coupons already exist, skipping');
        }

        console.log('\n🎉 All data imported successfully!');
        console.log('⚠️  Your existing user accounts were NOT deleted.');
        console.log('\n📋 Demo Accounts:');
        console.log('  Admin:  admin@martify.com / 123456');
        console.log('  Seller: ali@martify.com   / 123456');
        console.log('  Buyer:  buyer@martify.com  / 123456');
        process.exit(0);
    } catch (error) {
        console.error(`❌ Seeder Error: ${error}`);
        process.exit(1);
    }
};


const destroyData = async () => {
    try {
        await connectDB();
        await new Promise(resolve => setTimeout(resolve, 500));
        await Order.deleteMany();
        await Product.deleteMany();
        await Category.deleteMany();
        await Coupon.deleteMany();
        await User.deleteMany();
        console.log('💥 Data Destroyed!');
        process.exit(0);
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

if (process.argv[2] === '-d') {
    destroyData();
} else {
    importData();
}
