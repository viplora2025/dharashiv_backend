// src/middlewares/validateMiddleware.js

/**
 * Zod Validation Middleware
 * Accepts a schema and validates req.body, req.query, or req.params.
 */
const validate = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    // Write transformed values back so downstream code sees the validated/coerced shape
    if (parsed?.body !== undefined) req.body = parsed.body;
    if (parsed?.query !== undefined) req.query = parsed.query;
    if (parsed?.params !== undefined) req.params = parsed.params;
    next();
  } catch (err) {
    // ⬅️ Caught by global error handler
    err.name = "ZodError";
    next(err);
  }
};

export default validate;
