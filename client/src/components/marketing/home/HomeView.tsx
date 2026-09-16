'use client';

import React from 'react';
import Hero from './Hero';
import Problem from './Problem';
import Solution from './Solution';
import Matrix from './Matrix';
import Technical from './Technical';
import WhyNow from './WhyNow';
import Team from './Team';
import Marquee from '../Marquee';
import CallToAction from '../CallToAction';
import '../shared.css';
import './home.css';

const TICKER = [
	'44% of educators report burnout',
	'45,000 unfilled teaching positions',
	'61% cite AI-enabled cheating first',
	'88% actual student AI usage',
	'90% of the market runs legacy LMS',
	'Under 2% hallucination rate',
];

export default function HomeView() {
	return (
		<div className="o-page">
			<Hero />
			<Marquee items={TICKER} />
			<Problem />
			<Solution />
			<Matrix />
			<Technical />
			<WhyNow />
			<Team />
			<CallToAction
				eyebrow="Departmental pilot"
				title="Bring Orchard to one course first"
				body="Adoption starts with a single professor or department head — free for the first 100 students, then a low per-student semester fee. Institutional and enterprise licences follow once the efficacy data is yours."
				primary={{ label: 'Request Access', href: '/register' }}
				secondary={{ label: 'Watch the Demo', href: '/demo' }}
				note="Time to value target: under one hour from Canvas connection."
			/>
		</div>
	);
}
