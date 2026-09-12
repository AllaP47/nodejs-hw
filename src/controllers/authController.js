import createHttpError from 'http-errors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import fs from 'fs/promises';
import path from 'path';
import handlebars from 'handlebars';
import { User } from '../models/user.js';
import { Session } from '../models/session.js';
import { createSession, setSessionCookies } from '../services/auth.js';
import { sendEmail } from '../utils/sendMail.js'; 

const cookieOptions = { 
  httpOnly: true, 
  secure: true, 
  sameSite: 'none',
  path: '/' 
};

export const registerUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw createHttpError(400, 'Email in use');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      password: hashedPassword,
    });

    const session = await createSession(user._id);
    setSessionCookies(res, session);

    res.status(201).json({
      status: 201,
      message: 'Successfully registered a user!',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      throw createHttpError(401, 'Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw createHttpError(401, 'Invalid credentials');
    }

    await Session.deleteMany({ userId: user._id });

    const session = await createSession(user._id);
    setSessionCookies(res, session);

    res.status(200).json({
      status: 200,
      message: 'Successfully logged in a user!',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const refreshUserSession = async (req, res, next) => {
  try {
    const { sessionId, refreshToken } = req.cookies;

    const session = await Session.findOne({ _id: sessionId, refreshToken });

    if (!session) {
      res.clearCookie('sessionId', cookieOptions);
      res.clearCookie('accessToken', cookieOptions);
      res.clearCookie('refreshToken', cookieOptions);
      throw createHttpError(401, 'Session not found');
    }

    if (new Date() > new Date(session.refreshTokenValidUntil)) {
      await Session.deleteOne({ _id: sessionId });

      res.clearCookie('sessionId', cookieOptions);
      res.clearCookie('accessToken', cookieOptions);
      res.clearCookie('refreshToken', cookieOptions);
      throw createHttpError(401, 'Session token expired');
    }

    await Session.deleteOne({ _id: sessionId });

    const newSession = await createSession(session.userId);
    setSessionCookies(res, newSession);

    res.status(200).json({ 
      message: 'Session refreshed' 
    });
  } catch (error) {
    next(error);
  }
};

export const logoutUser = async (req, res, next) => {
  try {
    const { sessionId } = req.cookies;

    if (sessionId) {
      await Session.deleteOne({ _id: sessionId });
    }

    res.clearCookie('sessionId', cookieOptions);
    res.clearCookie('accessToken', cookieOptions);
    res.clearCookie('refreshToken', cookieOptions);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const requestResetEmail = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(200).json({
        message: 'Password reset email sent successfully',
      });
    }

    const resetToken = jwt.sign(
      { sub: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    const resetLink = `${process.env.FRONTEND_DOMAIN}/reset-password?token=${resetToken}`;

    const templatePath = path.resolve('src', 'templates', 'reset-password-email.html');
    const templateSource = await fs.readFile(templatePath, 'utf-8');
    const template = handlebars.compile(templateSource);

    const htmlContent = template({
      name: user.name || 'Користувач',
      resetLink,
    });

    try {
      await sendEmail({
        to: email,
        subject: 'Reset your password',
        html: htmlContent,
      });
    } catch (emailError) {
     
      console.error('Email transport breakdown:', emailError);
      throw createHttpError(500, 'Failed to send the email, please try again later.');
    }

    res.status(200).json({
      message: 'Password reset email sent successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
  
      console.error('JWT Verification failed:', jwtError);
      throw createHttpError(401, 'Invalid or expired token');
    }

    const user = await User.findOne({ _id: decoded.sub, email: decoded.email });
    if (!user) {
      throw createHttpError(404, 'User not found');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    await user.save();

    res.status(200).json({
      message: 'Password reset successfully',
    });
  } catch (error) {
    next(error);
  }
};
