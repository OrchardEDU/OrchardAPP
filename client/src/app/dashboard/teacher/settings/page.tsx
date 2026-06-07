'use client';

import Link from 'next/link';
import './page.css';

export default function TeacherSettingsPage() {
	return (
		<div className="settings-page">
			<div className="settings-header">
				<div>
					<h1>Settings</h1>
				</div>
				<div className="settings-actions">
					<Link href="/dashboard/teacher" className="secondary-action-btn">
						Back to Dashboard
					</Link>
				</div>
			</div>
		</div>
	);
}
