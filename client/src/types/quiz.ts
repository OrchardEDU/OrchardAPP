export interface QuizQuestion {
	id: string;
	type: 'multiple-choice' | 'open-ended';
	question: string;
	options?: string[] | null; // only for multiple-choice
	correctAnswer?: string | null; // only for teachers
	points: number;
}

export interface Quiz {
	id: string;
	courseId: string;
	title: string;
	description: string;
	published: boolean;
	dueDate: string | null;
	questions: QuizQuestion[];
	createdAt: string;
	questionCount?: number;
	submissionCount?: number; // only for teachers
	hasSubmission?: boolean; // only for students
}
