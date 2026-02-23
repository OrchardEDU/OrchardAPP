'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { quizzesApi } from '@/lib/api/courses/quizzes';
import { Submission } from '@/types/submission';
import './page.css';

export default function SubmissionGradingPage() {
	const params = useParams();
	const courseId = params.courseId as string;
	const quizId = params.quizId as string;
	const submissionId = params.submissionId as string;
	const router = useRouter();

	const [submission, setSubmission] = useState<Submission | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [isSaving, setIsSaving] = useState(false);
	const [pointsAwarded, setPointsAwarded] = useState<Record<number, number>>({});

	useEffect(() => {
		const loadSubmission = async () => {
			try {
				setIsLoading(true);
				setError(null);
				const data = await quizzesApi.getSubmissionDetail(courseId, quizId, submissionId);
				if (!data) {
					setError('Submission not found or you do not have access.');
				} else {
					setSubmission(data);
					// Initialize points_awarded from existing submission
					const initialPoints: Record<number, number> = {};
					data.answers.forEach(answer => {
						initialPoints[answer.questionIndex] = answer.pointsAwarded || 0;
					});
					setPointsAwarded(initialPoints);
				}
			} catch (err) {
				console.error('Failed to load submission', err);
				setError('Failed to load submission. Please try again.');
			} finally {
				setIsLoading(false);
			}
		};

		if (courseId && quizId && submissionId) {
			loadSubmission();
		}
	}, [courseId, quizId, submissionId]);

	const calculateTotal = () => {
		return Object.values(pointsAwarded).reduce((sum, points) => sum + points, 0);
	};

	const handlePointsChange = (questionIndex: number, value: string) => {
		const numValue = parseFloat(value) || 0;
		setPointsAwarded(prev => ({
			...prev,
			[questionIndex]: numValue,
		}));
	};

	const handleSaveDraft = async () => {
		if (!submission) return;

		try {
			setIsSaving(true);
			setError(null);

			const answers = Object.entries(pointsAwarded).map(([questionIndex, points]) => ({
				questionIndex: parseInt(questionIndex, 10),
				pointsAwarded: points,
			}));

			// For draft, we can save without marking as graded
			// But since the API requires grading, we'll just save the points
			// The actual grading will happen on "Submit grade"
			// For now, we'll just show a message that draft saving isn't implemented yet
			// and they should use "Submit grade" to save
			alert('Draft saving is not yet implemented. Use "Submit grade" to save your grading.');
		} catch (err) {
			console.error('Failed to save draft', err);
			setError('Failed to save draft. Please try again.');
		} finally {
			setIsSaving(false);
		}
	};

	const handleSubmitGrade = async () => {
		if (!submission) return;

		try {
			setIsSaving(true);
			setError(null);

			const answers = Object.entries(pointsAwarded).map(([questionIndex, points]) => ({
				questionIndex: parseInt(questionIndex, 10),
				pointsAwarded: points,
			}));

			const gradedSubmission = await quizzesApi.gradeSubmission(courseId, quizId, submissionId, answers);

			if (!gradedSubmission) {
				setError('Failed to submit grade. Please try again.');
				return;
			}

			// Redirect back to submissions list
			router.push(`/dashboard/teacher/courses/${courseId}/quizzes/${quizId}?view=submissions`);
		} catch (err) {
			console.error('Failed to submit grade', err);
			setError('Failed to submit grade. Please try again.');
		} finally {
			setIsSaving(false);
		}
	};

	if (isLoading) {
		return (
			<div className="grading-page">
				<p>Loading submission...</p>
			</div>
		);
	}

	if (error && !submission) {
		return (
			<div className="grading-page">
				<div className="grading-header">
					<div>
						<h1>Grade Submission</h1>
						<p className="error-text">{error}</p>
					</div>
					<div className="grading-actions">
						<Link href={`/dashboard/teacher/courses/${courseId}/quizzes/${quizId}`} className="secondary-action-btn">
							Back to Quiz
						</Link>
					</div>
				</div>
			</div>
		);
	}

	if (!submission || !submission.quizQuestions) {
		return (
			<div className="grading-page">
				<p>Submission data not available.</p>
			</div>
		);
	}

	const maxScore = submission.quizQuestions.reduce((sum, q) => sum + q.points, 0);
	const totalScore = calculateTotal();

	return (
		<div className="grading-page">
			<div className="grading-header">
				<div>
					<h1>Grade Submission</h1>
					<p className="grading-subtitle">
						{submission.quizTitle || 'Quiz'} - {submission.studentName || 'Student'}
					</p>
					<p className="grading-meta">
						Submitted: {new Date(submission.submittedAt).toLocaleString()}
					</p>
				</div>
				<div className="grading-actions">
					<Link href={`/dashboard/teacher/courses/${courseId}/quizzes/${quizId}?view=submissions`} className="secondary-action-btn">
						Back to Submissions
					</Link>
				</div>
			</div>

			{error && <p className="form-error">{error}</p>}

			<div className="grading-body">
				<div className="grading-questions">
					{submission.quizQuestions.map((question, index) => {
						const answer = submission.answers.find(a => a.questionIndex === index);
						const currentPoints = pointsAwarded[index] ?? (answer?.pointsAwarded || 0);

						return (
							<div key={index} className="grading-question-card">
								<div className="grading-question-header">
									<h3>Question {index + 1}</h3>
									<span className="grading-question-points">
										{currentPoints} / {question.points} pts
									</span>
								</div>
								<div className="grading-question-text">
									{question.question}
								</div>
								<div className="grading-answer-section">
									<label className="grading-answer-label">Student's Answer:</label>
									<div className="grading-answer-text">
										{answer?.answer || 'No answer provided'}
									</div>
								</div>
								<div className="grading-points-input">
									<label htmlFor={`points-${index}`} className="grading-points-label">
										Points Awarded:
									</label>
									<input
										id={`points-${index}`}
										type="number"
										min={0}
										max={question.points}
										value={currentPoints}
										onChange={e => handlePointsChange(index, e.target.value)}
										className="grading-points-field"
									/>
									<span className="grading-points-max">/ {question.points}</span>
								</div>
							</div>
						);
					})}
				</div>

				<div className="grading-summary-card">
					<h3>Grading Summary</h3>
					<div className="grading-summary-row">
						<span>Total Points Awarded:</span>
						<strong>{totalScore}</strong>
					</div>
					<div className="grading-summary-row">
						<span>Maximum Possible:</span>
						<strong>{maxScore}</strong>
					</div>
					<div className="grading-summary-row grading-summary-total">
						<span>Score:</span>
						<strong>{totalScore} / {maxScore}</strong>
					</div>
				</div>

				<div className="grading-actions-footer">
					<button
						type="button"
						className="draft-btn"
						onClick={handleSaveDraft}
						disabled={isSaving}
					>
						Save Draft
					</button>
					<button
						type="button"
						className="submit-grade-btn"
						onClick={handleSubmitGrade}
						disabled={isSaving}
					>
						{isSaving ? 'Submitting...' : 'Submit Grade'}
					</button>
				</div>
			</div>
		</div>
	);
}
