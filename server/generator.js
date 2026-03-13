import { Ollama } from 'ollama';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { demoOutputJsonSchema, questionGenerationOutputSchema } from './schemas.js';

export class Generator {
	constructor() {
		// Always initialize Ollama for embeddings
		const ollamaHost = process.env.PORT_OLLAMA || 'http://localhost:11434';
		this.embeddingModel = process.env.OLLAMA_EMBEDDING_MODEL || 'mxbai-embed-large';
		this.ollama = new Ollama({ host: ollamaHost });
		
		// Determine which provider to use for generation based on USE_LOCAL env var
		this.useLocal = process.env.USE_LOCAL === 'true' || process.env.USE_LOCAL === '1';
		
		if (this.useLocal) {
			// Use Ollama for generation
			this.model = process.env.OLLAMA_MODEL || 'llama3';
			console.log(
				`Generator initialized with Ollama for generation and embeddings (host: ${ollamaHost}, model: ${this.model}, embedding model: ${this.embeddingModel})`
			);
		} else {
			// Use Gemini for generation (embeddings still use Ollama)
			const geminiApiKey = process.env.GEMINI_API;
			if (!geminiApiKey) {
				throw new Error(
					'GEMINI_API not set. Required when USE_LOCAL is false or not set.'
				);
			}
			this.genAI = new GoogleGenerativeAI(geminiApiKey);
			this.model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
			console.log(
				`Generator initialized with Gemini for generation (model: ${this.model}) and Ollama for embeddings (model: ${this.embeddingModel})`
			);
		}
	}

	/**
	 * Check if Generator is running
	 * @returns {Promise<boolean>} True if generator is running
	 */
	async isRunning() {
		try {
			// Always check Ollama (required for embeddings)
			await this.ollama.list();
			
			// Check generation provider
			if (this.useLocal) {
				// Ollama is already checked above
				return true;
			} else {
				// Check if Gemini is accessible by making a simple request
				const model = this.genAI.getGenerativeModel({ model: this.model });
				await model.generateContent('test');
				return true;
			}
		} catch (error) {
			console.error('[Generator] Not running:', error.message);
			return false;
		}
	}

	/**
	 * Generate embeddings for text using Ollama (always uses Ollama regardless of USE_LOCAL)
	 * @param {string} text - Text to generate embedding for
	 * @param {string} model - Embedding model to use (optional, uses default)
	 * @returns {Promise<number[]>} Embedding vector
	 */
	async getEmbedding(text, model = null) {
		try {
			// Always use Ollama for embeddings
			const embeddingModel = model || this.embeddingModel;
			const response = await this.ollama.embeddings({
				model: embeddingModel,
				prompt: text,
			});
			return response.embedding;
		} catch (error) {
			console.error('Error getting embedding:', error);
			throw new Error(`Failed to get embedding: ${error.message}`);
		}
	}

	/**
	 * Generate a question using Ollama or Gemini with optional context
	 * @param {string} prompt - The user prompt or topic
	 * @param {string} context - Optional RAG context to include
	 * @returns {Promise<{message: {content: string}, structured: object|null}>} Generated response
	 */
	async generateQuestion(prompt, context = null) {
		try {
			const query = context
				? `Generate a thoughtful, educational question that would be appropriate for students based on the following topic: "${prompt}"

                Use the following context to inform your question:
                ${context}

                The question should:
                - Be clear and well-formulated
                - Test understanding of the topic
                - Be appropriate for educational purposes
                - Be engaging and thought-provoking
                - Relate to the provided context when relevant

                Generate the question now. Respond with a JSON object matching this schema: ${JSON.stringify(demoOutputJsonSchema)}`
				: `Generate a thoughtful, educational question that would be appropriate for students based on the following topic: "${prompt}"

                The question should:
                - Be clear and well-formulated
                - Test understanding of the topic
                - Be appropriate for educational purposes
                - Be engaging and thought-provoking

                Generate the question now. Respond with a JSON object matching this schema: ${JSON.stringify(demoOutputJsonSchema)}`;

			let response;
			let responseContent;

			if (this.useLocal) {
				// Use Ollama
				console.log('Using Ollama for generation');
				response = await this.ollama.chat({
					model: this.model,
					messages: [{ role: 'user', content: query }],
					format: demoOutputJsonSchema,
				});
				console.log('OLLAMA RESPONSE:\n', response);
				
				if (!response || !response.message || !response.message.content) {
					console.error('[Generator] Ollama failed to generate');
					return {
						message: {
							content: 'No question generated',
						},
						structured: null,
					};
				}
				responseContent = response.message.content;
			} else {
				// Use Gemini
				console.log('Using Gemini for generation');
				const model = this.genAI.getGenerativeModel({ 
					model: this.model,
					generationConfig: {
						responseMimeType: 'application/json',
						responseSchema: demoOutputJsonSchema,
					},
				});
				const result = await model.generateContent(query);
				responseContent = result.response.text();
				console.log('GEMINI RESPONSE:\n', responseContent);
			}

			// Parse structured output
			let structuredOutput;
			try {
				// Parse JSON response
				structuredOutput = JSON.parse(responseContent);
			} catch (error) {
				console.error('[Generator] Failed to parse JSON output:', error);
				// Fallback to extracting content as string
				return {
					message: {
						content: responseContent || 'No question generated',
					},
					structured: null,
				};
			}

			const generatedQuestion = structuredOutput.question;
			const relevancy = structuredOutput.relevancy;
			console.log('GENERATED QUESTION:', generatedQuestion);
			console.log('RELEVANCY:', relevancy);
			return {
				message: {
					content: generatedQuestion,
				},
				structured: structuredOutput,
			};
		} catch (error) {
			console.error('Error generating question:', error);
			throw error;
		}
	}

