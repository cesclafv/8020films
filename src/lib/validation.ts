/**
 * Input validation utilities for form submissions
 */

// Email regex pattern - validates common email formats
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Common spam patterns to filter
const SPAM_PATTERNS = [
  /\b(viagra|cialis|casino|lottery|winner|prize|claim|click here)\b/i,
  /\b(bitcoin|crypto|investment opportunity)\b/i,
  /http[s]?:\/\/[^\s]+/gi, // URLs in messages (often spam)
];

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateEmail(email: string): ValidationResult {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Email is required' };
  }

  const trimmed = email.trim().toLowerCase();

  if (trimmed.length > 254) {
    return { valid: false, error: 'Email address is too long' };
  }

  if (!EMAIL_REGEX.test(trimmed)) {
    return { valid: false, error: 'Invalid email format' };
  }

  // Block obvious disposable/temp email domains (add more as needed)
  const disposableDomains = ['tempmail.com', 'throwaway.com', '10minutemail.com', 'guerrillamail.com'];
  const domain = trimmed.split('@')[1];
  if (disposableDomains.includes(domain)) {
    return { valid: false, error: 'Please use a valid business email' };
  }

  return { valid: true };
}

export function validateStringLength(
  value: string,
  fieldName: string,
  minLength: number,
  maxLength: number
): ValidationResult {
  if (!value || typeof value !== 'string') {
    return { valid: false, error: `${fieldName} is required` };
  }

  const trimmed = value.trim();

  if (trimmed.length < minLength) {
    return { valid: false, error: `${fieldName} must be at least ${minLength} characters` };
  }

  if (trimmed.length > maxLength) {
    return { valid: false, error: `${fieldName} is too long (max ${maxLength} characters)` };
  }

  return { valid: true };
}

export function checkForSpam(message: string): ValidationResult {
  if (!message) {
    return { valid: true };
  }

  for (const pattern of SPAM_PATTERNS) {
    if (pattern.test(message)) {
      return { valid: false, error: 'Message contains suspicious content' };
    }
  }

  // Check for excessive random characters (common in bot submissions)
  const randomCharRatio = (message.match(/[^a-zA-Z0-9\s.,!?'-]/g) || []).length / message.length;
  if (randomCharRatio > 0.3 && message.length > 20) {
    return { valid: false, error: 'Message contains invalid characters' };
  }

  return { valid: true };
}

export interface QuoteFormData {
  company: string;
  first_name: string;
  last_name: string;
  email: string;
  job_title: string;
  message: string;
  project_type?: string;
  budget_range?: string;
  how_heard?: string;
  honeypot?: string; // Hidden field that should be empty
}

export function validateQuoteForm(data: QuoteFormData): ValidationResult {
  // Check honeypot - if filled, it's a bot
  if (data.honeypot && data.honeypot.trim().length > 0) {
    // Return success to not tip off bots, but we'll silently reject
    return { valid: false, error: 'HONEYPOT_TRIGGERED' };
  }

  // Validate email
  const emailResult = validateEmail(data.email);
  if (!emailResult.valid) {
    return emailResult;
  }

  // Validate required string fields with length limits
  const validations = [
    validateStringLength(data.company, 'Company', 2, 200),
    validateStringLength(data.first_name, 'First name', 1, 100),
    validateStringLength(data.last_name, 'Last name', 1, 100),
    validateStringLength(data.job_title, 'Job title', 2, 150),
    validateStringLength(data.message, 'Message', 25, 5000),
  ];

  for (const result of validations) {
    if (!result.valid) {
      return result;
    }
  }

  // Check for spam patterns in message
  const spamResult = checkForSpam(data.message);
  if (!spamResult.valid) {
    return spamResult;
  }

  // Additional bot detection: Check if names look fake (all caps, random chars)
  const allCapsPattern = /^[A-Z]+$/;

  if (allCapsPattern.test(data.first_name) && data.first_name.length > 3) {
    return { valid: false, error: 'Please enter your real name' };
  }
  if (allCapsPattern.test(data.last_name) && data.last_name.length > 3) {
    return { valid: false, error: 'Please enter your real name' };
  }

  return { valid: true };
}
