import config from "../config/env.config.js";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: config.email.smtpHost,
  port: config.email.smtpPort,
  secure: config.email.smtpSecure,
  auth: {
    user: config.email.smtpUser,
    pass: config.email.smtpPass,
  },
});

type EmailContent = {
  title: string;
  preheader?: string;
  bodyHtml: string;
  ctaLabel?: string;
  ctaUrl?: string;
};

const renderEmail = (content: EmailContent): { html: string; text: string } => {
  const preheader = content.preheader
    ? `<div style="display:none;max-height:0;overflow:hidden;color:transparent;">${content.preheader}</div>`
    : "";
  const cta = content.ctaLabel && content.ctaUrl
    ? `
      <div style="margin: 24px 0;">
        <a href="${content.ctaUrl}" style="background:#0f2b5b;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:6px;display:inline-block;font-weight:600;">
          ${content.ctaLabel}
        </a>
      </div>
    `
    : "";

  const html = `
    <div style="background:#f5f7fb;padding:24px 0;font-family:Arial,sans-serif;color:#1b1b1b;">
      ${preheader}
      <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:10px;overflow:hidden;border:1px solid #e6e9f2;">
        <div style="background:#0f2b5b;color:#ffffff;padding:20px 28px;">
          <div style="font-size:18px;font-weight:700;letter-spacing:0.2px;">Umurava</div>
        </div>
        <div style="padding:28px;">
          <h2 style="margin:0 0 12px 0;color:#0f2b5b;font-size:22px;">${content.title}</h2>
          <div style="font-size:15px;line-height:1.7;color:#2b2b2b;">
            ${content.bodyHtml}
          </div>
          ${cta}
          <div style="margin-top:24px;border-top:1px solid #eef1f7;padding-top:16px;font-size:12px;color:#6b7280;">
            If you did not request this, you can safely ignore this email.
          </div>
        </div>
      </div>
      <div style="text-align:center;margin-top:14px;font-size:12px;color:#9aa3b2;">
        Sent by Umurava
      </div>
    </div>
  `;

  const text = `${content.title}\n\n${content.preheader ?? ""}`.trim();
  return { html, text };
};

export const sendEmail = async (params: {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}) => {
  const options: {
    from: string;
    to: string | string[];
    subject: string;
    html: string;
    text?: string;
  } = {
    from: config.email.from,
    to: params.to,
    subject: params.subject,
    html: params.html,
  };
  if (params.text !== undefined) {
    options.text = params.text;
  }
  return transporter.sendMail(options);
};

export const sendVerificationEmail = async (to: string, code: string) => {
  const subject = "Verify your email";
  const { html, text } = renderEmail({
    title: "Email verification",
    preheader: "Use this code to verify your email address.",
    bodyHtml: `
      <p>Thanks for signing up. Use the verification code below to confirm your email address.</p>
      <div style="font-size:22px;font-weight:700;letter-spacing:4px;margin:16px 0;color:#0f2b5b;">
        ${code}
      </div>
      <p>This code expires in 15 minutes.</p>
    `,
  });
  return sendEmail({ to, subject, html, text });
};

export const sendWelcomeEmail = async (to: string, firstName?: string) => {
  const subject = "Welcome to Umurava";
  const greeting = firstName ? `Hi ${firstName},` : "Hi there,";
  const { html, text } = renderEmail({
    title: "Welcome to Umurava",
    preheader: "We are excited to have you onboard.",
    bodyHtml: `
      <p>${greeting}</p>
      <p>Thanks for joining Umurava. We are glad you are here.</p>
      <p>If you have any questions, just reply to this email.</p>
    `,
  });
  return sendEmail({ to, subject, html, text });
};

export const sendPasswordResetEmail = async (to: string, resetLink: string) => {
  const subject = "Reset your password";
  const { html, text } = renderEmail({
    title: "Reset your password",
    preheader: "Use the button below to reset your password.",
    bodyHtml: `
      <p>We received a request to reset your password.</p>
      <p>If you did not request this, you can safely ignore this email.</p>
    `,
    ctaLabel: "Reset password",
    ctaUrl: resetLink,
  });
  return sendEmail({ to, subject, html, text });
};

export const sendApplicationReceivedEmail = async (
  to: string,
  jobTitle: string,
  candidateName?: string,
) => {
  const subject = "We received your application";
  const nameLine = candidateName ? `Hi ${candidateName},` : "Hi there,";
  const { html, text } = renderEmail({
    title: "Application received",
    preheader: `We received your application for ${jobTitle}.`,
    bodyHtml: `
      <p>${nameLine}</p>
      <p>Thanks for applying for <strong>${jobTitle}</strong>. We will review your application and get back to you soon.</p>
    `,
  });
  return sendEmail({ to, subject, html, text });
};

export const sendApplicationStatusEmail = async (
  to: string,
  jobTitle: string,
  status: string,
  candidateName?: string,
) => {
  const subject = `Application update: ${jobTitle}`;
  const nameLine = candidateName ? `Hi ${candidateName},` : "Hi there,";
  const { html, text } = renderEmail({
    title: "Application update",
    preheader: `Your application for ${jobTitle} is now ${status}.`,
    bodyHtml: `
      <p>${nameLine}</p>
      <p>Your application for <strong>${jobTitle}</strong> is now marked as <strong>${status}</strong>.</p>
      <p>We will share next steps as soon as possible.</p>
    `,
  });
  return sendEmail({ to, subject, html, text });
};

export const sendJobPostedEmail = async (to: string, jobTitle: string) => {
  const subject = "Job posted successfully";
  const { html, text } = renderEmail({
    title: "Your job is live",
    preheader: `Your job posting for ${jobTitle} is now live.`,
    bodyHtml: `
      <p>Great news. Your job posting for <strong>${jobTitle}</strong> is now live.</p>
      <p>We will start matching applicants and notify you as applications come in.</p>
    `,
  });
  return sendEmail({ to, subject, html, text });
};

export const sendShortlistedEmail = async (
  to: string,
  jobTitle: string,
  candidateName?: string,
) => {
  const subject = `You have been shortlisted for ${jobTitle}`;
  const greeting = candidateName ? `Hi ${candidateName},` : "Hi there,";
  const { html, text } = renderEmail({
    title: "You have been shortlisted",
    preheader: `Your application for ${jobTitle} has been shortlisted.`,
    bodyHtml: `
      <p>${greeting}</p>
      <p>Good news. Your application for <strong>${jobTitle}</strong> has been shortlisted.</p>
      <p>We will reach out with the next steps shortly.</p>
    `,
  });
  return sendEmail({ to, subject, html, text });
};

export const sendRecruiterDeletionEmail = async (to: string, firstName?: string) => {
  const subject = "Your Umurava account has been deleted";
  const greeting = firstName ? `Hi ${firstName},` : "Hi there,";
  const { html, text } = renderEmail({
    title: "Account deleted",
    preheader: "Your recruiter account has been removed.",
    bodyHtml: `
      <p>${greeting}</p>
      <p>This confirms that your recruiter account has been deleted.</p>
      <p>If this was not you, please contact support immediately.</p>
    `,
  });
  return sendEmail({ to, subject, html, text });
};
