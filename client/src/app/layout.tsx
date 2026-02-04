import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import '../styles/theme.css';
import ConditionalLayout from '@/components/ConditionalLayout';
import { ThemeProvider } from '@/contexts/ThemeContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
	title: 'Orchard - Educational Content Creator',
	description: 'Transform your teaching materials into unlimited practice questions',
	icons: {
		icon: [
			{ url: '/orchardedulogo.png', type: 'image/png' },
			{ url: '/favicon.ico', sizes: 'any' },
		],
		apple: '/orchardedulogowhite.png',
	},
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<body className={inter.className}>
				<ThemeProvider>
					<ConditionalLayout>
						<div className="layout-wrapper">
							<Header />
							<main className="main-content">
								{children}
							</main>
							<Footer />
						</div>
					</ConditionalLayout>
				</ThemeProvider>
			</body>
		</html>
	);
}
