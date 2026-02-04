import { coursesApi } from '@/lib/api/courses';
import { Course } from '@/types/course';

export async function joinCourse(joinCode: string): Promise<{ success: boolean; course?: Course; error?: string }> {
	try {
		const course = await coursesApi.joinCourse(joinCode);
		if (course) {
			return { success: true, course };
		}
		return { success: false, error: 'Failed to join course' };
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Failed to join course',
		};
	}
}
