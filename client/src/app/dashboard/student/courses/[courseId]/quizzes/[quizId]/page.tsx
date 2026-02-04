'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import './page.css';

export default function StudentQuizPage() {
	const params = useParams();
	const courseId = params.courseId as string;
	const quizId = params.quizId as string;

	return (
		<div className="quiz-page">
			<h1>Quiz: {quizId}</h1>
			<p>Take quiz for course: {courseId}</p>
			<div className="navigation">
				<Link href={`/dashboard/student/courses/${courseId}`}>Back to Course</Link>
			</div>
		</div>
	);
}
