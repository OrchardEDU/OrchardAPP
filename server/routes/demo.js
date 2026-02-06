import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { body, validationResult } from 'express-validator';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import { Generator } from '../generator.js';
import { RagOperator } from '../ragoperator.js';
import { createUploadMiddleware } from '../utils/upload.js';

const router = express.Router();

// Initialize Generator and RAG Operator (lazy initialization)
let generator = null;
let ragoperator = null;

const initializeDemoServices = async () => {
	if (!generator) {
		try {
			generator = new Generator();
			const isRunning = await generator.isRunning();
			if (!isRunning) {
				console.warn('[Demo] Generator not running, but continuing...');
			}
			console.log('[Demo] Generator initialized');
		} catch (error) {
			console.error('[Demo] Failed to initialize Generator:', error.message);
			throw error;
		}
	}

	if (!ragoperator) {
		try {
			ragoperator = new RagOperator(generator);
			ragoperator.setGenerator(generator);
			const isRunning = await ragoperator.isRunning();
			if (!isRunning) {
				console.warn('[Demo] RAG Operator not running, but continuing...');
			}
			console.log('[Demo] RAG Operator initialized');
		} catch (error) {
			console.warn('[Demo] Failed to initialize RAG Operator:', error.message);
			console.log('[Demo] RAG features disabled. Using basic question generation.');
			ragoperator = null;
		}
	}
};

// Helper function to sanitize and validate demo password
const validateDemoPassword = (inputPassword) => {
	if (!inputPassword || typeof inputPassword !== 'string') {
		return false;
	}

	// Sanitize: trim whitespace
	const sanitized = String(inputPassword).trim();

	// Get the expected password from environment
	const expectedPassword = process.env.DEMO_PWD;

	if (!expectedPassword) {
		console.error('DEMO_PWD not set in environment variables');
		return false;
	}

	// Use constant-time comparison to prevent timing attacks
	if (sanitized.length !== expectedPassword.length) {
		return false;
	}

	try {
		// Use crypto.timingSafeEqual for secure constant-time comparison
		const sanitizedBuffer = Buffer.from(sanitized, 'utf8');
		const expectedBuffer = Buffer.from(expectedPassword, 'utf8');
		return crypto.timingSafeEqual(sanitizedBuffer, expectedBuffer);
	} catch (error) {
		console.error('Error in password validation:', error);
		return false;
	}
};

// Demo function - generates a good question based on the prompt
// Uses RAG if available: requests context from ragOperator, then sends to generator
// Otherwise falls back to basic generation with generator only
const demo = async (prompt, userId = null, subjectId = null) => {
	if (!generator) {
		throw new Error('Generator not initialized');
	}

	// Try to use RAG if available
	if (ragoperator) {
		try {
			console.log(`[Demo] Retrieving RAG context for prompt: "${prompt}"`);
			// Request context from ragoperator
			const contextChunks = await ragoperator.retrieveContext(prompt, 5, userId, subjectId);
			const context = contextChunks.join('\n\n');
			console.log(
				`[Demo] Retrieved ${contextChunks.length} context chunks (${context.length} characters)`
			);

			// Send context to generator for processing
			const response = await generator.generateQuestion(prompt, context);
			return response;
		} catch (error) {
			console.error('RAG generation failed, falling back to basic generation:', error);
			// Fall through to basic generation
		}
	}

	// Fallback to basic question generation without RAG
	console.log(`[Demo] Generating question without RAG context for prompt: "${prompt}"`);
	const response = await generator.generateQuestion(prompt);
	return response;
};

// Configure multer for file uploads
const upload = createUploadMiddleware();

/**
 * POST /api/demo
 * Demo endpoint with input sanitization
 */
