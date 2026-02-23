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
			question: string;
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
			question: string;
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

	async submitQuiz(courseId: string, quizId: string, answers: Array<{ questionIndex: number; answer: string }>): Promise<Submission | null> {
		const response = await apiClient.post<{ submission: Submission }>(`/api/courses/${courseId}/quizzes/${quizId}/submit`, { answers });
		if (response.success && response.data?.submission) {
			return response.data.submission;
		}
		return null;
	},

	async getSubmissionDetail(courseId: string, quizId: string, submissionId: string): Promise<Submission | null> {
		const response = await apiClient.get<{ submission: Submission }>(`/api/courses/${courseId}/quizzes/${quizId}/submissions/${submissionId}`);
		if (response.success && response.data?.submission) {
			return response.data.submission;
		}
		return null;
	},

	async gradeSubmission(courseId: string, quizId: string, submissionId: string, answers: Array<{ questionIndex: number; pointsAwarded: number }>): Promise<Submission | null> {
		const response = await apiClient.post<{ submission: Submission }>(`/api/courses/${courseId}/quizzes/${quizId}/submissions/${submissionId}/grade`, { answers });
		if (response.success && response.data?.submission) {
			return response.data.submission;
		}
		return null;
	},

	async getMySubmission(courseId: string, quizId: string): Promise<Submission | null> {
		const response = await apiClient.get<{ submission: Submission | null }>(`/api/courses/${courseId}/quizzes/${quizId}/my-submission`);
		if (response.success && response.data?.submission !== undefined) {
			return response.data.submission;
		}
		return null;
	},
};
