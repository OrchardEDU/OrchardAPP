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
			type: 'number',
			description:
				'The relevancy of the context inputted to the prompt & following question, where 1 is least relevant and 10 is most relevant',
		},
		// Add more fields as needed
	},
	required: ['question', 'relevancy'],
};
