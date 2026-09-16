'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { apiClient } from '@/lib/api/client';
import { User } from '@/types/user';
import { getDashboardUrl } from '@/lib/utils/dashboard';
import ThemeToggle from './ThemeToggle';
import './Header.css';

const NAV = [
	{ href: '/', label: 'Overview' },
	{ href: '/how-it-works', label: 'How It Works' },
	{ href: '/demo', label: 'Demo' },
];

/** Marketing routes let the hero run beneath a transparent header. */
const TRANSPARENT_ROUTES = new Set(NAV.map((item) => item.href));

const Header = () => {
	const [scrolled, setScrolled] = useState(false);
	const [menuOpen, setMenuOpen] = useState(false);
	const [user, setUser] = useState<User | null>(null);
	const [authResolved, setAuthResolved] = useState(false);
	const router = useRouter();
	const pathname = usePathname();

	const overlay = TRANSPARENT_ROUTES.has(pathname);

	useEffect(() => {
		const onScroll = () => {
			const top =
				window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
			setScrolled(top > 24);
		};

		onScroll();
		window.addEventListener('scroll', onScroll, { passive: true });
		return () => window.removeEventListener('scroll', onScroll);
	}, []);

	// Auth state lives in a server session, so re-check whenever the route changes.
	useEffect(() => {
		let cancelled = false;

		const checkAuth = async () => {
			try {
				const response = await apiClient.get<{ user: User }>('/api/auth/me');
				if (cancelled) return;
				setUser(response.success && response.data?.user ? response.data.user : null);
			} catch {
				if (!cancelled) setUser(null);
			} finally {
				if (!cancelled) setAuthResolved(true);
			}
		};

		checkAuth();
		return () => {
			cancelled = true;
		};
	}, [pathname]);

	// Close the drawer on navigation.
	useEffect(() => setMenuOpen(false), [pathname]);

	useEffect(() => {
		if (!menuOpen) return;

		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') setMenuOpen(false);
		};

		document.addEventListener('keydown', onKeyDown);
		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';

		return () => {
			document.removeEventListener('keydown', onKeyDown);
			document.body.style.overflow = previousOverflow;
		};
	}, [menuOpen]);

	const handleLogout = useCallback(async () => {
		try {
			await apiClient.post('/api/auth/logout');
			setUser(null);
			router.push('/');
			router.refresh();
		} catch (error) {
			console.error('Logout error:', error);
		}
	}, [router]);

	const navItems = user
		? [...NAV, { href: getDashboardUrl(user), label: 'Dashboard' }]
		: NAV;

	return (
		<header
			className={[
				'o-header',
				overlay ? 'o-header--overlay' : '',
				scrolled ? 'is-scrolled' : '',
				menuOpen ? 'is-open' : '',
			]
				.filter(Boolean)
				.join(' ')}
		>
			<div className="o-header__inner">
				<Link href="/" className="o-mark" aria-label="Orchard home">
					<span className="o-mark__badge">
						<Image
							src="/orchardedulogo.png"
							alt=""
							width={44}
							height={44}
							className="o-mark__img o-mark__img--light"
							priority
						/>
						<Image
							src="/orchardedulogowhite.png"
							alt=""
							width={44}
							height={44}
							className="o-mark__img o-mark__img--dark"
							priority
						/>
					</span>
					<span className="o-mark__type">
						<span className="o-mark__name">Orchard</span>
						<span className="o-mark__sub">Edu</span>
					</span>
				</Link>

				<nav className="o-header__nav" aria-label="Primary">
					<ul>
						{navItems.map((item) => (
							<li key={item.href}>
								<Link
									href={item.href}
									className={`o-navLink ${pathname === item.href ? 'is-active' : ''}`}
								>
									{item.label}
								</Link>
							</li>
						))}
					</ul>
				</nav>

				<div className="o-header__actions">
					<ThemeToggle />
					{!authResolved ? (
						<span className="o-header__placeholder" aria-hidden="true" />
					) : user ? (
						<>
							<Link href={getDashboardUrl(user)} className="o-btn o-btn--ghost o-btn--sm">
								Dashboard
							</Link>
							<button
								type="button"
								onClick={handleLogout}
								className="o-btn o-btn--solid o-btn--sm"
							>
								Sign Out
							</button>
						</>
					) : (
						<>
							<Link href="/login" className="o-btn o-btn--ghost o-btn--sm">
								Log In
							</Link>
							<Link href="/register" className="o-btn o-btn--solid o-btn--sm">
								Request Access
							</Link>
						</>
					)}
				</div>

				<button
					type="button"
					className="o-burger"
					aria-label={menuOpen ? 'Close menu' : 'Open menu'}
					aria-expanded={menuOpen}
					onClick={() => setMenuOpen((open) => !open)}
				>
					<span />
					<span />
					<span />
				</button>
			</div>

			<div className="o-header__rule" />

			{/* Mobile drawer */}
			<div className="o-drawer" hidden={!menuOpen}>
				<nav aria-label="Mobile">
					<ul>
						{navItems.map((item, index) => (
							<li key={item.href} style={{ '--i': index } as React.CSSProperties}>
								<Link href={item.href} className="o-drawer__link">
									<span className="o-drawer__index">
										{String(index + 1).padStart(2, '0')}
									</span>
									{item.label}
								</Link>
							</li>
						))}
					</ul>
				</nav>
				<div className="o-drawer__actions">
					{user ? (
						<button
							type="button"
							onClick={handleLogout}
							className="o-btn o-btn--solid"
						>
							Sign Out
						</button>
					) : (
						<>
							<Link href="/login" className="o-btn o-btn--ghost">
								Log In
							</Link>
							<Link href="/register" className="o-btn o-btn--gold">
								Request Access
							</Link>
						</>
					)}
				</div>
			</div>
		</header>
	);
};

export default Header;
