'use client';

import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import './ThemeToggle.css';

/**
 * Both glyphs are always rendered and swapped with CSS off the `data-theme`
 * attribute, so the button never disagrees with the server-rendered markup.
 */
export default function ThemeToggle({ className = '' }: { className?: string }) {
	const { toggleTheme } = useTheme();

	return (
		<button
			type="button"
			onClick={toggleTheme}
			className={`o-themeToggle ${className}`.trim()}
			aria-label="Switch between light and dark theme"
			title="Switch theme"
		>
			<span className="o-themeToggle__glyph o-themeToggle__glyph--sun">
				<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
					<circle cx="12" cy="12" r="4.2" />
					{[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
						<line
							key={angle}
							x1="12"
							y1="1.8"
							x2="12"
							y2="5.2"
							transform={`rotate(${angle} 12 12)`}
						/>
					))}
				</svg>
			</span>
			<span className="o-themeToggle__glyph o-themeToggle__glyph--moon">
				<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
					<path d="M15.6 3.4a9 9 0 1 0 5 12.1 7.2 7.2 0 0 1-5-12.1Z" />
				</svg>
			</span>
		</button>
	);
}
