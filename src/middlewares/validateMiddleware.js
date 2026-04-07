// src/middlewares/validateMiddleware.js

/**
 * Zod Validation Middleware
 * Accepts a schema and validates req.body, req.query, or req.params.
 */
const validate = (schema) => (req, res, next) => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  } catch (err) {
    // ⬅️ Caught by global error handler
    err.name = "ZodError";
    next(err);
  }
};

export default validate;
