import express from "express";
import next from "next";
import { Ollama } from "ollama";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname } from "path";
import pkg from "pg";
const { Pool } = pkg;
import { body, validationResult } from "express-validator";
import multer from "multer";
import fs from "fs";
import crypto from "crypto";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = process.env.PORT || 8086;
const IP = process.env.IP || "localhost";

const PORT_OLLAMA = process.env.PORT_OLLAMA;
const ollama = new Ollama({ host: PORT_OLLAMA });
// PostgreSQL connection configuration
const postgresConfig = {
    host: process.env.POSTGRES_HOST || "localhost",
    port: process.env.POSTGRES_PORT || 5432,
    database: process.env.POSTGRES_DB,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PWD,
};

// Create PostgreSQL connection pool
const pool = new Pool(postgresConfig);

// Test database connection
pool.on("connect", () => {
    console.log("Connected to PostgreSQL database");
});

pool.on("error", (err) => {
    console.error("Unexpected error on idle PostgreSQL client", err);
    process.exit(-1);
});

// Test connection on startup
(async () => {
    try {
        const client = await pool.connect();
        console.log("PostgreSQL connection test successful");
        client.release();
    } catch (err) {
        console.error("Failed to connect to PostgreSQL:", err.message);
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
        console.error("DEMO_PWD not set in environment variables");
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
        console.error("Error in password validation:", error);
        return false;
    }
};

// Configure Next.js to serve the built client app
const dev = process.env.NODE_ENV !== "production";
const nextApp = next({ dev, dir: path.join(__dirname, "../client") });
const handle = nextApp.getRequestHandler();

nextApp.prepare().then(() => {
    const expressApp = express();

    // Middleware to parse JSON bodies
    expressApp.use(express.json());
    expressApp.use(express.urlencoded({ extended: true }));

    // Configure multer for file uploads
    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            const uploadDir = path.join(__dirname, "uploads");
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }
            cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
            cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
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
                cb(new Error("Invalid file type. Only PDF, DOC, DOCX, TXT, and MD files are allowed."));
            }
        },
    });

    // Example backend API route
    expressApp.get("/api/hello", (req, res) => {
        res.json({ message: "Hello from Express backend!" });
    });

    // Demo endpoint with input sanitization
    expressApp.post(
        "/api/demo",
        [
            // Server-side validation + basic sanitization
            body("password")
                .trim()
                .notEmpty().withMessage("Password is required")
                .isLength({ min: 1, max: 500 }).withMessage("Password must be between 1 and 500 characters"),
            body("prompt")
                .trim()
                .notEmpty().withMessage("Prompt is required")
                .isLength({ min: 1, max: 10000 }).withMessage("Prompt must be between 1 and 10000 characters")
                .customSanitizer((value) =>
                    // Strip non-printable control chars but keep normal text/newlines
                    value.replace(/[^\x09\x0A\x0D\x20-\x7E]/g, "")
                ),
        ],
        async (req, res) => {
            // Check for validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    errors: errors.array(),
                });
            }

            // Get validated + sanitized inputs
            const password = String(req.body.password || "").trim();
            const prompt = String(req.body.prompt || "");

            // Validate password against DEMO_PWD
            if (!validateDemoPassword(password)) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid password",
                });
            }

            try {
                // Call the demo Ollama function with the sanitized prompt
                const ollamaResponse = await demo(prompt);

                res.json({
                    success: true,
                    message: "Demo endpoint called successfully",
                    data: {
                        password,
                        prompt,
                        ollamaResponse,
                    },
                });
            } catch (error) {
                console.error("Error in demo endpoint:", error);
                res.status(500).json({
                    success: false,
                    message: "Internal server error",
                });
            }
        }
    );

    // File upload endpoint for demo
    expressApp.post(
        "/api/demo/upload",
        (req, res, next) => {
            upload.single("file")(req, res, (err) => {
                if (err) {
                    // Handle multer errors (file type, size, etc.)
                    if (err instanceof multer.MulterError) {
                        if (err.code === 'LIMIT_FILE_SIZE') {
                            return res.status(400).json({
                                success: false,
                                message: "File too large. Maximum size is 10MB.",
                            });
                        }
                        return res.status(400).json({
                            success: false,
                            message: err.message || "File upload error",
                        });
                    }
                    // Handle other errors (like file type validation)
                    return res.status(400).json({
                        success: false,
                        message: err.message || "File upload error",
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
                    message: "Password is required",
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
                    message: "Invalid password",
                });
            }

            // Check if file was uploaded
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: "No file uploaded",
                });
            }

            try {
                // File upload successful
                res.json({
                    success: true,
                    message: "File uploaded successfully",
                    data: {
                        id: req.file.filename,
                        filename: req.file.originalname,
                        size: req.file.size,
                        mimetype: req.file.mimetype,
                    },
                });
            } catch (error) {
                console.error("Error in file upload endpoint:", error);
                // Clean up uploaded file on error
                if (req.file && fs.existsSync(req.file.path)) {
                    fs.unlinkSync(req.file.path);
                }
                res.status(500).json({
                    success: false,
                    message: "Internal server error",
                });
            }
        }
    );

    // File delete endpoint for demo
    expressApp.delete("/api/demo/upload/:fileId", async (req, res) => {
        const { fileId } = req.params;
        // DELETE requests use query parameters, not body
        const password = req.query.password;

        if (!password || typeof password !== 'string' || !password.trim()) {
            return res.status(400).json({
                success: false,
                message: "Password is required",
            });
        }

        // Validate password against DEMO_PWD
        if (!validateDemoPassword(password)) {
            return res.status(401).json({
                success: false,
                message: "Invalid password",
            });
        }

        try {
            const filePath = path.join(__dirname, "uploads", fileId);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                res.json({
                    success: true,
                    message: "File deleted successfully",
                });
            } else {
                res.status(404).json({
                    success: false,
                    message: "File not found",
                });
            }
        } catch (error) {
            console.error("Error deleting file:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error",
            });
        }
    });

    // Let Next handle all other routes
    expressApp.all(/.*/, (req, res) => {
        return handle(req, res);
    });

    const listener = expressApp.listen(PORT, IP, () => {
        console.log(`Server running on http://${IP}:${PORT}`);
        console.log(`Visit: http://${IP}:${PORT}`);
    });
});


// test ollama backend calls
const test = async () => {
    const response = await ollama.chat({
        model: "llama3",
        messages: [
            { role: "user", content: "Why is the sky blue?" },
            { role: "assistant", content: "It is not blue. It only appears blue" },
            { role: "user", content: "Are you sure? check and tell me why" },
        ],
    });
    console.log("Ollama response\n:");
    console.log(response);
};
// test();

// Demo Ollama call (similar to test, but uses the provided prompt)
const demo = async (prompt) => {
    const query = "Please answer the following question: " + prompt + "."
    const response = await ollama.chat({
        model: "llama3",
        messages: [
            { role: "user", content: query },
        ],
    });
    return response;
};

// Export the PostgreSQL pool for use in other modules
export { pool };