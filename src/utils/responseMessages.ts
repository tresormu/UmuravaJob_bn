/**
 * Centralized repository for all user-facing response messages.
 * Messages are designed to be polite, professional, and helpful.
 */
export const ResponseMessages = {
  SUCCESS: {
    DEFAULT: "The operation was completed successfully.",
    CREATED: (item: string) => `Great news! The ${item} has been successfully created.`,
    UPDATED: (item: string) => `The ${item} has been updated successfully.`,
    DELETED: (item: string) => `The ${item} has been removed successfully.`,
    FETCHED: (item: string) => `${item} details have been retrieved successfully.`,
    LOGIN: "Welcome back! You have logged in successfully.",
    LOGOUT: "You have been logged out successfully. Have a wonderful day!",
    TOKEN_REFRESHED: "Your session token has been refreshed successfully.",
    EMAIL_VERIFIED: "Excellent! Your email address has been verified successfully.",
    CODE_RESENT: "A new verification code has been sent to your email address.",
  },
  ERROR: {
    UNAUTHORIZED: "I'm sorry, but you need to be logged in to access this resource.",
    FORBIDDEN: "We apologize, but you do not have the necessary permissions to perform this action.",
    NOT_FOUND: (item: string) => `We couldn't find the ${item} you're looking for. Please check the details and try again.`,
    BAD_REQUEST: (message: string) => `It looks like some information is missing or incorrect: ${message}`,
    INTERNAL_SERVER_ERROR: "Something went wrong on our end. We're working to fix it as quickly as possible. Please try again later.",
    INVALID_TOKEN: "Your session appears to have expired or is invalid. Please log in again to continue.",
    INVALID_CREDENTIALS: "I'm sorry, the email or password you entered is incorrect. Please try again.",
    EMAIL_ALREADY_IN_USE: "It seems that email address is already registered. Would you like to log in instead?",
    EMAIL_NOT_VERIFIED: "Your email address hasn't been verified yet. Please check your inbox for the verification code.",
    MISSING_FIELD: (field: string) => `Please provide a ${field}, as it is a required field.`,
    INVALID_FIELD: (field: string) => `The ${field} you provided doesn't seem right. Please check and try again.`,
    EXPIRED_CODE: "I'm sorry, but this verification code has expired. Please request a new one.",
    INVALID_CODE: "The verification code you entered is incorrect. Please try again.",
  }
};
