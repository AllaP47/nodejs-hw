import { Router } from 'express';
import multer from 'multer';
import createError from 'http-errors';
import path from 'path';
import { updateAvatar } from '../controllers/userController.js';
import { authenticate } from '../middleware/authenticate.js'; 

const router = Router();


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});


const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  }
  cb(createError(400, 'Only .png, .jpg and .jpeg formats are allowed!'));
};


const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 },
});


router.patch('/me/avatar', authenticate, upload.single('avatar'), updateAvatar);

export default router;
