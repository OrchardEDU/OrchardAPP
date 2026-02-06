'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import './page.css';

export default function QuizSubmissionsPage() {
	const params = useParams();
	const courseId = params.courseId as string;
	const quizId = params.quizId as string;

	return (
		<div className="submissions-page">
			<h1>Quiz Submissions</h1>
			<p>View submissions for quiz: {quizId} in course: {courseId}</p>
			<div className="navigation">
				<Link href={`/dashboard/teacher/courses/${courseId}/quizzes/${quizId}`}>Back to Quiz</Link>
			</div>
		</div>
	);
}
