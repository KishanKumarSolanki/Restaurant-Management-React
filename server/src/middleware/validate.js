import { ApiError } from '../utils/ApiError.js';

export const validate = (schema) => (req, _res, next) => {
  const result = schema.safeParse(req.body ?? {});
  if (!result.success) {
    const errors = {};
    for (const issue of result.error.issues) {
      const key = issue.path.join('.') || '_';
      if (!errors[key]) errors[key] = issue.message;
    }
    return next(new ApiError(422, 'Please fix the highlighted fields.', errors));
  }
  req.body = result.data;
  next();
};
