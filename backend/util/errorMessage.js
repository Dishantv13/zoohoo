import ApiError from "./apiError.js";
import { HTTP_STATUS } from "./httpStatus.js";

export const BILL_ERRORS = {
  REQUIRED_FIELDS: () =>
    new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "vendorId, items and dueDate are required",
    ),
  VENDOR_NOT_FOUND: () =>
    new ApiError(HTTP_STATUS.NOT_FOUND, "Vendor not found"),
  INVALID_DUE_DATE: () =>
    new ApiError(HTTP_STATUS.BAD_REQUEST, "Due date cannot be in the past"),

  VENDOR_NOT_FOUND: () =>
    new ApiError(HTTP_STATUS.NOT_FOUND, "Vendor not found"),
  BILL_NOT_FOUND: () => new ApiError(HTTP_STATUS.NOT_FOUND, "Bill not found"),
  INVALID_STATUS: () =>
    new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid status value"),
  ITEM_FIELDS_REQUIRED: () =>
    new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "Each item must have itemId, quantity, and rate",
    ),
  DUE_DATE_INVALID: () =>
    new ApiError(HTTP_STATUS.BAD_REQUEST, "Due date cannot be in the past"),
  INSUFFICIENT_STOCK: (name, qty) =>
    new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      `Insufficient stock for ${name}. Available: ${qty}`,
    ),
  ITEM_NOT_FOUND: (itemId) =>
    new ApiError(
      HTTP_STATUS.NOT_FOUND,
      `Item with ID ${itemId} not found for this vendor`,
    ),
};

export const INVOICE_ERRORS = {
  ITEMS_REQUIRED: () =>
    new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "Invoice must have at least one item",
    ),
  INVALID_DUE_DATE: () =>
    new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "Due date cannot be before invoice date",
    ),
  USER_NO_COMPANY: () =>
    new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "User does not belong to any company",
    ),

  USER_NOT_FOUND: () => new ApiError(HTTP_STATUS.NOT_FOUND, "User not found"),
  INVOICE_NOT_FOUND: () =>
    new ApiError(HTTP_STATUS.NOT_FOUND, "Invoice not found"),
  COMPANY_NOT_FOUND: () =>
    new ApiError(HTTP_STATUS.NOT_FOUND, "Company not found"),
  CUSTOMER_NOT_FOUND: () =>
    new ApiError(HTTP_STATUS.NOT_FOUND, "Customer not found in your company"),

  NOT_AUTHORIZED_VIEW: () =>
    new ApiError(
      HTTP_STATUS.FORBIDDEN,
      "Not authorized to access this invoice",
    ),
  NOT_AUTHORIZED_UPDATE: () =>
    new ApiError(
      HTTP_STATUS.FORBIDDEN,
      "Not authorized to update this invoice",
    ),
  NOT_AUTHORIZED_STATUS: () =>
    new ApiError(
      HTTP_STATUS.FORBIDDEN,
      "Not authorized to update invoice status",
    ),
  NOT_AUTHORIZED_DELETE: () =>
    new ApiError(
      HTTP_STATUS.FORBIDDEN,
      "Not authorized to delete this invoice",
    ),
  NOT_AUTHORIZED: () => new ApiError(HTTP_STATUS.FORBIDDEN, "Not authorized"),

  PAID_UPDATE_RESTRICTED: () =>
    new ApiError(HTTP_STATUS.FORBIDDEN, "Paid invoice cannot be updated"),
  PAID_DELETE_RESTRICTED: () =>
    new ApiError(HTTP_STATUS.FORBIDDEN, "Paid invoice cannot be deleted"),

  ADMIN_ONLY_VIEW: () =>
    new ApiError(HTTP_STATUS.FORBIDDEN, "Only admin can view company invoices"),
  ADMIN_ONLY_CUSTOMER_VIEW: () =>
    new ApiError(
      HTTP_STATUS.FORBIDDEN,
      "Only admin can view customer invoices",
    ),
};

