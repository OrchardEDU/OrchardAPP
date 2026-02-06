'use client';

import { useState, useEffect } from 'react';
import { coursesApi } from '@/lib/api/courses';
import { Course } from '@/types/course';

export function useCourse(courseId: string) {
	const [course, setCourse] = useState<Course | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!courseId) {
			setIsLoading(false);
			return;
		}

		const fetchCourse = async () => {
			try {
				setIsLoading(true);
				const data = await coursesApi.getCourse(courseId);
				setCourse(data);
				setError(null);
			} catch (err) {
				setError(err instanceof Error ? err.message : 'Failed to fetch course');
			} finally {
				setIsLoading(false);
			}
		};

		fetchCourse();
	}, [courseId]);

	return { course, isLoading, error };
}
