/**
 * CatchBarrels Membership Tiers Configuration
 * 
 * Single source of truth for all membership tier details, pricing, and limits.
 * Work Order 13: Clean membership/usage system tied to Whop.
 */

export type MembershipTier = 'free' | 'athlete' | 'pro' | 'elite';

export interface TierConfig {
  id: MembershipTier;
  slug: string;
  displayName: string;
  price: number | null; // null for free tier
  billingCycle: 'month' | 'year' | null;
  sessionsPerWeek: number | 'unlimited';
  sessionsPerMonth: string; // Estimated for display (e.g., "4 per month")
  whopProductIds: string[]; // Whop product IDs that grant this tier
  features: string[];
  upgradeMessage: string;
  color: string; // Tailwind color class
  icon: string; // Emoji or icon
}

/**
 * Membership Tiers Configuration
 * 
 * NOTE: "Session" = 1 analyzed video upload (up to ~15 swings per session)
 */
export const MEMBERSHIP_TIERS: Record<MembershipTier, TierConfig> = {
  free: {
    id: 'free',
    slug: 'free',
    displayName: 'Free',
    price: null,
    billingCycle: null,
    sessionsPerWeek: 0,
    sessionsPerMonth: '0',
    whopProductIds: [],
    features: [
      'View dashboard',
      'Browse drills library',
      'Basic profile',
    ],
    upgradeMessage: 'Upgrade to start uploading swing analysis videos!',
    color: 'text-gray-400',
    icon: '⭐',
  },

  athlete: {
    id: 'athlete',
    slug: 'athlete',
    displayName: 'BARRELS Athlete',
    price: 49,
    billingCycle: 'month',
    sessionsPerWeek: 1,
    sessionsPerMonth: '4 per month',
    whopProductIds: ['prod_kNyobCww4tc2p'], // BARRELS Athlete from Whop
    features: [
      '1 remote session per week',
      '~15 swings analyzed per session',
      'BARREL Score & 4B breakdown',
      'Basic Coach Rick insights',
      'Progress tracking',
    ],
    upgradeMessage: 'Upgrade to BARRELS Athlete for 1 session/week at $49/month',
    color: 'text-blue-400',
    icon: '🏏',
  },

  pro: {
    id: 'pro',
    slug: 'pro',
    displayName: 'BARRELS Pro',
    price: 99,
    billingCycle: 'month',
    sessionsPerWeek: 2,
    sessionsPerMonth: '8 per month',
    whopProductIds: ['prod_O4CB6y0IzNJLe'], // BARRELS Pro from Whop
    features: [
      '2 remote sessions per week',
      '~15 swings analyzed per session',
      'Advanced biomechanics',
      'Kinematic sequence analysis',
      'Full Coach Rick reports',
      '52-pitch assessment access',
    ],
    upgradeMessage: 'Upgrade to BARRELS Pro for 2 sessions/week at $99/month',
    color: 'text-barrels-gold',
    icon: '💪',
  },

  elite: {
    id: 'elite',
    slug: 'elite',
    displayName: 'BARRELS Elite',
    price: 199,
    billingCycle: 'month',
    sessionsPerWeek: 'unlimited',
    sessionsPerMonth: 'Unlimited',
    whopProductIds: [
      'prod_vCV6UQH3K18QZ', // BARRELS Elite (The Inner Circle)
      'prod_zH1wnZs0JKKfd', // The 90-Day Transformation
    ],
    features: [
      'Unlimited remote sessions',
      'Unlimited assessments',
      'Priority support',
      'Custom training plans',
      'Live coaching access',
      'All features included',
    ],
    upgradeMessage: 'Upgrade to BARRELS Elite for unlimited sessions at $199/month',
    color: 'text-purple-400',
    icon: '⚡',
  },
};

/**
 * Assessment Product Configuration
 * 
 * One-time purchase products that grant 30-day app access.
 * After 30 days, user must subscribe to a membership tier to continue.
 */
export interface AssessmentConfig {
  productId: string;
  displayName: string;
  price: number;
  accessDays: number; // Days of app access
  sessionsAllowed: number; // Sessions available during access window
  features: string[];
}

export const ASSESSMENT_PRODUCTS: AssessmentConfig[] = [
  {
    productId: 'prod_assessment_standard_299', // PLACEHOLDER - update with real Whop ID
    displayName: 'Standard Assessment',
    price: 299,
    accessDays: 30,
    sessionsAllowed: 2,
    features: [
      '30-day app access',
      '2 analyzed sessions',
      'Full assessment report',
      'Personalized recommendations',
    ],
  },
  {
    productId: 'prod_assessment_pro_399', // PLACEHOLDER - update with real Whop ID
    displayName: 'Pro Assessment + S2 Cognition',
    price: 399,
    accessDays: 30,
    sessionsAllowed: 2,
    features: [
      '30-day app access',
      '2 analyzed sessions',
      'Full assessment report',
      'S2 Cognition testing',
      'Advanced brain metrics',
    ],
  },
];

