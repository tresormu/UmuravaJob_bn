import Jwt from "jsonwebtoken";
import config from "../config/env.config.js";
export const GenerateToken = (user) => {
    return Jwt.sign({
        id: user.id,
        email: user.email,
        role: user.role,
    }, config.jwtSecret, {
        expiresIn: config.expirationToken,
    });
};
export const GenerateRefreshToken = (user) => {
    return Jwt.sign({
        id: user.id,
        email: user.email,
        role: user.role,
    }, config.refreshTokenSecret, {
        expiresIn: config.refreshTokenExpiresIn,
    });
};
export const VerifyRefreshToken = (token) => {
    return Jwt.verify(token, config.refreshTokenSecret);
};
//# sourceMappingURL=token.js.map