router.post(
	'/',
	[
		// Server-side validation + basic sanitization
		body('password')
			.trim()
			.notEmpty()
			.withMessage('Password is required')
			.isLength({ min: 1, max: 500 })
			.withMessage('Password must be between 1 and 500 characters'),
		body('prompt')
			.trim()
			.notEmpty()
			.withMessage('Prompt is required')
			.isLength({ min: 1, max: 1000 })
			.withMessage('Prompt must be between 1 and 1000 characters')
			.customSanitizer((value) =>
				// Strip non-printable control chars but keep normal text/newlines
				value.replace(/[^\x09\x0A\x0D\x20-\x7E]/g, '')
			),
	],
	async (req, res) => {
		// Initialize demo services on first use
		try {
			await initializeDemoServices();
		} catch (error) {
			return res.status(500).json({
				success: false,
				message: 'Demo services not available',
				data: null,
			});
		}

		// Check for validation errors
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({
				success: false,
				message: 'ERROR: Validation failed',
				data: null,
			});
		}

		// Get validated + sanitized inputs
		const password = String(req.body.password || '').trim();
		const prompt = String(req.body.prompt || '');

		// Validate password against DEMO_PWD
		if (!validateDemoPassword(password)) {
			return res.status(401).json({
				success: false,
				message: 'ERROR',
				data: null,
			});
		}

		try {
			console.log(`[Demo] Generating question for prompt: "${prompt}"`);
			// Call the demo function which uses RAG (Qdrant + Ollama) if available
			const ollamaResponse = await demo(prompt);

			// Extract the generated question from the response (supports structured output)
			const generatedQuestion =
				ollamaResponse?.message?.content ||
				ollamaResponse?.choices?.[0]?.message?.content ||
				'No question generated';

			console.log(
				`[Demo] Generated question for prompt "${prompt}": ${generatedQuestion}`
			);

			res.json({
				success: true,
				message: 'Successfully generated',
				data: generatedQuestion,
			});
		} catch (error) {
			console.error('Error in demo endpoint:', error);
			res.status(500).json({
				success: false,
				message: 'ERROR',
				data: null,
			});
		}
	}
);

/**
 * POST /api/demo/upload
 * File upload endpoint for demo
 */
