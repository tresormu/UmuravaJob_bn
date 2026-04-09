const errorMiddleware = (err, _req, res, _next) => {
    const statusCode = err.statusCode ?? 500;
    const message = statusCode >= 500 ? "Internal server error" : err.message || "Request failed";
    res.status(statusCode).json({ error: message });
};
export default errorMiddleware;
//# sourceMappingURL=error.middleware.js.map