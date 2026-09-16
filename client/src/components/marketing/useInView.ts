'use client';

import { useEffect, useRef, useState } from 'react';

interface Options {
	/**
	 * Fraction of the element that must be visible. Defaults to 0 — any overlap
	 * counts — because a ratio-based trigger never fires for elements taller
	 * than the viewport. `rootMargin` does the "not quite at the edge" work.
	 */
	threshold?: number;
	/** Shrinks the viewport so elements trigger slightly before the true edge. */
	rootMargin?: string;
	/** When false the element resets to hidden once it leaves the viewport. */
	once?: boolean;
}

/**
 * Tracks whether an element has entered the viewport. Elements start hidden
 * only when JS is running and IntersectionObserver exists, so no-JS and
 * legacy environments render fully visible content.
 */
export function useInView<T extends HTMLElement = HTMLDivElement>({
	threshold = 0,
	rootMargin = '0px 0px -10% 0px',
	once = true,
}: Options = {}) {
	const ref = useRef<T | null>(null);
	const [inView, setInView] = useState(false);

	useEffect(() => {
		const node = ref.current;
		if (!node) return;

		if (typeof IntersectionObserver === 'undefined') {
			setInView(true);
			return;
		}

		const observer = new IntersectionObserver(
			(entries) => {
				const entry = entries[0];
				if (entry.isIntersecting) {
					setInView(true);
					if (once) observer.disconnect();
				} else if (!once) {
					setInView(false);
				}
			},
			{ threshold, rootMargin }
		);

		observer.observe(node);
		return () => observer.disconnect();
	}, [threshold, rootMargin, once]);

	return { ref, inView };
}
