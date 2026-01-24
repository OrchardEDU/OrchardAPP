'use client';

import { usePathname } from 'next/navigation';
import ChatbotSidebar from '@/components/ChatbotSidebar';
import DashboardHeader from '@/components/DashboardHeader';

interface ConditionalLayoutProps {
	children: React.ReactNode;
}

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
	const pathname = usePathname();

	// Handle null pathname
	if (!pathname) {
		return <div className="landing-layout">{children}</div>;
	}

	// Show dashboard layout for dashboard routes and class routes
	const isDashboardRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/class');

	if (isDashboardRoute) {
		return (
			<div className="app">
				<div className="main-content">
					<DashboardHeader />
					{children}
				</div>
				<ChatbotSidebar />
			</div>
		);
	}

	// For landing page and other routes, show just the content
	return <div className="landing-layout">{children}</div>;
}
