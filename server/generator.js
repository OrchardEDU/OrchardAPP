import { Ollama } from 'ollama';
import { demoOutputJsonSchema } from './schemas.js';

export class Generator {
	constructor() {
		// Handle all Ollama-related environment variables
		const ollamaHost = process.env.PORT_OLLAMA || 'http://localhost:11434';
		this.model = process.env.OLLAMA_MODEL || 'llama3';
		this.embeddingModel = process.env.OLLAMA_EMBEDDING_MODEL || 'mxbai-embed-large';

		this.ollama = new Ollama({ host: ollamaHost });
		console.log(
			`Generator initialized with Ollama (host: ${ollamaHost}, model: ${this.model})`
		);
	}

	/**
	 * Check if Generator is running
	 * @returns {Promise<boolean>} True if generator is running
	 */
	async isRunning() {
		try {
			// Check if Ollama is accessible
			await this.ollama.list();
			return true;
		} catch (error) {
			console.error('[Generator] Not running:', error.message);
			return false;
		}
	}

	/**
	 * Generate embeddings for text using Ollama
	 * @param {string} text - Text to generate embedding for
	 * @param {string} model - Embedding model to use (default: mxbai-embed-large)
	 * @returns {Promise<number[]>} Embedding vector
	 */
	async getEmbedding(text, model = null) {
		try {
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
	 * Generate a question using Ollama with optional context
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

                Generate the question now:`
				: `Generate a thoughtful, educational question that would be appropriate for students based on the following topic: "${prompt}"

                The question should:
                - Be clear and well-formulated
                - Test understanding of the topic
                - Be appropriate for educational purposes
                - Be engaging and thought-provoking

                Generate the question now:`;
			console.log(demoOutputJsonSchema);
			const response = await this.ollama.chat({
				model: this.model,
				messages: [{ role: 'user', content: query }],
				format: demoOutputJsonSchema,
			});
			console.log('OLLAMA RESPONSE:\n', response);
			// Parse structured output from Ollama
			if (!response || !response.message || !response.message.content) {
				console.error('[Generator] Ollama failed to generate');
				return {
					message: {
						content: 'No question generated',
					},
					structured: null,
				};
			}
			let structuredOutput;
			try {
				// Parse JSON response (no Zod validation, just JSON parsing)
				structuredOutput = JSON.parse(response.message.content);
			} catch (error) {
				console.error('[Generator] Failed to parse JSON output:', error);
				// Fallback to extracting content as string
				return {
					message: {
						content: response.message.content || 'No question generated',
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
				structured: null,
			};
		} catch (error) {
			console.error('Error generating question:', error);
			throw error;
		}
	}
}