/**
 * Helper Functions
 */

/**
 * Get tier config by tier ID
 */
export function getTierConfig(tier: MembershipTier): TierConfig {
  return MEMBERSHIP_TIERS[tier];
}

/**
 * Get tier from Whop product ID
 */
export function getTierFromProductId(productId: string): MembershipTier {
  for (const [tierKey, config] of Object.entries(MEMBERSHIP_TIERS)) {
    if (config.whopProductIds.includes(productId)) {
      return tierKey as MembershipTier;
    }
  }
  return 'free';
}

/**
 * Check if product ID is an assessment
 */
export function isAssessmentProductId(productId: string): boolean {
  return ASSESSMENT_PRODUCTS.some(a => a.productId === productId);
}

/**
 * Get assessment config by product ID
 */
export function getAssessmentConfig(productId: string): AssessmentConfig | null {
  return ASSESSMENT_PRODUCTS.find(a => a.productId === productId) || null;
}

/**
 * Check if user can start a new session
 * 
 * @param tier - User's membership tier
 * @param sessionsThisWeek - Number of sessions already used this week
 * @returns Object with allowed status and optional reason message
 */
export function canStartNewSession(
  tier: MembershipTier,
  sessionsThisWeek: number
): { allowed: boolean; reason?: string } {
  const config = getTierConfig(tier);
  const limit = config.sessionsPerWeek;

  if (limit === 'unlimited') {
    return { allowed: true };
  }

  if (limit === 0) {
    return {
      allowed: false,
      reason: `You need an active BARRELS membership to upload swing analysis. Upgrade to ${MEMBERSHIP_TIERS.athlete.displayName} ($${MEMBERSHIP_TIERS.athlete.price}/month) to start training!`,
    };
  }

  if (sessionsThisWeek >= limit) {
    const nextTier = getNextTier(tier);
    const nextTierName = nextTier ? MEMBERSHIP_TIERS[nextTier].displayName : 'a higher plan';
    const nextTierPrice = nextTier ? `$${MEMBERSHIP_TIERS[nextTier].price}/month` : '';

    return {
      allowed: false,
      reason: `You've used all ${limit} session${limit > 1 ? 's' : ''} for this week on the ${config.displayName} plan. Your next session unlocks on Monday. Want more reps now? Upgrade to ${nextTierName} ${nextTierPrice ? `(${nextTierPrice})` : ''} for more weekly sessions!`,
    };
  }

  return { allowed: true };
}

/**
 * Get next higher tier (for upgrade suggestions)
 */
function getNextTier(currentTier: MembershipTier): MembershipTier | null {
  const hierarchy: MembershipTier[] = ['free', 'athlete', 'pro', 'elite'];
  const currentIndex = hierarchy.indexOf(currentTier);
  return currentIndex < hierarchy.length - 1 ? hierarchy[currentIndex + 1] : null;
}

/**
 * Check if user has access to a specific tier
 */
export function hasTierAccess(
  userTier: MembershipTier,
  requiredTier: MembershipTier
): boolean {
  const hierarchy: Record<MembershipTier, number> = {
    free: 0,
    athlete: 1,
    pro: 2,
    elite: 3,
  };
  return hierarchy[userTier] >= hierarchy[requiredTier];
}

/**
 * Calculate assessment expiry date
 */
export function calculateAssessmentExpiry(purchaseDate: Date, accessDays: number): Date {
  const expiryDate = new Date(purchaseDate);
  expiryDate.setDate(expiryDate.getDate() + accessDays);
  return expiryDate;
}

/**
 * Check if assessment access is still valid
 */
export function isAssessmentAccessValid(expiryDate: Date | null): boolean {
  if (!expiryDate) return false;
  return new Date() < new Date(expiryDate);
}

/**
 * Get days remaining in assessment access
 */
export function getAssessmentDaysRemaining(expiryDate: Date | null): number {
  if (!expiryDate) return 0;
  
  const now = new Date();
  const expiry = new Date(expiryDate);
  const msRemaining = expiry.getTime() - now.getTime();
  const daysRemaining = Math.ceil(msRemaining / (1000 * 60 * 60 * 24));
  
  return Math.max(0, daysRemaining);
}
