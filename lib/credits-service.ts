// Credit system types and constants
// The actual operations are done via the /api/credits endpoint

export type Tier = 'free' | 'basic' | 'pro' | 'enterprise';
export type ActionType = 'resume' | 'presentation' | 'diagram' | 'letter' | 'ats_check' | 'cover_letter';

// Credit limits by tier
export const TIER_LIMITS: Record<Tier, number> = {
  free: 20,
  basic: 50,
  pro: 200,
  enterprise: 999999, // Effectively unlimited
};

// Credit costs by action type
// Note: presentation cost is PER SLIDE (e.g., 5 slides = 5 credits)
export const ACTION_COSTS: Record<ActionType, number> = {
  resume: 1,
  presentation: 1, // Per slide
  diagram: 1,
  letter: 1,
  ats_check: 1,
  cover_letter: 1,
};

// Tier display names
export const TIER_NAMES: Record<Tier, string> = {
  free: 'Free',
  basic: 'Basic',
  pro: 'Pro',
  enterprise: 'Enterprise',
};

// Tier features
export const TIER_FEATURES: Record<Tier, string[]> = {
  free: [
    '20 credits/month',
    'Basic resume templates',
    'PDF export',
    'Email support',
  ],
  basic: [
    '50 credits/month',
    'All resume templates',
    'PDF & DOCX export',
    'ATS optimization',
    'Priority email support',
  ],
  pro: [
    '200 credits/month',
    'All templates + Premium',
    'All export formats',
    'Advanced ATS optimization',
    'Custom domain hosting',
    'Priority support',
  ],
  enterprise: [
    'Unlimited credits',
    'All features included',
    'White-label options',
    'API access',
    'Dedicated support',
    'Custom integrations',
  ],
};

// Helper to check if a tier has enough credits for an action
export function canPerformAction(
  creditsRemaining: number,
  action: ActionType
): boolean {
  return creditsRemaining >= ACTION_COSTS[action];
}

// Helper to get credit cost description
export function getActionCostDescription(action: ActionType): string {
  const cost = ACTION_COSTS[action];
  return `${cost} credit${cost > 1 ? 's' : ''}`;
}
