'use client';

import React from 'react';
import Reveal from '../Reveal';
import { Chevrons, Ziggurat } from '../Deco';

const PHASES = [
	{
		numeral: 'I',
		name: 'The Invisible Integration',
		body: 'Perfect the Canvas connector so adoption costs a department nothing. Success is measured as time to value, and the target is under one hour for a new department.',
		metric: 'Time to value < 1 hour',
	},
	{
		numeral: 'II',
		name: 'The Assessment Engine',
		body: 'Instructors upload existing questions; Orchard parses them and varies wording and values per student. Grading follows the logic of the answer, which discourages copying and reduces marking error.',
		metric: 'Per-student question variants',
	},
	{
		numeral: 'III',
		name: 'Cross-Platform Expansion',
		body: 'Roll out Blackboard, D2L Brightspace and Moodle integrations alongside the Orchard API, letting universities connect internal databases directly to the inference engine.',
		metric: 'Orchard API + 3 new LMS',
	},
];

const TIMELINE = [
	{
		window: 'Month 1',
		title: 'Foundation & legal',
		body: 'LLC registration, domain and DNS/WAF via Cloudflare, and the initial AWS environment — IAM roles and VPC.',
	},
	{
		window: 'Months 2–3',
		title: 'Data infrastructure',
		body: 'RDS and S3 initialised, Qdrant instances stood up and curriculum indexing begun, first containerised ECS services deployed.',
	},
	{
		window: 'Months 4–6',
		title: 'Beta & AI tuning',
		body: 'GPU-backed ECS tasks tested for inference and fine-tuning, security audit against institutional requirements, stress tests on retrieval speed and accuracy.',
	},
	{
		window: 'Months 7–9',
		title: 'Pilot launch',
		body: 'Acquisition begins with named teachers and districts, first pilot users onboarded, usage-based costs monitored closely, prompts and indexing tuned on real classroom activity.',
	},
	{
		window: 'Months 10–12',
		title: 'Scaling & optimisation',
		body: 'Review AWS usage to confirm elastic scaling behaves, plan renewals, and take pilot results into district-wide contract conversations for year two.',
	},
];

export default function Roadmap() {
	return (
		<section className="o-section o-roadmap o-invert" id="roadmap">
			<Chevrons className="o-roadmap__chevrons" />

			<div className="o-shell">
				<div className="o-intro o-intro--center">
					<Reveal anim="fade">
						<Ziggurat />
					</Reveal>
					<Reveal delay={80}>
						<p className="o-eyebrow">Operational roadmap</p>
					</Reveal>
					<Reveal anim="curtain" delay={160}>
						<h2 className="o-h2">Three phases, then the platform</h2>
					</Reveal>
				</div>

				<div className="o-roadmap__phases">
					{PHASES.map((phase, index) => (
						<Reveal
							key={phase.numeral}
							delay={index * 130}
							className="o-roadmap__phase o-frame o-frame--lift"
						>
							<span className="o-numeral">{phase.numeral}</span>
							<h3 className="o-h3">{phase.name}</h3>
							<p className="o-body">{phase.body}</p>
							<p className="o-caps o-roadmap__metric">{phase.metric}</p>
						</Reveal>
					))}
				</div>

				<div className="o-roadmap__timeline">
					<Reveal anim="fade">
						<p className="o-caps o-roadmap__timelineTitle">Twelve-month build</p>
					</Reveal>
					<ol>
						{TIMELINE.map((entry, index) => (
							<Reveal
								as="li"
								key={entry.window}
								delay={index * 90}
								className="o-roadmap__milestone"
							>
								<span className="o-roadmap__marker" aria-hidden="true" />
								<span className="o-caps o-roadmap__window">{entry.window}</span>
								<h4 className="o-h3 o-roadmap__milestoneTitle">{entry.title}</h4>
								<p className="o-small">{entry.body}</p>
							</Reveal>
						))}
					</ol>
				</div>
			</div>
		</section>
	);
}
