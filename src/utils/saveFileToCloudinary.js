import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const saveFileToCloudinary = (fileBuffer, userId) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'avatars',
        resource_type: 'image',
        public_id: `avatar_${userId}`,
        overwrite: true,
        unique_filename: false,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result); 
      }
    );

    uploadStream.end(fileBuffer);
  });
};


