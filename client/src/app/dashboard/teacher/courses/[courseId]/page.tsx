'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import './page.css';

export default function TeacherCoursePage() {
	const params = useParams();
	const courseId = params.courseId as string;

	return (
		<div className="course-page">
			<h1>Course: {courseId}</h1>
			<p>Course dashboard for teachers.</p>
			<div className="navigation">
				<Link href="/dashboard/teacher/courses/create">Create Quiz</Link>
				<Link href="/dashboard/teacher">Back to Dashboard</Link>
			</div>
		</div>
	);
}
