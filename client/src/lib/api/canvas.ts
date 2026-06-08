import { apiClient } from './client';
import type {
	CanvasConnectionStatus,
	CanvasCourseOption,
	CourseCanvasLink,
} from '@/types/canvas';

const getApiBaseUrl = (): string => {
	if (typeof window !== 'undefined') {
		return process.env.NEXT_PUBLIC_API_BASE_URL || window.location.origin;
	}
	return process.env.NEXT_PUBLIC_API_BASE_URL || '';
};

export const canvasApi = {
	startOAuth(options: { reauth?: boolean } = {}) {
		const base = `${getApiBaseUrl()}/api/canvas/oauth/start`;
		window.location.href = options.reauth ? `${base}?reauth=1` : base;
	},

	async getStatus(): Promise<CanvasConnectionStatus | null> {
		const response = await apiClient.get<{ connected: boolean; canvasUserId?: number; connectedAt?: string; institutionName?: string }>(
			'/api/canvas/status'
		);
		if (!response.success || !response.data) {
			return null;
		}
		return response.data;
	},

	async disconnect(): Promise<boolean> {
		const response = await apiClient.delete('/api/canvas/disconnect');
		return response.success;
	},

	async getCanvasCourses(): Promise<CanvasCourseOption[]> {
		const response = await apiClient.get<{ courses: CanvasCourseOption[] }>('/api/canvas/courses');
		if (!response.success || !response.data?.courses) {
			return [];
		}
		return response.data.courses;
	},

	async linkCourse(courseId: string, canvasCourseId: number): Promise<CourseCanvasLink | null> {
		const response = await apiClient.post<{ canvas: CourseCanvasLink }>(
			`/api/courses/${courseId}/canvas/link`,
			{ canvasCourseId }
		);
		if (!response.success || !response.data?.canvas) {
			return null;
		}
		return response.data.canvas;
	},

	async unlinkCourse(courseId: string): Promise<boolean> {
		const response = await apiClient.delete(`/api/courses/${courseId}/canvas/link`);
		return response.success;
	},
};
