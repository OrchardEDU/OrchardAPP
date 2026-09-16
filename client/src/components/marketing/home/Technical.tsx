'use client';

import React from 'react';
import Reveal from '../Reveal';
import Counter from '../Counter';
import { Chevrons, DecoRule } from '../Deco';

const COSTS = [
	{
		label: 'Closed proprietary models',
		value: '$10.00',
		unit: 'per million tokens',
		width: '100%',
		tone: 'risk',
	},
	{
		label: 'Orchard — self-hosted Llama 3',
		value: '$0.20',
		unit: 'per million tokens',
		width: '4%',
		tone: 'safe',
	},
];

const INFRASTRUCTURE = [
	{
		name: 'AWS RDS + S3',
		role: 'Relational data and secure document storage',
		cost: '$32.39 / mo',
	},
	{
		name: 'Qdrant',
		role: 'Managed vector database for curriculum-grounded retrieval',
		cost: '$34.17 / mo',
	},
	{
		name: 'AWS ECS',
		role: 'Containerised API layer, orchestration and GPU inference tasks',
		cost: 'Usage-based',
	},
	{
		name: 'Cloudflare',
		role: 'Registrar, DNS and WAF protection',
		cost: '$25.00 / mo',
	},
];

export default function Technical() {
	return (
		<section className="o-section o-technical o-invert" id="architecture">
			<Chevrons className="o-technical__chevrons" />
			<div className="o-shell o-technical__top">
				<div className="o-technical__copy">
					<Reveal>
						<p className="o-eyebrow o-eyebrow--lead">Technical strategy</p>
					</Reveal>
					<Reveal anim="curtain" delay={100}>
						<h2 className="o-h2">
							Open weights, private cloud,
							<br />
							institutional margins
						</h2>
					</Reveal>
					<Reveal delay={200}>
						<p className="o-lede">
							Most early-stage EdTech wraps a proprietary API, which hands over both the
							variable cost curve and the student data. Orchard self-hosts fine-tuned
							Llama 3 models instead.
						</p>
					</Reveal>
					<Reveal delay={280}>
						<p className="o-body">
							That single decision does three things at once: it collapses the cost of
							inference far enough to offer genuinely unlimited practice, it keeps
							student data inside Orchard’s private cloud so nothing is ever used to
							train a third party, and it holds FERPA and GDPR compliance where
							university general counsel needs it.
						</p>
					</Reveal>

					<Reveal delay={360} className="o-technical__badges">
						<span className="o-chip o-chip--gold">FERPA aligned</span>
						<span className="o-chip o-chip--gold">GDPR aligned</span>
						<span className="o-chip o-chip--gold">No third-party training</span>
					</Reveal>
				</div>

				<Reveal anim="right" delay={160} className="o-technical__plate o-frame o-frame--static o-bracket">
					<p className="o-caps o-technical__plateTitle">Cost of inference</p>
					<DecoRule className="o-technical__plateRule" />

					<div className="o-technical__bars">
						{COSTS.map((row) => (
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
								<p className="o-small">{row.unit}</p>
							</div>
						))}
					</div>

					<div className="o-technical__multiple">
						<span className="o-technical__multipleValue">
							<Counter to={50} suffix="×" />
						</span>
						<span className="o-caps">Reduction in operating cost</span>
					</div>
				</Reveal>
			</div>

			<div className="o-shell o-technical__infra">
				<Reveal anim="fade">
					<p className="o-caps o-technical__infraTitle">Fully AWS-hosted, elastic by design</p>
				</Reveal>
				<div className="o-technical__infraGrid">
					{INFRASTRUCTURE.map((item, index) => (
						<Reveal
							key={item.name}
							delay={index * 110}
							className="o-technical__infraCard o-frame o-frame--lift"
						>
							<h3 className="o-h3">{item.name}</h3>
							<p className="o-body">{item.role}</p>
							<p className="o-caps o-technical__infraCost">{item.cost}</p>
						</Reveal>
					))}
				</div>
				<Reveal delay={140}>
					<p className="o-small o-technical__infraNote">
						Core services hold under $100 per month at steady state. Backend tasks run on
						CPU-based ECS while inference and fine-tuning run GPU-backed, so compute is
						only billed when instructional activity actually happens.
					</p>
				</Reveal>
			</div>
		</section>
	);
}
