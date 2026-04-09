import type { AuthUser } from "../types/type.js";
export declare const GenerateToken: (user: AuthUser) => string;
export declare const GenerateRefreshToken: (user: AuthUser) => string;
export declare const VerifyRefreshToken: (token: string) => AuthUser;
//# sourceMappingURL=token.d.ts.map