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

// JSON Schema for question generation output (multiple questions)
// TODO: Replace with actual schema definition
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
				},
				required: ['question'],
			},
			description: 'Array of generated questions',
		},
	},
	required: ['questions'],
};
