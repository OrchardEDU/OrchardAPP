'use client';

import React from 'react';
import Reveal from '../Reveal';
import { Ziggurat } from '../Deco';

const STAGES = [
	{
		numeral: '01',
		label: 'Connect',
		title: 'The Canvas handshake',
		body: 'Orchard authenticates against the Canvas API and reads what is already there — syllabi, lecture notes, assignments and grade data. When an instructor moves a due date or uploads a new PDF, Orchard sees it without anyone re-entering anything.',
		aside: ['Canvas API', 'Zero manual entry', 'Blackboard & D2L next'],
	},
	{
		numeral: '02',
		label: 'Ingest',
		title: 'Documents become text',
		body: 'PDF, DOCX, TXT and Markdown are parsed, cleaned and split into passages small enough to retrieve precisely but large enough to keep their meaning. Source files are stored in S3; structured records live in RDS.',
		aside: ['PDF · DOCX · TXT · MD', 'AWS S3', 'AWS RDS'],
	},
	{
		numeral: '03',
		label: 'Index',
		title: 'Passages become vectors',
		body: 'Each passage is embedded and written to a Qdrant collection scoped to that specific course, so retrieval can never reach across into a different professor’s material.',
		aside: ['Qdrant', 'Course-scoped collections', 'Semantic search'],
	},
	{
		numeral: '04',
		label: 'Retrieve',
		title: 'Only what answers the question',
		body: 'A request for practice on a topic pulls back the handful of passages that actually cover it. This is the step that keeps the model honest: there is nothing off-curriculum in the context window to reach for.',
		aside: ['Grounded context', 'Under 2% hallucination'],
	},
	{
		numeral: '05',
		label: 'Generate',
		title: 'Questions written from the source',
		body: 'A fine-tuned, self-hosted Llama 3 model writes lessons, assessments and unlimited practice from the retrieved passages, returning structured output so every question arrives in a predictable shape with its answer key attached.',
		aside: ['Self-hosted Llama 3', 'Structured output', 'MCQ, short answer, essay'],
	},
	{
		numeral: '06',
		label: 'Assess & analyse',
		title: 'Performance back to the teacher',
		body: 'Submissions are graded on the spot and every interaction is logged at the concept level. Instructors see pacing issues and knowledge gaps; administrators see them aggregated across sections with student privacy preserved.',
		aside: ['Instant grading', 'Concept-level metrics', 'Cross-section rollups'],
	},
];

export default function Pipeline() {
	return (
		<section className="o-section o-pipeline" id="pipeline">
			<div className="o-shell">
				<div className="o-intro o-pipeline__intro">
					<Reveal anim="fade">
						<Ziggurat />
					</Reveal>
					<Reveal delay={80}>
						<p className="o-eyebrow o-eyebrow--lead">The pipeline</p>
					</Reveal>
					<Reveal anim="curtain" delay={160}>
						<h2 className="o-h2">Six steps from a lecture note to a graded answer</h2>
					</Reveal>
					<Reveal delay={240}>
						<p className="o-lede">
							Nothing here asks an instructor to change how they work. The whole sequence
							runs off documents they have already written.
						</p>
					</Reveal>
				</div>

				<ol className="o-pipeline__list">
					{STAGES.map((stage, index) => (
						<Reveal as="li" key={stage.numeral} className="o-pipeline__stage">
							<div className="o-pipeline__spine" aria-hidden="true">
								<span className="o-pipeline__node" />
								{index < STAGES.length - 1 && <span className="o-pipeline__line" />}
							</div>

							<div className="o-pipeline__body">
								<p className="o-caps o-pipeline__label">
									<span className="o-pipeline__numeral">{stage.numeral}</span>
									{stage.label}
								</p>
								<h3 className="o-h3 o-pipeline__title">{stage.title}</h3>
								<p className="o-body">{stage.body}</p>
								<div className="o-pipeline__aside">
									{stage.aside.map((tag) => (
										<span key={tag} className="o-chip o-chip--gold">
											{tag}
										</span>
									))}
								</div>
							</div>
						</Reveal>
					))}
				</ol>
			</div>
		</section>
	);
}
