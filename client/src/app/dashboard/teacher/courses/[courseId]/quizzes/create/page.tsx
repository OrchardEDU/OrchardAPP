'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import './page.css';

export default function CreateQuizPage() {
	const params = useParams();
	const courseId = params.courseId as string;

	return (
		<div className="create-quiz-page">
			<h1>Create Quiz</h1>
			<p>Create a new quiz for course: {courseId}</p>
			<div className="navigation">
				<Link href={`/dashboard/teacher/courses/${courseId}`}>Back to Course</Link>
			</div>
		</div>
	);
}
