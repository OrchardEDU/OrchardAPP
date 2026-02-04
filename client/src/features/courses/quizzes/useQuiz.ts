'use client';

import { useState, useEffect } from 'react';
import { quizzesApi } from '@/lib/api/courses/quizzes';
import { Quiz } from '@/types/quiz';

export function useQuiz(courseId: string, quizId: string) {
	const [quiz, setQuiz] = useState<Quiz | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!courseId || !quizId) {
			setIsLoading(false);
			return;
		}

		const fetchQuiz = async () => {
			try {
				setIsLoading(true);
				const data = await quizzesApi.getQuiz(courseId, quizId);
				setQuiz(data);
				setError(null);
			} catch (err) {
				setError(err instanceof Error ? err.message : 'Failed to fetch quiz');
			} finally {
				setIsLoading(false);
			}
		};

		fetchQuiz();
	}, [courseId, quizId]);

	return { quiz, isLoading, error };
}
