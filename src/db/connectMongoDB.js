import mongoose from 'mongoose';

export const connectMongoDB = async () => {
  try {
  
    const mongoUrl = process.env.MONGO_URL;
;

    await mongoose.connect(mongoUrl);
    console.log('✅ MongoDB connection established successfully');
  } catch (error) {
    console.error('❌ Error while setting up mongo connection', error);
    throw error;
  }
};
