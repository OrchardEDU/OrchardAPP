import express from 'express';
import path from 'path';
import fs from 'fs';
import { body, validationResult } from 'express-validator';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { isValidUUID } from '../utils/validation.js';
import * as courseQueries from '../db/queries/courses.js';
import { Generator } from '../generator.js';
import { RagOperator } from '../ragoperator.js';
import { createUploadMiddleware } from '../utils/upload.js';

const router = express.Router();

// All routes require authentication and teacher role
router.use(requireAuth);
router.use(requireRole('teacher'));

// Initialize Generator and RAG Operator (lazy initialization)
let generator = null;
let ragoperator = null;

const initializeAIServices = async () => {
	if (!generator) {
		try {
			generator = new Generator();
			const isRunning = await generator.isRunning();
			if (!isRunning) {
				console.warn('[AI] Generator not running, but continuing...');
			}
			console.log('[AI] Generator initialized');
		} catch (error) {
			console.error('[AI] Failed to initialize Generator:', error.message);
			throw error;
		}
	}

	if (!ragoperator) {
		try {
			ragoperator = new RagOperator(generator);
			ragoperator.setGenerator(generator);
			const isRunning = await ragoperator.isRunning();
			if (!isRunning) {
				console.warn('[AI] RAG Operator not running, but continuing...');
			}
			console.log('[AI] RAG Operator initialized');
		} catch (error) {
			console.warn('[AI] Failed to initialize RAG Operator:', error.message);
			console.log('[AI] RAG features disabled. Using basic question generation.');
			ragoperator = null;
		}
	}
};

/**
 * Middleware to validate course ownership
 */
const validateCourseOwnership = async (req, res, next) => {
	try {
		// Support both body and query parameters
		// For GET requests, req.body may be undefined, so check safely
		const courseId = (req.body && req.body.courseId) || req.query.courseId;
		const userId = req.session.userId;

		if (!courseId) {
			return res.status(400).json({
				success: false,
				message: 'Course ID is required',
			});
		}

		if (!isValidUUID(courseId)) {
			return res.status(400).json({
				success: false,
				message: 'Invalid course ID',
			});
		}

		// Check ownership
		const isOwner = await courseQueries.isCourseOwner(userId, courseId);
		if (!isOwner) {
			return res.status(403).json({
				success: false,
				message: 'Access denied',
			});
		}

		req.courseId = courseId;
		next();
	} catch (error) {
		console.error('Course ownership validation error:', error);
		res.status(500).json({
			success: false,
			message: 'Internal server error',
		});
	}
};

// Configure multer for file uploads
const upload = createUploadMiddleware();

/**
 * POST /api/ai/questions/generate
 * Generate multiple questions from a topic
 */
