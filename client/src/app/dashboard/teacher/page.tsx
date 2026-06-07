'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { coursesApi } from '@/lib/api/courses';
import { Course } from '@/types/course';
import './page.css';

export default function TeacherDashboardPage() {
	const [courses, setCourses] = useState<Course[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [deletingId, setDeletingId] = useState<string | null>(null);
	const router = useRouter();

	const loadCourses = async () => {
		try {
			setIsLoading(true);
			setError(null);
			const data = await coursesApi.getCourses();
			setCourses(data);
		} catch (err) {
			console.error('Failed to load courses', err);
			setError('Failed to load courses. Please try again.');
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		loadCourses();
	}, []);

	const handleDelete = async (courseId: string) => {
		if (!window.confirm('Are you sure you want to delete this course? This cannot be undone.')) {
			return;
		}
		try {
			setDeletingId(courseId);
			const success = await coursesApi.deleteCourse(courseId);
			if (!success) {
				alert('Failed to delete course. Please try again.');
				return;
			}
			// Remove from local state
			setCourses(prev => prev.filter(course => course.id !== courseId));
		} catch (err) {
			console.error('Failed to delete course', err);
			alert('Failed to delete course. Please try again.');
		} finally {
			setDeletingId(null);
		}
	};

	const handleCardClick = (courseId: string) => {
		router.push(`/dashboard/teacher/courses/${courseId}`);
	};

	return (
		<div className="dashboard-page">
			<div className="dashboard-header-row">
				<div>
					<h1>Teacher Dashboard</h1>
					<p>Manage your courses.</p>
				</div>
				<div className="dashboard-actions">
					<Link href="/dashboard/teacher/courses/create" className="primary-action-btn">
						+ Create Course
					</Link>
					<Link href="/dashboard/teacher/settings" className="secondary-action-btn">
						Settings
					</Link>
				</div>
			</div>

			{isLoading && <p className="status-text">Loading your courses...</p>}
			{error && !isLoading && <p className="status-text error-text">{error}</p>}

			{!isLoading && !error && (
				<>
					{courses.length === 0 ? (
						<div className="empty-state">
							<p className="empty-state-text">No courses created yet.</p>
							<Link href="/dashboard/teacher/courses/create" className="create-card">
								<span className="create-icon">+</span>
								<span className="create-text">Create your first course</span>
							</Link>
						</div>
					) : (
						<div className="courses-grid">
							{courses.map(course => (
								<div
									key={course.id}
									className="course-card"
									onClick={() => handleCardClick(course.id)}
								>
									<div className="course-card-header">
										<h2 className="course-title">{course.name}</h2>
										<button
											type="button"
											className="course-delete-btn"
											onClick={e => {
												e.stopPropagation();
												handleDelete(course.id);
											}}
											disabled={deletingId === course.id}
											aria-label="Delete course"
										>
											{deletingId === course.id ? '...' : '🗑️'}
										</button>
									</div>
									<p className="course-description">
										{course.description || 'No description provided.'}
									</p>
									<div className="course-meta">
										<span>
											Students:{' '}
											<strong>{course.studentCount !== undefined ? course.studentCount : 0}</strong>
										</span>
										<span className="course-join-code">
											Join code: <code>{course.joinCode}</code>
										</span>
									</div>
								</div>
							))}
						</div>
					)}
				</>
			)}
		</div>
	);
}
