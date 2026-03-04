export type QuizQuestionType = 'open-response' | 'multiple-choice' | 'short-answer';

export interface QuizQuestion {
	question: string;
	points: number;
	type?: QuizQuestionType;
	options?: string[];
	correctAnswer?: number;
	wordLimit?: number;
	charLimit?: number;
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
	score?: number; // only for students, if graded
	maxScore?: number; // only for students, if graded
	isGraded?: boolean; // only for students
}
