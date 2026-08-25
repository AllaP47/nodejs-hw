import mongoose from 'mongoose';

// Обов'язково додаємо "export const" перед назвою функції
export const connectMongoDB = async () => {
  try {
    const mongoUrl = process.env.MONGO_URL;

    if (!mongoUrl) {
      throw new Error('MONGO_URL is not defined in environment variables');
    }

    await mongoose.connect(mongoUrl);
    console.log('✅ MongoDB connection established successfully');
  } catch (error) {
    console.error('❌ Error while setting up mongo connection', error);
    throw error;
  }
};
