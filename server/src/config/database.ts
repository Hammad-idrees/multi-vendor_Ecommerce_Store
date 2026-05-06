import mongoose from 'mongoose';

const LOCAL_URI = 'mongodb://127.0.0.1:27017/ecommDB';

export const connectDB = async (): Promise<void> => {
    try {
        // 1. Try Local First
        // We use a short timeout for local so we can quickly failover if needed
        const conn = await mongoose.connect(LOCAL_URI, {
            serverSelectionTimeoutMS: 2000
        });
        console.log(`✅ MongoDB Connected (Local): ${conn.connection.host}`);
    } catch (localError) {
        console.warn('⚠️ Local MongoDB connection failed.');

        // 2. Fallback to Env/Atlas URI
        // If MONGO_URI is defined and different from our local default, try it.
        const fallbackURI = process.env.MONGO_URI;

        if (fallbackURI && fallbackURI !== LOCAL_URI) {
            try {
                console.log(`Attempting to connect to Fallback MongoDB...`);
                const conn = await mongoose.connect(fallbackURI, {
                    serverSelectionTimeoutMS: 5000
                });
                console.log(`✅ MongoDB Connected (Fallback): ${conn.connection.host}`);
            } catch (fallbackError) {
                console.error(`❌ Fallback MongoDB connection failed: ${(fallbackError as Error).message}`);
                // If both fail, retry after delay
                console.log('Retrying connection in 5 seconds...');
                setTimeout(connectDB, 5000);
            }
        } else {
            // No fallback available or it's the same as local
            if (localError instanceof Error) {
                console.error(`❌ Error: ${localError.message}`);
            }
            console.log('Retrying connection in 5 seconds...');
            setTimeout(connectDB, 5000);
        }
    }
};
