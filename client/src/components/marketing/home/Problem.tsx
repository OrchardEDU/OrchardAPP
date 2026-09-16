'use client';

import React from 'react';
import Reveal from '../Reveal';
import Counter from '../Counter';
import { Ziggurat } from '../Deco';

const PRESSURES = [
	{
		numeral: 'I',
		title: 'Scalability & burnout',
		to: 44,
		suffix: '%',
		metric: 'of educators are burned out',
		source: 'Gallup, 2025',
		body: 'K-12 and university educators report feeling "always" or "very often" burned out — the highest rate of any profession in the United States. As class sizes grow to cover vacancies, individualised feedback becomes mathematically impossible.',
		tone: 'red',
	},
	{
		numeral: 'II',
		title: 'The integrity gap',
		to: 61,
		suffix: '%',
		metric: 'cite AI-enabled cheating first',
		source: 'Carnegie Learning, 2025',
		body: 'Detection tools flag roughly 7.5 incidents per 1,000 papers while anonymous student surveys put actual usage near 88%. Instructional time is being redirected into policing authorship instead of teaching concepts.',
		tone: 'blue',
	},
	{
		numeral: 'III',
		title: 'Infrastructure that never adapted',
		to: 90,
		suffix: '%',
		metric: 'of the market is legacy LMS',
		source: 'North American higher ed',
		body: 'Canvas and Blackboard store content effectively but function as static digital filing cabinets. They cannot identify a student’s confusion in real time or remediate against a specific professor’s lecture material.',
		tone: 'gold',
	},
];

export default function Problem() {
	return (
		<section className="o-section o-problem" id="problem">
			<div className="o-shell">
				<div className="o-intro o-problem__intro">
					<Reveal anim="fade">
						<Ziggurat />
					</Reveal>
					<Reveal delay={80}>
						<p className="o-eyebrow o-eyebrow--lead">The problem</p>
					</Reveal>
					<Reveal anim="curtain" delay={160}>
						<h2 className="o-h2">The collapse of instructional capacity</h2>
					</Reveal>
					<Reveal delay={240}>
						<p className="o-lede">
							Three pressures are converging on the same hour of a teacher’s day. None of
							them are solved by another content repository.
						</p>
					</Reveal>
				</div>

				<div className="o-problem__grid">
					{PRESSURES.map((pressure, index) => (
						<Reveal
							key={pressure.title}
							delay={index * 130}
							className={`o-problem__card o-frame o-frame--lift o-problem__card--${pressure.tone}`}
						>
							<span className="o-problem__numeral">{pressure.numeral}</span>

							<p className="o-problem__stat">
								<Counter to={pressure.to} suffix={pressure.suffix} />
							</p>
							<p className="o-caps o-problem__metric">{pressure.metric}</p>

							<h3 className="o-h3 o-problem__title">{pressure.title}</h3>
							<p className="o-body">{pressure.body}</p>

							<p className="o-small o-problem__source">{pressure.source}</p>
						</Reveal>
					))}
				</div>

				<Reveal delay={120} className="o-problem__coda o-frame o-frame--flat o-frame--static">
					<p className="o-body">
						<strong>45,000</strong> teaching positions sit unfilled nationwide
						<span className="o-problem__cite"> (NCES)</span>. Institutions absorb the gap by
						enlarging classes, which is precisely the condition under which static
						platforms fail hardest.
					</p>
				</Reveal>
			</div>
		</section>
	);
}
