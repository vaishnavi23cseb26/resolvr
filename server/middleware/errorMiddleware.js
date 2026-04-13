const { apiError } = require("../utils/apiResponse");

// eslint-disable-next-line no-unused-vars
function notFound(req, res, next) {
  return apiError(res, { statusCode: 404, message: `Not found - ${req.originalUrl}` });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  const message = err?.message || "Server error";
  return apiError(res, { statusCode, message, error: err?.stack || message });
}

module.exports = { notFound, errorHandler };

