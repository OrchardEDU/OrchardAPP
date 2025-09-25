import express from "express";
import { Ollama } from "ollama";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname } from "path";

const app = express();

dotenv.config();

app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(express.static(path.join(__dirname, '../client/.next/static/')));
app.use(express.static(path.join(__dirname, '../client/out/')));

// Catch-all handler for Next.js
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/out/index.html'));
});

const PORT = process.env.PORT || 8086;
const IP = process.env.IP || "localhost";
const PORT_OLLAMA = process.env.PORT_OLLAMA;

const listener = app.listen(PORT, IP, () => {
    console.log(`Server running on http://${IP}:${PORT}`);
    console.log(`Visit: http://${IP}:${PORT}`);
});

const ollama = new Ollama({ host: PORT_OLLAMA});

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
// test ollama backend calls
// test();