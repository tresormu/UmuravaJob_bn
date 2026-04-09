import Jwt from "jsonwebtoken";
import config from "../config/env.config.js";
import type { AuthUser } from "../types/type.js";

export const GenerateToken = (user: AuthUser) => {
  return Jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    config.jwtSecret,
    {
      expiresIn: config.expirationToken,
    },
  );
};

export const GenerateRefreshToken = (user: AuthUser) => {
  return Jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    config.refreshTokenSecret,
    {
      expiresIn: config.refreshTokenExpiresIn,
    },
  );
};

export const VerifyRefreshToken = (token: string) => {
  return Jwt.verify(token, config.refreshTokenSecret) as AuthUser;
};
