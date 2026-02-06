'use client';

import { useState, useEffect } from 'react';
import { coursesApi } from '@/lib/api/courses';
import { Course } from '@/types/course';

export function useCourses() {
	const [courses, setCourses] = useState<Course[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchCourses = async () => {
			try {
				setIsLoading(true);
				const data = await coursesApi.getCourses();
				setCourses(data);
				setError(null);
			} catch (err) {
				setError(err instanceof Error ? err.message : 'Failed to fetch courses');
			} finally {
				setIsLoading(false);
			}
		};

		fetchCourses();
	}, []);

	return { courses, isLoading, error, refetch: () => {
		const fetchCourses = async () => {
			try {
				setIsLoading(true);
				const data = await coursesApi.getCourses();
				setCourses(data);
				setError(null);
			} catch (err) {
				setError(err instanceof Error ? err.message : 'Failed to fetch courses');
			} finally {
				setIsLoading(false);
			}
		};
		fetchCourses();
	} };
}
