import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
    } catch {
        process.stderr.write('Failed to connect to MongoDB. Check MONGO_URI in .env\n');
        process.exit(1);
    }
};

export default connectDB;