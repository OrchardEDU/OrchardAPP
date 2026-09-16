'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

/** Routes that render the art deco marketing surface. */
const MARKETING_ROUTES = new Set(['/', '/how-it-works', '/demo', '/login', '/register']);

interface ConditionalLayoutProps {
	children: React.ReactNode;
}

/**
 * Marketing pages and the app share one header and footer but need different
 * page-level spacing: marketing heroes run under a transparent header, while
 * dashboard routes need the fixed header's height reserved. The surface is
 * published as a data attribute so CSS can branch without duplicating layout.
 */
export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
	const pathname = usePathname();
	const surface = MARKETING_ROUTES.has(pathname) ? 'marketing' : 'app';

	return (
		<div className="layout-wrapper" data-surface={surface}>
			<Header />
			<main className="main-content">{children}</main>
			<Footer />
		</div>
	);
}
