'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { coursesApi } from '@/lib/api/courses';
import { quizzesApi } from '@/lib/api/courses/quizzes';
import { Course } from '@/types/course';
import { Quiz } from '@/types/quiz';
import './page.css';

export default function StudentCoursePage() {
	const params = useParams();
	const courseId = params.courseId as string;

	const [course, setCourse] = useState<Course | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [quizzes, setQuizzes] = useState<Quiz[]>([]);
	const [quizzesLoading, setQuizzesLoading] = useState(true);
	const [quizzesError, setQuizzesError] = useState<string | null>(null);

	useEffect(() => {
		const loadCourse = async () => {
			try {
				setIsLoading(true);
				setError(null);
				const data = await coursesApi.getCourse(courseId);
				if (!data) {
					setError('Course not found or you are not enrolled.');
				} else {
					setCourse(data);
				}
			} catch (err) {
				console.error('Failed to load course', err);
				setError('Failed to load course. Please try again.');
			} finally {
				setIsLoading(false);
			}
		};

		if (courseId) {
			loadCourse();
		}
	}, [courseId]);

	useEffect(() => {
		const loadQuizzes = async () => {
			try {
				setQuizzesLoading(true);
				setQuizzesError(null);
				const data = await quizzesApi.getCourseQuizzes(courseId);
				setQuizzes(data);
			} catch (err) {
				console.error('Failed to load quizzes', err);
				setQuizzesError('Failed to load quizzes. Please try again.');
			} finally {
				setQuizzesLoading(false);
			}
		};

		if (courseId) {
			loadQuizzes();
		}
	}, [courseId]);

	return (
		<div className="course-page">
			<div className="course-header">
				<div>
					<h1>{course ? course.name : 'Course'}</h1>
					{course && (
						<p className="course-subtitle">
							{course.description || 'No description provided yet.'}
						</p>
					)}
					{!course && !isLoading && !error && (
						<p className="course-subtitle">Course details will appear here.</p>
					)}
				</div>
				<div className="course-actions">
					<Link href="/dashboard/student" className="secondary-action-btn">
						Back to Dashboard
					</Link>
				</div>
			</div>

			{isLoading && <p className="status-text">Loading course...</p>}
			{error && !isLoading && <p className="status-text error-text">{error}</p>}

			{course && !isLoading && !error && (
				<div className="course-body">
					<div className="course-info-card">
						<h2>Course Overview</h2>
						<p>{course.description || 'No description provided yet.'}</p>
						<div className="course-meta-row">
							<span>
								Teacher: <strong>{course.teacherName || 'Unknown'}</strong>
							</span>
						</div>
					</div>

					<div className="quizzes-section">
						<div className="section-header">
							<h2>Quizzes {quizzes.length > 0 && <span className="count-badge">({quizzes.length})</span>}</h2>
						</div>

						{quizzesLoading && <p className="status-text">Loading quizzes...</p>}
						{quizzesError && !quizzesLoading && <p className="status-text error-text">{quizzesError}</p>}

						{!quizzesLoading && !quizzesError && (
							<div className="quizzes-grid">
								{quizzes.length === 0 ? (
									<div className="empty-state">
										<p>No published quizzes available</p>
									</div>
								) : (
									quizzes.map((quiz) => (
										<Link
											key={quiz.id}
											href={`/dashboard/student/courses/${courseId}/quizzes/${quiz.id}`}
											className="quiz-card"
										>
											<div className="quiz-card-header">
												<h3 className="quiz-card-title">{quiz.title}</h3>
											</div>
											{quiz.description && (
												<p className="quiz-card-description">
													{quiz.description.length > 100
														? `${quiz.description.substring(0, 100)}...`
														: quiz.description}
												</p>
											)}
											<div className="quiz-card-meta">
												{quiz.questionCount !== undefined && (
													<span>{quiz.questionCount} question{quiz.questionCount !== 1 ? 's' : ''}</span>
												)}
												{quiz.hasSubmission && <span className="submission-indicator">Submitted</span>}
												{quiz.isGraded && quiz.score !== undefined && quiz.maxScore !== undefined && (
													<span className="grade-indicator">
														Grade: {quiz.score} / {quiz.maxScore}
													</span>
												)}
											</div>
										</Link>
									))
								)}
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	);
}
