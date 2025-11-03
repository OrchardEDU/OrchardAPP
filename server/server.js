import express from "express";
import next from "next";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname } from "path";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = process.env.PORT || 8084;
const IP = process.env.IP || "localhost";

// Configure Next.js to serve the built client app
const dev = process.env.NODE_ENV !== "production";
const nextApp = next({ dev, dir: path.join(__dirname, "../client") });
const handle = nextApp.getRequestHandler();

nextApp.prepare().then(() => {
    const expressApp = express();

    // Let Next.js handle all routes (serves the static landing page)
    expressApp.all(/.*/, (req, res) => {
        return handle(req, res);
    });

    const listener = expressApp.listen(PORT, IP, () => {
        console.log(`Server running on http://${IP}:${PORT}`);
        console.log(`Visit: http://${IP}:${PORT}`);
    });
});
