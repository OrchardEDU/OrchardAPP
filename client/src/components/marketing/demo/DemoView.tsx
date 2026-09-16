'use client';

import React from 'react';
import PageHeader from '../PageHeader';
import Reveal from '../Reveal';
import DemoPlayer from './DemoPlayer';
import CallToAction from '../CallToAction';
import { Ziggurat } from '../Deco';
import '../shared.css';
import '../home/home.css';
import './demo.css';

const FACTS = [
	{ label: 'Runtime', value: 'About 65 seconds' },
	{ label: 'Chapters', value: 'Nine, jump anywhere' },
	{ label: 'Covers', value: 'Instructor and student' },
	{ label: 'Build', value: 'Current working demo' },
];

const UNDER_THE_HOOD = [
	{
		title: 'Retrieval before generation',
		body: 'The scores beside each retrieved passage are cosine similarity from the course’s Qdrant collection. Nothing outside those passages reaches the model, which is what holds the hallucination rate under 2%.',
	},
	{
		title: 'Structured output',
		body: 'Questions come back in a fixed shape — stem, options, correct index, and the passage they were derived from — so the review screen can show a trace rather than asking the instructor to take it on faith.',
	},
	{
		title: 'Concept-level logging',
		body: 'Each answer is tagged to the concept it tests. Aggregating those tags is what turns a gradebook into the mastery breakdown in the final chapter.',
	},
];

export default function DemoView() {
	return (
		<div className="o-page">
			<PageHeader
				eyebrow="Demo"
				title={
					<>
						The current build,
						<br />
						start to finish
					</>
				}
				lede="A walkthrough of the working demo as it stands: an instructor creates a course, indexes their materials, generates a grounded quiz and publishes it — then a student takes it, gets graded on submission, and the instructor sees which concept the cohort missed."
				facts={FACTS}
			/>

			<section className="o-section o-demo__stageSection">
				<div className="o-shell o-shell--wide">
					<DemoPlayer />

					<Reveal delay={100}>
						<p className="o-small o-demo__note">
							This is a reconstruction of the shipping flow rather than a video file, so
							it stays in step with the product and you can stop on any frame. Screens,
							copy, retrieval scores and analytics mirror the current build.
						</p>
					</Reveal>

					<Reveal delay={160} className="o-demo__hint">
						<span className="o-demo__key">
							<kbd>Space</kbd> play or pause
						</span>
						<span className="o-demo__key">
							<kbd>←</kbd> <kbd>→</kbd> previous or next chapter
						</span>
						<span className="o-demo__key">Click any chapter to jump</span>
					</Reveal>
				</div>
			</section>

			<section className="o-section o-section--alt">
				<div className="o-shell">
					<div className="o-intro o-intro--center">
						<Reveal anim="fade">
							<Ziggurat />
						</Reveal>
						<Reveal delay={80}>
							<p className="o-eyebrow">Under the hood</p>
						</Reveal>
						<Reveal anim="curtain" delay={160}>
							<h2 className="o-h2">What is actually happening in those frames</h2>
						</Reveal>
					</div>

					<div className="o-demo__under">
						{UNDER_THE_HOOD.map((item, index) => (
							<Reveal
								key={item.title}
								delay={index * 120}
								className="o-demo__underCard o-frame o-frame--lift"
							>
								<span className="o-numeral">{String(index + 1).padStart(2, '0')}</span>
								<h3 className="o-h3">{item.title}</h3>
								<p className="o-body">{item.body}</p>
							</Reveal>
						))}
					</div>
				</div>
			</section>

			<CallToAction
				eyebrow="Pilot"
				title="Run this on one of your own courses"
				body="A departmental pilot connects a single course, indexes the material already in it, and produces the same analytics against your own cohort. Free for the first hundred students."
				primary={{ label: 'Request Access', href: '/register' }}
				secondary={{ label: 'Read How It Works', href: '/how-it-works' }}
			/>
		</div>
	);
}
