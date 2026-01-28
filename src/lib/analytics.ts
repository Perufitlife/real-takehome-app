import PostHog from 'posthog-react-native';
import Constants from 'expo-constants';

let posthogClient: PostHog | null = null;

export const initializeAnalytics = async () => {
  const apiKey = process.env.POSTHOG_API_KEY;
  const host = process.env.POSTHOG_HOST || 'https://app.posthog.com';

  if (!apiKey) {
    console.warn('PostHog API key not found. Analytics will be disabled.');
    return;
  }

  try {
    posthogClient = await PostHog.initAsync(apiKey, {
      host,
      captureApplicationLifecycleEvents: true,
      captureDeepLinks: true,
    });
    console.log('PostHog initialized successfully');
  } catch (error) {
    console.error('Failed to initialize PostHog:', error);
  }
};

export const trackEvent = (
  eventName: string,
  properties?: Record<string, any>
) => {
  if (!posthogClient) {
    console.warn('PostHog not initialized. Event not tracked:', eventName);
    return;
  }

  try {
    posthogClient.capture(eventName, properties);
  } catch (error) {
    console.error('Error tracking event:', eventName, error);
  }
};

export const identifyUser = (userId: string, properties?: Record<string, any>) => {
  if (!posthogClient) return;
  
  try {
    posthogClient.identify(userId, properties);
  } catch (error) {
    console.error('Error identifying user:', error);
  }
};

export const setUserProperty = (property: string, value: any) => {
  if (!posthogClient) return;
  
  try {
    posthogClient.capture('$set', { $set: { [property]: value } });
  } catch (error) {
    console.error('Error setting user property:', error);
  }
};

export const resetUser = () => {
  if (!posthogClient) return;
  
  try {
    posthogClient.reset();
  } catch (error) {
    console.error('Error resetting user:', error);
  }
};

// Helper to get build version
export const getBuildVersion = () => {
  return Constants.expoConfig?.version || '1.0.0';
};

// ===== ANALYTICS EVENT TYPES =====

/**
 * All analytics events tracked in the app
 * 
 * CORE EVENTS:
 * - app_opened: App launch
 * - onboarding_step_viewed: Each onboarding step
 * - pay_type_selected: Salary vs Hourly choice
 * - inputs_completed: All inputs filled
 * - results_viewed: Results screen shown
 * 
 * DASHBOARD EVENTS:
 * - dashboard_viewed: Dashboard screen viewed
 * - dashboard_feature_clicked: Feature card clicked from dashboard
 * 
 * FEATURE ENGAGEMENT EVENTS:
 * - overtime_optimizer_opened: Overtime optimizer screen opened
 * - overtime_comparison_viewed: Overtime scenario viewed
 * - overtime_scenario_selected: User selected specific overtime scenario
 * - overtime_decision_made: User made a decision based on overtime data
 * 
 * - job_comparison_opened: Job comparison screen opened
 * - job_comparison_created: User compared jobs
 * - job_offer_winner_viewed: Winner indicated in comparison
 * 
 * - state_comparison_opened: State comparison screen opened
 * - state_comparison_viewed: State comparison result viewed
 * - state_selected_for_comparison: User selected a state to compare
 * - state_move_decision_viewed: User viewed state move decision
 * 
 * - forecast_opened: Forecast screen opened
 * - forecast_viewed: Forecast calculated and viewed
 * - forecast_customized: User customized forecast hours
 * 
 * - results_feature_clicked: Feature clicked from results screen
 * 
 * PREMIUM CONVERSION EVENTS:
 * - breakdown_cta_clicked: User clicked "See full breakdown"
 * - premium_feature_locked_clicked: User tried to access locked feature
 * - paywall_viewed: Paywall shown
 * - paywall_viewed_from: Paywall shown with source tracking
 * - premium_value_prop_clicked: User clicked on premium value prop
 * - trial_started: Subscription purchased
 * 
 * SUCCESS METRICS:
 * - job_comparison_winner_selected: Winner chosen in job comparison
 * - overtime_decision_made: Decision made using overtime optimizer
 * - state_move_decision_viewed: State move decision data viewed
 */

export type AnalyticsEvent = 
  // Core
  | 'app_opened'
  | 'onboarding_step_viewed'
  | 'pay_type_selected'
  | 'inputs_completed'
  | 'results_viewed'
  // Dashboard
  | 'dashboard_viewed'
  | 'dashboard_feature_clicked'
  // Features
  | 'overtime_optimizer_opened'
  | 'overtime_comparison_viewed'
  | 'overtime_scenario_selected'
  | 'overtime_decision_made'
  | 'job_comparison_opened'
  | 'job_comparison_created'
  | 'job_offer_winner_viewed'
  | 'state_comparison_opened'
  | 'state_comparison_viewed'
  | 'state_selected_for_comparison'
  | 'state_move_decision_viewed'
  | 'forecast_opened'
  | 'forecast_viewed'
  | 'forecast_customized'
  | 'results_feature_clicked'
  // Premium
  | 'breakdown_cta_clicked'
  | 'premium_feature_locked_clicked'
  | 'paywall_viewed'
  | 'paywall_viewed_from'
  | 'premium_value_prop_clicked'
  | 'trial_started'
  // Success
  | 'job_comparison_winner_selected';

// Helper functions for tracking specific flows

export const trackFeatureEngagement = (
  feature: 'overtime' | 'job_comparison' | 'state_comparison' | 'forecast' | 'breakdown',
  action: 'opened' | 'viewed' | 'completed',
  properties?: Record<string, any>
) => {
  trackEvent(`${feature}_${action}`, properties);
};

export const trackPremiumConversion = (
  step: 'paywall_viewed' | 'trial_started' | 'feature_locked',
  properties?: Record<string, any>
) => {
  trackEvent(step, {
    ...properties,
    timestamp: new Date().toISOString(),
  });
};

export const trackUserDecision = (
  decision: 'overtime' | 'job_change' | 'state_move',
  properties?: Record<string, any>
) => {
  trackEvent(`${decision}_decision_made`, {
    ...properties,
    decision_timestamp: new Date().toISOString(),
  });
};
