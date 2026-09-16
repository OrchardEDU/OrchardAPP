'use client';

import React from 'react';
import Reveal from '../Reveal';
import { DecoRule, Rosette, Ziggurat } from '../Deco';
import './auth.css';

interface AuthShellProps {
	eyebrow: string;
	title: React.ReactNode;
	lede: string;
	facts?: Array<{ label: string; value: string }>;
	children: React.ReactNode;
}

export default function AuthShell({ eyebrow, title, lede, facts, children }: AuthShellProps) {
	return (
		<div className="o-page o-auth">
			<div className="o-rays o-auth__rays" aria-hidden="true" />
			<Rosette size={480} className="o-watermark o-auth__mark" animate={false} spin />

			<div className="o-shell o-auth__inner">
				<div className="o-auth__copy">
					<Reveal anim="fade">
						<Ziggurat />
					</Reveal>
					<Reveal delay={60}>
						<p className="o-eyebrow o-eyebrow--lead">{eyebrow}</p>
					</Reveal>
					<Reveal anim="curtain" delay={120}>
						<h1 className="o-h1 o-auth__title">{title}</h1>
					</Reveal>
					<Reveal anim="rule" delay={220}>
						<DecoRule className="o-auth__rule" />
					</Reveal>
					<Reveal delay={280}>
						<p className="o-lede">{lede}</p>
					</Reveal>
					{facts && (
						<dl className="o-auth__facts">
							{facts.map((fact, index) => (
								<Reveal key={fact.label} delay={340 + index * 70} className="o-auth__fact">
									<dt className="o-caps">{fact.label}</dt>
									<dd>{fact.value}</dd>
								</Reveal>
							))}
						</dl>
					)}
				</div>

				<Reveal delay={180} className="o-auth__card o-frame o-frame--static o-bracket">
					{children}
				</Reveal>
			</div>
		</div>
	);
}

export function AuthSpin({ label }: { label: string }) {
	return (
		<div className="o-auth__busy" role="status">
			<span className="o-auth__spinner" aria-hidden="true" />
			<span className="o-small">{label}</span>
		</div>
	);
}
