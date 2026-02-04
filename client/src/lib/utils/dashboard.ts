import { User } from '@/types/user';

/**
 * Get the dashboard URL for a user based on their role
 * @param user - The user object (can be null/undefined)
 * @returns The dashboard URL path
 */
export function getDashboardUrl(user: User | null | undefined): string {
	if (!user) {
		return '/dashboard/student'; // Default to student if no user
	}
	
	return user.role === 'teacher' 
		? '/dashboard/teacher' 
		: '/dashboard/student';
}
