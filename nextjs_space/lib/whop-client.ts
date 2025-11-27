
/**
 * Whop API Client
 * 
 * Provides utilities for Whop membership verification and management
 */

import Whop from "@whop/sdk";

// Initialize Whop SDK client
const getWhopClient = () => {
  const apiKey = process.env.WHOP_API_KEY;
  const appId = process.env.WHOP_APP_ID;

  if (!apiKey) {
    console.warn("WHOP_API_KEY not configured");
    return null;
  }

  return new Whop({
    apiKey,
    appID: appId || undefined,
  });
};

export interface WhopMembership {
  id: string;
  userId: string;
  productId: string;
  planId?: string;
  status: string;
  valid: boolean;
  cancelAtPeriodEnd: boolean;
  expiresAt?: string;
  licenseKey?: string;
}

/**
 * Verify a Whop membership by membership ID or license key
 */
export async function verifyWhopMembership(
  membershipIdOrLicenseKey: string
): Promise<WhopMembership | null> {
  try {
    const client = getWhopClient();
    if (!client) {
      console.error("Whop client not initialized");
      return null;
    }

    // Fetch membership from Whop API
    const membership = await client.memberships.retrieve(
      membershipIdOrLicenseKey
    );

    if (!membership) {
      return null;
    }

    const membershipData = membership as any;

    return {
      id: membershipData.id || "",
      userId: membershipData.user?.id || "",
      productId: membershipData.product?.id || "",
      planId: membershipData.plan?.id,
      status: membershipData.status || "unknown",
      valid: membershipData.valid || false,
      cancelAtPeriodEnd: membershipData.cancel_at_period_end || false,
      expiresAt: membershipData.expires_at || undefined,
      licenseKey: membershipData.license_key,
    };
  } catch (error) {
    console.error("Error verifying Whop membership:", error);
    return null;
  }
}

/**
 * Get all memberships for a specific Whop user
 */
export async function getWhopUserMemberships(
  whopUserId: string
): Promise<WhopMembership[]> {
  try {
    const client = getWhopClient();
    if (!client) {
      console.error("Whop client not initialized");
      return [];
    }

    // List memberships (filter by user_ids parameter - note the plural)
    const memberships = await client.memberships.list({
      user_ids: [whopUserId],
    } as any);

    const data = (memberships as any).data || [];

    return data.map((m: any) => ({
      id: m.id || "",
      userId: m.user?.id || "",
      productId: m.product?.id || "",
      planId: m.plan?.id,
      status: m.status || "unknown",
      valid: m.valid || false,
      cancelAtPeriodEnd: m.cancel_at_period_end || false,
      expiresAt: m.expires_at || undefined,
      licenseKey: m.license_key,
    }));
  } catch (error) {
    console.error("Error fetching Whop user memberships:", error);
    return [];
  }
}

/**
 * Map Whop product ID to BARRELS membership tier
 */
export function getWhopProductTier(productId: string): string {
  // Product IDs from Whop dashboard (configured Nov 2024)
  const productMapping: Record<string, string> = {
    // BARRELS Athlete - $49/mo or $417/yr
    "prod_kNyobCww4tc2p": "athlete",
    
    // BARRELS Pro - $99/mo or $839/yr
    "prod_O4CB6y0IzNJLe": "pro",
    
    // BARRELS Elite (The Inner Circle) - $199/mo or $1,699/yr
    "prod_vCV6UQH3K18QZ": "elite",
    
    // The 90-Day Transformation - $997 one-time
    "prod_zH1wnZs0JKKfd": "elite", // Transformation grants elite access
  };

  return productMapping[productId] || "free";
}

/**
 * Check if a Whop product is an assessment product
 * Assessment purchases unlock VIP pricing for BARRELS Pro
 */
export function isAssessmentProduct(productId: string): boolean {
  // Assessment product IDs (TODO: Update with real Whop product IDs)
  const assessmentProducts = [
    'prod_assessment_standard_299',  // Standard In-Person Assessment - $299
    'prod_assessment_pro_399',       // Pro Assessment + S2 Cognition - $399
  ];
  
  return assessmentProducts.includes(productId);
}

/**
 * Get assessment purchase date from memberships
 * Returns the earliest assessment purchase date
 */
export function getAssessmentPurchaseDate(memberships: WhopMembership[]): Date | null {
  const assessmentMemberships = memberships.filter(m => isAssessmentProduct(m.productId));
  
  if (assessmentMemberships.length === 0) return null;
  
  // If memberships have a created_at or similar field, use that
  // For now, we'll use the current date as a fallback
  // TODO: Update this when we have access to actual purchase dates from Whop API
  return new Date();
}

/**
 * Check if a membership grants access to a specific tier
 */
export function hasTierAccess(
  userTier: string,
  requiredTier: string
): boolean {
  const tierHierarchy = ["free", "athlete", "pro", "elite"];
  const userLevel = tierHierarchy.indexOf(userTier);
  const requiredLevel = tierHierarchy.indexOf(requiredTier);

  return userLevel >= requiredLevel;
}

/**
 * Get tier display name
 */
export function getTierDisplayName(tier: string): string {
  const displayNames: Record<string, string> = {
    free: "Free",
    athlete: "BARRELS Athlete",
    pro: "BARRELS Pro",
    elite: "BARRELS Elite",
  };

  return displayNames[tier] || "Free";
}
