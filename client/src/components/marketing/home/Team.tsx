'use client';

import React from 'react';
import Reveal from '../Reveal';
import { Ziggurat } from '../Deco';

const FOUNDERS = [
	{
		initials: 'SB',
		name: 'Skandha Suhas Badrinarayan',
		role: 'Co-Founder',
		school: 'University of Illinois Urbana-Champaign',
		body: 'Started Orchard after a 300-page question bank for one of his courses leaked, inflating test scores and corrupting the performance data his instructors relied on. Published author of the Amazon bestseller The Young Investors Club and featured in The Wall Street Journal.',
		tone: 'red',
	},
	{
		initials: 'JR',
		name: 'Jonathan “Jonny” James Rice',
		role: 'Co-Founder',
		school: 'University of Illinois Urbana-Champaign',
		body: 'Course Assistant for UIUC Data Science Discovery, one of the largest data science programmes in the nation, and a former administrative intern at Minnetonka Public Schools. Focused on moving assessment away from testing-centric models.',
		tone: 'blue',
	},
	{
		initials: 'EK',
		name: 'Ethan Kusse',
		role: 'Technical Co-Founder',
		school: 'Rensselaer Polytechnic Institute',
		body: 'Owns the platform top to bottom — the user-facing product, backend services, core systems, deployment and infrastructure. Built Orchard out of watching course materials get replaced by old exams.',
		tone: 'gold',
	},
	{
		initials: 'PV',
		name: 'Pranav Vasisht',
		role: 'Technical Co-Founder',
		school: 'Oregon State University',
		body: 'Co-developed NutriScanAI and engineered a mini-LLM that generates mridangam patterns. Works on making retrieval and generation feel accessible and intuitive rather than merely clever.',
		tone: 'ink',
	},
];

const ADVISORS = [
	{ name: 'Ragothan Murthy', role: 'Advisor' },
	{ name: 'Dr. Michael Rice', role: 'Advisor · Educator' },
];

export default function Team() {
	return (
		<section className="o-section o-team" id="team">
			<div className="o-shell">
				<div className="o-intro o-intro--center">
					<Reveal anim="fade">
						<Ziggurat />
					</Reveal>
					<Reveal delay={80}>
						<p className="o-eyebrow">The team</p>
					</Reveal>
					<Reveal anim="curtain" delay={160}>
						<h2 className="o-h2">Built by people who sat in the classroom</h2>
					</Reveal>
					<Reveal delay={240}>
						<p className="o-lede">
							Two founders from the buying side of education and two engineers who ship
							the platform themselves.
						</p>
					</Reveal>
				</div>

				<div className="o-team__grid">
					{FOUNDERS.map((person, index) => (
						<Reveal
							key={person.name}
							delay={index * 110}
							className="o-team__card o-frame o-frame--lift"
						>
							<div className="o-team__head">
								<span className={`o-team__monogram o-team__monogram--${person.tone}`}>
									{person.initials}
								</span>
								<div>
									<h3 className="o-h3 o-team__name">{person.name}</h3>
									<p className="o-caps o-team__role">{person.role}</p>
									<p className="o-small">{person.school}</p>
								</div>
							</div>
							<p className="o-body">{person.body}</p>
						</Reveal>
					))}
				</div>

				<Reveal delay={100} className="o-team__advisors o-frame o-frame--flat o-frame--static">
					<p className="o-caps o-team__advisorsTitle">Advisors</p>
					<ul>
						{ADVISORS.map((advisor) => (
							<li key={advisor.name}>
								<span className="o-team__advisorName">{advisor.name}</span>
								<span className="o-small">{advisor.role}</span>
							</li>
						))}
					</ul>
				</Reveal>
			</div>
		</section>
	);
}
