import express from 'express';
import next from 'next';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import pkg from 'pg';
const { Pool } = pkg;
import { body, validationResult } from 'express-validator';
import multer from 'multer';
import fs from 'fs';
import crypto from 'crypto';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import { Generator } from './generator.js';
import { RagOperator } from './ragoperator.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = process.env.PORT || 8086;
const IP = process.env.IP || 'localhost';
// PostgreSQL connection configuration
const postgresConfig = {
	host: process.env.POSTGRES_HOST || 'localhost',
	port: process.env.POSTGRES_PORT || 5432,
	database: process.env.POSTGRES_DB,
	user: process.env.POSTGRES_USER,
	password: process.env.POSTGRES_PWD,
};

// Create PostgreSQL connection pool
const pool = new Pool(postgresConfig);

// Test database connection
pool.on('connect', () => {
	console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
	console.error('Unexpected error on idle PostgreSQL client', err);
	process.exit(-1);
});

// Test connection on startup
(async () => {
	try {
		const client = await pool.connect();
		console.log('PostgreSQL connection test successful');
		client.release();
	} catch (err) {
		console.error('Failed to connect to PostgreSQL:', err.message);
	}
})();

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

// Configure Next.js to serve the built client app
const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({
	dev,
	dir: path.join(__dirname, '../client'),
	quiet: true, // Suppress Next.js compilation/output messages
});
const handle = nextApp.getRequestHandler();

// Initialize Generator and RAG Operator (will be set up before server starts)
let generator = null;
let ragoperator = null;

const initializeServices = async () => {
	// Initialize Generator (Ollama) - let it handle its own env vars
	try {
		generator = new Generator();
		const isRunning = await generator.isRunning();
		if (!isRunning) {
			console.warn('[Generator] Not running, but continuing...');
		}
		console.log('Generator initialized');
	} catch (error) {
		console.error('Failed to initialize Generator:', error.message);
		throw error; // Generator is required
	}

	// Initialize RAG Operator - let it handle its own env vars
	try {
		ragoperator = new RagOperator(generator);
		// Set generator for embeddings
		ragoperator.setGenerator(generator);
		// Check if it's running
		const isRunning = await ragoperator.isRunning();
		if (!isRunning) {
			console.warn('[RAG Operator] Not running, but continuing...');
		}
		console.log('RAG Operator initialized');
	} catch (error) {
		console.warn('Failed to initialize RAG Operator:', error.message);
		console.log('RAG features disabled. Using basic question generation.');
		ragoperator = null; // Ensure it's null if initialization fails
	}
};

nextApp.prepare().then(async () => {
	// Initialize Generator and RAG Operator before setting up Express routes
	await initializeServices();

	console.log('\n=== Server Starting ===');
	const expressApp = express();

	// Middleware to parse JSON bodies
	expressApp.use(express.json());
	expressApp.use(express.urlencoded({ extended: true }));

	// Configure multer for file uploads
	const storage = multer.diskStorage({
		destination: (req, file, cb) => {
			const uploadDir = path.join(__dirname, 'uploads');
			if (!fs.existsSync(uploadDir)) {
				fs.mkdirSync(uploadDir, { recursive: true });
			}
			cb(null, uploadDir);
		},
		filename: (req, file, cb) => {
			const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
			cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
		},
	});

	const upload = multer({
		storage: storage,
		limits: {
			fileSize: 10 * 1024 * 1024, // 10MB limit
		},
		fileFilter: (req, file, cb) => {
			// Allow common document types
			const allowedTypes = /\.(pdf|doc|docx|txt|md)$/i;
			if (allowedTypes.test(file.originalname)) {
				cb(null, true);
			} else {
				cb(
					new Error(
						'Invalid file type. Only PDF, DOC, DOCX, TXT, and MD files are allowed.'
					)
				);
			}
		},
	});

	// Example backend API route
	expressApp.get('/api/hello', (req, res) => {
		res.json({ message: 'Hello from Express backend!' });
	});

	// Demo endpoint with input sanitization
	expressApp.post(
		'/api/demo',
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

	// File upload endpoint for demo
	expressApp.post(
		'/api/demo/upload',
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

	// File delete endpoint for demo
	expressApp.delete('/api/demo/upload/:fileId', async (req, res) => {
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
			const filePath = path.join(__dirname, 'uploads', fileId);

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

	// Clear all data endpoint for demo
	expressApp.delete('/api/demo/clear-all', async (req, res) => {
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
			const uploadsDir = path.join(__dirname, 'uploads');
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

	// Let Next handle all other routes
	expressApp.all(/.*/, (req, res) => {
		return handle(req, res);
	});

	const listener = expressApp.listen(PORT, IP, () => {
		console.log(`\nServer running on http://${IP}:${PORT}`);
		console.log(`Visit: http://${IP}:${PORT}`);
		console.log(`Generator: ${generator ? 'Enabled' : 'Disabled'}`);
		console.log(`RAG Operator: ${ragoperator ? 'Enabled' : 'Disabled'}\n`);
	});
});

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

// Export the PostgreSQL pool for use in other modules
export { pool };
