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
 * NOTE: This is a test implementation. The actual Reboot API structure may differ.
 * Adjust based on their actual API documentation.
 */
export async function fetchRebootSessions(): Promise<RebootSessionPayload[]> {
  // Guard: Ensure environment variables are set
  if (!REBOOT_API_BASE || !REBOOT_API_KEY) {
    throw new Error(
      'Reboot API not configured. Please set REBOOT_API_BASE_URL and REBOOT_API_KEY in .env'
    );
  }

  console.log('[Reboot API] Fetching sessions...');
  console.log(`[Reboot API] Base URL: ${REBOOT_API_BASE}`);
  console.log(`[Reboot API] API Key configured: ${REBOOT_API_KEY ? 'Yes (length: ' + REBOOT_API_KEY.length + ')' : 'No'}`);

  try {
    // Try different possible endpoints and auth methods
    const endpoints = [
      '/sessions',
      '/swings',
      '/data',
      '/api/sessions',
    ];

    for (const endpoint of endpoints) {
      const url = `${REBOOT_API_BASE}${endpoint}`;
      console.log(`[Reboot API] Trying endpoint: ${url}`);

      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${REBOOT_API_KEY}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        });

        console.log(`[Reboot API] Response status: ${response.status} ${response.statusText}`);
        
        // If we get 2xx, try to parse the response
        if (response.ok) {
          const data = await response.json();
          console.log('[Reboot API] Success! Response structure:', Object.keys(data));
          
          // Try to find the sessions array in the response
          const sessions = data.sessions || data.data || data.results || data.swings || [];
          
          if (Array.isArray(sessions)) {
            console.log(`[Reboot API] Found ${sessions.length} sessions`);
            return sessions.map((s: any) => ({
              sessionId: s.id || s.session_id || s.sessionId || String(Math.random()),
              athleteId: s.athlete_id || s.athleteId || s.player_id,
              athleteName: s.athlete_name || s.athleteName || s.player_name || s.name,
              athleteEmail: s.athlete_email || s.email,
              level: s.level || s.skill_level,
              sessionType: mapSessionTypeFromReboot(s),
              team: s.team || s.team_name,
              captureDate: s.capture_date || s.created_at || s.date,
              metrics: s,
            }));
          }
        }
        
        // Log error details for non-200 responses
        const errorText = await response.text();
        console.log(`[Reboot API] Error response: ${errorText.substring(0, 200)}`);
        
      } catch (endpointError: any) {
        console.log(`[Reboot API] Endpoint ${endpoint} failed:`, endpointError.message);
      }
    }

    // If none of the endpoints worked, throw an error with diagnostic info
    throw new Error(
      'Unable to connect to Reboot API. Tried multiple endpoints and all returned errors. ' +
      'Please verify:\n' +
      '1. REBOOT_API_KEY is correct\n' +
      '2. REBOOT_API_BASE_URL is correct\n' +
      '3. API key has proper permissions\n' +
      '4. Contact Reboot Motion support for correct API endpoint'
    );

  } catch (error: any) {
    console.error('[Reboot API] Fatal error:', error);
    throw error;
  }
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
