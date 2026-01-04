import { QdrantClient } from '@qdrant/js-client-rest';
import { Ollama } from 'ollama';

export class Generator {
	constructor(qdrantUrl = null) {
		this.collectionName = process.env.QDRANT_COLLECTION_NAME;
		if (!this.collectionName) {
			throw new Error('QDRANT_COLLECTION_NAME must be set in .env file');
		}

		const apiKey = process.env.QDRANT_API_KEY;
		if (!apiKey) {
			throw new Error('QDRANT_API_KEY must be set in .env file');
		}

		const qdrantClusterUrl = process.env.QDRANT_CLUSTER_URL;
		if (!qdrantClusterUrl) {
			throw new Error('QDRANT_CLUSTER_URL must be set in .env file');
		}

		this.client = new QdrantClient({
			url: qdrantClusterUrl,
			apiKey: apiKey,
		});

		const ollamaHost = process.env.PORT_OLLAMA || 'http://localhost:11434';
		this.ollama = new Ollama({ host: ollamaHost });

		this.embeddingModel = 'mxbai-embed-large';
		this.vectorSize = 1024;
		this._collectionVerified = false;
		this._pointIdCounter = parseInt(process.env.QDRANT_COUNT || '0', 10);
		console.log(
			`RAG Generator initialized with Qdrant (starting point ID: ${this._pointIdCounter})`
		);
	}

	async _ensureCollection() {
		if (this._collectionVerified) return;
		try {
			const collection = await this.client.getCollection(this.collectionName);
			if (!collection) {
				throw new Error(`Collection ${this.collectionName} does not exist in Qdrant`);
			}
			this._collectionVerified = true;
		} catch (error) {
			throw new Error(
				`Collection ${this.collectionName} does not exist in Qdrant: ${error.message}`
			);
		}
	}

	async _getEmbedding(text) {
		try {
			const response = await this.ollama.embeddings({
				model: this.embeddingModel,
				prompt: text,
			});
			return response.embedding;
		} catch (error) {
			console.error('Error getting embedding:', error);
			throw new Error(`Failed to get embedding: ${error.message}`);
		}
	}

	async search(queryText, limit = 5, userId = null, subjectId = null) {
		await this._ensureCollection();
		const queryVector = await this._getEmbedding(queryText);

		let queryFilter = null;
		if (userId || subjectId) {
			const mustConditions = [];
			if (userId) {
				mustConditions.push({ key: 'user-id', match: { value: userId } });
			}
			if (subjectId) {
				mustConditions.push({ key: 'subject-id', match: { value: subjectId } });
			}
			queryFilter = { must: mustConditions };
		}

		const searchRequest = {
			vector: queryVector,
			limit: limit,
			with_payload: true,
		};

		if (queryFilter) {
			searchRequest.filter = queryFilter;
		}

		const results = await this.client.search(this.collectionName, searchRequest);
		const queryPreview = queryText.length > 50 ? queryText.substring(0, 50) + '...' : queryText;
		console.log(
			`[Qdrant] Successfully retrieved ${results.length} results from Qdrant for query: "${queryPreview}"`
		);
		return results;
	}

	async retrieveContext(queryText, limit = 5, userId = null, subjectId = null) {
		const results = await this.search(queryText, limit, userId, subjectId);
		const contextChunks = [];
		for (const point of results) {
			if (point.payload?.text) {
				contextChunks.push(point.payload.text);
			}
		}
		console.log(
			`[Qdrant] Successfully retrieved ${contextChunks.length} context chunks from Qdrant`
		);
		return contextChunks;
	}

