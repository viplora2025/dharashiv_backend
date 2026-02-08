export const sendSuccess = (res, options = {}) => {
  const { status = 200, message, data, ...rest } = options;
  const payload = { success: true, ...rest };

  if (message) payload.message = message;
  if (data !== undefined) payload.data = data;

  return res.status(status).json(payload);
};

export const sendError = (res, options = {}) => {
  const { status = 400, message = "Something went wrong", ...rest } = options;
  const payload = { success: false, message, ...rest };

  return res.status(status).json(payload);
};
