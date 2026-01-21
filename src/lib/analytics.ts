/**
 * GA4 Analytics Event Tracking
 *
 * This module provides typed functions for tracking conversion events in Google Analytics 4.
 * Events follow GA4 recommended event naming conventions.
 */

// Extend window type for gtag
declare global {
  interface Window {
    gtag?: (
      command: 'event' | 'config' | 'js',
      eventName: string,
      params?: Record<string, unknown>
    ) => void;
  }
}

/**
 * Safely call gtag - returns false if gtag is not available
 */
function gtag(
  command: 'event' | 'config' | 'js',
  eventName: string,
  params?: Record<string, unknown>
): boolean {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag(command, eventName, params);
    return true;
  }
  return false;
}

// ============================================
// Form Events
// ============================================

export type FormLocation = 'homepage' | 'quote_page' | 'contact_page';

/**
 * Track when a user starts interacting with a quote form
 * Call this on the first field interaction (focus)
 */
export function trackFormStart(formLocation: FormLocation): void {
  gtag('event', 'form_start', {
    form_name: 'quote_request',
    form_location: formLocation,
  });
}

/**
 * Track successful quote form submission (lead generation)
 * This is the primary conversion event - mark as conversion in GA4
 */
export function trackGenerateLead(params: {
  formLocation: FormLocation;
  projectType?: string;
  budgetRange?: string;
}): void {
  gtag('event', 'generate_lead', {
    form_name: 'quote_request',
    form_location: params.formLocation,
    project_type: params.projectType || 'not_specified',
    budget_range: params.budgetRange || 'not_specified',
    currency: 'USD',
  });
}

/**
 * Track form submission errors
 */
export function trackFormError(formLocation: FormLocation, errorType: string): void {
  gtag('event', 'form_error', {
    form_name: 'quote_request',
    form_location: formLocation,
    error_type: errorType,
  });
}

// ============================================
// CTA Click Events
// ============================================

export type CTAType = 'get_quote' | 'contact' | 'work' | 'careers';

/**
 * Track CTA button/link clicks
 * Useful for understanding navigation patterns to conversion pages
 */
export function trackCTAClick(params: {
  ctaType: CTAType;
  ctaLocation: 'header' | 'footer' | 'hero' | 'page_content';
  ctaText?: string;
}): void {
  gtag('event', 'cta_click', {
    cta_type: params.ctaType,
    cta_location: params.ctaLocation,
    cta_text: params.ctaText,
  });
}

// ============================================
// Newsletter Events
// ============================================

/**
 * Track newsletter signup
 */
export function trackNewsletterSignup(success: boolean): void {
  gtag('event', success ? 'newsletter_signup' : 'newsletter_signup_error', {
    form_name: 'newsletter',
  });
}
