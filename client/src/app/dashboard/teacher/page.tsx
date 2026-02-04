'use client';

import Link from 'next/link';
import './page.css';

export default function TeacherDashboardPage() {
	return (
		<div className="dashboard-page">
			<h1>Teacher Dashboard</h1>
			<p>Welcome to your dashboard. Here you can manage your courses.</p>
			<div className="navigation">
				<Link href="/dashboard/teacher/courses/create">Create New Course</Link>
				<Link href="/">Back to Home</Link>
			</div>
		</div>
	);
}
