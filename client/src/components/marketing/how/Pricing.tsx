'use client';

import React from 'react';
import Link from 'next/link';
import Reveal from '../Reveal';
import { DecoRule, Ziggurat } from '../Deco';

const TIERS = [
	{
		tier: 'Tier I',
		name: 'Departmental Pilot',
		buyer: 'Individual professors & department heads',
		price: 'Free',
		priceNote: 'for the first 100 students, then a low per-student semester fee',
		includes: [
			'Canvas connection for one course',
			'Grounded generation from your materials',
			'Instant grading and student feedback',
			'Efficacy data you keep',
		],
		featured: false,
	},
	{
		tier: 'Tier II',
		name: 'Institutional Licence',
		buyer: 'Deans & provosts',
		price: 'Per FTE',
		priceNote: 'annual, based on full-time equivalent enrolment',
		includes: [
			'Full Canvas integration',
			'Dedicated Llama 3 hosting',
			'Unlimited material storage',
			'Analytics dashboards',
		],
		featured: true,
	},
	{
		tier: 'Tier III',
		name: 'Enterprise & Analytics',
		buyer: 'Districts & university systems',
		price: 'Custom',
		priceNote: 'contracted per system',
		includes: [
			'Predictive retention modelling',
			'At-risk identification weeks before finals',
			'Instructional efficacy reporting',
			'Orchard API access',
		],
		featured: false,
	},
];

export default function Pricing() {
	return (
		<section className="o-section o-pricing" id="pricing">
			<div className="o-shell">
				<div className="o-intro o-intro--center o-pricing__intro">
					<Reveal anim="fade">
						<Ziggurat />
					</Reveal>
					<Reveal delay={80}>
						<p className="o-eyebrow">Access</p>
					</Reveal>
					<Reveal anim="curtain" delay={160}>
						<h2 className="o-h2">Institutional by design, not per student</h2>
					</Reveal>
					<Reveal delay={240}>
						<p className="o-lede">
							Orchard is sold to departments and institutions rather than to individual
							students, so no cohort ends up with better tooling than the one beside it.
						</p>
					</Reveal>
				</div>

				<div className="o-pricing__grid">
					{TIERS.map((tier, index) => (
						<Reveal
							key={tier.tier}
							delay={index * 120}
							className={`o-pricing__card o-frame o-frame--lift ${
								tier.featured ? 'o-pricing__card--featured o-bracket' : ''
							}`}
						>
							{tier.featured && <span className="o-pricing__flag o-caps">Most adopted</span>}

							<p className="o-caps o-pricing__tier">{tier.tier}</p>
							<h3 className="o-h3 o-pricing__name">{tier.name}</h3>
							<p className="o-small o-pricing__buyer">{tier.buyer}</p>

							<DecoRule className="o-pricing__rule" />

							<p className="o-pricing__price">{tier.price}</p>
							<p className="o-small o-pricing__priceNote">{tier.priceNote}</p>

							<ul className="o-pricing__list">
								{tier.includes.map((item) => (
									<li key={item}>{item}</li>
								))}
							</ul>

							<Link
								href="/register"
								className={`o-btn ${tier.featured ? 'o-btn--gold' : 'o-btn--ghost'} o-pricing__cta`}
							>
								Enquire
							</Link>
						</Reveal>
					))}
				</div>
			</div>
		</section>
	);
}
