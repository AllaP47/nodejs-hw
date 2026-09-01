import createHttpError from 'http-errors';
import * as authServices from '../services/auth.js';
import { Session } from '../models/session.js';
import { FIFTEEN_MINUTES, ONE_DAY } from '../constants/time.js';


export const setSessionCookies = (res, session) => {
  const cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
  };

  res.cookie('accessToken', session.accessToken, { ...cookieOptions, maxAge: FIFTEEN_MINUTES });
  res.cookie('refreshToken', session.refreshToken, { ...cookieOptions, maxAge: ONE_DAY });
  res.cookie('sessionId', session._id.toString(), { ...cookieOptions, maxAge: ONE_DAY });
};


export const registerUser = async (req, res, next) => {
  try {
    const user = await authServices.registerUserDB(req.body);
    const session = await authServices.createSession(user._id);
    setSessionCookies(res, session);
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
};


export const loginUser = async (req, res, next) => {
  try {
    const user = await authServices.loginUserDB(req.body);
    const session = await authServices.createSession(user._id);
    setSessionCookies(res, session);
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};


export const refreshUserSession = async (req, res, next) => {
  try {
    const { sessionId, refreshToken } = req.cookies;
    const session = await Session.findOne({ _id: sessionId, refreshToken });

    if (!session) throw createHttpError(401, 'Session not found');
    if (new Date() > new Date(session.refreshTokenValidUntil)) {
      throw createHttpError(401, 'Session token expired');
    }

    await authServices.deleteSessionDB(sessionId);
    const newSession = await authServices.createSession(session.userId);
    setSessionCookies(res, newSession);

    res.status(200).json({ message: 'Session refreshed' });
  } catch (error) {
    next(error);
  }
};


export const logoutUser = async (req, res, next) => {
  try {
    const { sessionId } = req.cookies;
    if (sessionId) {
      await authServices.deleteSessionDB(sessionId);
    }

    const cookieOptions = { httpOnly: true, secure: true, sameSite: 'none' };
    res.clearCookie('sessionId', cookieOptions);
    res.clearCookie('accessToken', cookieOptions);
    res.clearCookie('refreshToken', cookieOptions);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
