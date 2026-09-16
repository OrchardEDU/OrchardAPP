'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CHAPTERS, OFFSETS, TOTAL } from './scenes';
import { useInView } from '../useInView';

const TICK = 50;
const SPEEDS = [1, 1.5, 2] as const;

function timecode(ms: number) {
	const total = Math.max(0, Math.floor(ms / 1000));
	return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

const prefersReducedMotion = () =>
	typeof window !== 'undefined' &&
	window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * A scripted walkthrough of the product, played back like a recording.
 *
 * One clock drives everything: the elapsed time resolves to a chapter plus a
 * 0–1 progress value, and each scene animates itself from that. The clock ticks
 * at 20Hz rather than every frame — scenes change in discrete steps and CSS
 * transitions smooth the movement in between, which keeps the cost flat.
 */
export default function DemoPlayer() {
	const [elapsed, setElapsed] = useState(0);
	const [playing, setPlaying] = useState(false);
	const [speed, setSpeed] = useState<(typeof SPEEDS)[number]>(1);
	const [started, setStarted] = useState(false);

	const { ref: stageRef, inView } = useInView<HTMLDivElement>({ threshold: 0.35, once: false });
	const autoStarted = useRef(false);

	// Begin playing the first time the stage is properly on screen.
	useEffect(() => {
		if (!inView || autoStarted.current || prefersReducedMotion()) return;
		autoStarted.current = true;
		setPlaying(true);
		setStarted(true);
	}, [inView]);

	// Pause when scrolled away so an off-screen recording isn't burning cycles.
	useEffect(() => {
		if (!inView) setPlaying(false);
	}, [inView]);

	useEffect(() => {
		if (!playing) return;

		let last = performance.now();
		const id = window.setInterval(() => {
			const now = performance.now();
			const delta = (now - last) * speed;
			last = now;
			setElapsed((prev) => (prev + delta) % TOTAL);
		}, TICK);

		return () => window.clearInterval(id);
	}, [playing, speed]);

	const { index, local } = useMemo(() => {
		for (let i = CHAPTERS.length - 1; i >= 0; i -= 1) {
			if (elapsed >= OFFSETS[i]) {
				return {
					index: i,
					local: Math.min((elapsed - OFFSETS[i]) / CHAPTERS[i].duration, 1),
				};
			}
		}
		return { index: 0, local: 0 };
	}, [elapsed]);

	const chapter = CHAPTERS[index];

	const jumpTo = useCallback((target: number) => {
		setElapsed(OFFSETS[target]);
		setStarted(true);
	}, []);

	const toggle = useCallback(() => {
		setPlaying((value) => !value);
		setStarted(true);
	}, []);

	const onKeyDown = (event: React.KeyboardEvent) => {
		if (event.key === ' ' || event.key === 'k') {
			event.preventDefault();
			toggle();
		} else if (event.key === 'ArrowRight') {
			event.preventDefault();
			jumpTo(Math.min(index + 1, CHAPTERS.length - 1));
		} else if (event.key === 'ArrowLeft') {
			event.preventDefault();
			jumpTo(Math.max(index - 1, 0));
		}
	};

	// Latest waypoint the pointer has reached in this chapter.
	const pointer = useMemo(() => {
		const reached = chapter.cursor.filter((point) => local >= point.at);
		const current = reached[reached.length - 1] ?? chapter.cursor[0];
		const sinceArrival = (local - current.at) * chapter.duration;
		return {
			x: current.x,
			y: current.y,
			clicking: Boolean(current.click) && sinceArrival < 420,
		};
	}, [chapter, local]);

	return (
		<div
			className="o-player"
			ref={stageRef}
			onKeyDown={onKeyDown}
			tabIndex={0}
			role="group"
			aria-label="Orchard product walkthrough"
		>
			<div className="o-player__stage">
				{/* Recording frame */}
				<div className="o-player__chrome">
					<span className="o-player__rec" aria-hidden="true">
						<i className={playing ? 'is-live' : ''} />
						Rec
					</span>
					<span className="o-player__url">{chapter.url}</span>
					<span className="o-player__time">
						{timecode(elapsed)} / {timecode(TOTAL)}
					</span>
				</div>

				<div className="o-player__viewport">
					{chapter.render(local)}

					<span
						className={`o-player__pointer ${pointer.clicking ? 'is-clicking' : ''}`}
						style={{ left: `${pointer.x}%`, top: `${pointer.y}%` }}
						aria-hidden="true"
					>
						<svg viewBox="0 0 16 20" focusable="false">
							<path d="M1 1l12.4 8.6-5.4.7 3 6.6-2.7 1.2-3-6.6-4.3 3.4z" />
						</svg>
					</span>

					{!started && (
						<button type="button" className="o-player__poster" onClick={toggle}>
							<span className="o-player__posterIcon" aria-hidden="true">
								▶
							</span>
							<span className="o-caps">Play walkthrough</span>
						</button>
					)}
				</div>

				{/* Transport */}
				<div className="o-player__transport">
					<button
						type="button"
						className="o-player__control"
						onClick={toggle}
						aria-label={playing ? 'Pause' : 'Play'}
					>
						{playing ? '❙❙' : '▶'}
					</button>
					<button
						type="button"
						className="o-player__control"
						onClick={() => {
							setElapsed(0);
							setPlaying(true);
							setStarted(true);
						}}
						aria-label="Restart from the beginning"
					>
						↺
					</button>

					<div className="o-player__scrub">
						{CHAPTERS.map((item, i) => (
							<button
								type="button"
								key={item.id}
								className={`o-player__seg ${i === index ? 'is-current' : ''} ${
									i < index ? 'is-done' : ''
								}`}
								style={{ flexGrow: item.duration }}
								onClick={() => jumpTo(i)}
								aria-label={`Jump to: ${item.label}`}
								title={item.label}
							>
								<span
									className="o-player__segFill"
									style={{ width: i === index ? `${local * 100}%` : undefined }}
								/>
							</button>
						))}
					</div>

					<button
						type="button"
						className="o-player__control o-player__control--speed"
						onClick={() =>
							setSpeed(SPEEDS[(SPEEDS.indexOf(speed) + 1) % SPEEDS.length])
						}
						aria-label={`Playback speed ${speed} times`}
					>
						{speed}×
					</button>
				</div>
			</div>

			{/* Chapter list */}
			<div className="o-player__chapters">
				<p className="o-caps o-player__chaptersTitle">Chapters</p>
				<ol>
					{CHAPTERS.map((item, i) => (
						<li key={item.id}>
							<button
								type="button"
								className={`o-player__chapter ${i === index ? 'is-current' : ''}`}
								onClick={() => jumpTo(i)}
							>
								<span className="o-player__chapterIndex">
									{String(i + 1).padStart(2, '0')}
								</span>
								<span className="o-player__chapterLabel">{item.label}</span>
								<span className="o-player__chapterTime">
									{timecode(OFFSETS[i])}
								</span>
							</button>
						</li>
					))}
				</ol>
			</div>

			{/* Narration for the active chapter */}
			<div className="o-player__caption">
				<span className="o-caps o-player__captionLabel">
					{String(index + 1).padStart(2, '0')} · {chapter.label}
				</span>
				<p key={chapter.id} className="o-lede o-player__captionText">
					{chapter.caption}
				</p>
			</div>
		</div>
	);
}
