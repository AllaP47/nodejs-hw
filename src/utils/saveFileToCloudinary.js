import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs/promises';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const saveFileToCloudinary = async (filePath) => {
  try {
    const response = await cloudinary.uploader.upload(filePath, {
      folder: 'avatars',
    });
    
    await fs.unlink(filePath);
    
    return response.secure_url;
  } catch (error) {
    try {
      await fs.unlink(filePath);
    } catch (unlinkError) {
      console.error('Failed to delete local file:', unlinkError);
    }
    throw error;
  }
};
