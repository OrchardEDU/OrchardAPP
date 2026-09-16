'use client';

import React, { useId } from 'react';
import { useInView } from './useInView';
import './Deco.css';

/* ==========================================================================
   Geometric ornaments derived from the Orchard mark. These are decorative
   only — the mark itself is always the real logo asset, never a redraw.
   ========================================================================== */

const CENTRE = 100;

/** Lens-shaped petal pointing up from the centre of a 200x200 viewBox. */
function petalPath(inner: number, outer: number, width: number) {
	const top = CENTRE - outer;
	const base = CENTRE - inner;
	const waist = CENTRE - (inner + outer) / 2;
	return [
		`M ${CENTRE} ${base}`,
		`Q ${CENTRE + width} ${waist} ${CENTRE} ${top}`,
		`Q ${CENTRE - width} ${waist} ${CENTRE} ${base}`,
		'Z',
	].join(' ');
}

/** One quadrant of the centre block, with a quarter of the star void removed. */
function quadrantPath(dirX: 1 | -1, dirY: 1 | -1) {
	const half = 43;
	const star = 27; // how far the void reaches along each axis
	const pinch = 8; // pulls the void's waist toward the corner
	const outerX = CENTRE - dirX * half;
	const outerY = CENTRE - dirY * half;
	return [
		`M ${outerX} ${outerY}`,
		`H ${CENTRE}`,
		`V ${CENTRE - dirY * star}`,
		`Q ${CENTRE - dirX * pinch} ${CENTRE - dirY * pinch} ${CENTRE - dirX * star} ${CENTRE}`,
		`H ${outerX}`,
		'Z',
	].join(' ');
}

const PETALS = [
	// Long petals on the axes and diagonals, short ones between them.
	...[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => ({
		angle,
		d: petalPath(47, 97, 16),
		tone: i % 2 === 0 ? 'ink' : 'gold',
	})),
	...[22.5, 67.5, 112.5, 157.5, 202.5, 247.5, 292.5, 337.5].map((angle, i) => ({
		angle,
		d: petalPath(47, 82, 12),
		tone: i % 2 === 0 ? 'red' : 'blue',
	})),
];

const QUADRANTS: Array<{ d: string; tone: string }> = [
	{ d: quadrantPath(1, 1), tone: 'red' },
	{ d: quadrantPath(-1, 1), tone: 'blue' },
	{ d: quadrantPath(1, -1), tone: 'blue' },
	{ d: quadrantPath(-1, -1), tone: 'red' },
];

interface RosetteProps {
	size?: number;
	className?: string;
	/** Plays the petal build-in when the rosette scrolls into view. */
	animate?: boolean;
	/** Keeps the outer petals turning very slowly. */
	spin?: boolean;
}

export function Rosette({ size = 320, className = '', animate = true, spin = false }: RosetteProps) {
	const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.25 });
	const playing = !animate || inView;

	return (
		<div
			ref={ref}
			className={`o-rosette ${playing ? 'is-in' : ''} ${className}`}
			/* Width is published as a custom property so layout CSS can override the
			   size without breaking the square aspect ratio. */
			style={{ '--o-rosette-size': `${size}px` } as React.CSSProperties}
			aria-hidden="true"
		>
			<svg viewBox="0 0 200 200" className={spin ? 'o-rosette__svg o-rosette__svg--spin' : 'o-rosette__svg'}>
				<g className="o-rosette__petals">
					{/* Rotation lives on the wrapping group so the petal's own CSS scale
					    animation stays in its local box and can't fight the rotation. */}
					{PETALS.map((petal, i) => (
						<g
							key={`${petal.angle}-${petal.tone}`}
							transform={`rotate(${petal.angle} ${CENTRE} ${CENTRE})`}
						>
							<path
								d={petal.d}
								className={`o-rosette__petal o-rosette__petal--${petal.tone}`}
								style={{ '--i': i } as React.CSSProperties}
							/>
						</g>
					))}
				</g>
				<g className="o-rosette__block">
					{QUADRANTS.map((quadrant, i) => (
						<path
							key={i}
							d={quadrant.d}
							className={`o-rosette__quadrant o-rosette__quadrant--${quadrant.tone}`}
							style={{ '--i': i } as React.CSSProperties}
						/>
					))}
				</g>
			</svg>
		</div>
	);
}

/** Hairline — lozenge — hairline divider. */
export function DecoRule({ className = '' }: { className?: string }) {
	return (
		<div className={`o-decoRule ${className}`} aria-hidden="true">
			<span className="o-decoRule__line" />
			<span className="o-decoRule__lozenge" />
			<span className="o-decoRule__pip" />
			<span className="o-decoRule__lozenge" />
			<span className="o-decoRule__line" />
		</div>
	);
}

/** Tiling zigzag hairline used to cap inverted bands. */
export function Chevrons({ className = '', height = 12 }: { className?: string; height?: number }) {
	const id = useId().replace(/:/g, '');
	const step = 26;
	return (
		<svg
			className={`o-chevrons ${className}`}
			height={height}
			width="100%"
			aria-hidden="true"
			focusable="false"
		>
			<defs>
				<pattern id={id} width={step} height={height} patternUnits="userSpaceOnUse">
					<path
						d={`M0 ${height - 1.5} L${step / 2} 1.5 L${step} ${height - 1.5}`}
						fill="none"
						stroke="currentColor"
						strokeWidth="1"
					/>
				</pattern>
			</defs>
			<rect width="100%" height={height} fill={`url(#${id})`} />
		</svg>
	);
}

/** Stepped ziggurat stack, used as a title ornament. */
export function Ziggurat({ className = '' }: { className?: string }) {
	return (
		<div className={`o-ziggurat ${className}`} aria-hidden="true">
			<span />
			<span />
			<span />
		</div>
	);
}
