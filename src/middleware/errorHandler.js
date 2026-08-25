import { HttpError } from 'http-errors';

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  
  if (err instanceof HttpError || (err.status && err.expose)) {
    return res.status(err.status).json({
      message: err.message,
    });
  }


  res.status(500).json({
    message: err.message || 'Internal server error',
  });
};
