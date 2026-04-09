import jwt from "jsonwebtoken";
import config from "../config/env.config.js";
export const protect = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "No token provided" });
    }
    try {
        if (!config.jwtSecret) {
            return res.status(500).json({ error: "Server misconfiguration" });
        }
        const jwtSecret = config.jwtSecret;
        const token = authHeader.split(" ")[1];
        if (!token) {
            return res.status(401).json({ error: "Invalid token format" });
        }
        const decoded = jwt.verify(token, jwtSecret);
        req.user = {
            email: decoded.email,
            id: decoded.id,
            role: decoded.role,
        };
        next();
    }
    catch {
        res.status(401).json({ error: "Invalid or expired token" });
    }
};
//# sourceMappingURL=Auth.Middleware.js.map