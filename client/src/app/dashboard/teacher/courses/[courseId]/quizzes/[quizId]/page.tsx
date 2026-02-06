'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { quizzesApi } from '@/lib/api/courses/quizzes';
import { Quiz } from '@/types/quiz';
import './page.css';

export default function TeacherQuizPage() {
	const params = useParams();
	const courseId = params.courseId as string;
	const quizId = params.quizId as string;

	const [quiz, setQuiz] = useState<Quiz | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [activeView, setActiveView] = useState<'details' | 'submissions'>('details');
	const [submissions, setSubmissions] = useState<any[]>([]);
	const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(false);
	const [submissionsError, setSubmissionsError] = useState<string | null>(null);

	useEffect(() => {
		const loadQuiz = async () => {
			try {
				setIsLoading(true);
				setError(null);
				const data = await quizzesApi.getQuiz(courseId, quizId);
				if (!data) {
					setError('Quiz not found or you do not have access.');
				} else {
					setQuiz(data);
				}
			} catch (err) {
				console.error('Failed to load quiz', err);
				setError('Failed to load quiz. Please try again.');
			} finally {
				setIsLoading(false);
			}
		};

		if (courseId && quizId) {
			loadQuiz();
		}
	}, [courseId, quizId]);

	const loadSubmissions = async () => {
		if (!quiz || !quiz.published) return;
		try {
			setIsLoadingSubmissions(true);
			setSubmissionsError(null);
			const data = await quizzesApi.getQuizSubmissions(courseId, quizId);
			setSubmissions(data);
		} catch (err) {
			console.error('Failed to load submissions', err);
			setSubmissionsError('Failed to load submissions. Please try again.');
		} finally {
			setIsLoadingSubmissions(false);
		}
	};

	const handleToggleView = async () => {
		if (!quiz || !quiz.published) return;
		if (activeView === 'details') {
			setActiveView('submissions');
			await loadSubmissions();
		} else {
			setActiveView('details');
		}
	};

	return (
		<div className="quiz-page">
			<div className="quiz-header">
				<div>
					<h1>{quiz ? quiz.title : 'Quiz'}</h1>
					{quiz && (
						<div className="quiz-header-badges">
							<span className={`status-badge ${quiz.published ? 'published' : 'unpublished'}`}>
								{quiz.published ? 'Published' : 'Unpublished'}
							</span>
						</div>
					)}
					{!quiz && !isLoading && !error && (
						<p className="quiz-subtitle">Quiz details will appear here.</p>
					)}
				</div>
				<div className="quiz-actions">
					{quiz && quiz.published && (
						<button
							type="button"
							className="toggle-view-btn"
							onClick={handleToggleView}
						>
							{activeView === 'details' ? 'View Submissions' : 'View Quiz Details'}
						</button>
					)}
					<Link href={`/dashboard/teacher/courses/${courseId}`} className="secondary-action-btn">
						Back to Course
					</Link>
				</div>
			</div>

			{isLoading && <p className="status-text">Loading quiz...</p>}
			{error && !isLoading && <p className="status-text error-text">{error}</p>}

			{quiz && !isLoading && !error && (
				<div className="quiz-body">
					<div className="quiz-info-card">
						<h2>Quiz Overview</h2>
						{quiz.description && <p>{quiz.description}</p>}
						<div className="quiz-meta-row">
							<span>
								Status: <strong>{quiz.published ? 'Published' : 'Unpublished'}</strong>
							</span>
							{quiz.dueDate && (
								<span>
									Due date: <strong>{new Date(quiz.dueDate).toLocaleDateString()}</strong>
								</span>
							)}
							{quiz.questionCount !== undefined && (
								<span>
									Questions: <strong>{quiz.questionCount}</strong>
								</span>
							)}
							{quiz.submissionCount !== undefined && (
								<span>
									Submissions: <strong>{quiz.submissionCount}</strong>
								</span>
							)}
						</div>
					</div>

					{activeView === 'details' && (
						<div className="quiz-questions-card">
							<h3>Questions</h3>
							{(!quiz.questions || quiz.questions.length === 0) && (
								<p className="status-text">No questions have been added to this quiz yet.</p>
							)}
							{quiz.questions && quiz.questions.length > 0 && (
								<ol className="quiz-questions-list">
									{quiz.questions.map((q, index) => (
										<li key={index} className="quiz-question-item">
											<div className="quiz-question-text">{q.question}</div>
											<div className="quiz-question-meta">{q.points} pts</div>
										</li>
									))}
								</ol>
							)}
						</div>
					)}

					{activeView === 'submissions' && (
						<div className="quiz-submissions-card">
							<h3>Submissions</h3>
							{isLoadingSubmissions && <p className="status-text">Loading submissions...</p>}
							{submissionsError && <p className="status-text error-text">{submissionsError}</p>}
							{!isLoadingSubmissions && !submissionsError && submissions.length === 0 && (
								<p className="status-text">No submissions yet.</p>
							)}
							{!isLoadingSubmissions && !submissionsError && submissions.length > 0 && (
								<ul className="quiz-submissions-list">
									{submissions.map(sub => (
										<li key={sub.id} className="quiz-submission-item">
											<div className="quiz-submission-main">
												<div className="quiz-submission-name">
													{sub.studentName || 'Student'}
												</div>
												<div className="quiz-submission-email">
													{sub.studentEmail}
												</div>
											</div>
											<div className="quiz-submission-meta">
												<span>
													Score:{' '}
													<strong>
														{sub.score} / {sub.maxScore}
													</strong>
												</span>
												<span>
													Submitted:{' '}
													<strong>
														{new Date(sub.submittedAt).toLocaleString()}
													</strong>
												</span>
											</div>
										</li>
									))}
								</ul>
							)}
						</div>
					)}
				</div>
			)}
		</div>
	);
}