	/**
	 * Generate multiple questions using Ollama or Gemini with optional context
	 * @param {string} topic - The topic for question generation
	 * @param {number} numQuestions - Number of questions to generate (1-20)
	 * @param {string} context - Optional RAG context to include
	 * @param {'open-response'|'multiple-choice'|'short-answer'} questionType - Desired question type
	 * @returns {Promise<Array<{question: string}>>} Array of generated questions
	 */
	async generateQuestions(
		topic,
		numQuestions,
		context = null,
		questionType = 'open-response'
	) {
		try {
			const baseSystemPrompt = `You are an AI assistant that generates high-quality quiz questions for students.

General requirements for all questions:
- Be clear and well-formulated
- Test understanding of the topic
- Be appropriate for educational purposes
- Be engaging and age-appropriate
- Questions must be distinct from one another

The JSON you return MUST strictly follow the provided JSON schema, including field names and types.`;

			let typeInstructions = '';
			if (questionType === 'multiple-choice') {
				typeInstructions = `
For this request, you MUST generate ONLY multiple-choice questions.
For each object in the "questions" array:
- Set "type" to "multiple-choice"
- Include a "correctOption" string that is the single correct answer
- Include an "incorrectOptions" array with 3 concise, plausible but clearly incorrect options
- Do NOT include "options" or "correctAnswerIndex" fields; those will be constructed on the backend
- The incorrect options must be plausible but clearly incorrect for a well-prepared student.`;
			} else if (questionType === 'short-answer') {
				typeInstructions = `
For this request, you MUST generate ONLY short-answer questions.
For each object in the "questions" array:
- Set "type" to "short-answer"
- Do NOT include "options" or "correctAnswerIndex".`;
			} else {
				typeInstructions = `
For this request, you MUST generate ONLY open-ended questions.
For each object in the "questions" array:
- Set "type" to "open-response"
- Do NOT include "options" or "correctAnswerIndex".`;
			}

			const systemPrompt = `${baseSystemPrompt}\n\n${typeInstructions}`;

			const query = context
				? `${systemPrompt}

Generate ${numQuestions} thoughtful, educational questions that would be appropriate for students based on the following topic: "${topic}"

Use the following context to inform your questions:
${context}

Generate ${numQuestions} questions now. Respond with a JSON object matching this schema: ${JSON.stringify(
					questionGenerationOutputSchema
				)}`
				: `${systemPrompt}

Generate ${numQuestions} thoughtful, educational questions that would be appropriate for students based on the following topic: "${topic}"

Generate ${numQuestions} questions now. Respond with a JSON object matching this schema: ${JSON.stringify(
					questionGenerationOutputSchema
				)}`;

			let response;
			let responseContent;

			if (this.useLocal) {
				// Use Ollama
				console.log('Using Ollama for question generation');
				response = await this.ollama.chat({
					model: this.model,
					messages: [{ role: 'user', content: query }],
					format: questionGenerationOutputSchema,
				});
				console.log('OLLAMA RESPONSE:\n', response);

				if (!response || !response.message || !response.message.content) {
					console.error('[Generator] Ollama failed to generate questions');
					return [];
				}
				responseContent = response.message.content;
			} else {
				// Use Gemini
				console.log('Using Gemini for question generation');
				const model = this.genAI.getGenerativeModel({
					model: this.model,
					generationConfig: {
						responseMimeType: 'application/json',
						responseSchema: questionGenerationOutputSchema,
					},
				});
				const result = await model.generateContent(query);
				responseContent = result.response.text();
				console.log('GEMINI RESPONSE:\n', responseContent);
			}

			// Parse structured output
			let structuredOutput;
			try {
				// Parse JSON response
				structuredOutput = JSON.parse(responseContent);
			} catch (error) {
				console.error('[Generator] Failed to parse JSON output:', error);
				return [];
			}

			// Extract questions array and normalize MCQ structure
			const rawQuestions = structuredOutput.questions || [];

			const questions = rawQuestions.map((q) => {
				if (!q || q.type !== 'multiple-choice') {
					return q;
				}

				const correctOption =
					typeof q.correctOption === 'string' ? q.correctOption.trim() : '';
				const incorrectOptions = Array.isArray(q.incorrectOptions)
					? q.incorrectOptions
							.filter((opt) => typeof opt === 'string')
							.map((opt) => opt.trim())
							.filter((opt) => opt.length > 0)
					: [];

				if (!correctOption) {
					// If the model didn't follow the spec, fall back to the original object.
					return q;
				}

				// Start from the incorrect options and insert the correct option at a random index.
				const options = [...incorrectOptions];
				const insertIndex = Math.floor(Math.random() * (options.length + 1));
				options.splice(insertIndex, 0, correctOption);

				return {
					...q,
					options,
					correctAnswerIndex: insertIndex,
				};
			});

			console.log(`[Generator] Generated ${questions.length} questions`);
			return questions;
		} catch (error) {
			console.error('Error generating questions:', error);
			throw error;
		}
	}
}
