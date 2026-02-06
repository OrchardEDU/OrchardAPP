'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/api/client';
import { getDashboardUrl } from '@/lib/utils/dashboard';
import { User } from '@/types/user';
import './page.css';

export default function LoginPage() {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [demoCode, setDemoCode] = useState('');
	const [demoMode, setDemoMode] = useState(false);
	const [error, setError] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [isCheckingAuth, setIsCheckingAuth] = useState(true);
	const router = useRouter();

	// Check if already authenticated
	useEffect(() => {
		const checkAuth = async () => {
			try {
				const response = await apiClient.get<{ user: User }>('/api/auth/me');
				if (response.success && response.data?.user) {
					// Already logged in, redirect to dashboard
					router.push(getDashboardUrl(response.data.user));
				}
			} catch (error) {
				// Not authenticated, show login page
			} finally {
				setIsCheckingAuth(false);
			}
		};

		checkAuth();
	}, [router]);

	// Fetch auth config (demo mode flag)
	useEffect(() => {
		const loadConfig = async () => {
			try {
				const response = await apiClient.get<{ demoMode: boolean }>('/api/auth/config');
				if (response.success && response.data) {
					setDemoMode(!!response.data.demoMode);
				}
			} catch {
				// If config fails, default to demoMode=false
			}
		};

		loadConfig();
	}, []);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setError('');
		setIsLoading(true);

		try {
			const body: any = {
				email,
				password,
			};
			if (demoMode) {
				body.demoCode = demoCode;
			}

			const response = await apiClient.post<{ user: User }>('/api/auth/login', body);

			if (response.success && response.data?.user) {
				// Server handles session creation, redirect to dashboard
				router.push(getDashboardUrl(response.data.user));
				router.refresh();
			} else {
				// Display validation errors or general error
				if (response.errors && response.errors.length > 0) {
					const errorMessages = response.errors.map((err: any) => err.msg || err.message).join(', ');
					setError(errorMessages);
				} else {
					setError(response.error || 'Invalid email or password');
				}
			}
		} catch (err: any) {
			const errorMessage = err?.message || err?.error || 'An error occurred. Please try again.';
			setError(errorMessage);
		} finally {
			setIsLoading(false);
		}
	};

	// Show loading state while checking auth
	if (isCheckingAuth) {
		return (
			<div className="auth-loading">
				<div className="auth-loading-text">Loading...</div>
			</div>
		);
	}

	return (
		<div className="auth-container">
			<div className="auth-card">
				{/* Header */}
				<div className="auth-header">
					<h2 className="auth-title">
						Welcome back
					</h2>
					<p className="auth-subtitle">
						Sign in to your account to continue
					</p>
				</div>

				{/* Error Message */}
				{error && (
					<div className="auth-error">
						{error.includes(',') ? (
							<ul className="auth-error-text" style={{ listStyle: 'disc', listStylePosition: 'inside' }}>
								{error.split(', ').map((err, idx) => (
									<li key={idx}>{err.trim()}</li>
								))}
							</ul>
						) : (
							<p className="auth-error-text">{error}</p>
						)}
					</div>
				)}

				{/* Form */}
				<form className="auth-form" onSubmit={handleSubmit}>
					<div className="auth-form-fields">
						<div className="auth-field">
							<label htmlFor="email" className="auth-label">
								Email address
							</label>
							<input
								id="email"
								name="email"
								type="email"
								autoComplete="email"
								required
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								className="auth-input"
								placeholder="you@example.com"
							/>
						</div>
						<div className="auth-field">
							<label htmlFor="password" className="auth-label">
								Password
							</label>
							<input
								id="password"
								name="password"
								type="password"
								autoComplete="current-password"
								required
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								className="auth-input"
								placeholder="Enter your password"
							/>
						</div>
						{demoMode && (
							<div className="auth-field">
								<label htmlFor="demo-code" className="auth-label">
									Demo access code
								</label>
								<input
									id="demo-code"
									name="demo-code"
									type="password"
									required={demoMode}
									value={demoCode}
									onChange={(e) => setDemoCode(e.target.value)}
									className="auth-input"
									placeholder="Enter demo access code"
								/>
								<p className="auth-hint">
									Ask the Orchard team for the current demo access code.
								</p>
							</div>
						)}
					</div>

					<div>
						<button
							type="submit"
							disabled={isLoading}
							className="auth-button"
						>
							{isLoading ? (
								<span style={{ display: 'flex', alignItems: 'center' }}>
									<svg
										style={{ animation: 'spin 1s linear infinite', marginRight: '0.75rem', height: '1.25rem', width: '1.25rem' }}
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
									>
										<circle
											style={{ opacity: 0.25 }}
											cx="12"
											cy="12"
											r="10"
											stroke="currentColor"
											strokeWidth="4"
										></circle>
										<path
											style={{ opacity: 0.75 }}
											fill="currentColor"
											d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
										></path>
									</svg>
									Signing in...
								</span>
							) : (
								'Sign in'
							)}
						</button>
					</div>
				</form>

				{/* Footer */}
				<div className="auth-footer">
					<p className="auth-footer-text">
						Don't have an account?{' '}
						<Link href="/register" className="auth-link">
							Sign up
						</Link>
					</p>
				</div>
			</div>
		</div>
	);
}
