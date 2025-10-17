import express from "express";
import next from "next";
import { Ollama } from "ollama";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname } from "path";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = process.env.PORT || 8086;
const IP = process.env.IP || "localhost";

// Configure Next.js to serve the built client app
const dev = process.env.NODE_ENV !== "production";
const nextApp = next({ dev, dir: path.join(__dirname, "../client") });
const handle = nextApp.getRequestHandler();

nextApp.prepare().then(() => {
    const expressApp = express();

    // Example backend API route
    expressApp.get("/api/hello", (req, res) => {
        res.json({ message: "Hello from Express backend!" });
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

const PORT_OLLAMA = process.env.PORT_OLLAMA;
const ollama = new Ollama({ host: PORT_OLLAMA });

// test ollama backend calls
const test = async () => {
    const response = await ollama.chat({
        model: 'llama3',
        messages: [
            { role: 'user', content: 'Why is the sky blue?' },
            { role: 'assistant', content: 'It is not blue. It only appears blue' },
            { role: 'user', content: 'Are you sure? check and tell me why' },
        ],
    });
    console.log("Ollama response\n:");
    console.log(response);
}
// test();