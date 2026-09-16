'use client';

import React from 'react';
import Link from 'next/link';
import Reveal from '../Reveal';
import { DecoRule, Rosette } from '../Deco';

const STACK = ['Canvas API', 'Llama 3', 'Qdrant', 'AWS'];

const PLATES = [
	{ value: '<2%', label: 'Hallucination rate', position: 'a' },
	{ value: '50×', label: 'Lower inference cost', position: 'b' },
	{ value: '100%', label: 'Data sovereignty', position: 'c' },
];

export default function Hero() {
	return (
		<section className="o-hero">
			<div className="o-rays o-hero__rays" aria-hidden="true" />
			<div className="o-flutes o-hero__flutes" aria-hidden="true" />

			<div className="o-shell o-shell--wide o-hero__inner">
				<div className="o-hero__copy">
					<Reveal>
						<p className="o-eyebrow o-eyebrow--lead">
							Curriculum-grounded intelligence for your LMS
						</p>
					</Reveal>

					<Reveal anim="curtain" delay={120}>
						<h1 className="o-h1 o-hero__title">
							Giving every classroom
							<br />
							an <span className="o-accent">extra teacher</span>
						</h1>
					</Reveal>

					<Reveal anim="rule" delay={340}>
						<DecoRule className="o-hero__rule" />
					</Reveal>

					<Reveal delay={420}>
						<p className="o-lede o-hero__lede">
							Orchard reads the syllabi, lecture notes and assignments your instructors
							already wrote, then generates aligned lessons, assessments and unlimited
							practice from them — and reports concept-level performance back to the
							people doing the teaching.
						</p>
					</Reveal>

					<Reveal delay={520} className="o-hero__actions">
						<Link href="/how-it-works" className="o-btn o-btn--solid">
							How It Works
						</Link>
						<Link href="/demo" className="o-btn o-btn--ghost">
							Watch the Demo
						</Link>
					</Reveal>

					<Reveal delay={620} className="o-hero__stack">
						<span className="o-caps o-hero__stackLabel">Built on</span>
						<span className="o-hero__stackItems">
							{STACK.map((item) => (
								<span key={item} className="o-chip">
									{item}
								</span>
							))}
						</span>
					</Reveal>
				</div>

				<div className="o-hero__figure">
					<div className="o-hero__plate o-bracket">
						<Rosette size={340} spin className="o-hero__rosette" />
					</div>

					{PLATES.map((plate, index) => (
						<div
							key={plate.label}
							className={`o-hero__stat o-hero__stat--${plate.position}`}
							style={{ animationDelay: `${index * 1.4}s` }}
						>
							<span className="o-hero__statValue">{plate.value}</span>
							<span className="o-caps o-hero__statLabel">{plate.label}</span>
						</div>
					))}
				</div>
			</div>

			<Reveal anim="fade" delay={700} className="o-hero__scroll">
				<span className="o-caps">Scroll</span>
				<span className="o-hero__scrollLine" />
			</Reveal>
		</section>
	);
}
