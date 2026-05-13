/**
 * Google Analytics helper functions
 * These functions only work if analytics consent has been given
 * and Google Analytics has been initialized
 */

export type GtagEvent = {
  action: string
  category?: string
  label?: string
  value?: number
}

/**
 * Track a page view
 */
export function trackPageView(url: string): void {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '', {
      page_path: url,
    })
  }
}

/**
 * Track a custom event
 */
export function trackEvent({ action, category, label, value }: GtagEvent): void {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    })
  }
}

/**
 * Track survey started
 */
export function trackSurveyStart(surveyId: string, surveyType: string): void {
  trackEvent({
    action: 'survey_start',
    category: 'Survey',
    label: `${surveyType}_${surveyId}`,
  })
}

/**
 * Track survey completed
 */
export function trackSurveyComplete(surveyId: string, surveyType: string): void {
  trackEvent({
    action: 'survey_complete',
    category: 'Survey',
    label: `${surveyType}_${surveyId}`,
  })
}

/**
 * Track button click
 */
export function trackButtonClick(buttonName: string, location: string): void {
  trackEvent({
    action: 'button_click',
    category: 'Engagement',
    label: `${location}_${buttonName}`,
  })
}

/**
 * Track form submission
 */
export function trackFormSubmit(formName: string): void {
  trackEvent({
    action: 'form_submit',
    category: 'Form',
    label: formName,
  })
}

/**
 * Track download/export
 */
export function trackExport(exportType: string, format: string): void {
  trackEvent({
    action: 'export',
    category: 'Export',
    label: `${exportType}_${format}`,
  })
}

/**
 * Track user login
 */
export function trackLogin(method: string): void {
  trackEvent({
    action: 'login',
    category: 'Auth',
    label: method,
  })
}

/**
 * Track user signup
 */
export function trackSignup(method: string): void {
  trackEvent({
    action: 'signup',
    category: 'Auth',
    label: method,
  })
}



