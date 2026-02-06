export interface User {
	id: string;
	email: string;
	name: string;
	role: 'student' | 'teacher';
}
