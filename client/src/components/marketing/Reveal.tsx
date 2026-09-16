'use client';

import React from 'react';
import { useInView } from './useInView';

type Anim = 'up' | 'left' | 'right' | 'scale' | 'fade' | 'curtain' | 'rule';

type Tag = 'div' | 'section' | 'li' | 'span' | 'p' | 'header' | 'article' | 'tr';

interface RevealProps {
	children: React.ReactNode;
	/** Movement style. `curtain` wipes upward, `rule` grows a hairline outward. */
	anim?: Anim;
	/** Stagger in milliseconds. */
	delay?: number;
	className?: string;
	as?: Tag;
	threshold?: number;
}

/** Polymorphic wrapper, so one cast covers every tag Reveal can render. */
type AnyElement = React.FC<
	React.HTMLAttributes<HTMLElement> & { ref?: React.Ref<HTMLElement> }
>;

export default function Reveal({
	children,
	anim = 'up',
	delay = 0,
	className = '',
	as = 'div',
	threshold,
}: RevealProps) {
	const { ref, inView } = useInView<HTMLElement>({ threshold });
	const Element = as as unknown as AnyElement;

	return (
		<Element
			ref={ref}
			data-anim={anim}
			className={`o-reveal ${inView ? 'is-in' : ''} ${className}`.trim()}
			style={{ '--o-delay': `${delay}ms` } as React.CSSProperties}
		>
			{children}
		</Element>
	);
}
