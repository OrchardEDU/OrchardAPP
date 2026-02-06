import { Course } from '@/types/course';
import { User } from '@/types/user';

export function canAccessCourse(course: Course, user: User | null): boolean {
	if (!user) return false;
	
	// Teacher can access if they own the course
	if (user.role === 'teacher' && course.teacherId === user.id) {
		return true;
	}
	
	// Student can access if enrolled (has enrolledAt date)
	if (user.role === 'student' && course.enrolledAt) {
		return true;
	}
	
	return false;
}

export function canEditCourse(course: Course, user: User | null): boolean {
	if (!user) return false;
	return user.role === 'teacher' && course.teacherId === user.id;
}