router.post(
	'/questions/generate',
	[
		body('topic')
			.trim()
			.notEmpty()
			.withMessage('Topic is required')
			.isLength({ min: 1, max: 1000 })
			.withMessage('Topic must be between 1 and 1000 characters')
			.customSanitizer((value) =>
				// Strip non-printable control chars but keep normal text/newlines
				value.replace(/[^\x09\x0A\x0D\x20-\x7E]/g, '')
			),
		body('numQuestions')
			.isInt({ min: 1, max: 20 })
			.withMessage('Number of questions must be between 1 and 20'),
		body('courseId')
			.optional()
			.custom((value) => {
				if (value && !isValidUUID(value)) {
					throw new Error('Invalid course ID format');
				}
				return true;
			}),
	],
	async (req, res) => {
		// Initialize AI services on first use
		try {
			await initializeAIServices();
		} catch (error) {
			return res.status(500).json({
				success: false,
				message: 'AI services not available',
				data: null,
			});
		}

		// Check for validation errors
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({
				success: false,
				message: 'Validation failed',
				data: null,
			});
		}

		// Get validated + sanitized inputs
		const topic = String(req.body.topic || '').trim();
		const numQuestions = parseInt(req.body.numQuestions, 10);
		const courseId = req.body.courseId || null;
		const userId = req.session.userId;

		// Validate course ownership if courseId provided
		if (courseId) {
			if (!isValidUUID(courseId)) {
				return res.status(400).json({
					success: false,
					message: 'Invalid course ID',
					data: null,
				});
			}

			const isOwner = await courseQueries.isCourseOwner(userId, courseId);
			if (!isOwner) {
				return res.status(403).json({
					success: false,
					message: 'Access denied',
					data: null,
				});
			}
		}

		try {
			console.log(`[AI] Generating ${numQuestions} questions for topic: "${topic}"`);
			
			let context = null;
			// Try to use RAG if available and courseId provided
			if (ragoperator && courseId) {
				try {
					console.log(`[AI] Retrieving RAG context for topic: "${topic}"`);
					const contextChunks = await ragoperator.retrieveContext(topic, 5, userId, courseId);
					context = contextChunks.join('\n\n');
					console.log(
						`[AI] Retrieved ${contextChunks.length} context chunks (${context.length} characters)`
					);
				} catch (error) {
					console.error('RAG context retrieval failed, falling back to basic generation:', error);
					// Fall through to basic generation
				}
			}

			// Generate questions
			const questions = await generator.generateQuestions(topic, numQuestions, context);

			if (!questions || questions.length === 0) {
				return res.status(500).json({
					success: false,
					message: 'Failed to generate questions',
					data: null,
				});
			}

			console.log(`[AI] Successfully generated ${questions.length} questions`);

			res.json({
				success: true,
				message: 'Questions generated successfully',
				data: questions,
			});
		} catch (error) {
			console.error('Error in question generation endpoint:', error);
			res.status(500).json({
				success: false,
				message: 'Internal server error',
				data: null,
			});
		}
	}
);

/**
 * GET /api/ai/content
 * List embedded materials for a course
 */
router.get('/content', validateCourseOwnership, async (req, res) => {
	// Initialize AI services on first use
	try {
		await initializeAIServices();
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: 'AI services not available',
			data: [],
		});
	}

	const courseId = req.courseId;
	const userId = req.session.userId;

	try {
		// List materials from Qdrant if RAG operator is available
		if (ragoperator) {
			try {
				const documents = await ragoperator.listDocuments(userId, courseId);
				// Transform to match EmbedContentResponse format
				const materials = documents.map(doc => ({
					id: doc.fileId,
					filename: doc.filename,
				}));
				res.json({
					success: true,
					message: 'Materials retrieved successfully',
					data: materials,
				});
			} catch (ragError) {
				console.error('[AI List] Error retrieving materials from Qdrant:', ragError);
				return res.status(500).json({
					success: false,
					message: 'Failed to retrieve materials',
					data: [],
				});
			}
		} else {
			return res.status(500).json({
				success: false,
				message: 'RAG service not available',
				data: [],
			});
		}
	} catch (error) {
		console.error('Error listing materials:', error);
		res.status(500).json({
			success: false,
			message: 'Internal server error',
			data: [],
		});
	}
});

/**
 * POST /api/ai/content/embed
 * Embed content (text or file) to Qdrant for a course
 */
