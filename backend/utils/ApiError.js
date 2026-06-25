// A typed error carrying an HTTP status code, so controllers/services can
// `throw new ApiError(404, "Not found")` and let the central error handler
// translate it into a consistent JSON response.
export default class ApiError extends Error {
  constructor(statusCode, message, details = undefined) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true; // distinguishes expected errors from bugs
    Error.captureStackTrace?.(this, this.constructor);
  }
}
