import type { CourseCanvasLink } from './canvas';

export interface Course {
	id: string;
	name: string;
	description: string;
	teacherId: string;
	teacherName?: string;
	joinCode: string;
	createdAt: string;
	enrolledAt?: string; // only for students
	studentCount?: number; // only for teachers
	canvas?: CourseCanvasLink;
}
