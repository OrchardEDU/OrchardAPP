'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { coursesApi } from '@/lib/api/courses';
import { Course } from '@/types/course';
import './page.css';

export default function StudentDashboardPage() {
	const [courses, setCourses] = useState<Course[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [joinCode, setJoinCode] = useState('');
	const [joinError, setJoinError] = useState<string | null>(null);
	const [isJoining, setIsJoining] = useState(false);
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

	const handleCardClick = (courseId: string) => {
		router.push(`/dashboard/student/courses/${courseId}`);
	};

	const handleJoin = async (e: React.FormEvent) => {
		e.preventDefault();
		setJoinError(null);
		const trimmed = joinCode.trim().toUpperCase();
		if (!trimmed) {
			setJoinError('Please enter a join code.');
			return;
		}
		try {
			setIsJoining(true);
			const course = await coursesApi.joinCourse(trimmed);
			if (!course) {
				setJoinError('Could not join course. Check the code and try again.');
				return;
			}
			setJoinCode('');
			// Reload courses to show the newly joined course
			await loadCourses();
		} catch (err) {
			console.error('Failed to join course', err);
			setJoinError('Failed to join course. Please try again.');
		} finally {
			setIsJoining(false);
		}
	};

	return (
		<div className="dashboard-page">
			<div className="dashboard-header-row">
				<div>
					<h1>Student Dashboard</h1>
					<p>View and join your courses.</p>
				</div>
				<div className="dashboard-actions">
					<Link href="/" className="secondary-action-btn">
						Back to Home
					</Link>
				</div>
			</div>

			{isLoading && <p className="status-text">Loading your courses...</p>}
			{error && !isLoading && <p className="status-text error-text">{error}</p>}

			{!isLoading && !error && (
				<>
					{courses.length === 0 ? (
						<div className="empty-state">
							<p className="empty-state-text">No courses enrolled in yet.</p>
							<form className="join-card" onSubmit={handleJoin}>
								<label htmlFor="join-code" className="join-label">
									Enter a join code to enroll:
								</label>
								<div className="join-input-row">
									<input
										id="join-code"
										type="text"
										value={joinCode}
										onChange={e => setJoinCode(e.target.value)}
										placeholder="e.g. ABCD1234"
										className="join-input"
									/>
									<button
										type="submit"
										className="join-button"
										disabled={isJoining}
									>
										{isJoining ? 'Joining...' : 'Join Course'}
									</button>
								</div>
								{joinError && <p className="join-error">{joinError}</p>}
							</form>
						</div>
					) : (
						<>
							<div className="join-inline">
								<form className="join-inline-form" onSubmit={handleJoin}>
									<label htmlFor="join-code-inline" className="join-label">
										Have a join code?
									</label>
									<div className="join-input-row">
										<input
											id="join-code-inline"
											type="text"
											value={joinCode}
											onChange={e => setJoinCode(e.target.value)}
											placeholder="Enter code"
											className="join-input"
										/>
										<button
											type="submit"
											className="join-button"
											disabled={isJoining}
										>
											{isJoining ? 'Joining...' : 'Join'}
										</button>
									</div>
								</form>
								{joinError && <p className="join-error">{joinError}</p>}
							</div>

							<div className="courses-grid">
								{courses.map(course => (
									<div
										key={course.id}
										className="course-card"
										onClick={() => handleCardClick(course.id)}
									>
										<h2 className="course-title">{course.name}</h2>
										<p className="course-description">
											{course.description || 'No description provided.'}
										</p>
										<div className="course-meta">
											<span>
												Teacher:{' '}
												<strong>{course.teacherName || 'Unknown'}</strong>
											</span>
											{course.enrolledAt && (
												<span>
													Enrolled:{' '}
													{new Date(course.enrolledAt).toLocaleDateString()}
												</span>
											)}
										</div>
									</div>
								))}
							</div>
						</>
					)}
				</>
			)}
		</div>
	);
}
