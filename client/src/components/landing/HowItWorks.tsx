'use client';

import React from 'react';
import './HowItWorks.css';

const HowItWorks = () => {
	const steps = [
		{
			number: '01',
			title: 'Upload Content',
			description: 'Drag and drop your lecture slides, notes, or existing question banks.',
		},
		{
			number: '02',
			title: 'AI Processing',
			description:
				"Orchard's AI analyzes your material to understand key concepts and learning objectives.",
		},
		{
			number: '03',
			title: 'Generate & Assess',
			description:
				'Create quizzes and exams in seconds. Students can practice or take them online and get instant feedback.',
		},
	];

	return (
		<section id="how-it-works" className="how-it-works">
			<div className="container">
				<div className="section-header">
					<h2>How Orchard Works</h2>
					<p>Three simple steps to unlimited test questions.</p>
				</div>
				<div className="steps-container">
					{steps.map((step, index) => (
						<div className="step-item" key={index}>
							<div className="step-number">{step.number}</div>
							<div className="step-content">
								<h3>{step.title}</h3>
								<p>{step.description}</p>
							</div>
							{index < steps.length - 1 && <div className="step-connector"></div>}
						</div>
					))}
				</div>
			</div>
		</section>
	);
};

export default HowItWorks;