export const ITEM_ERRORS = {
  NOT_AUTHORIZED: () => new ApiError(HTTP_STATUS.FORBIDDEN, "Not authorized"),
  ADMIN_ONLY: () => new ApiError(HTTP_STATUS.FORBIDDEN, "Admin access only"),

  VENDOR_ID_REQUIRED: () =>
    new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "vendorId is required for admin operations",
    ),
  VENDOR_NOT_FOUND: () =>
    new ApiError(HTTP_STATUS.NOT_FOUND, "Vendor not found in your company"),

  ITEM_REQUIRED_FIELDS: () =>
    new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "name, quantity and rate are required",
    ),
  ITEM_NOT_FOUND: () =>
    new ApiError(HTTP_STATUS.NOT_FOUND, "Inventory item not found"),
  ITEM_UPDATE_NOT_ALLOWED: () =>
    new ApiError(
      HTTP_STATUS.FORBIDDEN,
      "Not authorized to update this inventory item",
    ),
  ITEM_DELETE_NOT_ALLOWED: () =>
    new ApiError(
      HTTP_STATUS.FORBIDDEN,
      "Not authorized to delete this inventory item",
    ),
  ITEM_DELETE_SUCCESS: () =>
    new ApiError(HTTP_STATUS.OK, "Inventory item deleted successfully"),

  COMPANY_VENDOR_NOT_FOUND: () =>
    new ApiError(HTTP_STATUS.NOT_FOUND, "Vendor not found in your company"),
};

export const PAYMENT_ERRORS = {
  DOCUMENT_REQUIRED: () =>
    new ApiError(HTTP_STATUS.BAD_REQUEST, "invoiceId or billId is required"),

  INVOICE_NOT_FOUND: () =>
    new ApiError(HTTP_STATUS.NOT_FOUND, "Invoice not found"),

  BILL_NOT_FOUND: () => new ApiError(HTTP_STATUS.NOT_FOUND, "Bill not found"),

  ALREADY_PAID: (docType = "document") =>
    new ApiError(HTTP_STATUS.BAD_REQUEST, `${docType} is already paid`),

  INVALID_PAYMENT_AMOUNT: () =>
    new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid payment amount"),

  PAYMENT_EXCEEDS_REMAINING: (docType, remaining) =>
    new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      `Payment amount exceeds remaining ${docType} amount ₹${remaining}`,
    ),

  INVALID_CARD_NUMBER: () =>
    new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid card number"),

  CARD_HOLDER_REQUIRED: () =>
    new ApiError(HTTP_STATUS.BAD_REQUEST, "Card holder name is required"),

  EXPIRY_REQUIRED: () =>
    new ApiError(HTTP_STATUS.BAD_REQUEST, "Expiry date is required"),

  INVALID_CVV: () => new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid CVV"),

  INVALID_QR_DATA: () =>
    new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid QR code data"),

  UNAUTHORIZED_INVOICE_PAYMENT: () =>
    new ApiError(
      HTTP_STATUS.FORBIDDEN,
      "You are not authorized to pay this invoice",
    ),

  UNAUTHORIZED_VIEW: () =>
    new ApiError(HTTP_STATUS.FORBIDDEN, "Not authorized to view this document"),
};

export const REPORT_ERROR = {
  COMPANY_NOT_FOUND: () =>
    new ApiError(HTTP_STATUS.NOT_FOUND, "Company not found for the admin"),

  INVALID_MONTH_OR_YEAR: () =>
    new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid month or year value"),

  INVALID_YEAR: () =>
    new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid year value"),

  INVALID_DATE_RANGE: () =>
    new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid startDate or endDate"),

  INVALID_DATE: () =>
    new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid date value"),
};

