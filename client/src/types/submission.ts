export interface SubmissionAnswer {
	questionIndex: number;
	answer: string;
	pointsAwarded?: number;
}

export interface Submission {
	id: string;
	quizId: string;
	studentId: string;
	studentName?: string;
	studentEmail?: string;
	answers: SubmissionAnswer[];
	score: number;
	maxScore: number;
	isGraded?: boolean;
	submittedAt: string;
	quizTitle?: string;
	quizQuestions?: Array<{
		question: string;
		points: number;
		type?: 'open-response' | 'multiple-choice' | 'short-answer';
		options?: string[];
		correctAnswer?: number;
		wordLimit?: number;
		charLimit?: number;
		orderIndex: number;
	}>;
}
