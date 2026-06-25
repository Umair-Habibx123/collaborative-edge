// Wraps an async route handler so any thrown error / rejected promise is
// forwarded to Express's error middleware instead of crashing the request
// with an unhandled rejection. Removes the repetitive try/catch in every route.
//
//   router.get("/x", asyncHandler(async (req, res) => { ... }))
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

export default asyncHandler;
