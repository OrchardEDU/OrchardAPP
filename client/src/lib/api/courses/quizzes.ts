import { apiClient } from '../client';
import { Quiz } from '@/types/quiz';
import { Submission } from '@/types/submission';

export const quizzesApi = {
	async getCourseQuizzes(courseId: string): Promise<Quiz[]> {
		const response = await apiClient.get<{ quizzes: Quiz[] }>(`/api/courses/${courseId}/quizzes`);
		if (response.success && response.data?.quizzes) {
			return response.data.quizzes;
		}
		return [];
	},

	async getQuiz(courseId: string, quizId: string): Promise<Quiz | null> {
		const response = await apiClient.get<{ quiz: Quiz }>(`/api/courses/${courseId}/quizzes/${quizId}`);
		if (response.success && response.data?.quiz) {
			return response.data.quiz;
		}
		return null;
	},

	async createQuiz(courseId: string, data: {
		title: string;
		description: string;
		published: boolean;
		dueDate: string | null;
		questions: Array<{
			type: 'multiple-choice' | 'open-ended';
			question: string;
			options?: string[] | null;
			correctAnswer: string;
			points: number;
		}>;
	}): Promise<Quiz | null> {
		const response = await apiClient.post<{ quiz: Quiz }>(`/api/courses/${courseId}/quizzes`, data);
		if (response.success && response.data?.quiz) {
			return response.data.quiz;
		}
		return null;
	},

	async updateQuiz(courseId: string, quizId: string, data: {
		title?: string;
		description?: string;
		published?: boolean;
		dueDate?: string | null;
		questions?: Array<{
			type: 'multiple-choice' | 'open-ended';
			question: string;
			options?: string[] | null;
			correctAnswer: string;
			points: number;
		}>;
	}): Promise<Quiz | null> {
		const response = await apiClient.put<{ quiz: Quiz }>(`/api/courses/${courseId}/quizzes/${quizId}`, data);
		if (response.success && response.data?.quiz) {
			return response.data.quiz;
		}
		return null;
	},

	async getQuizSubmissions(courseId: string, quizId: string): Promise<Submission[]> {
		const response = await apiClient.get<{ submissions: Submission[] }>(`/api/courses/${courseId}/quizzes/${quizId}/submissions`);
		if (response.success && response.data?.submissions) {
			return response.data.submissions;
		}
		return [];
	},

	async submitQuiz(courseId: string, quizId: string, answers: Array<{ questionId: string; answer: string }>): Promise<Submission | null> {
		const response = await apiClient.post<{ submission: Submission }>(`/api/courses/${courseId}/quizzes/${quizId}/submit`, { answers });
		if (response.success && response.data?.submission) {
			return response.data.submission;
		}
		return null;
	},
};
