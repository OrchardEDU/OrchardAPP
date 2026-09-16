'use client';

import React from 'react';
import Reveal from '../Reveal';
import Counter from '../Counter';
import { Ziggurat } from '../Deco';

const MARKET = [
	{ to: 163, prefix: '$', suffix: 'B', label: 'Global EdTech market, 2025' },
	{ to: 13.3, suffix: '%', decimals: 1, label: 'CAGR through 2030' },
	{ to: 7.05, prefix: '$', suffix: 'B', decimals: 2, label: 'AI in education segment' },
	{ to: 36, suffix: '%', label: 'Growth rate of that segment' },
];

const TRIGGERS = [
	{
		numeral: '01',
		title: 'Pressure to adopt safe AI',
		body: 'Boards and parents are pushing schools toward AI they can defend. Because Orchard reasons only over teacher-provided notes and PDFs rather than a generic internet search, it gives districts a walled garden they can actually approve.',
	},
	{
		numeral: '02',
		title: 'Demand for granular intervention data',
		body: 'Administrators want motivation and mastery metrics, not login counts. Showing which concepts an entire class is failing before the midterm moves Orchard from software line item to strategic insight.',
	},
	{
		numeral: '03',
		title: 'Hybrid learning is now the baseline',
		body: 'With roughly 70% of learners preferring flexible formats, digital-first practice sets stopped being an enhancement. Active-learning mandates require asynchronous practice that does not add to a professor’s workload.',
	},
];

const SEGMENTS = [
	{
		label: 'K-12, grades 9–12',
		value: '~$56B',
		body: 'Close to 35% of online education share, driven by exam prep and college readiness. The economic buyer is a district weighing teacher retention against the ten to fifteen hours a week lost to prep.',
	},
	{
		label: 'Higher education',
		value: '~$81B',
		body: 'Undergraduate student spend, where deans are measured on DFW rates in large gateway courses. Failure is a retention risk, and retention is revenue.',
	},
];

export default function WhyNow() {
	return (
		<section className="o-section o-section--alt o-whyNow" id="market">
			<div className="o-shell">
				<div className="o-intro o-intro--center">
					<Reveal anim="fade">
						<Ziggurat />
					</Reveal>
					<Reveal delay={80}>
						<p className="o-eyebrow">Why now</p>
					</Reveal>
					<Reveal anim="curtain" delay={160}>
						<h2 className="o-h2">A market entering a super-cycle</h2>
					</Reveal>
					<Reveal delay={240}>
						<p className="o-lede">
							Institutions are shifting from exploring AI to mandating it. The window is
							defined less by the technology than by who the procurement office is
							willing to trust.
						</p>
					</Reveal>
				</div>

				<div className="o-whyNow__stats">
					{MARKET.map((stat, index) => (
						<Reveal key={stat.label} delay={index * 100} className="o-whyNow__stat">
							<span className="o-whyNow__statValue">
								<Counter
									to={stat.to}
									prefix={stat.prefix}
									suffix={stat.suffix}
									decimals={stat.decimals ?? 0}
								/>
							</span>
							<span className="o-caps o-whyNow__statLabel">{stat.label}</span>
						</Reveal>
					))}
				</div>

				<div className="o-whyNow__segments">
					{SEGMENTS.map((segment, index) => (
						<Reveal
							key={segment.label}
							anim={index === 0 ? 'left' : 'right'}
							delay={index * 120}
							className="o-whyNow__segment o-frame o-frame--static"
						>
							<div className="o-whyNow__segmentHead">
								<span className="o-caps">{segment.label}</span>
								<span className="o-whyNow__segmentValue">{segment.value}</span>
							</div>
							<p className="o-body">{segment.body}</p>
						</Reveal>
					))}
				</div>

				<ol className="o-whyNow__triggers">
					{TRIGGERS.map((trigger, index) => (
						<Reveal
							as="li"
							key={trigger.title}
							delay={index * 130}
							className="o-whyNow__trigger"
						>
							<span className="o-numeral">{trigger.numeral}</span>
							<div>
								<h3 className="o-h3">{trigger.title}</h3>
								<p className="o-body">{trigger.body}</p>
							</div>
						</Reveal>
					))}
				</ol>
			</div>
		</section>
	);
}
