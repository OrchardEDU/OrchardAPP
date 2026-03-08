'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';
import { apiClient } from '@/lib/api/client';
import { User } from '@/types/user';
import { getDashboardUrl } from '@/lib/utils/dashboard';
import './Header.css';

const Header = () => {
	const [scrolled, setScrolled] = useState(false);
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const { theme } = useTheme();
	const router = useRouter();
	const pathname = usePathname();

	useEffect(() => {
		const handleScroll = () => {
			setScrolled(window.scrollY > 50);
		};
		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	}, []);

	// Check auth state via server-side session
	// Refresh on route changes to update header after login/register
	useEffect(() => {
		const checkAuth = async () => {
			try {
				const response = await apiClient.get<{ user: User }>('/api/auth/me');
				if (response.success && response.data?.user) {
					setUser(response.data.user);
				} else {
					setUser(null);
				}
			} catch (error) {
				console.error('Error checking auth:', error);
				setUser(null);
			} finally {
				setIsLoading(false);
			}
		};

		checkAuth();
	}, [pathname]); // Re-check auth when route changes

	const handleLogout = async () => {
		try {
			await apiClient.post('/api/auth/logout');
			setUser(null);
			router.push('/');
			router.refresh();
		} catch (error) {
			console.error('Logout error:', error);
		}
	};

	// Select logo based on theme
	const logoSrc = theme === 'dark' ? '/orchardedulogowhite.png' : '/orchardedulogo.png';

	return (
		<header className={`header ${scrolled ? 'scrolled' : ''}`}>
			<div className="container header-container">
				<Link href="/" className="logo">
					<Image src={logoSrc} alt="Orchard Logo" width={40} height={40} />
					<span>Orchard</span>
				</Link>
				<nav>
					<ul>
						{user ? (
							<li>
								<Link href={getDashboardUrl(user)}>Dashboard</Link>
							</li>
						) : (
							<>
								<li>
									<Link href="/#features">Features</Link>
								</li>
								<li>
									<Link href="/#how-it-works">How it Works</Link>
								</li>
							</>
						)}
					</ul>
				</nav>
				<div className="header-actions">
					{isLoading ? (
						<span className="btn btn-secondary btn-sm">Loading...</span>
					) : user ? (
						<>
							<Link href={getDashboardUrl(user)} className="btn btn-secondary btn-sm">
								Dashboard
							</Link>
							<button onClick={handleLogout} className="btn btn-primary btn-sm">
								Logout
							</button>
						</>
					) : (
						<>
							<Link href="/login" className="btn btn-secondary btn-sm">
								Log In
							</Link>
							<Link href="/register" className="btn btn-primary btn-sm">
								Register
							</Link>
						</>
					)}
				</div>
			</div>
		</header>
	);
};

export default Header;
