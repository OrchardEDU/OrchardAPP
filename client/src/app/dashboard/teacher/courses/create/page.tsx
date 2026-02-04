'use client';

import Link from 'next/link';
import './page.css';

export default function CreateCoursePage() {
	return (
		<div className="create-course-page">
			<h1>Create New Course</h1>
			<p>Create a new course for your students.</p>
			<div className="navigation">
				<Link href="/dashboard/teacher">Back to Dashboard</Link>
			</div>
		</div>
	);
}
