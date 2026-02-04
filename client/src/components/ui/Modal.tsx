'use client';

import React from 'react';

interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	title?: string;
	children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
	if (!isOpen) return null;

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
			onClick={onClose}
		>
			<div
				className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 p-6"
				onClick={(e) => e.stopPropagation()}
			>
				{title && (
					<div className="flex items-center justify-between mb-4">
						<h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
						<button
							onClick={onClose}
							className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
						>
							×
						</button>
					</div>
				)}
				{children}
			</div>
		</div>
	);
}
