export interface SubmissionAnswer {
	questionId: string;
	answer: string;
	isCorrect?: boolean; // if auto-gradable
	points?: number;
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
	submittedAt: string;
}
