'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { quizzesApi } from '@/lib/api/courses/quizzes';
import { aiApi } from '@/lib/api/ai';
import { Quiz, QuizQuestionType } from '@/types/quiz';
import '../../create/page.css';

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

	type LimitType = 'words' | 'chars' | null;

	type NewQuestion = {
		question: string;
		points: number;
		type: QuizQuestionType;
		options?: string[];
		correctAnswer?: number;
		wordLimit?: number;
		charLimit?: number;
		limitType?: LimitType;
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
					setQuestions(
						quizData.questions.map(q => ({
							question: q.question || '',
							points: q.points || 1,
							type: q.type || 'open-response',
							options: q.options,
							correctAnswer: typeof q.correctAnswer === 'number' ? q.correctAnswer : undefined,
							wordLimit: q.wordLimit,
							charLimit: q.charLimit,
							limitType: q.wordLimit ? 'words' : q.charLimit ? 'chars' : null,
						}))
					);
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

	const createEmptyQuestion = (): NewQuestion => ({
		question: '',
		points: 1,
		type: 'open-response',
	});

	const ensureMultipleChoiceDefaults = (question: NewQuestion): NewQuestion => {
		const options = question.options && question.options.length >= 2
			? question.options
			: ['', ''];
		const correctAnswer =
			typeof question.correctAnswer === 'number' &&
			question.correctAnswer >= 0 &&
			question.correctAnswer < options.length
				? question.correctAnswer
				: 0;

		return {
			...question,
			options,
			correctAnswer,
		};
	};

	const handleAddQuestion = () => {
		setQuestions(prev => [...prev, createEmptyQuestion()]);
	};

	const handleUpdateQuestion = (index: number, field: keyof NewQuestion, value: string | number) => {
		setQuestions(prev =>
			prev.map((q, i) =>
				i === index
					? {
							...q,
							[field]:
								field === 'points'
									? Number(value) || 0
									: field === 'correctAnswer'
									? Number(value)
									: value,
					  }
					: q
			)
		);
	};

	const handleDeleteQuestion = (index: number) => {
		setQuestions(prev => prev.filter((_, i) => i !== index));
	};

	const handleChangeQuestionType = (index: number, nextType: QuizQuestionType) => {
		setQuestions(prev =>
			prev.map((q, i) => {
				if (i !== index) return q;

				if (nextType === 'multiple-choice') {
					return ensureMultipleChoiceDefaults({
						...q,
						type: nextType,
					});
				}

				if (nextType === 'short-answer') {
					return {
						...q,
						type: nextType,
					};
				}

				// open-response
				return {
					...q,
					type: nextType,
					options: undefined,
					correctAnswer: undefined,
					wordLimit: undefined,
					charLimit: undefined,
					limitType: undefined,
				};
			})
		);
	};

	const handleAddOption = (questionIndex: number) => {
		setQuestions(prev =>
			prev.map((q, i) =>
				i === questionIndex
					? {
							...ensureMultipleChoiceDefaults(q),
							options: [...(q.options || ['', '']), ''],
					  }
					: q
			)
		);
	};

	const handleUpdateOption = (questionIndex: number, optionIndex: number, value: string) => {
		setQuestions(prev =>
			prev.map((q, i) => {
				if (i !== questionIndex) return q;
				const base = ensureMultipleChoiceDefaults(q);
				const options = [...(base.options || ['', ''])];
				options[optionIndex] = value;
				return {
					...base,
					options,
				};
			})
		);
	};

	const handleRemoveOption = (questionIndex: number, optionIndex: number) => {
		setQuestions(prev =>
			prev.map((q, i) => {
				if (i !== questionIndex) return q;
				const base = ensureMultipleChoiceDefaults(q);
				if (!base.options || base.options.length <= 2) {
					return base;
				}
				const options = base.options.filter((_, idx) => idx !== optionIndex);
				let correctAnswer = base.correctAnswer ?? 0;
				if (optionIndex === correctAnswer) {
					correctAnswer = 0;
				} else if (optionIndex < correctAnswer) {
					correctAnswer = correctAnswer - 1;
				}
				return {
					...base,
					options,
					correctAnswer,
				};
			})
		);
	};

	const handleSetCorrectOption = (questionIndex: number, optionIndex: number) => {
		setQuestions(prev =>
			prev.map((q, i) =>
				i === questionIndex
					? {
							...ensureMultipleChoiceDefaults(q),
							correctAnswer: optionIndex,
					  }
					: q
			)
		);
	};

	const handleChangeLimitType = (index: number, limitType: LimitType) => {
		setQuestions(prev =>
			prev.map((q, i) =>
				i === index
					? {
							...q,
							limitType,
							wordLimit: limitType === 'words' ? q.wordLimit : undefined,
							charLimit: limitType === 'chars' ? q.charLimit : undefined,
					  }
					: q
			)
		);
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
			const newQuestions: NewQuestion[] = generatedQuestions.map(q => ({
				question: q.question,
				points: 1,
				type: 'open-response',
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

		// Basic validation for multiple-choice questions
		for (const q of questions) {
			if (q.type === 'multiple-choice') {
				const options = (q.options || []).map(o => o.trim()).filter(o => o.length > 0);
				if (options.length < 2) {
					setError('Multiple choice questions must have at least two answer options.');
					return;
				}
				const correctIndex = q.correctAnswer ?? 0;
				if (correctIndex < 0 || correctIndex >= options.length) {
					setError('Please select a valid correct answer for each multiple choice question.');
					return;
				}
			}
		}

		try {
			setIsSubmitting(true);
			const updatedQuiz = await quizzesApi.updateQuiz(courseId, quizId, {
				title: trimmedTitle,
				description: description.trim(),
				published,
				dueDate: dueDate ? new Date(dueDate).toISOString() : null,
				questions: questions.map(q => {
					const base = {
						question: q.question.trim(),
						points: q.points || 0,
						type: q.type,
					} as any;

					if (q.type === 'multiple-choice') {
						const options = (q.options || []).map(o => o.trim()).filter(o => o.length > 0);
						base.options = options;
						base.correctAnswer = q.correctAnswer ?? 0;
					}

					if (q.type === 'short-answer') {
						if (q.limitType === 'words' && q.wordLimit) {
							base.wordLimit = q.wordLimit;
						}
						if (q.limitType === 'chars' && q.charLimit) {
							base.charLimit = q.charLimit;
						}
					}

					return base;
				}),
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
						<p>Add questions with point values. Question numbers are assigned automatically.</p>
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
										<div className="question-meta-row">
											<div className="form-field question-type-field">
												<label className="form-label">Question type</label>
												<select
													className="form-input"
													value={q.type}
													onChange={e =>
														handleChangeQuestionType(index, e.target.value as QuizQuestionType)
													}
												>
													<option value="open-response">Open response</option>
													<option value="multiple-choice">Multiple choice</option>
													<option value="short-answer">Short answer</option>
												</select>
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

										{q.type === 'multiple-choice' && (
											<div className="form-field">
												<label className="form-label">Answer options</label>
												<div className="mc-options-list">
													{(q.options && q.options.length ? q.options : ['', '']).map(
														(option, optionIndex) => (
															<div
																key={optionIndex}
																className={`mc-option-card${
																	q.correctAnswer === optionIndex
																		? ' mc-option-card-correct'
																		: ''
																}`}
																onClick={() => handleSetCorrectOption(index, optionIndex)}
															>
																<div className="mc-option-main">
																	<span className="mc-option-label">
																		Option {optionIndex + 1}
																	</span>
																	<input
																		type="text"
																		className="form-input mc-option-input"
																		value={option}
																		onChange={e =>
																			handleUpdateOption(index, optionIndex, e.target.value)
																		}
																		placeholder="Option text"
																		onClick={e => e.stopPropagation()}
																	/>
																</div>
																<div className="mc-option-actions">
																	<span className="mc-option-correct-indicator">
																		{q.correctAnswer === optionIndex
																			? 'Correct answer'
																			: 'Mark correct'}
																	</span>
																	<button
																		type="button"
																		className="mc-option-delete-btn"
																		onClick={e => {
																			e.stopPropagation();
																			handleRemoveOption(index, optionIndex);
																		}}
																		disabled={
																			(q.options && q.options.length <= 2) ||
																			!q.options ||
																			q.options.length <= 2
																		}
																	>
																		Remove
																	</button>
																</div>
															</div>
														)
													)}
												</div>
												<button
													type="button"
													className="add-option-btn"
													onClick={() => handleAddOption(index)}
												>
													Add option
												</button>
											</div>
										)}

										{q.type === 'short-answer' && (
											<div className="form-field short-answer-limits">
												<label className="form-label">Answer length limit (optional)</label>
												<div className="short-answer-limit-row">
													<select
														className="form-input short-answer-limit-type"
														value={q.limitType || ''}
														onChange={e =>
															handleChangeLimitType(
																index,
																e.target.value ? (e.target.value as LimitType) : null
															)
														}
													>
														<option value="">No limit</option>
														<option value="chars">Character limit</option>
														<option value="words">Word limit</option>
													</select>
													{q.limitType === 'chars' && (
														<input
															type="number"
															min={1}
															className="form-input short-answer-limit-input"
															placeholder="e.g. 100"
															value={q.charLimit ?? ''}
															onChange={e =>
																handleUpdateQuestion(
																	index,
																	'charLimit',
																	e.target.value ? Number(e.target.value) : 0
																)
															}
														/>
													)}
													{q.limitType === 'words' && (
														<input
															type="number"
															min={1}
															className="form-input short-answer-limit-input"
															placeholder="e.g. 25"
															value={q.wordLimit ?? ''}
															onChange={e =>
																handleUpdateQuestion(
																	index,
																	'wordLimit',
																	e.target.value ? Number(e.target.value) : 0
																)
															}
														/>
													)}
												</div>
											</div>
										)}
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