	async generateQuestionWithContext(queryText, userId = null, subjectId = null, limit = 5) {
		try {
			console.log(`[RAG] Retrieving context for query: "${queryText}"`);
			const contextChunks = await this.retrieveContext(queryText, limit, userId, subjectId);
			console.log(`[RAG] Retrieved ${contextChunks.length} context chunks`);

			const context = contextChunks.join('\n\n');
			console.log(`[RAG] Context length: ${context.length} characters`);

			const prompt = context
				? `Generate a thoughtful, educational question that would be appropriate for students based on the following topic: "${queryText}"

Use the following context to inform your question:
${context}

The question should:
- Be clear and well-formulated
- Test understanding of the topic
- Be appropriate for educational purposes
- Be engaging and thought-provoking
- Relate to the provided context when relevant

Generate the question now:`
				: `Generate a thoughtful, educational question that would be appropriate for students based on the following topic: "${queryText}"

The question should:
- Be clear and well-formulated
- Test understanding of the topic
- Be appropriate for educational purposes
- Be engaging and thought-provoking

Generate the question now:`;

			const response = await this.ollama.chat({
				model: 'llama3',
				messages: [{ role: 'user', content: prompt }],
			});

			const generatedQuestion =
				response.message?.content ||
				response.choices?.[0]?.message?.content ||
				'No question generated';
			return generatedQuestion;
		} catch (error) {
			console.error('Error generating question with context:', error);
			throw error;
		}
	}

	_chunkText(text, chunkSize = 500, overlap = 50) {
		const chunks = [];
		let start = 0;

		while (start < text.length) {
			const end = Math.min(start + chunkSize, text.length);
			let chunk = text.slice(start, end);

			if (end < text.length) {
				const lastPeriod = chunk.lastIndexOf('.');
				const lastNewline = chunk.lastIndexOf('\n');
				const breakPoint = Math.max(lastPeriod, lastNewline);

				if (breakPoint > chunkSize * 0.5) {
					chunk = text.slice(start, start + breakPoint + 1);
					start = start + breakPoint + 1 - overlap;
				} else {
					start = end - overlap;
				}
			} else {
				start = end;
			}

			chunks.push(chunk.trim());
		}

		return chunks.filter((chunk) => chunk.length > 0);
	}

	async addDocument(fileId, text, filename, userId = null, subjectId = null) {
		try {
			await this._ensureCollection();
			console.log(`[RAG] Processing document: ${filename} (${text.length} characters)`);

			const chunks = this._chunkText(text, 500, 50);
			console.log(`[RAG] Split into ${chunks.length} chunks`);

			const points = [];
			for (let i = 0; i < chunks.length; i++) {
				const embedding = await this._getEmbedding(chunks[i]);
				const point = {
					id: this._pointIdCounter++,
					vector: embedding,
					payload: {
						text: chunks[i],
						'file-id': fileId,
						filename: filename,
						'chunk-index': i,
					},
				};

				if (userId) point.payload['user-id'] = userId;
				if (subjectId) point.payload['subject-id'] = subjectId;
				points.push(point);
			}

			const startId = points[0]?.id ?? this._pointIdCounter;
			const endId = this._pointIdCounter - 1;
			console.log(
				`[Qdrant] Uploading ${points.length} points to Qdrant for file: ${filename} (IDs: ${startId}-${endId})...`
			);

			await this.client.upsert(this.collectionName, {
				wait: true,
				points: points,
			});

			console.log(
				`[Qdrant] Successfully uploaded ${points.length} chunks to Qdrant for file: ${filename} (point IDs: ${startId}-${endId})`
			);
			return points.length;
		} catch (error) {
			console.error(`[RAG] Error adding document ${filename}:`, error);
			throw error;
		}
	}

	async deleteDocument(fileId) {
		try {
			await this._ensureCollection();
			console.log(`[Qdrant] Deleting all chunks for file: ${fileId} from Qdrant...`);

			await this.client.delete(this.collectionName, {
				wait: true,
				filter: {
					must: [{ key: 'file-id', match: { value: fileId } }],
				},
			});

			console.log(`[Qdrant] Successfully deleted all chunks from Qdrant for file: ${fileId}`);
			return true;
		} catch (error) {
			console.error(`[RAG] Error deleting document ${fileId}:`, error);
			throw error;
		}
	}
}
