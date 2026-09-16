import type { Metadata } from 'next';
import DemoView from '@/components/marketing/demo/DemoView';

export const metadata: Metadata = {
	title: 'Demo',
	description:
		'A chapter-by-chapter walkthrough of the current Orchard build: course setup, material indexing, grounded quiz generation, publishing, student submission, instant grading and concept-level analytics.',
};

export default function Page() {
	return <DemoView />;
}