router.post(
	'/content/embed',
	// Handle file uploads first - multer needs to process before validation
	(req, res, next) => {
		// Check if this is a file upload (FormData) or text content (JSON)
		// If content-type is multipart/form-data, it's a file upload
		const contentType = req.headers['content-type'] || '';
		if (contentType.includes('multipart/form-data')) {
			// File upload - use multer first, then validate course ownership
			upload.single('file')(req, res, (err) => {
				if (err) {
					if (err instanceof multer.MulterError) {
						if (err.code === 'LIMIT_FILE_SIZE') {
							return res.status(400).json({
								success: false,
								message: 'File too large. Maximum size is 10MB.',
							});
						}
						return res.status(400).json({
							success: false,
							message: err.message || 'File upload error',
						});
					}
					return res.status(400).json({
						success: false,
						message: err.message || 'File upload error',
					});
				}
				// After multer processes, validate course ownership
				validateCourseOwnership(req, res, next);
			});
		} else {
			// Text content - validate course ownership first, then validate content
			validateCourseOwnership(req, res, () => {
				body('content')
					.trim()
					.isLength({ max: 100000 })
					.withMessage('Content must be less than 100000 characters')
					.customSanitizer((value) =>
						value ? value.replace(/[^\x09\x0A\x0D\x20-\x7E]/g, '') : value
					)(req, res, next);
			});
		}
	},
	async (req, res) => {
		// Initialize AI services on first use
		try {
			await initializeAIServices();
		} catch (error) {
			// Clean up uploaded file if services not available
			if (req.file && fs.existsSync(req.file.path)) {
				fs.unlinkSync(req.file.path);
			}
			return res.status(500).json({
				success: false,
				message: 'AI services not available',
			});
		}

		// Check for validation errors (only for text content)
		if (req.body.content) {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return res.status(400).json({
					success: false,
					message: 'Validation failed',
				});
			}
		}

		const courseId = req.courseId;
		const userId = req.session.userId;
		let contentText = '';
		let contentId = '';
		let filename = '';

		try {
			// Handle text content
			if (req.body.content) {
				contentText = String(req.body.content || '').trim();
				contentId = `text-${Date.now()}-${Math.round(Math.random() * 1e9)}`;
				filename = 'text-content';
			}
			// Handle file upload
			else if (req.file) {
				contentId = req.file.filename;
				filename = req.file.originalname;
				const filePath = req.file.path;
				const fileExtension = path.extname(filename).toLowerCase();

				// Extract text from file
				if (fileExtension === '.txt' || fileExtension === '.md') {
					contentText = fs.readFileSync(filePath, 'utf-8');
				} else if (fileExtension === '.pdf') {
					try {
						const dataBuffer = fs.readFileSync(filePath);
						const pdfData = await pdfParse(dataBuffer);
						contentText = pdfData.text;
						console.log(
							`[AI Embed] Extracted ${contentText.length} characters from PDF: ${filename}`
						);
					} catch (pdfError) {
						console.error(`[AI Embed] Error parsing PDF ${filename}:`, pdfError.message);
						fs.unlinkSync(filePath);
						return res.status(400).json({
							success: false,
							message: 'Failed to parse PDF file',
						});
					}
				} else if (fileExtension === '.docx') {
					try {
						const dataBuffer = fs.readFileSync(filePath);
						const result = await mammoth.extractRawText({ buffer: dataBuffer });
						contentText = result.value || '';
						console.log(
							`[AI Embed] Extracted ${contentText.length} characters from DOCX: ${filename}`
						);
					} catch (docxError) {
						console.error(`[AI Embed] Error parsing DOCX ${filename}:`, docxError.message);
						fs.unlinkSync(filePath);
						return res.status(400).json({
							success: false,
							message: 'Failed to parse DOCX file',
						});
					}
				} else {
					fs.unlinkSync(filePath);
					return res.status(400).json({
						success: false,
						message: 'File type not supported for text extraction',
					});
				}
			} else {
				return res.status(400).json({
					success: false,
					message: 'Either content or file is required',
				});
			}

			if (!contentText || contentText.trim().length === 0) {
				// Clean up uploaded file if no content
				if (req.file && fs.existsSync(req.file.path)) {
					fs.unlinkSync(req.file.path);
				}
				return res.status(400).json({
					success: false,
					message: 'No content to embed',
				});
			}

			// Embed to Qdrant if RAG operator is available
			if (ragoperator) {
				try {
					// TODO: Add system prompt for content embedding
					const chunksUploaded = await ragoperator.addDocument(
						contentId,
						contentText,
						filename,
						userId,
						courseId
					);
					console.log(
						`[AI Embed] Content "${filename}" successfully processed and uploaded to Qdrant (${chunksUploaded} chunks)`
					);
				} catch (ragError) {
					console.error('[AI Embed] Error uploading to Qdrant:', ragError);
					// Clean up uploaded file if Qdrant fails
					if (req.file && fs.existsSync(req.file.path)) {
						fs.unlinkSync(req.file.path);
					}
					return res.status(500).json({
						success: false,
						message: 'Failed to embed content',
					});
				}
			} else {
				return res.status(500).json({
					success: false,
					message: 'RAG service not available',
				});
			}

			// Content embedding successful
			res.json({
				success: true,
				message: 'Content embedded successfully',
				data: {
					id: contentId,
					filename: filename,
					...(req.file && {
						size: req.file.size,
						mimetype: req.file.mimetype,
					}),
				},
			});
		} catch (error) {
			console.error('Error in content embed endpoint:', error);
			// Clean up uploaded file on error
			if (req.file && fs.existsSync(req.file.path)) {
				fs.unlinkSync(req.file.path);
			}
			res.status(500).json({
				success: false,
				message: 'Internal server error',
			});
		}
	}
);

