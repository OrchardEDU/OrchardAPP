'use client';

import { useState, useEffect } from 'react';
import { quizzesApi } from '@/lib/api/courses/quizzes';
import { Quiz } from '@/types/quiz';

export function useCourseQuizzes(courseId: string) {
	const [quizzes, setQuizzes] = useState<Quiz[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!courseId) {
			setIsLoading(false);
			return;
		}

		const fetchQuizzes = async () => {
			try {
				setIsLoading(true);
				const data = await quizzesApi.getCourseQuizzes(courseId);
				setQuizzes(data);
				setError(null);
			} catch (err) {
				setError(err instanceof Error ? err.message : 'Failed to fetch quizzes');
			} finally {
				setIsLoading(false);
			}
		};

		fetchQuizzes();
	}, [courseId]);

	return { quizzes, isLoading, error };
}
