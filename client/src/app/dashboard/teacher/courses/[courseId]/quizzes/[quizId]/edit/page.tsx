'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { quizzesApi } from '@/lib/api/courses/quizzes';
import { aiApi } from '@/lib/api/ai';
import { Quiz } from '@/types/quiz';
import '../create/page.css';

export default function EditQuizPage() {
	const params = useParams();
	const courseId = params.courseId as string;
	const quizId = params.quizId as string;
	const router = useRouter();

	const [quiz, setQuiz] = useState<Quiz | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [title, setTitle] = useState('');
	const [description, setDescription] = useState('');
	const [published, setPublished] = useState(false);
	const [dueDate, setDueDate] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	type NewQuestion = {
		question: string;
		points: number;
	};

	const [questions, setQuestions] = useState<NewQuestion[]>([]);
	const [isGenerating, setIsGenerating] = useState(false);
	const [showAIGenerate, setShowAIGenerate] = useState(false);
	const [aiTopic, setAiTopic] = useState('');
	const [aiNumQuestions, setAiNumQuestions] = useState(3);

	// Load existing quiz data
	useEffect(() => {
		const loadQuiz = async () => {
			try {
				setIsLoading(true);
				setError(null);
				const quizData = await quizzesApi.getQuiz(courseId, quizId);
				
				if (!quizData) {
					setError('Quiz not found or you do not have access.');
					return;
				}

				// Check if quiz is published - if so, redirect back
				if (quizData.published) {
					setError('Cannot edit a published quiz.');
					setTimeout(() => {
						router.push(`/dashboard/teacher/courses/${courseId}/quizzes/${quizId}`);
					}, 2000);
					return;
				}

				setQuiz(quizData);
				setTitle(quizData.title || '');
				setDescription(quizData.description || '');
				setPublished(quizData.published || false);
				
				// Format due date for datetime-local input
				if (quizData.dueDate) {
					const date = new Date(quizData.dueDate);
					const year = date.getFullYear();
					const month = String(date.getMonth() + 1).padStart(2, '0');
					const day = String(date.getDate()).padStart(2, '0');
					const hours = String(date.getHours()).padStart(2, '0');
					const minutes = String(date.getMinutes()).padStart(2, '0');
					setDueDate(`${year}-${month}-${day}T${hours}:${minutes}`);
				}

				// Load questions from quiz data
				if (quizData.questions && Array.isArray(quizData.questions)) {
					setQuestions(quizData.questions.map(q => ({
						question: q.question || '',
						points: q.points || 1,
					})));
				}
			} catch (err) {
				console.error('Failed to load quiz', err);
				setError('Failed to load quiz. Please try again.');
			} finally {
				setIsLoading(false);
			}
		};

		loadQuiz();
	}, [courseId, quizId, router]);

	const handleAddQuestion = () => {
		setQuestions(prev => [...prev, { question: '', points: 1 }]);
	};

	const handleUpdateQuestion = (index: number, field: keyof NewQuestion, value: string) => {
		setQuestions(prev =>
			prev.map((q, i) =>
				i === index
					? {
							...q,
							[field]: field === 'points' ? Number(value) || 0 : value,
					  }
					: q
			)
		);
	};

	const handleDeleteQuestion = (index: number) => {
		setQuestions(prev => prev.filter((_, i) => i !== index));
	};

	const handleGenerateQuestions = async () => {
		if (!aiTopic.trim()) {
			setError('Please enter a topic for question generation.');
			return;
		}

		setIsGenerating(true);
		setError(null);

		try {
			const generatedQuestions = await aiApi.generateQuestions(
				aiTopic.trim(),
				aiNumQuestions,
				courseId
			);

			if (generatedQuestions.length === 0) {
				setError('Failed to generate questions. Please try again.');
				return;
			}

			// Add generated questions to the questions list with default points of 1
			const newQuestions = generatedQuestions.map(q => ({
				question: q.question,
				points: 1,
			}));

			setQuestions(prev => [...prev, ...newQuestions]);
			
			// Reset AI form and hide AI generation card
			setAiTopic('');
			setAiNumQuestions(3);
			setShowAIGenerate(false);
		} catch (err) {
			console.error('Failed to generate questions', err);
			setError('Failed to generate questions. Please try again.');
		} finally {
			setIsGenerating(false);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);

		const trimmedTitle = title.trim();
		if (!trimmedTitle) {
			setError('Quiz title is required.');
			return;
		}

		// Prevent editing if quiz is published
		if (quiz?.published) {
			setError('Cannot edit a published quiz.');
			return;
		}

		try {
			setIsSubmitting(true);
			const updatedQuiz = await quizzesApi.updateQuiz(courseId, quizId, {
				title: trimmedTitle,
				description: description.trim(),
				published,
				dueDate: dueDate ? new Date(dueDate).toISOString() : null,
				questions: questions.map(q => ({
					question: q.question.trim(),
					points: q.points || 0,
				})),
			});

			if (!updatedQuiz) {
				setError('Failed to update quiz. Please try again.');
				return;
			}

			// Redirect to the quiz page
			router.push(`/dashboard/teacher/courses/${courseId}/quizzes/${quizId}`);
		} catch (err) {
			console.error('Failed to update quiz', err);
			setError('Failed to update quiz. Please try again.');
		} finally {
			setIsSubmitting(false);
		}
	};

	if (isLoading) {
		return (
			<div className="create-quiz-page">
				<p>Loading quiz...</p>
			</div>
		);
	}

	if (error && !quiz) {
		return (
			<div className="create-quiz-page">
				<div className="create-quiz-header">
					<div>
						<h1>Edit Quiz</h1>
						<p className="form-error">{error}</p>
					</div>
					<div className="create-quiz-actions">
						<Link href={`/dashboard/teacher/courses/${courseId}`} className="secondary-action-btn">
							Back to Course
						</Link>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="create-quiz-page">
			<div className="create-quiz-header">
				<div>
					<h1>Edit Quiz</h1>
					<p>Update your quiz details and questions.</p>
				</div>
				<div className="create-quiz-actions">
					<Link href={`/dashboard/teacher/courses/${courseId}/quizzes/${quizId}`} className="secondary-action-btn">
						Back to Quiz
					</Link>
				</div>
			</div>

			<form className="create-quiz-form" onSubmit={handleSubmit}>
				{/* Quiz details */}
				<div className="form-field">
					<label htmlFor="quiz-title" className="form-label">
						Quiz Title<span className="required">*</span>
					</label>
					<input
						id="quiz-title"
						type="text"
						value={title}
						onChange={e => setTitle(e.target.value)}
						className="form-input"
						placeholder="e.g. Chapter 1 Quiz"
						required
					/>
				</div>

				<div className="form-field">
					<label htmlFor="quiz-description" className="form-label">
						Description
					</label>
					<textarea
						id="quiz-description"
						value={description}
						onChange={e => setDescription(e.target.value)}
						className="form-textarea"
						placeholder="Optional description to help students understand what this quiz covers."
						rows={5}
					/>
				</div>

				<div className="form-field">
					<label htmlFor="quiz-due-date" className="form-label">
						Due Date
					</label>
					<input
						id="quiz-due-date"
						type="datetime-local"
						value={dueDate}
						onChange={e => setDueDate(e.target.value)}
						className="form-input"
					/>
				</div>

				<div className="form-field">
					<label className="form-checkbox-label">
						<input
							type="checkbox"
							checked={published}
							onChange={e => setPublished(e.target.checked)}
							className="form-checkbox"
						/>
						<span>Publish quiz (make it visible to students)</span>
					</label>
				</div>

				{/* Questions section */}
				<div className="questions-section">
					<div className="questions-section-header">
						<h2>Questions</h2>
						<p>Add open-ended questions with point values. Question numbers are assigned automatically.</p>
					</div>

					{questions.length === 0 && (
						<div className="question-card question-card-empty">
							<p className="question-empty-title">No questions yet</p>
							<p className="question-empty-text">
								Start by adding a question. You can always edit or remove questions later.
							</p>
						</div>
					)}

					<div className="questions-list">
						{questions.map((q, index) => (
							<div key={index} className="question-card">
								<div className="question-card-header">
									<span className="question-number">Question {index + 1}</span>
									<button
										type="button"
										className="question-delete-btn"
										onClick={() => handleDeleteQuestion(index)}
									>
										Delete question
									</button>
								</div>
								<div className="question-card-body">
									<div className="form-field">
										<label className="form-label">Question text</label>
										<textarea
											value={q.question}
											onChange={e => handleUpdateQuestion(index, 'question', e.target.value)}
											className="form-textarea"
											placeholder="Enter the question students should answer"
											rows={3}
										/>
									</div>
									<div className="form-field question-points-field">
										<label className="form-label">Points</label>
										<input
											type="number"
											min={1}
											value={q.points}
											onChange={e => handleUpdateQuestion(index, 'points', e.target.value)}
											className="form-input"
										/>
									</div>
								</div>
							</div>
						))}

						{showAIGenerate ? (
							<div className="ai-generate-card">
								<div className="ai-generate-header">
									<h3 className="ai-generate-title">AI Question Generation</h3>
									<button
										type="button"
										className="ai-generate-close"
										onClick={() => {
											setShowAIGenerate(false);
											setAiTopic('');
											setAiNumQuestions(3);
										}}
									>
										×
									</button>
								</div>
								<div className="ai-generate-body">
									<div className="form-field">
										<label className="form-label">Topic</label>
										<input
											type="text"
											value={aiTopic}
											onChange={e => setAiTopic(e.target.value)}
											className="form-input"
											placeholder="e.g. Photosynthesis, World War II, Calculus derivatives"
											disabled={isGenerating}
										/>
									</div>
									<div className="form-field">
										<label className="form-label">Number of Questions</label>
										<select
											value={aiNumQuestions}
											onChange={e => setAiNumQuestions(Number(e.target.value))}
											className="form-input"
											disabled={isGenerating}
										>
											{Array.from({ length: 20 }, (_, i) => i + 1).map(num => (
												<option key={num} value={num}>
													{num}
												</option>
											))}
										</select>
									</div>
									<button
										type="button"
										className="ai-generate-btn"
										onClick={handleGenerateQuestions}
										disabled={isGenerating || !aiTopic.trim()}
									>
										{isGenerating ? 'Generating...' : 'Generate Questions'}
									</button>
								</div>
							</div>
						) : (
							<div className="add-question-buttons">
								<button
									type="button"
									className="add-question-card"
									onClick={handleAddQuestion}
								>
									<span className="add-question-plus">+</span>
									<span>Add Question</span>
								</button>
								<button
									type="button"
									className="add-question-card add-question-ai"
									onClick={() => setShowAIGenerate(true)}
								>
									<span className="add-question-brain">🧠</span>
									<span>Generate with AI</span>
								</button>
							</div>
						)}
					</div>
				</div>

				{error && <p className="form-error">{error}</p>}

				<div className="form-actions">
					<button
						type="submit"
						className="primary-action-btn"
						disabled={isSubmitting}
					>
						{isSubmitting ? 'Saving...' : 'Save Quiz'}
					</button>
				</div>
			</form>
		</div>
	);
}
