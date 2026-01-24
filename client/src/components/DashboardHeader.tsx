'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useTheme } from '@/contexts/ThemeContext';
import ClientThemeToggle from './ClientThemeToggle';

export default function DashboardHeader() {
	const router = useRouter();
	const pathname = usePathname();
	const { theme } = useTheme();
	const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);
	const [isCircleDisappearing, setIsCircleDisappearing] = useState(false);
	const [currentTitle, setCurrentTitle] = useState('Dashboard');
	const [isTitleChanging, setIsTitleChanging] = useState(false);

	const handleLogoClick = () => {
		router.push('/');
	};

	// Update title based on current path
	useEffect(() => {
		const getPageTitle = (path: string) => {
			switch (path) {
				case '/':
					return 'Dashboard';
				case '/lesson-plan':
					return 'Assignment';
				case '/generate-project':
					return 'Project';
				case '/multiple-choice-quiz':
					return 'Quiz';
				case '/open-ended-quiz':
					return 'Test';
				default:
					return 'Dashboard';
			}
		};

		// Handle null pathname
		if (!pathname) {
			return;
		}

		const newTitle = getPageTitle(pathname);
		if (newTitle !== currentTitle) {
			setIsTitleChanging(true);
			setTimeout(() => {
				setCurrentTitle(newTitle);
				setIsTitleChanging(false);
			}, 150); // Half of animation duration for smooth transition
		}
	}, [pathname, currentTitle]);

	const handleSidebarToggle = () => {
		if (isSidebarMinimized) {
			setIsCircleDisappearing(true);
			setTimeout(() => {
				setIsSidebarMinimized(false);
				setIsCircleDisappearing(false);
			}, 150);
		} else {
			setIsSidebarMinimized(true);
		}
	};

	// Select logo based on theme
	const logoSrc = theme === 'dark' ? '/orchardedulogowhite.png' : '/orchardedulogo.png';

	return (
		<div className="dashboard-header">
			<div className="logo-section" onClick={handleLogoClick}>
				<Image
					src={logoSrc}
					alt="OrchardEDU Logo"
					className="header-logo"
					width={32}
					height={32}
				/>
				<span className="service-name">EggplantEDU</span>
			</div>
			<h1 className={`page-title ${isTitleChanging ? 'changing' : ''}`}>{currentTitle}</h1>
			<div className="account-section">
				<ClientThemeToggle />
				<div className="account-settings">
					<div className="profile-picture">
						<div className="profile-placeholder">👤</div>
					</div>
					<div className="account-info">
						<span className="account-name">John Doe</span>
						<span className="account-role">Teacher</span>
					</div>
				</div>
				{isSidebarMinimized && (
					<div
						className={`minimized-circle ${isCircleDisappearing ? 'disappearing' : ''}`}
						onClick={handleSidebarToggle}
					>
						<span className="minimized-icon">💬</span>
					</div>
				)}
			</div>
		</div>
	);
}
