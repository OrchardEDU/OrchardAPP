import { Quiz } from '@/types/quiz';

export function validateSubmission(quiz: Quiz, answers: Array<{ questionId: string; answer: string }>): { valid: boolean; errors: string[] } {
	const errors: string[] = [];

	// Check if quiz is published
	if (!quiz.published) {
		errors.push('Quiz is not published');
	}

	// Check if due date has passed
	if (quiz.dueDate) {
		const dueDate = new Date(quiz.dueDate);
		const now = new Date();
		if (now > dueDate) {
			errors.push('Quiz due date has passed');
		}
	}

	// Check if all questions are answered
	if (answers.length !== quiz.questions.length) {
		errors.push('Not all questions are answered');
	}

	// Check if all question IDs match
	const questionIds = new Set(quiz.questions.map(q => q.id));
	const answerIds = new Set(answers.map(a => a.questionId));
	
	if (questionIds.size !== answerIds.size) {
		errors.push('Answer question IDs do not match quiz questions');
	}

	// Convert Set to Array for iteration (compatible with es5 target)
	Array.from(questionIds).forEach((questionId) => {
		if (!answerIds.has(questionId)) {
			errors.push(`Question ${questionId} is not answered`);
		}
	});

	return {
		valid: errors.length === 0,
		errors,
	};
}
