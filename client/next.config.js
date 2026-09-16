/** @type {import('next').NextConfig} */
const nextConfig = {
	output: 'standalone',
	// Logos live in /public. Serving them through /_next/image fails on
	// beta.orchardedu.com (Cloudflare in front of the Express+Next standalone
	// server), which is why the mark disappeared while the rest of the page
	// loaded. Unoptimized emits a plain /file.png request instead.
	images: {
		unoptimized: true,
	},
};

module.exports = nextConfig;
