import { Quiz } from '@/types/quiz';

export function isQuizPublished(quiz: Quiz): boolean {
	return quiz.published === true;
}

export function canStudentViewQuiz(quiz: Quiz): boolean {
	return isQuizPublished(quiz);
}

export function canStudentSubmitQuiz(quiz: Quiz): boolean {
	if (!isQuizPublished(quiz)) return false;
	
	// Check if due date has passed
	if (quiz.dueDate) {
		const dueDate = new Date(quiz.dueDate);
		const now = new Date();
		return now <= dueDate;
	}
	
	return true;
}
