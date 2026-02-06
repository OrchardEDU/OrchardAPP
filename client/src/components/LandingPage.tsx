'use client';

import React from 'react';
import Hero from './landing/Hero';
import Features from './landing/Features';
import HowItWorks from './landing/HowItWorks';

export default function LandingPage() {
	return (
		<div className="App">
			<main>
				<Hero />
				<Features />
				<HowItWorks />
			</main>
		</div>
	);
}
