'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { quizzesApi } from '@/lib/api/courses/quizzes';
import { Quiz } from '@/types/quiz';
import './page.css';

export default function StudentQuizPage() {
	const params = useParams();
	const courseId = params.courseId as string;
	const quizId = params.quizId as string;
	const router = useRouter();

	const [quiz, setQuiz] = useState<Quiz | null>(null);
	const [submission, setSubmission] = useState<any | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isLoadingSubmission, setIsLoadingSubmission] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [answers, setAnswers] = useState<string[]>([]);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submitMessage, setSubmitMessage] = useState<string | null>(null);

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
					setAnswers(new Array(data.questions.length).fill(''));
				}
			} catch (err) {
				console.error('Failed to load quiz', err);
				setError('Failed to load quiz. Please try again.');
			} finally {
				setIsLoading(false);
			}
		};

		const loadSubmission = async () => {
			try {
				setIsLoadingSubmission(true);
				const data = await quizzesApi.getMySubmission(courseId, quizId);
				setSubmission(data);
			} catch (err) {
				console.error('Failed to load submission', err);
				// If submission doesn't exist or isn't graded, that's fine - just set to null
				setSubmission(null);
			} finally {
				setIsLoadingSubmission(false);
			}
		};

		if (courseId && quizId) {
			loadQuiz();
			loadSubmission();
		}
	}, [courseId, quizId]);

	// Warn on unload if quiz not submitted and not already graded
	useEffect(() => {
		const handleBeforeUnload = (e: BeforeUnloadEvent) => {
			// Don't warn if submitting, no quiz, or if submission exists (already graded)
			if (isSubmitting || !quiz || submission) return;
			e.preventDefault();
			e.returnValue = '';
		};

		window.addEventListener('beforeunload', handleBeforeUnload);
		return () => {
			window.removeEventListener('beforeunload', handleBeforeUnload);
		};
	}, [isSubmitting, quiz, submission]);

	const handleChangeAnswer = (index: number, value: string) => {
		setAnswers(prev => prev.map((a, i) => (i === index ? value : a)));
	};

	const submitCurrentAnswers = async () => {
		if (!quiz) return false;
		try {
			setIsSubmitting(true);
			setSubmitMessage(null);
			const payload = quiz.questions.map((_, index) => ({
				questionIndex: index,
				answer: answers[index] || '',
			}));
			const submission = await quizzesApi.submitQuiz(courseId, quizId, payload);
			if (!submission) {
				setSubmitMessage('Failed to submit quiz. Please try again.');
				return false;
			}
			// Redirect to course dashboard after successful submission
			router.push(`/dashboard/student/courses/${courseId}`);
			return true;
		} catch (err) {
			console.error('Failed to submit quiz', err);
			setSubmitMessage('Failed to submit quiz. Please try again.');
			return false;
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		await submitCurrentAnswers();
	};

	const handleBackClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
		// If submission exists (graded), allow normal navigation
		if (submission) {
			return; // Allow normal link navigation
		}
		
		if (!quiz) return;
		e.preventDefault();
		const confirmLeave = window.confirm(
			'If you leave this page, your current answers will be submitted. Do you want to submit and leave now?'
		);
		if (confirmLeave) {
			await submitCurrentAnswers();
			// submitCurrentAnswers will handle the redirect
		}
		// If cancelled, stay on page
	};

	return (
		<div className="quiz-page">
			<div className="quiz-header">
				<div>
					<h1>{quiz ? quiz.title : 'Quiz'}</h1>
					{!quiz && !isLoading && !error && (
						<p className="quiz-subtitle">Quiz details will appear here.</p>
					)}
				</div>
				<div className="quiz-actions">
					<Link
						href={`/dashboard/student/courses/${courseId}`}
						className="secondary-action-btn"
						onClick={handleBackClick}
					>
						Back to Course
					</Link>
				</div>
			</div>

			{isLoading && <p className="status-text">Loading quiz...</p>}
			{error && !isLoading && <p className="status-text error-text">{error}</p>}

			{quiz && !isLoading && !error && (
				<>
					{/* Show graded view if submission exists */}
					{submission && !isLoadingSubmission ? (
						<div className="quiz-body">
							<div className="quiz-info-card">
								<h2>Quiz Results</h2>
								<p>Your quiz has been graded.</p>
								<div className="quiz-meta-row">
									<span>
										Score: <strong>{submission.score} / {submission.maxScore}</strong>
									</span>
									<span>
										Submitted: <strong>{new Date(submission.submittedAt).toLocaleString()}</strong>
									</span>
								</div>
							</div>

							<div className="student-quiz-questions">
								{submission.quizQuestions && submission.quizQuestions.map((q: any, index: number) => {
									const answer = submission.answers.find((a: any) => a.questionIndex === index);
									return (
										<div key={index} className="student-question-card graded-question-card">
											<div className="student-question-header">
												<span className="student-question-number">Question {index + 1}</span>
												<span className="student-question-points">
													{answer?.pointsAwarded || 0} / {q.points} pts
												</span>
											</div>
											<div className="student-question-text">{q.question}</div>
											<div className="graded-answer-section">
												<label className="graded-answer-label">Your Answer:</label>
												<div className="graded-answer-text">{answer?.answer || 'No answer provided'}</div>
											</div>
										</div>
									);
								})}
							</div>
						</div>
					) : (
						/* Show quiz form if no submission or not graded */
						<>
						{quiz.hasSubmission && !submission ? (
							/* Show awaiting grading message if submitted but not graded */
							<div className="quiz-body">
								<div className="quiz-info-card">
									<h2>Quiz Submitted</h2>
									<p>Your quiz has been submitted and is awaiting grading. You will be able to view your results once your teacher has graded it.</p>
									<div className="quiz-meta-row">
										<span className="submission-indicator">
											<strong>Awaiting Grading</strong>
										</span>
									</div>
								</div>
							</div>
						) : (
							/* Show quiz form if not submitted */
							<form className="quiz-body" onSubmit={handleSubmit}>
					<div className="quiz-info-card">
						<h2>Quiz Overview</h2>
						{quiz.description && <p>{quiz.description}</p>}
						<div className="quiz-meta-row">
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
						</div>
					</div>

					<div className="student-quiz-questions">
						{quiz.questions.map((q, index) => (
							<div key={index} className="student-question-card">
								<div className="student-question-header">
									<span className="student-question-number">Question {index + 1}</span>
									<span className="student-question-points">{q.points} pts</span>
								</div>
								<div className="student-question-text">{q.question}</div>
								<textarea
									className="student-answer-textarea"
									rows={4}
									value={answers[index] || ''}
									onChange={e => handleChangeAnswer(index, e.target.value)}
									placeholder="Type your answer here..."
								/>
							</div>
						))}
					</div>

					{submitMessage && (
						<p className={`status-text ${submitMessage.includes('Failed') ? 'error-text' : ''}`}>
							{submitMessage}
						</p>
					)}

					<div className="quiz-submit-actions">
						<button
							type="submit"
							className="primary-action-btn"
							disabled={isSubmitting}
						>
							{isSubmitting ? 'Submitting...' : 'Submit Quiz'}
						</button>
					</div>
				</form>
						)}
					</>
					)}
				</>
			)}
		</div>
	);
}
