# OrchardEDU - Coming Soon

A static landing page for OrchardEDU, an AI-powered educational content creation platform for teachers.

## Structure

- `client/` - Next.js frontend application
- `server/` - Express.js server to serve the Next.js app

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Install server dependencies:
```bash
cd server
npm install
```

2. Install client dependencies:
```bash
cd ../client
npm install
```

3. Create a `.env` file in the server directory (optional):
```
PORT=8084
IP=localhost
NODE_ENV=development
```

### Running the Application

From the root directory:

```bash
cd server
node server.js
```

The application will be available at `http://localhost:8084`

### Adding Images

Place placeholder images in `client/public/img/`:
- `hero-placeholder.png` - Hero section image (600x400px recommended)

## Development

The server runs Next.js in development mode by default. For production, set `NODE_ENV=production` in your environment variables.
