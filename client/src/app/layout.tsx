import type { Metadata } from 'next';
import { Inter, Josefin_Sans, Poiret_One } from 'next/font/google';
import './globals.css';
import '../styles/theme.css';
import '../styles/deco.css';
import ConditionalLayout from '@/components/ConditionalLayout';
import { ThemeProvider } from '@/contexts/ThemeContext';

/* Poiret One carries the deco display voice, Josefin Sans handles the
   letterspaced labels, Inter does the reading. */
const display = Poiret_One({
	subsets: ['latin'],
	weight: '400',
	variable: '--font-display',
	display: 'swap',
});

const deco = Josefin_Sans({
	subsets: ['latin'],
	weight: ['300', '400', '600', '700'],
	variable: '--font-deco',
	display: 'swap',
});

const body = Inter({
	subsets: ['latin'],
	variable: '--font-body',
	display: 'swap',
});

export const metadata: Metadata = {
	title: {
		default: 'Orchard EDU — Giving every classroom an extra teacher',
		template: '%s · Orchard EDU',
	},
	description:
		'Orchard is a curriculum-grounded intelligence layer for your LMS. It turns instructor-approved materials into aligned lessons, assessments and unlimited practice — with concept-level analytics and full data sovereignty.',
	keywords: [
		'LMS',
		'Canvas integration',
		'retrieval-augmented generation',
		'education technology',
		'academic integrity',
		'adaptive learning',
	],
	openGraph: {
		title: 'Orchard EDU — Giving every classroom an extra teacher',
		description:
			'A curriculum-grounded RAG layer for Canvas that generates aligned assessments and surfaces concept-level knowledge gaps.',
		type: 'website',
		siteName: 'Orchard EDU',
	},
	icons: {
		icon: [
			{ url: '/orchardedulogo.png', type: 'image/png' },
			{ url: '/favicon.ico', sizes: 'any' },
		],
		apple: '/orchardedulogowhite.png',
	},
};

/* Applies the stored theme before first paint so dark mode never flashes. */
const themeBootstrap = `(function(){try{var t=localStorage.getItem('theme');if(t!=='dark'&&t!=='light'){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html
			lang="en"
			className={`${display.variable} ${deco.variable} ${body.variable}`}
			suppressHydrationWarning
		>
			<head>
				<script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
			</head>
			<body>
				<ThemeProvider>
					<ConditionalLayout>{children}</ConditionalLayout>
				</ThemeProvider>
			</body>
		</html>
	);
}
