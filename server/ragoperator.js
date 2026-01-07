import { QdrantClient } from '@qdrant/js-client-rest';

export class RagOperator {
	constructor(generator = null) {
		// Handle all Qdrant-related environment variables
		this.collectionName = process.env.QDRANT_COLLECTION_NAME;
		const apiKey = process.env.QDRANT_API_KEY;
		const qdrantClusterUrl = process.env.QDRANT_CLUSTER_URL;
		this._pointIdCounter = parseInt(process.env.QDRANT_COUNT || '0', 10);

		// Check if Qdrant is configured
		if (!this.collectionName || !apiKey || !qdrantClusterUrl) {
			throw new Error(
				'Qdrant not configured. Required env vars: QDRANT_COLLECTION_NAME, QDRANT_API_KEY, QDRANT_CLUSTER_URL'
			);
		}

		this.client = new QdrantClient({
			url: qdrantClusterUrl,
			apiKey: apiKey,
		});

		// Generator instance for embeddings (optional - can be set later)
		this.generator = generator;

		this.embeddingModel = 'mxbai-embed-large';
		this.vectorSize = 1024;
		this._collectionVerified = false;
		console.log(
			`RAG Operator initialized with Qdrant (collection: ${this.collectionName}, starting point ID: ${this._pointIdCounter})`
		);
	}

	/**
	 * Set the generator instance for embeddings
	 * @param {Generator} generator - Generator instance
	 */
	setGenerator(generator) {
		this.generator = generator;
	}

	/**
	 * Check if RAG Operator is running
	 * @returns {Promise<boolean>} True if RAG operator is running
	 */
	async isRunning() {
		try {
			await this._ensureCollection();
			// Try a simple operation to verify connection
			await this.client.getCollection(this.collectionName);
			return true;
		} catch (error) {
			console.error('[RAG Operator] Not running:', error.message);
			return false;
		}
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
		if (!this.generator) {
			throw new Error(
				'Generator not set. Call setGenerator() first or pass generator to constructor.'
			);
		}
		return await this.generator.getEmbedding(text, this.embeddingModel);
	}

	/**
	 * Search Qdrant for similar vectors
	 * @param {string} queryText - Text to search for
	 * @param {number} limit - Maximum number of results
	 * @param {string|null} userId - Optional user ID filter
	 * @param {string|null} subjectId - Optional subject ID filter
	 * @returns {Promise<Array>} Search results
	 */
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

	/**
	 * Retrieve context chunks from Qdrant
	 * @param {string} queryText - Text to search for
	 * @param {number} limit - Maximum number of context chunks
	 * @param {string|null} userId - Optional user ID filter
	 * @param {string|null} subjectId - Optional subject ID filter
	 * @returns {Promise<Array<string>>} Array of context text chunks
	 */
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

	/**
	 * Add a document to Qdrant
	 * @param {string} fileId - Unique file identifier
	 * @param {string} text - Document text content
	 * @param {string} filename - Original filename
	 * @param {string|null} userId - Optional user ID
	 * @param {string|null} subjectId - Optional subject ID
	 * @returns {Promise<number>} Number of chunks added
	 */
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

	/**
	 * Delete a document from Qdrant
	 * @param {string} fileId - File identifier to delete
	 * @returns {Promise<boolean>} Success status
	 */
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
