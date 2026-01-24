'use client';

import dynamic from 'next/dynamic';

const ThemeToggle = dynamic(() => import('./ThemeToggle'), {
	ssr: false,
	loading: () => (
		<div className="theme-toggle">
			<div className="theme-toggle-icon">
				<svg
					width="18"
					height="18"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					className="theme-icon"
				>
					<circle cx="12" cy="12" r="5" />
				</svg>
			</div>
		</div>
	),
});

export default function ClientThemeToggle() {
	return <ThemeToggle />;
}
