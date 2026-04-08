import type { StringValue } from "ms";
declare const config: {
    readonly port: number;
    readonly mongoUrl: string;
    readonly jwtSecret: string;
    readonly expirationToken: StringValue;
    readonly saltRounds: number;
    readonly cloudinary: {
        readonly cloudName: string;
        readonly apiKey: string;
        readonly apiSecret: string;
    };
    readonly email: {
        readonly apiKey: string;
        readonly from: string;
    };
};
export default config;
//# sourceMappingURL=env.config.d.ts.map