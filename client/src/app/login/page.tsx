'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/api/client';
import { getDashboardUrl } from '@/lib/utils/dashboard';
import { User } from '@/types/user';
import AuthShell, { AuthSpin } from '@/components/marketing/auth/AuthShell';

export default function LoginPage() {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [isCheckingAuth, setIsCheckingAuth] = useState(true);
	const router = useRouter();

	useEffect(() => {
		const checkAuth = async () => {
			try {
				const response = await apiClient.get<{ user: User }>('/api/auth/me');
				if (response.success && response.data?.user) {
					router.push(getDashboardUrl(response.data.user));
				}
			} catch {
				// Not authenticated — stay on the form.
			} finally {
				setIsCheckingAuth(false);
			}
		};

		checkAuth();
	}, [router]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setError('');
		setIsLoading(true);

		try {
			const response = await apiClient.post<{ user: User }>('/api/auth/login', {
				email,
				password,
			});

			if (response.success && response.data?.user) {
				router.push(getDashboardUrl(response.data.user));
				router.refresh();
			} else if (response.errors && response.errors.length > 0) {
				setError(response.errors.map((err: any) => err.msg || err.message).join(', '));
			} else {
				setError(response.error || 'Invalid email or password');
			}
		} catch (err: any) {
			setError(err?.message || err?.error || 'An error occurred. Please try again.');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<AuthShell
			eyebrow="Access"
			title="Welcome back"
			lede="Sign in to the courses you already teach or take. Nothing here is a second gradebook."
			facts={[
				{ label: 'Session', value: 'Institutional' },
				{ label: 'Alignment', value: 'FERPA & GDPR' },
			]}
		>
			{isCheckingAuth ? (
				<AuthSpin label="Checking your session" />
			) : (
				<>
					{error && (
						<div className="o-auth__error" role="alert">
							{error.includes(',') ? (
								<ul>
									{error.split(', ').map((err, idx) => (
										<li key={idx}>{err.trim()}</li>
									))}
								</ul>
							) : (
								<p>{error}</p>
							)}
						</div>
					)}

					<form className="o-auth__form" onSubmit={handleSubmit}>
						<div className="o-auth__fields">
							<div className="o-auth__field">
								<label htmlFor="email" className="o-auth__label">
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
									className="o-auth__input"
									placeholder="you@institution.edu"
								/>
							</div>
							<div className="o-auth__field">
								<label htmlFor="password" className="o-auth__label">
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
									className="o-auth__input"
									placeholder="Enter your password"
								/>
							</div>
						</div>

						<button
							type="submit"
							disabled={isLoading}
							className="o-btn o-btn--solid o-auth__submit"
						>
							{isLoading ? (
								<span className="o-auth__submitContent">
									<span className="o-auth__spinner" aria-hidden="true" />
									Signing in
								</span>
							) : (
								'Sign in'
							)}
						</button>
					</form>

					<p className="o-small o-auth__foot">
						Need a seat?{' '}
						<Link href="/register" className="o-auth__link">
							Request access
						</Link>
					</p>
				</>
			)}
		</AuthShell>
	);
}
