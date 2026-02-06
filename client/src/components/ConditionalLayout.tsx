'use client';

interface ConditionalLayoutProps {
	children: React.ReactNode;
}

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
	// Show Header/Footer for all routes (they're now in root layout)
	return <>{children}</>;
}
