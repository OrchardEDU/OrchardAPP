'use client';

import React from 'react';
import Reveal from './Reveal';
import { DecoRule, Rosette } from './Deco';

interface PageHeaderProps {
	eyebrow: string;
	title: React.ReactNode;
	lede: string;
	/** Short label/value pairs rendered as a rail beneath the lede. */
	facts?: Array<{ label: string; value: string }>;
}

export default function PageHeader({ eyebrow, title, lede, facts }: PageHeaderProps) {
	return (
		<header className="o-pageHeader">
			<div className="o-rays o-pageHeader__rays" aria-hidden="true" />
			<Rosette size={520} className="o-watermark o-pageHeader__mark" animate={false} spin />

			<div className="o-shell o-pageHeader__inner">
				<Reveal>
					<p className="o-eyebrow o-eyebrow--lead">{eyebrow}</p>
				</Reveal>
				<Reveal anim="curtain" delay={100}>
					<h1 className="o-h1 o-pageHeader__title">{title}</h1>
				</Reveal>
				<Reveal anim="rule" delay={240}>
					<DecoRule className="o-pageHeader__rule" />
				</Reveal>
				<Reveal delay={300}>
					<p className="o-lede o-pageHeader__lede">{lede}</p>
				</Reveal>

				{facts && (
					<dl className="o-factRail">
						{facts.map((fact, index) => (
							<Reveal key={fact.label} delay={380 + index * 80} className="o-factRail__item">
								<dt className="o-caps">{fact.label}</dt>
								<dd>{fact.value}</dd>
							</Reveal>
						))}
					</dl>
				)}
			</div>
		</header>
	);
}
