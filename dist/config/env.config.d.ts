import type { StringValue } from "ms";
declare const config: {
    readonly port: number;
    readonly corsOrigins: string[] | undefined;
    readonly mongoUrl: string;
    readonly jwtSecret: string;
    readonly expirationToken: StringValue;
    readonly refreshTokenSecret: string;
    readonly refreshTokenExpiresIn: StringValue;
    readonly saltRounds: number;
    readonly cloudinary: {
        readonly cloudName: string;
        readonly apiKey: string;
        readonly apiSecret: string;
    };
    readonly email: {
        readonly from: string;
        readonly smtpHost: string;
        readonly smtpPort: number;
        readonly smtpUser: string;
        readonly smtpPass: string;
        readonly smtpSecure: boolean;
    };
};
export default config;
//# sourceMappingURL=env.config.d.ts.map