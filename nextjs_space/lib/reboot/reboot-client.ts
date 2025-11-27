/**
 * Reboot Motion API Client
 * 
 * This module handles communication with the Reboot Motion API to fetch swing data
 * for MLB, indy ball, college, HS, and youth players.
 * 
 * IMPORTANT: This is a placeholder implementation. Real API details and keys
 * must be configured in .env before this will work.
 * 
 * TODO:
 * 1. Get actual Reboot API endpoint URLs from Reboot Motion
 * 2. Get API authentication keys/tokens from Reboot Motion
 * 3. Understand the actual response payload structure
 * 4. Map Reboot's field names to our schema (athleteName, level, metrics, etc.)
 * 5. Add proper error handling and retry logic
 * 6. Add rate limiting if needed
 */

const REBOOT_API_BASE = process.env.REBOOT_API_BASE_URL;  // e.g., "https://api.rebootmotion.com/v1"
const REBOOT_API_KEY = process.env.REBOOT_API_KEY;        // API key or bearer token

/**
 * Session type classification
 * HITTING: Baseball hitting/batting sessions
 * PITCHING: Baseball pitching sessions
 * OTHER: Any other type of motion (fielding, etc.)
 */
export type SessionType = 'HITTING' | 'PITCHING' | 'OTHER';

/**
 * Maps Reboot's session type classification to our internal type
 * 
 * TODO: Update this based on actual Reboot API field names
 * Reboot may use fields like:
 * - activity_type
 * - motion_type
 * - tags
 * - labels
 * - session_category
 * 
 * @param raw - Raw session data from Reboot API
 * @returns SessionType enum value
 */
export function mapSessionTypeFromReboot(raw: any): SessionType {
  // TODO: Replace with actual Reboot API field mapping
  // Example implementations (adjust based on actual API):
  
  // Option 1: Direct field mapping
  // if (raw.activity_type === 'hitting') return 'HITTING';
  // if (raw.activity_type === 'pitching') return 'PITCHING';
  
  // Option 2: Tags array
  // if (raw.tags?.includes('hitting')) return 'HITTING';
  // if (raw.tags?.includes('pitching')) return 'PITCHING';
  
  // Option 3: Motion type classification
  // if (raw.motion_type?.toLowerCase().includes('hit')) return 'HITTING';
  // if (raw.motion_type?.toLowerCase().includes('pitch')) return 'PITCHING';
  
  // Fallback: Default to HITTING for now (since hitting is primary use case)
  // This should be updated once we have real Reboot API documentation
  
  const activityType = raw.activity_type || raw.motion_type || raw.type || '';
  const lowerType = activityType.toLowerCase();
  
  if (lowerType.includes('hit') || lowerType.includes('bat')) {
    return 'HITTING';
  }
  
  if (lowerType.includes('pitch') || lowerType.includes('throw')) {
    return 'PITCHING';
  }
  
  // Check tags if available
  if (raw.tags && Array.isArray(raw.tags)) {
    const tagStr = raw.tags.join(' ').toLowerCase();
    if (tagStr.includes('hitting') || tagStr.includes('batting')) {
      return 'HITTING';
    }
    if (tagStr.includes('pitching') || tagStr.includes('throwing')) {
      return 'PITCHING';
    }
  }
  
  // Default to HITTING if uncertain (can be changed to 'OTHER' if preferred)
  return 'HITTING';
}

/**
 * Interface for a single Reboot session from their API
 * TODO: Update this based on actual Reboot API response
 */
export interface RebootSessionPayload {
  sessionId: string;           // Unique ID from Reboot
  athleteId?: string;          // Reboot's athlete identifier
  athleteName?: string;        // Player name
  athleteEmail?: string;       // Player email (if available)
  level?: string;              // "MLB", "Pro", "College", "HS", "Youth"
  sessionType: SessionType;    // "HITTING", "PITCHING", or "OTHER"
  team?: string;               // Team or organization
  captureDate?: string;        // ISO date string
  metrics: Record<string, any>; // Full kinematic/timing data
}

/**
 * Fetch all sessions from Reboot Motion API
 * 
 * @returns Array of Reboot session payloads
 * 
 * TODO: Implement actual API call
 * - Determine if API is paginated (likely is for large datasets)
 * - Add pagination logic to fetch all pages
 * - Add query params for filtering by date range, level, etc.
 * - Handle authentication (API key, OAuth, etc.)
 * - Parse response and map to RebootSessionPayload[]
 */
export async function fetchRebootSessions(): Promise<RebootSessionPayload[]> {
  // Guard: Ensure environment variables are set
  if (!REBOOT_API_BASE || !REBOOT_API_KEY) {
    throw new Error(
      'Reboot API not configured. Please set REBOOT_API_BASE_URL and REBOOT_API_KEY in .env'
    );
  }

  // TODO: Replace with actual API call
  // Example structure (replace with real endpoint):
  //
  // const response = await fetch(`${REBOOT_API_BASE}/sessions`, {
  //   headers: {
  //     'Authorization': `Bearer ${REBOOT_API_KEY}`,
  //     'Content-Type': 'application/json',
  //   },
  // });
  //
  // if (!response.ok) {
  //   throw new Error(`Reboot API error: ${response.statusText}`);
  // }
  //
  // const data = await response.json();
  // return data.sessions; // Or whatever the actual structure is

  throw new Error(
    'fetchRebootSessions not implemented – requires actual Reboot API endpoint and key'
  );
}

/**
 * Fetch sessions for a specific athlete
 * 
 * @param athleteId - Reboot's athlete identifier
 * @returns Array of sessions for that athlete
 * 
 * TODO: Implement when we have the real API
 */
export async function fetchRebootAthleteSessions(
  athleteId: string
): Promise<RebootSessionPayload[]> {
  if (!REBOOT_API_BASE || !REBOOT_API_KEY) {
    throw new Error('Reboot API not configured');
  }

  // TODO: Implement
  // const response = await fetch(`${REBOOT_API_BASE}/athletes/${athleteId}/sessions`, {
  //   headers: {
  //     'Authorization': `Bearer ${REBOOT_API_KEY}`,
  //   },
  // });

  throw new Error('fetchRebootAthleteSessions not implemented');
}

/**
 * Get list of all unique Reboot athletes
 * 
 * This is useful for the admin UI to show a dropdown of Reboot athletes
 * when linking a CatchBarrels user to a Reboot profile.
 * 
 * TODO: Implement or derive from sessions
 */
export async function fetchRebootAthletes(): Promise<
  Array<{ id: string; name: string; email?: string }>
> {
  if (!REBOOT_API_BASE || !REBOOT_API_KEY) {
    throw new Error('Reboot API not configured');
  }

  // TODO: Implement
  // Option 1: If Reboot has an /athletes endpoint, use that
  // Option 2: Fetch all sessions and extract unique athletes

  throw new Error('fetchRebootAthletes not implemented');
}
