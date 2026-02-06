/**
 * Centralized environment variable access
 */

export const config = {
	apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : ''),
};
