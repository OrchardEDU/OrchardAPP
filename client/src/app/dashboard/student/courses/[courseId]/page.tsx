'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import './page.css';

export default function StudentCoursePage() {
	const params = useParams();
	const courseId = params.courseId as string;

	return (
		<div className="course-page">
			<h1>Course: {courseId}</h1>
			<p>Course overview for students.</p>
			<div className="navigation">
				<Link href="/dashboard/student">Back to Dashboard</Link>
			</div>
		</div>
	);
}
