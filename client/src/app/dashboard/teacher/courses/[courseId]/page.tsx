'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { coursesApi } from '@/lib/api/courses';
import { canvasApi } from '@/lib/api/canvas';
import { quizzesApi } from '@/lib/api/courses/quizzes';
import { aiApi, EmbedContentResponse } from '@/lib/api/ai';
import { Course } from '@/types/course';
import type { CanvasConnectionStatus, CanvasCourseOption } from '@/types/canvas';
import { Quiz } from '@/types/quiz';
import './page.css';

type Student = {
	id: string;
	name: string;
	email: string;
	enrolledAt: string;
};

export default function TeacherCoursePage() {
	const params = useParams();
	const router = useRouter();
	const courseId = params.courseId as string;

	const [course, setCourse] = useState<Course | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [quizzes, setQuizzes] = useState<Quiz[]>([]);
	const [quizzesLoading, setQuizzesLoading] = useState(true);
	const [quizzesError, setQuizzesError] = useState<string | null>(null);
	const [students, setStudents] = useState<Student[]>([]);
	const [studentsLoading, setStudentsLoading] = useState(true);
	const [studentsError, setStudentsError] = useState<string | null>(null);
	const [isDeletingCourse, setIsDeletingCourse] = useState(false);
	const [deletingQuizId, setDeletingQuizId] = useState<string | null>(null);
	const [materials, setMaterials] = useState<EmbedContentResponse[]>([]);
	const [materialsLoading, setMaterialsLoading] = useState(false);
	const [uploadingFile, setUploadingFile] = useState<string | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [canvasStatus, setCanvasStatus] = useState<CanvasConnectionStatus | null>(null);
	const [canvasCourses, setCanvasCourses] = useState<CanvasCourseOption[]>([]);
	const [canvasCoursesLoading, setCanvasCoursesLoading] = useState(false);
	const [selectedCanvasCourseId, setSelectedCanvasCourseId] = useState('');
	const [isLinkingCanvas, setIsLinkingCanvas] = useState(false);
	const [isUnlinkingCanvas, setIsUnlinkingCanvas] = useState(false);
	const [canvasLinkError, setCanvasLinkError] = useState<string | null>(null);

	useEffect(() => {
		const loadCourse = async () => {
			try {
				setIsLoading(true);
				setError(null);
				const data = await coursesApi.getCourse(courseId);
				if (!data) {
					setError('Course not found or you do not have access.');
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
		const loadCanvasStatus = async () => {
			const status = await canvasApi.getStatus();
			setCanvasStatus(status);
		};

		loadCanvasStatus();
	}, []);

	useEffect(() => {
		const loadCanvasCourses = async () => {
			if (!canvasStatus?.connected || course?.canvas?.connected) {
				return;
			}

			try {
				setCanvasCoursesLoading(true);
				setCanvasLinkError(null);
				const courses = await canvasApi.getCanvasCourses();
				setCanvasCourses(courses);
			} catch (err) {
				console.error('Failed to load Canvas courses', err);
				setCanvasLinkError('Failed to load Canvas courses.');
			} finally {
				setCanvasCoursesLoading(false);
			}
		};

		loadCanvasCourses();
	}, [canvasStatus?.connected, course?.canvas?.connected]);

	const handleLinkCanvasCourse = async () => {
		if (!selectedCanvasCourseId) {
			setCanvasLinkError('Select a Canvas course to link.');
			return;
		}

		try {
			setIsLinkingCanvas(true);
			setCanvasLinkError(null);
			const linked = await canvasApi.linkCourse(courseId, Number(selectedCanvasCourseId));
			if (!linked) {
				setCanvasLinkError('Failed to link Canvas course.');
				return;
			}

			setCourse(prev => (prev ? { ...prev, canvas: linked } : prev));
			setSelectedCanvasCourseId('');
		} catch (err) {
			console.error('Failed to link Canvas course', err);
			setCanvasLinkError('Failed to link Canvas course.');
		} finally {
			setIsLinkingCanvas(false);
		}
	};

	const handleUnlinkCanvasCourse = async () => {
		if (!window.confirm('Unlink this course from Canvas?')) {
			return;
		}

		try {
			setIsUnlinkingCanvas(true);
			setCanvasLinkError(null);
			const success = await canvasApi.unlinkCourse(courseId);
			if (!success) {
				setCanvasLinkError('Failed to unlink Canvas course.');
				return;
			}

			setCourse(prev => {
				if (!prev) return prev;
				const { canvas: _canvas, ...rest } = prev;
				return rest;
			});
		} catch (err) {
			console.error('Failed to unlink Canvas course', err);
			setCanvasLinkError('Failed to unlink Canvas course.');
		} finally {
			setIsUnlinkingCanvas(false);
		}
	};

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

	useEffect(() => {
		const loadStudents = async () => {
			try {
				setStudentsLoading(true);
				setStudentsError(null);
				const data = await coursesApi.getCourseStudents(courseId);
				setStudents(data);
			} catch (err) {
				console.error('Failed to load students', err);
				setStudentsError('Failed to load students. Please try again.');
			} finally {
				setStudentsLoading(false);
			}
		};

		if (courseId) {
			loadStudents();
		}
	}, [courseId]);

	useEffect(() => {
		const loadMaterials = async () => {
			try {
				setMaterialsLoading(true);
				const data = await aiApi.listMaterials(courseId);
				setMaterials(data);
			} catch (err) {
				console.error('Failed to load materials', err);
			} finally {
				setMaterialsLoading(false);
			}
		};

		if (courseId) {
			loadMaterials();
		}
	}, [courseId]);

	const handleTogglePublish = async (e: React.MouseEvent, quizId: string, currentPublished: boolean) => {
		e.preventDefault();
		e.stopPropagation();

		try {
			const updatedQuiz = await quizzesApi.updateQuiz(courseId, quizId, {
				published: !currentPublished,
			});

			if (updatedQuiz) {
				// Update the quiz in the list
				setQuizzes(prevQuizzes =>
					prevQuizzes.map(quiz =>
						quiz.id === quizId ? { ...quiz, published: updatedQuiz.published } : quiz
					)
				);
			} else {
				alert('Failed to update quiz status. Please try again.');
			}
		} catch (err) {
			console.error('Failed to toggle publish status', err);
			alert('Failed to update quiz status. Please try again.');
		}
	};

	const handleDeleteCourse = async () => {
		if (!confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
			return;
		}

		try {
			setIsDeletingCourse(true);
			const success = await coursesApi.deleteCourse(courseId);
			if (success) {
				router.push('/dashboard/teacher');
			} else {
				alert('Failed to delete course. Please try again.');
				setIsDeletingCourse(false);
			}
		} catch (err) {
			console.error('Failed to delete course', err);
			alert('Failed to delete course. Please try again.');
			setIsDeletingCourse(false);
		}
	};

	const handleRemoveStudent = async (studentId: string, studentName: string) => {
		if (!confirm(`Are you sure you want to remove ${studentName} from this course?`)) {
			return;
		}

		try {
			const success = await coursesApi.removeStudent(courseId, studentId);
			if (success) {
				// Remove student from list
				setStudents(prevStudents => prevStudents.filter(s => s.id !== studentId));
				// Update course student count
				if (course) {
					setCourse({ ...course, studentCount: (course.studentCount || 0) - 1 });
				}
			} else {
				alert('Failed to remove student. Please try again.');
			}
		} catch (err) {
			console.error('Failed to remove student', err);
			alert('Failed to remove student. Please try again.');
		}
	};

	const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		setUploadingFile(file.name);

		try {
			const result = await aiApi.embedFile(courseId, file);
			if (result) {
				// Refresh materials list to get updated list from server
				const materialsList = await aiApi.listMaterials(courseId);
				setMaterials(materialsList);
				alert(`File "${file.name}" uploaded and embedded successfully!`);
			} else {
				alert('Failed to upload file. Please try again.');
			}
		} catch (err) {
			console.error('Failed to upload file', err);
			alert('Failed to upload file. Please try again.');
		} finally {
			setUploadingFile(null);
			// Reset file input
			if (fileInputRef.current) {
				fileInputRef.current.value = '';
			}
		}
	};

	const handleDeleteMaterial = async (materialId: string, filename: string) => {
		if (!confirm(`Are you sure you want to delete "${filename}"?`)) {
			return;
		}

		try {
			const success = await aiApi.deleteContent(materialId, courseId);
			if (success) {
				// Refresh materials list to get updated list from server
				const materialsList = await aiApi.listMaterials(courseId);
				setMaterials(materialsList);
			} else {
				alert('Failed to delete material. Please try again.');
			}
		} catch (err) {
			console.error('Failed to delete material', err);
			alert('Failed to delete material. Please try again.');
		}
	};

	const handleDeleteQuiz = async (e: React.MouseEvent, quizId: string, quizTitle: string) => {
		e.preventDefault();
		e.stopPropagation();

		if (!confirm(`Are you sure you want to delete "${quizTitle}"? This will also delete all submissions for this quiz. This action cannot be undone.`)) {
			return;
		}

		try {
			setDeletingQuizId(quizId);
			const success = await quizzesApi.deleteQuiz(courseId, quizId);
			if (success) {
				// Remove quiz from list
				setQuizzes(prevQuizzes => prevQuizzes.filter(quiz => quiz.id !== quizId));
			} else {
				alert('Failed to delete quiz. Please try again.');
			}
		} catch (err) {
			console.error('Failed to delete quiz', err);
			alert('Failed to delete quiz. Please try again.');
		} finally {
			setDeletingQuizId(null);
		}
	};

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
					<Link href="/dashboard/teacher/settings" className="secondary-action-btn">
						Settings
					</Link>
					<Link href="/dashboard/teacher" className="secondary-action-btn">
						Back to Dashboard
					</Link>
				</div>
			</div>

			{isLoading && <p className="status-text">Loading course...</p>}
			{error && !isLoading && <p className="status-text error-text">{error}</p>}

			{course && !isLoading && !error && (
				<div className="course-body">
					<div className="course-info-card">
						<div className="course-overview-header">
							<h2>Course Overview</h2>
							<button
								className="delete-course-btn"
								onClick={handleDeleteCourse}
								disabled={isDeletingCourse}
							>
								{isDeletingCourse ? 'Deleting...' : 'Delete Course'}
							</button>
						</div>
						<p>{course.description || 'No description provided yet.'}</p>
						<div className="course-meta-row">
							<span>
								Join code: <code>{course.joinCode}</code>
							</span>
							{course.studentCount !== undefined && (
								<span>
									Students enrolled: <strong>{course.studentCount}</strong>
								</span>
							)}
						</div>

						<div className="canvas-course-section">
							<h3 className="canvas-section-title">Canvas Integration</h3>

							{course.canvas?.connected ? (
								<div className="canvas-linked-info">
									<span className="canvas-connected-badge">Connected to Canvas</span>
									<p className="canvas-linked-name">
										Linked course: <strong>{course.canvas.canvasCourseName}</strong>
									</p>
									<div className="canvas-linked-actions">
										{course.canvas.canvasCourseUrl && (
											<a
												href={course.canvas.canvasCourseUrl}
												target="_blank"
												rel="noopener noreferrer"
												className="canvas-open-link"
											>
												Open in Canvas
											</a>
										)}
										<button
											type="button"
											className="canvas-unlink-btn"
											onClick={handleUnlinkCanvasCourse}
											disabled={isUnlinkingCanvas}
										>
											{isUnlinkingCanvas ? 'Unlinking...' : 'Unlink'}
										</button>
									</div>
								</div>
							) : canvasStatus?.connected ? (
								<div className="canvas-link-form">
									<p className="canvas-link-help">
										Select a Canvas course to link with this Orchard course.
									</p>
									{canvasCoursesLoading ? (
										<p className="status-text">Loading Canvas courses...</p>
									) : (
										<div className="canvas-link-controls">
											<select
												className="canvas-course-select"
												value={selectedCanvasCourseId}
												onChange={e => setSelectedCanvasCourseId(e.target.value)}
											>
												<option value="">Select a Canvas course...</option>
												{canvasCourses.map(canvasCourse => (
													<option key={canvasCourse.id} value={canvasCourse.id}>
														{canvasCourse.name}
														{canvasCourse.courseCode ? ` (${canvasCourse.courseCode})` : ''}
													</option>
												))}
											</select>
											<button
												type="button"
												className="canvas-link-btn"
												onClick={handleLinkCanvasCourse}
												disabled={isLinkingCanvas || !selectedCanvasCourseId}
											>
												{isLinkingCanvas ? 'Linking...' : 'Link Course'}
											</button>
										</div>
									)}
								</div>
							) : (
								<p className="canvas-link-help">
									Connect Canvas in{' '}
									<Link href="/dashboard/teacher/settings" className="canvas-settings-link">
										Settings
									</Link>{' '}
									to link this course.
								</p>
							)}

							{canvasLinkError && (
								<p className="status-text error-text">{canvasLinkError}</p>
							)}
						</div>
					</div>

					<div className="students-section">
						<div className="section-header">
							<h2>Students & Materials</h2>
						</div>

						<div className="students-materials-container">
							{/* Left Column: Students */}
							<div className="students-column">
								<div className="column-header">
									<h3>Students {students.length > 0 && <span className="count-badge">({students.length})</span>}</h3>
								</div>

								{studentsLoading && <p className="status-text">Loading students...</p>}
								{studentsError && !studentsLoading && <p className="status-text error-text">{studentsError}</p>}

								{!studentsLoading && !studentsError && (
									<div className="students-list">
										{students.length === 0 ? (
											<div className="empty-state">
												<p>No students enrolled yet</p>
											</div>
										) : (
											students.map((student) => (
												<div key={student.id} className="student-card">
													<div className="student-info">
														<h3 className="student-name">{student.name}</h3>
														<p className="student-email">{student.email}</p>
														<p className="student-enrolled-date">
															Enrolled: {new Date(student.enrolledAt).toLocaleDateString()}
														</p>
													</div>
													<button
														className="remove-student-btn"
														onClick={() => handleRemoveStudent(student.id, student.name)}
														title={`Remove ${student.name} from course`}
													>
														Remove
													</button>
												</div>
											))
										)}
									</div>
								)}
							</div>

							{/* Right Column: Materials */}
							<div className="materials-column">
								<div className="column-header">
									<h3>Materials {materials.length > 0 && <span className="count-badge">({materials.length})</span>}</h3>
								</div>

								<div className="materials-upload-section">
									<input
										ref={fileInputRef}
										type="file"
										accept=".pdf,.doc,.docx,.txt,.md"
										onChange={handleFileUpload}
										className="file-input-hidden"
										id="materials-file-input"
										disabled={!!uploadingFile}
									/>
									<label
										htmlFor="materials-file-input"
										className={`upload-materials-btn ${uploadingFile ? 'uploading' : ''}`}
									>
										{uploadingFile ? `Uploading ${uploadingFile}...` : 'Upload Material'}
									</label>
								</div>

								{materialsLoading && <p className="status-text">Loading materials...</p>}
								<div className="materials-list">
									{!materialsLoading && materials.length === 0 ? (
										<div className="empty-state">
											<p>No materials uploaded yet</p>
											<p className="empty-state-hint">Upload PDF, DOCX, TXT, or MD files to use with AI question generation</p>
										</div>
									) : (
										!materialsLoading && materials.map((material) => (
											<div key={material.id} className="material-card">
												<div className="material-info">
													<h4 className="material-name">{material.filename}</h4>
													{material.size && (
														<p className="material-size">
															{(material.size / 1024).toFixed(2)} KB
														</p>
													)}
												</div>
												<button
													className="remove-material-btn"
													onClick={() => handleDeleteMaterial(material.id, material.filename)}
													title={`Delete ${material.filename}`}
												>
													Delete
												</button>
											</div>
										))
									)}
								</div>
							</div>
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
										<p>No quizzes yet</p>
										<Link href={`/dashboard/teacher/courses/${courseId}/quizzes/create`} className="create-quiz-card">
											<div className="create-card-icon">+</div>
											<div className="create-card-text">Create Quiz</div>
										</Link>
									</div>
								) : (
									<>
										{quizzes.map((quiz) => (
											<div key={quiz.id} className="quiz-card-wrapper">
												<Link
													href={`/dashboard/teacher/courses/${courseId}/quizzes/${quiz.id}`}
													className="quiz-card"
												>
													<div className="quiz-card-header">
														<h3 className="quiz-card-title">{quiz.title}</h3>
														<span className={`status-badge ${quiz.published ? 'published' : 'unpublished'}`}>
															{quiz.published ? 'Published' : 'Unpublished'}
														</span>
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
														{quiz.submissionCount !== undefined && (
															<span>{quiz.submissionCount} submission{quiz.submissionCount !== 1 ? 's' : ''}</span>
														)}
													</div>
												</Link>
												<button
													className="quiz-publish-toggle-btn"
													onClick={(e) => handleTogglePublish(e, quiz.id, quiz.published)}
													title={quiz.published ? 'Unpublish quiz' : 'Publish quiz'}
												>
													{quiz.published ? 'Unpublish' : 'Publish'}
												</button>
												{!quiz.published && (
													<Link
														href={`/dashboard/teacher/courses/${courseId}/quizzes/${quiz.id}/edit`}
														className="quiz-edit-btn"
													>
														Edit
													</Link>
												)}
												<button
													className="quiz-delete-btn"
													onClick={(e) => handleDeleteQuiz(e, quiz.id, quiz.title)}
													disabled={deletingQuizId === quiz.id}
													title="Delete quiz"
												>
													{deletingQuizId === quiz.id ? 'Deleting...' : 'Delete'}
												</button>
											</div>
										))}
										<Link href={`/dashboard/teacher/courses/${courseId}/quizzes/create`} className="create-quiz-card">
											<div className="create-card-icon">+</div>
											<div className="create-card-text">Create Quiz</div>
										</Link>
									</>
								)}
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	);
}
