'use client';

import React from 'react';
import Reveal from '../Reveal';
import { DecoRule } from '../Deco';

export default function Grounding() {
	return (
		<section className="o-section o-section--alt o-grounding" id="grounding">
			<div className="o-shell">
				<div className="o-intro o-intro--center o-grounding__intro">
					<Reveal delay={60}>
						<p className="o-eyebrow">The difference</p>
					</Reveal>
					<Reveal anim="curtain" delay={140}>
						<h2 className="o-h2">Same request, two very different sources</h2>
					</Reveal>
					<Reveal delay={220}>
						<p className="o-lede">
							A commercial assistant predicts an answer from everything it has ever read.
							Orchard is only allowed to read one course.
						</p>
					</Reveal>
				</div>

				<div className="o-grounding__pair">
					<Reveal anim="left" className="o-grounding__card o-frame o-frame--static">
						<div className="o-grounding__cardHead">
							<span className="o-caps">General assistant</span>
							<span className="o-chip o-chip--red">Open internet</span>
						</div>
						<DecoRule />

						<p className="o-caps o-grounding__step">Request</p>
						<p className="o-body o-grounding__quote">
							“Write a practice question on weighted average cost of capital.”
						</p>

						<p className="o-caps o-grounding__step">Context used</p>
						<p className="o-body">
							Everything the model absorbed during training — textbooks it has never been
							told your department rejected, forum answers, competing notation.
						</p>

						<p className="o-caps o-grounding__step">Result</p>
						<p className="o-body">
							A technically correct question that may use book weights, a different
							symbol set, or an assumption the professor explicitly ruled out in week
							two. The student learns something adjacent to the course.
						</p>

						<p className="o-small o-grounding__foot">
							Documented hallucination range for general-purpose models: 15–20%.
						</p>
					</Reveal>

					<Reveal anim="right" delay={120} className="o-grounding__card o-grounding__card--lead o-frame o-frame--static o-bracket">
						<div className="o-grounding__cardHead">
							<span className="o-caps">Orchard</span>
							<span className="o-chip o-chip--gold">Instructor materials only</span>
						</div>
						<DecoRule />

						<p className="o-caps o-grounding__step">Request</p>
						<p className="o-body o-grounding__quote">
							“Write a practice question on weighted average cost of capital.”
						</p>

						<p className="o-caps o-grounding__step">Context retrieved</p>
						<div className="o-grounding__source">
							<span className="o-caps o-grounding__sourceName">Lecture 09 — WACC.pdf</span>
							<p className="o-body">
								“We compute WACC on the firm’s <em>target</em> capital structure, not book
								weights. Use the after-tax cost of debt throughout.”
							</p>
						</div>

						<p className="o-caps o-grounding__step">Result</p>
						<p className="o-body">
							A question built on target weights and after-tax cost of debt, in the
							notation the lecture used, with an answer key traceable to the passage it
							came from. If the passage did not exist, no question would be written.
						</p>

						<p className="o-small o-grounding__foot">
							Grounded retrieval holds hallucination under 2%.
						</p>
					</Reveal>
				</div>
			</div>
		</section>
	);
}
