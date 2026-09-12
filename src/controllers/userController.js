import createHttpError from 'http-errors';
import { User } from '../models/user.js';
import { saveFileToCloudinary } from '../utils/saveFileToCloudinary.js';


export const updateUserAvatar = async (req, res, next) => {
  try {
  
    const fileBuffer = req.file ? req.file.buffer : null;
    
    if (!fileBuffer) {
      return next(createHttpError(400, 'File is required'));
    }

    
    const cloudinaryResult = await saveFileToCloudinary(fileBuffer, req.user._id);
    const avatarUrl = cloudinaryResult.secure_url;

    
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: avatarUrl },
      { returnDocument: 'after' }
    );

   
    res.status(200).json({
      url: updatedUser.avatar,
    });
  } catch (error) {
    next(error);
  }
};

