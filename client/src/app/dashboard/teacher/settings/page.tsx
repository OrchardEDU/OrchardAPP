'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { canvasApi } from '@/lib/api/canvas';
import type { CanvasConnectionStatus } from '@/types/canvas';
import './page.css';

export default function TeacherSettingsPage() {
	const [status, setStatus] = useState<CanvasConnectionStatus | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isDisconnecting, setIsDisconnecting] = useState(false);
	const [showConnectConfirm, setShowConnectConfirm] = useState(false);
	const [banner, setBanner] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		const canvasParam = params.get('canvas');
		const messageParam = params.get('message');

		if (canvasParam === 'connected') {
			setBanner({ type: 'success', message: 'Canvas connected successfully.' });
		} else if (canvasParam === 'error') {
			setBanner({
				type: 'error',
				message: messageParam
					? `Canvas connection failed: ${messageParam.replace(/_/g, ' ')}`
					: 'Canvas connection failed. Please try again.',
			});
		}
	}, []);

	useEffect(() => {
		const loadStatus = async () => {
			try {
				setIsLoading(true);
				const data = await canvasApi.getStatus();
				setStatus(data);
			} finally {
				setIsLoading(false);
			}
		};

		loadStatus();
	}, []);

	const handleAuthorize = () => {
		canvasApi.startOAuth();
	};

	const handleNotYou = () => {
		canvasApi.startOAuth({ reauth: true });
	};

	const handleDisconnect = async () => {
		if (!window.confirm('Disconnect Canvas? This will revoke your Canvas tokens and remove all course links.')) {
			return;
		}

		try {
			setIsDisconnecting(true);
			const success = await canvasApi.disconnect();
			if (success) {
				setStatus({ connected: false });
				setShowConnectConfirm(false);
				setBanner({ type: 'success', message: 'Canvas disconnected and tokens revoked.' });
			} else {
				setBanner({ type: 'error', message: 'Failed to disconnect Canvas.' });
			}
		} finally {
			setIsDisconnecting(false);
		}
	};

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

			{banner && (
				<div className={`settings-banner settings-banner-${banner.type}`}>{banner.message}</div>
			)}

			<section className="settings-section">
				<h2>Canvas Integration</h2>
				<p className="settings-section-description">
					Connect Orchard to your Canvas account to link courses and enable student launches.
				</p>

				{isLoading ? (
					<p className="status-text">Checking Canvas connection...</p>
				) : status?.connected ? (
					<div className="canvas-status-card canvas-status-connected">
						<div>
							<p className="canvas-status-label">Status</p>
							<p className="canvas-status-value">Connected</p>
							{status.institutionName && (
								<p className="canvas-status-meta">Institution: {status.institutionName}</p>
							)}
							{status.connectedAt && (
								<p className="canvas-status-meta">
									Connected: {new Date(status.connectedAt).toLocaleString()}
								</p>
							)}
						</div>
						<button
							type="button"
							className="canvas-disconnect-btn"
							onClick={handleDisconnect}
							disabled={isDisconnecting}
						>
							{isDisconnecting ? 'Disconnecting...' : 'Disconnect Canvas'}
						</button>
					</div>
				) : showConnectConfirm ? (
					<div className="canvas-connect-confirm">
						<h3 className="canvas-connect-confirm-title">Connect to Canvas</h3>
						<p className="canvas-connect-confirm-text">
							You will be sent to Canvas to sign in and authorize Orchard to access your courses.
						</p>
						<div className="canvas-connect-confirm-actions">
							<button type="button" className="canvas-connect-btn" onClick={handleAuthorize}>
								Authorize
							</button>
							<button
								type="button"
								className="canvas-cancel-btn"
								onClick={() => setShowConnectConfirm(false)}
							>
								Cancel
							</button>
						</div>
						<p className="canvas-not-you">
							Not you?{' '}
							<button type="button" className="canvas-not-you-link" onClick={handleNotYou}>
								Sign in with a different Canvas account
							</button>
						</p>
					</div>
				) : (
					<div className="canvas-status-card">
						<div>
							<p className="canvas-status-label">Status</p>
							<p className="canvas-status-value">Not connected</p>
							<p className="canvas-status-meta">
								Connect your Canvas account to link Orchard courses.
							</p>
						</div>
						<button
							type="button"
							className="canvas-connect-btn"
							onClick={() => setShowConnectConfirm(true)}
						>
							Connect to Canvas
						</button>
					</div>
				)}
			</section>
		</div>
	);
}
