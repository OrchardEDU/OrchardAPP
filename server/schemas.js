// JSON Schema for demo input
// TODO: Replace with actual schema definition
export const demoInputJsonSchema = {
	type: 'object',
	properties: {
		prompt: {
			type: 'string',
			description: 'The user prompt or question',
		},
		// Add more fields as needed
	},
	required: ['prompt'],
};

// JSON Schema for demo output
// TODO: Replace with actual schema definition
export const demoOutputJsonSchema = {
	type: 'object',
	properties: {
		question: {
			type: 'string',
			description: 'The generated question',
		},
		relevancy: {
			type: 'string',
			enum: ['not relevant', 'somewhat relevant', 'relevant', 'very relevant'],
			description:
				'The relevancy of the context inputted to the prompt & following, where 1 is least relevant and 10 is most relevant',
		},
		// Add more fields as needed
	},
	required: ['question', 'relevancy'],
};

// JSON Schema for question generation output (multiple questions).
// NOTE: Gemini's responseSchema only supports a subset of JSON Schema, so we avoid
// oneOf/const here and enforce stricter rules via the prompt and our own validation.
export const questionGenerationOutputSchema = {
	type: 'object',
	properties: {
		questions: {
			type: 'array',
			items: {
				type: 'object',
				properties: {
					question: {
						type: 'string',
						description: 'The generated question text',
					},
					type: {
						type: 'string',
						enum: ['open-response', 'multiple-choice', 'short-answer'],
						description: 'The type of question that was generated',
					},
					correctOption: {
						type: 'string',
						description:
							'For multiple-choice questions, the single correct answer option',
					},
					incorrectOptions: {
						type: 'array',
						items: {
							type: 'string',
						},
						description:
							'For multiple-choice questions, an array of incorrect but plausible options',
					},
				},
				required: ['question', 'type'],
			},
			description: 'Array of generated questions',
		},
	},
	required: ['questions'],
};
