import { HttpError } from 'http-errors';

export const errorHandler = (error, req, res, next) => {
  if (error instanceof HttpError) {
    return res.status(error.statusCode || error.status || 500).json({
      message: error.message || error.name,
    });
  }

  console.error(error);
  res.status(500).json({
    message: error.message,
  });
};
