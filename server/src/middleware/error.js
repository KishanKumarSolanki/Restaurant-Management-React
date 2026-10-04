import { ApiError } from '../utils/ApiError.js';

export function notFound(req, _res, next) {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

export function errorHandler(err, _req, res, _next) {
  let status = err.status || 500;
  let message = err.message || 'Server error';
  let errors = err.errors;

  if (err.name === 'ValidationError' && err.errors && !(err instanceof ApiError)) {
    status = 422;
    errors = Object.fromEntries(Object.entries(err.errors).map(([k, v]) => [k, v.message]));
    message = 'Validation failed.';
  } else if (err.code === 11000) {
    status = 422;
    const field = Object.keys(err.keyPattern || {})[0] || 'field';
    errors = { [field]: `This ${field} is already taken.` };
    message = `This ${field} is already taken.`;
  } else if (err.name === 'CastError') {
    status = 404;
    message = 'Record not found.';
  }

  if (status >= 500) console.error(err);
  res.status(status).json({ message, ...(errors ? { errors } : {}) });
}