/**
 * GET /api/ai/content
 * List embedded materials for a course
 */
router.get('/content', validateCourseOwnership, async (req, res) => {
	// Initialize AI services on first use
	try {
		await initializeAIServices();
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: 'AI services not available',
			data: null,
		});
	}

	const courseId = req.courseId;
	const userId = req.session.userId;

	try {
		if (!ragoperator) {
			return res.status(500).json({
				success: false,
				message: 'RAG service not available',
				data: null,
			});
		}

		// List documents filtered by courseId and userId
		const documents = await ragoperator.listDocuments(userId, courseId);

		// Format response to match frontend expectations
		const materials = documents.map(doc => ({
			id: doc.fileId,
			filename: doc.filename,
		}));

		res.json({
			success: true,
			message: 'Materials retrieved successfully',
			data: materials,
		});
	} catch (error) {
		console.error('Error listing materials:', error);
		res.status(500).json({
			success: false,
			message: 'Internal server error',
			data: null,
		});
	}
});

/**
 * DELETE /api/ai/content/:contentId
 * Delete embedded content from Qdrant
 */
router.delete('/content/:contentId', validateCourseOwnership, async (req, res) => {
	// Initialize AI services on first use
	try {
		await initializeAIServices();
	} catch (error) {
		// Continue even if services not available for deletion
	}

	const { contentId } = req.params;
	const courseId = req.courseId;

	if (!contentId || !contentId.trim()) {
		return res.status(400).json({
			success: false,
			message: 'Content ID is required',
		});
	}

	try {
		// Delete from Qdrant if RAG operator is available
		if (ragoperator) {
			try {
				await ragoperator.deleteDocument(contentId);
				console.log(`[AI Delete] Removed ${contentId} from Qdrant`);
			} catch (ragError) {
				console.error('[AI Delete] Error removing from Qdrant:', ragError);
				return res.status(500).json({
					success: false,
					message: 'Failed to delete content from Qdrant',
				});
			}
		} else {
			return res.status(500).json({
				success: false,
				message: 'RAG service not available',
			});
		}

		// Also try to delete file from filesystem if it exists
		const filePath = path.join(process.cwd(), 'server', 'uploads', contentId);
		if (fs.existsSync(filePath)) {
			try {
				fs.unlinkSync(filePath);
				console.log(`[AI Delete] Removed file ${contentId} from filesystem`);
			} catch (fileError) {
				console.error('[AI Delete] Error removing file from filesystem:', fileError);
				// Continue even if file deletion fails
			}
		}

		res.json({
			success: true,
			message: 'Content deleted successfully',
		});
	} catch (error) {
		console.error('Error deleting content:', error);
		res.status(500).json({
			success: false,
			message: 'Internal server error',
		});
	}
});

export default router;
