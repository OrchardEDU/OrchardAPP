'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/types/user';
import { apiClient } from '@/lib/api/client';
import { LoginCredentials, RegisterCredentials } from './types';

interface UseAuthReturn {
	user: User | null;
	isLoading: boolean;
	isAuthenticated: boolean;
	login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string; errors?: any[] }>;
	register: (credentials: RegisterCredentials) => Promise<{ success: boolean; error?: string; errors?: any[]; user?: User }>;
	logout: () => Promise<void>;
	refresh: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const router = useRouter();

	const fetchUser = useCallback(async () => {
		try {
			const response = await apiClient.get<{ user: User }>('/api/auth/me');
			if (response.success && response.data?.user) {
				setUser(response.data.user);
			} else {
				setUser(null);
			}
		} catch (error) {
			console.error('Error fetching user:', error);
			setUser(null);
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		let isMounted = true;
		
		const loadUser = async () => {
			await fetchUser();
		};
		
		loadUser();
		
		return () => {
			isMounted = false;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []); // Only run once on mount

	const login = useCallback(
		async (credentials: LoginCredentials): Promise<{ success: boolean; error?: string; errors?: any[]; user?: User }> => {
			try {
				const response = await apiClient.post<{ user: User }>('/api/auth/login', credentials);
				if (response.success && response.data?.user) {
					setUser(response.data.user);
					return { success: true, user: response.data.user };
				}
				// Return error details including validation errors
				return {
					success: false,
					error: response.error || response.message || 'Login failed',
					errors: (response as any).errors,
				};
			} catch (error) {
				console.error('Login error:', error);
				return {
					success: false,
					error: error instanceof Error ? error.message : 'An error occurred during login',
				};
			}
		},
		[]
	);

	const register = useCallback(
		async (credentials: RegisterCredentials): Promise<{ success: boolean; error?: string; errors?: any[]; user?: User }> => {
			try {
				const response = await apiClient.post<{ user: User }>(
					'/api/auth/register',
					credentials
				);
				if (response.success && response.data?.user) {
					setUser(response.data.user);
					return { success: true, user: response.data.user };
				}
				// Return error details including validation errors
				return {
					success: false,
					error: response.error || response.message || 'Registration failed',
					errors: (response as any).errors,
				};
			} catch (error) {
				console.error('Registration error:', error);
				return {
					success: false,
					error: error instanceof Error ? error.message : 'An error occurred during registration',
				};
			}
		},
		[]
	);

	const logout = useCallback(async () => {
		try {
			await apiClient.post('/api/auth/logout');
		} catch (error) {
			console.error('Logout error:', error);
		} finally {
			setUser(null);
			// Redirect to landing page instead of login
			router.push('/');
			router.refresh();
		}
	}, [router]);

	const refresh = useCallback(async () => {
		await fetchUser();
	}, [fetchUser]);

	return {
		user,
		isLoading,
		isAuthenticated: !!user,
		login,
		register,
		logout,
		refresh,
	};
}
