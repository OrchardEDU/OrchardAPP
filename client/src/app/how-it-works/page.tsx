import type { Metadata } from 'next';
import HowView from '@/components/marketing/how/HowView';

export const metadata: Metadata = {
	title: 'How It Works',
	description:
		'From a lecture note to a graded answer: how Orchard connects to Canvas, indexes instructor materials in Qdrant, generates curriculum-grounded assessments with self-hosted Llama 3, and reports concept-level performance.',
};

export default function Page() {
	return <HowView />;
}
