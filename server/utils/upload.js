import multer from 'multer';
import path from 'path';
import fs from 'fs';

/**
 * Create multer storage configuration for file uploads
 * @param {Object} options - Configuration options
 * @param {number} options.maxFileSize - Maximum file size in bytes (default: 10MB)
 * @param {RegExp} options.allowedTypes - Regex pattern for allowed file extensions (default: pdf, doc, docx, txt, md)
 * @returns {multer.Multer} Configured multer instance
 */
export function createUploadMiddleware(options = {}) {
	const maxFileSize = options.maxFileSize || 10 * 1024 * 1024; // 10MB default
	const allowedTypes = options.allowedTypes || /\.(pdf|doc|docx|txt|md)$/i;

	const storage = multer.diskStorage({
		destination: (req, file, cb) => {
			const uploadDir = path.join(process.cwd(), 'server', 'uploads');
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

	return multer({
		storage: storage,
		limits: {
			fileSize: maxFileSize,
		},
		fileFilter: (req, file, cb) => {
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
}
