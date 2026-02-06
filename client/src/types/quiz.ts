export interface QuizQuestion {
	question: string;
	points: number;
	orderIndex?: number;
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
