import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect('mongodb+srv://kyaginthan:6zrHmV1Aild13QD4@cluster0.ckp4p6g.mongodb.net/Sports?retryWrites=true&w=majority&appName=Cluster0', {
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
