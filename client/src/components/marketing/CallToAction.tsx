'use client';

import React from 'react';
import Link from 'next/link';
import Reveal from './Reveal';
import { Chevrons, Ziggurat } from './Deco';

interface CallToActionProps {
	eyebrow?: string;
	title: React.ReactNode;
	body: string;
	primary?: { label: string; href: string };
	secondary?: { label: string; href: string };
	note?: string;
}

export default function CallToAction({
	eyebrow = 'Get started',
	title,
	body,
	primary = { label: 'Request Access', href: '/register' },
	secondary = { label: 'Watch the Demo', href: '/demo' },
	note,
}: CallToActionProps) {
	return (
		<section className="o-cta o-invert">
			<Chevrons className="o-cta__chevrons" />
			<div className="o-rays o-cta__rays" aria-hidden="true" />

			<div className="o-shell o-cta__inner">
				<Reveal anim="fade">
					<Ziggurat className="o-cta__zig" />
				</Reveal>
				<Reveal delay={80}>
					<p className="o-eyebrow">{eyebrow}</p>
				</Reveal>
				<Reveal anim="curtain" delay={140}>
					<h2 className="o-h2 o-cta__title">{title}</h2>
				</Reveal>
				<Reveal delay={220}>
					<p className="o-lede o-cta__body">{body}</p>
				</Reveal>
				<Reveal delay={300} className="o-cta__actions">
					<Link href={primary.href} className="o-btn o-btn--gold">
						{primary.label}
					</Link>
					<Link href={secondary.href} className="o-btn o-btn--ghost">
						{secondary.label}
					</Link>
				</Reveal>
				{note && (
					<Reveal delay={380}>
						<p className="o-small o-cta__note">{note}</p>
					</Reveal>
				)}
			</div>
		</section>
	);
}
