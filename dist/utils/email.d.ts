export declare const sendEmail: (params: {
    to: string | string[];
    subject: string;
    html: string;
    text?: string;
}) => Promise<import("nodemailer/lib/smtp-transport/index.js").SentMessageInfo>;
export declare const sendVerificationEmail: (to: string, code: string) => Promise<import("nodemailer/lib/smtp-transport/index.js").SentMessageInfo>;
export declare const sendWelcomeEmail: (to: string, firstName?: string) => Promise<import("nodemailer/lib/smtp-transport/index.js").SentMessageInfo>;
export declare const sendPasswordResetEmail: (to: string, resetLink: string) => Promise<import("nodemailer/lib/smtp-transport/index.js").SentMessageInfo>;
export declare const sendApplicationReceivedEmail: (to: string, jobTitle: string, candidateName?: string) => Promise<import("nodemailer/lib/smtp-transport/index.js").SentMessageInfo>;
export declare const sendApplicationStatusEmail: (to: string, jobTitle: string, status: string, candidateName?: string) => Promise<import("nodemailer/lib/smtp-transport/index.js").SentMessageInfo>;
export declare const sendJobPostedEmail: (to: string, jobTitle: string) => Promise<import("nodemailer/lib/smtp-transport/index.js").SentMessageInfo>;
export declare const sendShortlistedEmail: (to: string, jobTitle: string, candidateName?: string) => Promise<import("nodemailer/lib/smtp-transport/index.js").SentMessageInfo>;
export declare const sendRecruiterDeletionEmail: (to: string, firstName?: string) => Promise<import("nodemailer/lib/smtp-transport/index.js").SentMessageInfo>;
//# sourceMappingURL=email.d.ts.map