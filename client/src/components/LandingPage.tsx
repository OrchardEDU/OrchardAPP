'use client';

import React from 'react';
import Header from './Header';
import Hero from './Hero';
import Features from './Features';
import HowItWorks from './HowItWorks';
import Footer from './Footer';

export default function LandingPage() {
	return (
		<div className="App">
			<Header />
			<main>
				<Hero />
				<Features />
				<HowItWorks />
			</main>
			<Footer />
		</div>
	);
}
