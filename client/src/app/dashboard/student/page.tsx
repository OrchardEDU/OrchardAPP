'use client';

import Link from 'next/link';
import './page.css';

export default function StudentDashboardPage() {
	return (
		<div className="dashboard-page">
			<h1>Student Dashboard</h1>
			<p>Welcome to your dashboard. Here you can view your enrolled courses.</p>
			<div className="navigation">
				<Link href="/">Back to Home</Link>
			</div>
		</div>
	);
}
