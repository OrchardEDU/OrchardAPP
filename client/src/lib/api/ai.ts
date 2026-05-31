import { apiClient } from './client';

export interface GeneratedQuestion {
	question: string;
	// Optional structured fields used for richer question types (e.g. MCQ)
	type?: 'open-response' | 'multiple-choice' | 'short-answer';
	options?: string[];
	/**
	 * Index of the correct answer in the options array (0-based)
	 * Only used for multiple-choice questions.
	 */
	correctAnswerIndex?: number;
}

export interface EmbedContentResponse {
	id: string;
	filename: string;
	size?: number;
	mimetype?: string;
}

export const aiApi = {
	/**
	 * Generate multiple questions from a topic
	 * @param topic - The topic for question generation
	 * @param numQuestions - Number of questions to generate (1-20)
	 * @param courseId - Optional course ID for RAG context
	 * @param questionType - Optional question type hint for generation
	 * @returns Array of generated questions
	 */
	async generateQuestions(
		topic: string,
		numQuestions: number,
		courseId?: string,
		questionType?: 'open-response' | 'multiple-choice' | 'short-answer'
	): Promise<GeneratedQuestion[]> {
		const body: any = {
			topic,
			numQuestions,
		};
		if (courseId) {
			body.courseId = courseId;
		}
		if (questionType) {
			body.questionType = questionType;
		}

		const response = await apiClient.post<GeneratedQuestion[]>(
			'/api/ai/questions/generate',
			body
		);
		if (response.success && response.data) {
			return response.data;
		}
		return [];
	},

	/**
	 * Embed text content to Qdrant for a course
	 * @param courseId - Course ID
	 * @param content - Text content to embed
	 * @returns Embed response with content ID
	 */
	async embedContent(
		courseId: string,
		content: string
	): Promise<EmbedContentResponse | null> {
		const response = await apiClient.post<EmbedContentResponse>(
			'/api/ai/content/embed',
			{
				courseId,
				content,
			}
		);
		if (response.success && response.data) {
			return response.data;
		}
		return null;
	},

	/**
	 * Embed file content to Qdrant for a course
	 * @param courseId - Course ID
	 * @param file - File to upload and embed
	 * @returns Embed response with content ID
	 */
	async embedFile(
		courseId: string,
		file: File
	): Promise<EmbedContentResponse | null> {
		const formData = new FormData();
		formData.append('file', file);
		formData.append('courseId', courseId);

		try {
			const apiBase =
				process.env.NEXT_PUBLIC_API_BASE_URL ||
				(typeof window !== 'undefined' ? window.location.origin : '');

			const response = await fetch(`${apiBase}/api/ai/content/embed`, {
				method: 'POST',
				credentials: 'include',
				body: formData,
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || 'Failed to embed file');
			}

			const data = await response.json();
			if (data.success && data.data) {
				return data.data;
			}
			return null;
		} catch (error) {
			console.error('API embed file error:', error);
			return null;
		}
	},

	/**
	 * List embedded materials for a course
	 * @param courseId - Course ID
	 * @returns Array of materials
	 */
	async listMaterials(courseId: string): Promise<EmbedContentResponse[]> {
		const response = await apiClient.get<EmbedContentResponse[]>(
			`/api/ai/content?courseId=${courseId}`
		);
		if (response.success && response.data) {
			return response.data;
		}
		return [];
	},

	/**
	 * Delete embedded content from Qdrant
	 * @param contentId - Content ID to delete
	 * @param courseId - Course ID
	 * @returns Success status
	 */
	async deleteContent(contentId: string, courseId: string): Promise<boolean> {
		const response = await apiClient.delete<{ success: boolean }>(
			`/api/ai/content/${contentId}?courseId=${courseId}`
		);
		return response.success || false;
	},
};
