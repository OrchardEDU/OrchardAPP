'use client';

import React from 'react';
import Reveal from '../Reveal';
import { DecoRule } from '../Deco';

const GROUNDING = [
	{
		label: 'General-purpose AI',
		detail: 'Answers predicted from the open internet',
		value: '15–20%',
		width: '82%',
		tone: 'risk',
	},
	{
		label: 'Orchard',
		detail: 'Answers derived from instructor materials only',
		value: '<2%',
		width: '9%',
		tone: 'safe',
	},
];

const AUDIENCES = [
	{
		numeral: '01',
		title: 'For the instructor',
		body: 'Building a fresh question bank every semester is a labour sink. Upload the questions you already have and Orchard reparses them, varying wording and values per student so a leaked bank stops being leverage.',
	},
	{
		numeral: '02',
		title: 'For the student',
		body: 'A tutor that knows exactly what was covered in class that day, and low-stakes practice to test understanding before it counts toward a GPA.',
	},
	{
		numeral: '03',
		title: 'For the administrator',
		body: 'Interactions are logged at the concept level, surfacing which ideas a whole cohort is failing before the midterm — aggregated across sections while student privacy is preserved.',
	},
];

export default function Solution() {
	return (
		<section className="o-section o-section--alt o-solution" id="solution">
			<div className="o-shell o-solution__top">
				<div className="o-solution__copy">
					<Reveal>
						<p className="o-eyebrow o-eyebrow--lead">The solution</p>
					</Reveal>
					<Reveal anim="curtain" delay={100}>
						<h2 className="o-h2">
							Grounded automation,
							<br />
							not another chatbot
						</h2>
					</Reveal>
					<Reveal delay={200}>
						<p className="o-lede">
							Orchard is not a replacement for your LMS. It is an intelligent layer that
							sits on top of it, and its knowledge base is deliberately small: only the
							documents your instructor uploaded.
						</p>
					</Reveal>
					<Reveal delay={280}>
						<p className="o-body o-solution__body">
							If an answer cannot be derived from that specific syllabus, textbook or set
							of lecture notes, the system does not invent one. Every generated practice
							problem, assessment and piece of feedback stays inside the curriculum the
							department actually approved.
						</p>
					</Reveal>
				</div>

				<Reveal anim="right" delay={160} className="o-solution__panel o-frame o-frame--static o-bracket">
					<p className="o-caps o-solution__panelTitle">Hallucination risk</p>
					<DecoRule className="o-solution__panelRule" />

					<div className="o-solution__bars">
						{GROUNDING.map((row) => (
							<div key={row.label} className={`o-bar o-bar--${row.tone}`}>
								<div className="o-bar__head">
									<span className="o-bar__label">{row.label}</span>
									<span className="o-bar__value">{row.value}</span>
								</div>
								<div className="o-bar__track">
									<span
										className="o-bar__fill"
										style={{ '--w': row.width } as React.CSSProperties}
									/>
								</div>
								<p className="o-small">{row.detail}</p>
							</div>
						))}
					</div>

					<p className="o-small o-solution__panelNote">
						Retrieval is restricted to instructor-approved context, so the model has
						nothing off-curriculum to reach for.
					</p>
				</Reveal>
			</div>

			<div className="o-shell o-solution__audiences">
				{AUDIENCES.map((audience, index) => (
					<Reveal
						key={audience.title}
						delay={index * 120}
						className="o-solution__audience"
					>
						<span className="o-numeral">{audience.numeral}</span>
						<h3 className="o-h3">{audience.title}</h3>
						<p className="o-body">{audience.body}</p>
					</Reveal>
				))}
			</div>
		</section>
	);
}
