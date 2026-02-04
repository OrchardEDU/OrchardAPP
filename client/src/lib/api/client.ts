/**
 * API client for making authenticated requests
 * Handles session cookies automatically (browser sends cookies)
 * No auth state management - relies on server-side sessions
 */

interface ApiResponse<T = any> {
	success: boolean;
	data?: T;
	message?: string;
	error?: string;
	errors?: any[];
}

const getApiBaseUrl = (): string => {
	if (typeof window !== 'undefined') {
		return process.env.NEXT_PUBLIC_API_BASE_URL || window.location.origin;
	}
	return process.env.NEXT_PUBLIC_API_BASE_URL || '';
};

export const apiClient = {
	async get<T = any>(endpoint: string): Promise<ApiResponse<T>> {
		try {
			const response = await fetch(`${getApiBaseUrl()}${endpoint}`, {
				method: 'GET',
				credentials: 'include', // Include cookies
				headers: {
					'Content-Type': 'application/json',
				},
			});

			if (response.status === 401) {
				// Server will handle redirects
				return {
					success: false,
					error: 'Unauthorized',
				};
			}

			const data = await response.json();
			return data;
		} catch (error) {
			console.error('API GET error:', error);
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Network error',
			};
		}
	},

	async post<T = any>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
		try {
			const response = await fetch(`${getApiBaseUrl()}${endpoint}`, {
				method: 'POST',
				credentials: 'include', // Include cookies
				headers: {
					'Content-Type': 'application/json',
				},
				body: body ? JSON.stringify(body) : undefined,
			});

			if (response.status === 401) {
				// Server will handle redirects
				return {
					success: false,
					error: 'Unauthorized',
				};
			}

			const data = await response.json();
			return data;
		} catch (error) {
			console.error('API POST error:', error);
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Network error',
			};
		}
	},

	async put<T = any>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
		try {
			const response = await fetch(`${getApiBaseUrl()}${endpoint}`, {
				method: 'PUT',
				credentials: 'include', // Include cookies
				headers: {
					'Content-Type': 'application/json',
				},
				body: body ? JSON.stringify(body) : undefined,
			});

			if (response.status === 401) {
				// Server will handle redirects
				return {
					success: false,
					error: 'Unauthorized',
				};
			}

			const data = await response.json();
			return data;
		} catch (error) {
			console.error('API PUT error:', error);
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Network error',
			};
		}
	},

	async delete<T = any>(endpoint: string): Promise<ApiResponse<T>> {
		try {
			const response = await fetch(`${getApiBaseUrl()}${endpoint}`, {
				method: 'DELETE',
				credentials: 'include', // Include cookies
				headers: {
					'Content-Type': 'application/json',
				},
			});

			if (response.status === 401) {
				// Server will handle redirects
				return {
					success: false,
					error: 'Unauthorized',
				};
			}

			const data = await response.json();
			return data;
		} catch (error) {
			console.error('API DELETE error:', error);
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Network error',
			};
		}
	},
};
