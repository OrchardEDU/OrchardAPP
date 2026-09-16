'use client';

import React, { useEffect, useState } from 'react';
import { useInView } from './useInView';

interface CounterProps {
	to: number;
	prefix?: string;
	suffix?: string;
	decimals?: number;
	duration?: number;
	className?: string;
	/** Renders 45000 as "45,000". */
	group?: boolean;
}

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

const prefersReducedMotion = () =>
	typeof window !== 'undefined' &&
	window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Counts up to `to` the first time it scrolls into view. */
export default function Counter({
	to,
	prefix = '',
	suffix = '',
	decimals = 0,
	duration = 1600,
	className = '',
	group = false,
}: CounterProps) {
	const { ref, inView } = useInView<HTMLSpanElement>({ threshold: 0.4 });
	const [value, setValue] = useState(0);

	useEffect(() => {
		if (!inView) return;

		if (prefersReducedMotion()) {
			setValue(to);
			return;
		}

		let frame = 0;
		const start = performance.now();

		const tick = (now: number) => {
			const progress = Math.min((now - start) / duration, 1);
			setValue(to * easeOutCubic(progress));
			if (progress < 1) frame = requestAnimationFrame(tick);
		};

		frame = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(frame);
	}, [inView, to, duration]);

	const rendered = group
		? Math.round(value).toLocaleString('en-US')
		: value.toFixed(decimals);

	return (
		<span ref={ref} className={className}>
			{prefix}
			{rendered}
			{suffix}
		</span>
	);
}
