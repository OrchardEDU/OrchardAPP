import { apiClient } from './client';
import { Course } from '@/types/course';

export const coursesApi = {
	async getCourses(): Promise<Course[]> {
		const response = await apiClient.get<{ courses: Course[] }>('/api/courses');
		if (response.success && response.data?.courses) {
			return response.data.courses;
		}
		return [];
	},

	async getCourse(courseId: string): Promise<Course | null> {
		const response = await apiClient.get<{ course: Course }>(`/api/courses/${courseId}`);
		if (response.success && response.data?.course) {
			return response.data.course;
		}
		return null;
	},

	async createCourse(data: { name: string; description: string }): Promise<Course | null> {
		const response = await apiClient.post<{ course: Course }>('/api/courses', data);
		if (response.success && response.data?.course) {
			return response.data.course;
		}
		return null;
	},

	async updateCourse(courseId: string, data: { name?: string; description?: string }): Promise<Course | null> {
		const response = await apiClient.put<{ course: Course }>(`/api/courses/${courseId}`, data);
		if (response.success && response.data?.course) {
			return response.data.course;
		}
		return null;
	},

	async joinCourse(joinCode: string): Promise<Course | null> {
		const response = await apiClient.post<{ course: Course }>('/api/courses/join', { joinCode });
		if (response.success && response.data?.course) {
			return response.data.course;
		}
		return null;
	},

	async deleteCourse(courseId: string): Promise<boolean> {
		const response = await apiClient.delete<{ id: string }>(`/api/courses/${courseId}`);
		return !!(response.success && response.data?.id);
	},

	async getCourseStudents(courseId: string): Promise<Array<{ id: string; name: string; email: string; enrolledAt: string }>> {
		const response = await apiClient.get<{ students: Array<{ id: string; name: string; email: string; enrolledAt: string }> }>(`/api/courses/${courseId}/students`);
		if (response.success && response.data?.students) {
			return response.data.students;
		}
		return [];
	},

	async removeStudent(courseId: string, studentId: string): Promise<boolean> {
		const response = await apiClient.delete<{ id: string }>(`/api/courses/${courseId}/students/${studentId}`);
		return !!(response.success && response.data?.id);
	},
};
