import createHttpError from 'http-errors';
import { User } from '../models/user.js';
import { saveFileToCloudinary } from '../utils/saveFileToCloudinary.js';

export const updateAvatar = async (req, res, next) => {
  try {
    const filePath = req.file ? req.file.path : null;
    
    if (!filePath) {
      return next(createHttpError(400, 'File is required'));
    }

  
    const avatarUrl = await saveFileToCloudinary(filePath);

 
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { avatarUrl },
      { new: true }
    );

    res.status(200).json({
      status: 200,
      message: 'Successfully updated avatar!',
      data: {
        avatarUrl: updatedUser.avatarUrl,
      },
    });
  } catch (error) {
    next(error);
  }
};
