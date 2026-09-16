'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/api/client';
import { getDashboardUrl } from '@/lib/utils/dashboard';
import { User } from '@/types/user';
import AuthShell, { AuthSpin } from '@/components/marketing/auth/AuthShell';

export default function RegisterPage() {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [name, setName] = useState('');
	const [role, setRole] = useState<'student' | 'teacher'>('student');
	const [demoCode, setDemoCode] = useState('');
	const [demoMode, setDemoMode] = useState(false);
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
			const response = await apiClient.post<{ user: User }>('/api/auth/register', {
				email,
				password,
				name,
				role,
				...(demoMode && role === 'teacher' ? { demoCode } : {}),
			});

			if (response.success && response.data?.user) {
				router.push(getDashboardUrl(response.data.user));
				router.refresh();
			} else if (response.errors && response.errors.length > 0) {
				setError(response.errors.map((err: any) => err.msg || err.message).join(', '));
			} else {
				setError(
					response.error ||
						'Registration failed. Please check your information and try again.'
				);
			}
		} catch (err: any) {
			setError(err?.message || err?.error || 'An error occurred. Please try again.');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<AuthShell
			eyebrow="Pilot"
			title="Request access"
			lede="A departmental pilot connects a single course, indexes the material already in it, and is free for the first hundred students."
			facts={[
				{ label: 'Pilot', value: 'First 100 students free' },
				{ label: 'Time to value', value: 'Under one hour' },
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
								<label htmlFor="name" className="o-auth__label">
									Full name
								</label>
								<input
									id="name"
									name="name"
									type="text"
									autoComplete="name"
									required
									value={name}
									onChange={(e) => setName(e.target.value)}
									className="o-auth__input"
									placeholder="Your name"
								/>
							</div>
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
									autoComplete="new-password"
									required
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									className="o-auth__input"
									placeholder="At least 8 characters"
								/>
								<p className="o-auth__hint">Must be at least 8 characters.</p>
							</div>
							<div className="o-auth__field">
								<label htmlFor="role" className="o-auth__label">
									I am a
								</label>
								<select
									id="role"
									name="role"
									value={role}
									onChange={(e) => setRole(e.target.value as 'student' | 'teacher')}
									className="o-auth__select"
								>
									<option value="student">Student</option>
									<option value="teacher">Teacher</option>
								</select>
							</div>
							{demoMode && role === 'teacher' && (
								<div className="o-auth__field">
									<label htmlFor="demo-code" className="o-auth__label">
										Demo access code
									</label>
									<input
										id="demo-code"
										name="demo-code"
										type="password"
										required={demoMode && role === 'teacher'}
										value={demoCode}
										onChange={(e) => setDemoCode(e.target.value)}
										className="o-auth__input"
										placeholder="Enter demo access code"
									/>
									<p className="o-auth__hint">
										Ask the Orchard team for the current demo access code.
									</p>
								</div>
							)}
						</div>

						<button
							type="submit"
							disabled={isLoading}
							className="o-btn o-btn--solid o-auth__submit"
						>
							{isLoading ? (
								<span className="o-auth__submitContent">
									<span className="o-auth__spinner" aria-hidden="true" />
									Creating account
								</span>
							) : (
								'Request access'
							)}
						</button>
					</form>

					<p className="o-small o-auth__foot">
						Already have a seat?{' '}
						<Link href="/login" className="o-auth__link">
							Log in
						</Link>
					</p>
				</>
			)}
		</AuthShell>
	);
}