router.post(
	'/upload',
	(req, res, next) => {
		upload.single('file')(req, res, (err) => {
			if (err) {
				// Handle multer errors (file type, size, etc.)
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
				// Handle other errors (like file type validation)
				return res.status(400).json({
					success: false,
					message: err.message || 'File upload error',
				});
			}
			next();
		});
	},
	async (req, res) => {
		// Initialize demo services on first use
		try {
			await initializeDemoServices();
		} catch (error) {
			// Clean up uploaded file if services not available
			if (req.file && fs.existsSync(req.file.path)) {
				fs.unlinkSync(req.file.path);
			}
			return res.status(500).json({
				success: false,
				message: 'Demo services not available',
			});
		}

		// Check if password is provided
		const password = req.body.password;
		if (!password || !password.trim()) {
			return res.status(400).json({
				success: false,
				message: 'Password is required',
			});
		}

		// Validate password against DEMO_PWD
		if (!validateDemoPassword(password)) {
			// Clean up uploaded file if password is invalid
			if (req.file && fs.existsSync(req.file.path)) {
				fs.unlinkSync(req.file.path);
			}
			return res.status(401).json({
				success: false,
				message: 'Invalid password',
			});
		}

		// Check if file was uploaded
		if (!req.file) {
			return res.status(400).json({
				success: false,
				message: 'No file uploaded',
			});
		}

		try {
			const fileId = req.file.filename;
			const filename = req.file.originalname;
			const filePath = req.file.path;

			// If RAG operator is available, process and upload to Qdrant
			if (ragoperator) {
				try {
					// Read file content based on file type
					const fileExtension = path.extname(filename).toLowerCase();
					let fileText = '';

					if (fileExtension === '.txt' || fileExtension === '.md') {
						// Read as text
						fileText = fs.readFileSync(filePath, 'utf-8');
					} else if (fileExtension === '.pdf') {
						// Parse PDF file
						try {
							const dataBuffer = fs.readFileSync(filePath);
							const pdfData = await pdfParse(dataBuffer);
							fileText = pdfData.text;
							console.log(
								`[Upload] Extracted ${fileText.length} characters from PDF: ${filename}`
							);
						} catch (pdfError) {
							console.error(
								`[Upload] Error parsing PDF ${filename}:`,
								pdfError.message
							);
							// Continue without text extraction - file is still saved
						}
					} else if (fileExtension === '.docx') {
						// Parse DOCX file
						try {
							const dataBuffer = fs.readFileSync(filePath);
							const result = await mammoth.extractRawText({ buffer: dataBuffer });
							fileText = result.value || '';
							console.log(
								`[Upload] Extracted ${fileText.length} characters from DOCX: ${filename}`
							);
						} catch (docxError) {
							console.error(
								`[Upload] Error parsing DOCX ${filename}:`,
								docxError.message
							);
							// Continue without text extraction - file is still saved
						}
					} else {
						// For other file types (DOC, DOCX, etc.), we'd need additional parsers
						console.log(
							`[Upload] File type ${fileExtension} not yet supported for Qdrant upload`
						);
					}

					// Upload to Qdrant if we have text content
					if (fileText) {
						const chunksUploaded = await ragoperator.addDocument(
							fileId,
							fileText,
							filename
						);
						console.log(
							`[Upload] File "${filename}" successfully processed and uploaded to Qdrant (${chunksUploaded} chunks)`
						);
					}
				} catch (ragError) {
					console.error('[Upload] Error uploading to Qdrant:', ragError);
					// Don't fail the entire upload if Qdrant fails - file is still saved
					// User can still use the file, just won't be in RAG context
				}
			}

			// File upload successful
			res.json({
				success: true,
				message: 'File uploaded successfully',
				data: {
					id: fileId,
					filename: filename,
					size: req.file.size,
					mimetype: req.file.mimetype,
				},
			});
		} catch (error) {
			console.error('Error in file upload endpoint:', error);
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
 * DELETE /api/demo/upload/:fileId
 * File delete endpoint for demo
 */
router.delete('/upload/:fileId', async (req, res) => {
	// Initialize demo services on first use
	try {
		await initializeDemoServices();
	} catch (error) {
		// Continue even if services not available for deletion
	}

	const { fileId } = req.params;
	// DELETE requests use query parameters, not body
	const password = req.query.password;

	if (!password || typeof password !== 'string' || !password.trim()) {
		return res.status(400).json({
			success: false,
			message: 'Password is required',
		});
	}

	// Validate password against DEMO_PWD
	if (!validateDemoPassword(password)) {
		return res.status(401).json({
			success: false,
			message: 'Invalid password',
		});
	}

	try {
		const filePath = path.join(process.cwd(), 'server', 'uploads', fileId);

		// Delete from Qdrant if RAG operator is available
		if (ragoperator) {
			try {
				await ragoperator.deleteDocument(fileId);
				console.log(`[Delete] Removed ${fileId} from Qdrant`);
			} catch (ragError) {
				console.error('[Delete] Error removing from Qdrant:', ragError);
				// Continue with file deletion even if Qdrant deletion fails
			}
		}

		// Delete file from filesystem
		if (fs.existsSync(filePath)) {
			fs.unlinkSync(filePath);
			res.json({
				success: true,
				message: 'File deleted successfully',
			});
		} else {
			res.status(404).json({
				success: false,
				message: 'File not found',
			});
		}
	} catch (error) {
		console.error('Error deleting file:', error);
		res.status(500).json({
			success: false,
			message: 'Internal server error',
		});
	}
});

/**
 * DELETE /api/demo/clear-all
 * Clear all data endpoint for demo
 */
router.delete('/clear-all', async (req, res) => {
	// Initialize demo services on first use
	try {
		await initializeDemoServices();
	} catch (error) {
		// Continue even if services not available for clearing
	}

	// DELETE requests use query parameters, not body
	const password = req.query.password;

	if (!password || typeof password !== 'string' || !password.trim()) {
		return res.status(400).json({
			success: false,
			message: 'Password is required',
		});
	}

	// Validate password against DEMO_PWD
	if (!validateDemoPassword(password)) {
		return res.status(401).json({
			success: false,
			message: 'Invalid password',
		});
	}

	try {
		const uploadsDir = path.join(process.cwd(), 'server', 'uploads');
		let filesDeleted = 0;
		let qdrantCleared = false;

		// Clear all files from uploads folder
		if (fs.existsSync(uploadsDir)) {
			const files = fs.readdirSync(uploadsDir);
			for (const file of files) {
				const filePath = path.join(uploadsDir, file);
				try {
					fs.unlinkSync(filePath);
					filesDeleted++;
				} catch (fileError) {
					console.error(`[Clear All] Error deleting file ${file}:`, fileError);
				}
			}
			console.log(`[Clear All] Deleted ${filesDeleted} files from uploads folder`);
		}

		// Clear all data from Qdrant if RAG operator is available
		if (ragoperator) {
			try {
				await ragoperator.clearAllData();
				qdrantCleared = true;
				console.log('[Clear All] Cleared all data from Qdrant');
			} catch (ragError) {
				console.error('[Clear All] Error clearing Qdrant:', ragError);
				// Continue even if Qdrant clearing fails
			}
		}

		res.json({
			success: true,
			message: 'All data cleared successfully',
			data: {
				filesDeleted,
				qdrantCleared,
			},
		});
	} catch (error) {
		console.error('Error clearing all data:', error);
		res.status(500).json({
			success: false,
			message: 'Internal server error',
		});
	}
});

export default router;
