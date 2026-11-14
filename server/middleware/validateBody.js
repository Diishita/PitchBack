export const validateBody = (schema) => (req, _res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    next(Object.assign(new Error('Request validation failed.'), {
      statusCode: 400,
      code: 'VALIDATION_ERROR',
      details: result.error.issues.map(({ path, message }) => ({
        field: path.join('.'),
        message,
      })),
    }));
    return;
  }

  req.validatedBody = result.data;
  next();
};
