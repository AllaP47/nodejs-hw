import createHttpError from 'http-errors';
import bcrypt from 'bcrypt';
import { User } from '../models/user.js';
import { Session } from '../models/session.js';
import { createSession, setSessionCookies } from '../services/auth.js';


const cookieOptions = { 
  httpOnly: true, 
  secure: true, 
  sameSite: 'none' 
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
