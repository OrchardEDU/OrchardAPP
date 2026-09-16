'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
	theme: Theme;
	toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
	const [theme, setTheme] = useState<Theme>('light');
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		// The inline bootstrap script in the document head already resolved the
		// theme (stored preference, else system preference) before first paint,
		// so read it back from the DOM rather than recomputing it here.
		const applied = document.documentElement.getAttribute('data-theme');
		if (applied === 'light' || applied === 'dark') {
			setTheme(applied);
		}
		setMounted(true);
	}, []);

	useEffect(() => {
		if (mounted) {
			document.documentElement.setAttribute('data-theme', theme);
			localStorage.setItem('theme', theme);
		}
	}, [theme, mounted]);

	const toggleTheme = () => {
		setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
	};

	// Always provide the context, even before mounted, to prevent errors
	// The mounted state only controls when we apply theme to document
	return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
	const context = useContext(ThemeContext);
	if (context === undefined) {
		throw new Error('useTheme must be used within a ThemeProvider');
	}
	return context;
}
