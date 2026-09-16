'use client';

import React from 'react';
import PageHeader from '../PageHeader';
import Pipeline from './Pipeline';
import Grounding from './Grounding';
import Integrity from './Integrity';
import Roadmap from './Roadmap';
import Pricing from './Pricing';
import CallToAction from '../CallToAction';
import '../shared.css';
import '../home/home.css';
import './how.css';

const FACTS = [
	{ label: 'Integration', value: 'Native Canvas API' },
	{ label: 'Retrieval', value: 'Qdrant vector search' },
	{ label: 'Inference', value: 'Self-hosted Llama 3' },
	{ label: 'Time to value', value: 'Under one hour' },
];

export default function HowView() {
	return (
		<div className="o-page">
			<PageHeader
				eyebrow="How it works"
				title={
					<>
						An invisible layer over
						<br />
						the LMS you already run
					</>
				}
				lede="Orchard sits on top of Canvas rather than replacing it. It reads the material the department has already approved, indexes it, and only ever answers from that. What follows is the whole path, from a lecture note to a graded response."
				facts={FACTS}
			/>
			<Pipeline />
			<Grounding />
			<Integrity />
			<Roadmap />
			<Pricing />
			<CallToAction
				eyebrow="Next step"
				title="See it run end to end"
				body="The demo walks through the whole loop as an instructor and then as a student — course creation, material embedding, grounded generation, publishing, submission and concept-level analytics."
				primary={{ label: 'Watch the Demo', href: '/demo' }}
				secondary={{ label: 'Request Access', href: '/register' }}
			/>
		</div>
	);
}
