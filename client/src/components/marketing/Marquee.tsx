'use client';

import React from 'react';

interface MarqueeProps {
	items: string[];
	/** Seconds for one full pass. */
	speed?: number;
	className?: string;
}

/**
 * Continuous ticker. The list is rendered twice so the translation can loop at
 * exactly -50% without a visible seam.
 */
export default function Marquee({ items, speed = 46, className = '' }: MarqueeProps) {
	const track = [...items, ...items];

	return (
		<div className={`o-marquee ${className}`.trim()}>
			<div
				className="o-marquee__track"
				style={{ animationDuration: `${speed}s` }}
				aria-hidden="true"
			>
				{track.map((item, index) => (
					<span key={index} className="o-marquee__item">
						{item}
						<i className="o-marquee__pip" />
					</span>
				))}
			</div>
			{/* Screen readers get the list once, without the duplication. */}
			<ul className="o-visually-hidden">
				{items.map((item) => (
					<li key={item}>{item}</li>
				))}
			</ul>
		</div>
	);
}
