import { Joi, Segments } from 'celebrate';

export const registerUserSchema = {
  [Segments.BODY]: Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  }),
};

export const loginUserSchema = {
  [Segments.BODY]: Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
};

export const requestResetEmailSchema = {
  [Segments.BODY]: Joi.object().keys({
    email: Joi.string().email().required().messages({
      'string.email': 'Email must be a valid email address',
      'any.required': 'Email is a required field',
    }),
  }),
};

export const resetPasswordSchema = {
  [Segments.BODY]: Joi.object().keys({
    password: Joi.string().min(6).required().messages({
      'string.min': 'Password must be at least 6 characters long',
      'any.required': 'Password is a required field',
    }),
    token: Joi.string().required().messages({
      'any.required': 'Token is a required field',
    }),
  }),
};
