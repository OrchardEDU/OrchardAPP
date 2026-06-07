'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { coursesApi } from '@/lib/api/courses';
import './page.css';

export default function CreateCoursePage() {
	const [name, setName] = useState('');
	const [description, setDescription] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const router = useRouter();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);

		const trimmedName = name.trim();
		if (!trimmedName) {
			setError('Course name is required.');
			return;
		}

		try {
			setIsSubmitting(true);
			const course = await coursesApi.createCourse({
				name: trimmedName,
				description: description.trim(),
			});

			if (!course) {
				setError('Failed to create course. Please try again.');
				return;
			}

			// Redirect to the new course page
			router.push(`/dashboard/teacher/courses/${course.id}`);
		} catch (err) {
			console.error('Failed to create course', err);
			setError('Failed to create course. Please try again.');
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="create-course-page">
			<div className="create-course-header">
				<div>
					<h1>Create New Course</h1>
					<p>Set up a course for your students with a name and description.</p>
				</div>
				<div className="create-course-actions">
					<Link href="/dashboard/teacher/settings" className="secondary-action-btn">
						Settings
					</Link>
					<Link href="/dashboard/teacher" className="secondary-action-btn">
						Back to Dashboard
					</Link>
				</div>
			</div>

			<form className="create-course-form" onSubmit={handleSubmit}>
				<div className="form-field">
					<label htmlFor="course-name" className="form-label">
						Course Name<span className="required">*</span>
					</label>
					<input
						id="course-name"
						type="text"
						value={name}
						onChange={e => setName(e.target.value)}
						className="form-input"
						placeholder="e.g. Intro to Biology"
						required
					/>
				</div>

				<div className="form-field">
					<label htmlFor="course-description" className="form-label">
						Description
					</label>
					<textarea
						id="course-description"
						value={description}
						onChange={e => setDescription(e.target.value)}
						className="form-textarea"
						placeholder="Optional description to help students understand what this course covers."
						rows={5}
					/>
				</div>

				{error && <p className="form-error">{error}</p>}

				<div className="form-actions">
					<button
						type="submit"
						className="primary-action-btn"
						disabled={isSubmitting}
					>
						{isSubmitting ? 'Creating...' : 'Create Course'}
					</button>
				</div>
			</form>
		</div>
	);
}