export const AUTH_ERRORS = {
  REQUIRED_REGISTER_FIELDS: () =>
    new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "Please provide name, email and password",
    ),

  REQUIRED_ADMIN_FIELDS: () =>
    new ApiError(HTTP_STATUS.BAD_REQUEST, "Please provide all required fields"),

  USER_ALREADY_EXISTS: () =>
    new ApiError(HTTP_STATUS.CONFLICT, "User already exists"),

  ADMIN_EMAIL_EXISTS: () =>
    new ApiError(HTTP_STATUS.CONFLICT, "Admin email already registered"),

  COMPANY_EMAIL_EXISTS: () =>
    new ApiError(HTTP_STATUS.CONFLICT, "Company email already registered"),

  EMAIL_PASSWORD_REQUIRED: () =>
    new ApiError(HTTP_STATUS.BAD_REQUEST, "Email and password are required"),

  INVALID_CREDENTIALS: () =>
    new ApiError(HTTP_STATUS.UNAUTHORIZED, "Invalid email or password"),

  ACCOUNT_DEACTIVATED: () =>
    new ApiError(HTTP_STATUS.BAD_REQUEST, "Your account has been deactivated"),

  USER_NOT_FOUND: () => new ApiError(HTTP_STATUS.NOT_FOUND, "User not found"),

  ADMIN_ONLY_ACCESS: () =>
    new ApiError(HTTP_STATUS.FORBIDDEN, "Only admin can perform this action"),

  CUSTOMER_NOT_FOUND: () =>
    new ApiError(HTTP_STATUS.NOT_FOUND, "Customer not found in your company"),

  EMAIL_ALREADY_REGISTERED: () =>
    new ApiError(HTTP_STATUS.CONFLICT, "Email already registered"),

  PASSWORD_REQUIRED: () =>
    new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "Please provide current and new password",
    ),

  PASSWORD_MIN_LENGTH: () =>
    new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "New password must be at least 6 characters",
    ),

  PASSWORD_SAME_AS_OLD: () =>
    new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "New password cannot be the same as current password",
    ),

  CURRENT_PASSWORD_INCORRECT: () =>
    new ApiError(HTTP_STATUS.BAD_REQUEST, "Current password is incorrect"),
};

export const VENDOR_ERRORS = {
  REQUIRED_FIELDS: () =>
    new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "Name, email, and password are required",
    ),

  VENDOR_ALREADY_EXISTS: () =>
    new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "A vendor with this email already exists",
    ),

  VENDOR_NOT_FOUND: () =>
    new ApiError(HTTP_STATUS.NOT_FOUND, "Vendor not found"),

  VENDOR_DELETE_WITH_BILLS: () =>
    new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "Cannot delete vendor with existing bills. Please delete or reassign bills first.",
    ),
};

export const MIDDLEWARE_ERRORS = {
  AUTH_REQUIRED: () =>
    new ApiError(
      HTTP_STATUS.UNAUTHORIZED,
      "Not authorized to access this route",
    ),
  TOKEN_EXPIRED: () =>
    new ApiError(
      HTTP_STATUS.UNAUTHORIZED,
      "Token expired. Please login again.",
    ),
  VENDOR_NOT_FOUND: () =>
    new ApiError(HTTP_STATUS.NOT_FOUND, "Vendor not found"),
  USER_NOT_FOUND: () => new ApiError(HTTP_STATUS.NOT_FOUND, "User not found"),
  ADMIN_ONLY: () => new ApiError(HTTP_STATUS.FORBIDDEN, "Admin access only"),
};

export const RATELIMIT_ERRORS = {
  TOO_MANY_REQUESTS: () =>
    new ApiError(
      HTTP_STATUS.TOO_MANY_REQUESTS,
      "Too many requests. Please try again after 10 minutes.",
    ),
};

export const CHAT_ERRORS = {
  INVALID_CONVERSATION_ID: () =>
    new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid conversation ID"),

  INVALID_USER_IDS: () =>
    new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid user IDs"),

  SELF_CONVERSATION_NOT_ALLOWED: () =>
    new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "Cannot create conversation with yourself",
    ),

  USERS_NOT_FOUND: () =>
    new ApiError(HTTP_STATUS.BAD_REQUEST, "One or both users do not exist"),

  CONVERSATION_NOT_FOUND: () =>
    new ApiError(HTTP_STATUS.NOT_FOUND, "Conversation not found"),

  MESSAGE_EMPTY: () =>
    new ApiError(HTTP_STATUS.BAD_REQUEST, "Message text cannot be empty"),

  MESSAGE_TOO_LONG: () =>
    new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "Message exceeds maximum length of 5000 characters",
    ),

  UNAUTHORIZED_MESSAGE: () =>
    new ApiError(
      HTTP_STATUS.FORBIDDEN,
      "Not authorized to send messages in this conversation",
    ),

  INVALID_MESSAGE_IDS: () =>
    new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid message IDs"),
};
