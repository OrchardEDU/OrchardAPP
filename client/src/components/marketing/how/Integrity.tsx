'use client';

import React from 'react';
import Reveal from '../Reveal';

const VARIANTS = [
	{
		student: 'Student A',
		stem: 'A firm issues a bond at par with a 6.0% annual coupon. Its marginal tax rate is 21%. What is the after-tax cost of debt?',
		answer: '4.74%',
	},
	{
		student: 'Student B',
		stem: 'A firm issues a bond at par with a 7.5% annual coupon. Its marginal tax rate is 24%. What is the after-tax cost of debt?',
		answer: '5.70%',
	},
	{
		student: 'Student C',
		stem: 'Par-value debt carries an 8.0% annual coupon and the issuer faces a 21% marginal rate. Compute the cost of that debt on an after-tax basis.',
		answer: '6.32%',
	},
];

export default function Integrity() {
	return (
		<section className="o-section o-integrity" id="integrity">
			<div className="o-shell o-integrity__inner">
				<div className="o-integrity__copy">
					<Reveal>
						<p className="o-eyebrow o-eyebrow--lead">Academic integrity</p>
					</Reveal>
					<Reveal anim="curtain" delay={100}>
						<h2 className="o-h2">
							A leaked question bank
							<br />
							stops being leverage
						</h2>
					</Reveal>
					<Reveal delay={200}>
						<p className="o-lede">
							Instructors upload the questions they already have. Orchard parses each one,
							then varies the wording and the values per student.
						</p>
					</Reveal>
					<Reveal delay={280}>
						<p className="o-body">
							Because grading follows the logic of the answer rather than matching against
							a single stored string, changing the numbers costs the instructor nothing
							and removes the payoff from memorising a circulated copy. It also cuts the
							error rate in manual grading, which is the quieter half of the problem.
						</p>
					</Reveal>
					<Reveal delay={340} className="o-integrity__chips">
						<span className="o-chip o-chip--gold">One source question</span>
						<span className="o-chip o-chip--gold">Per-student variants</span>
						<span className="o-chip o-chip--gold">Logic-based grading</span>
					</Reveal>
				</div>

				<div className="o-integrity__variants">
					{VARIANTS.map((variant, index) => (
						<Reveal
							key={variant.student}
							anim="right"
							delay={index * 130}
							className="o-integrity__variant o-frame o-frame--static"
						>
							<div className="o-integrity__variantHead">
								<span className="o-caps">{variant.student}</span>
								<span className="o-integrity__answer">{variant.answer}</span>
							</div>
							<p className="o-body">{variant.stem}</p>
						</Reveal>
					))}
					<Reveal delay={420}>
						<p className="o-small o-integrity__note">
							Three deliveries of one instructor-authored question. Same concept, same
							rubric, different work.
						</p>
					</Reveal>
				</div>
			</div>
		</section>
	);
}
