function apiSuccess(res, { statusCode = 200, data = {}, message = "" } = {}) {
  return res.status(statusCode).json({
    success: true,
    data,
    message,
    error: "",
  });
}

function apiError(res, { statusCode = 500, message = "Server error", error = "" } = {}) {
  return res.status(statusCode).json({
    success: false,
    data: {},
    message,
    error: error || message,
  });
}

module.exports = { apiSuccess, apiError };

