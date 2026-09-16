'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Chevrons } from './marketing/Deco';
import './Footer.css';

const COLUMNS = [
	{
		heading: 'Platform',
		links: [
			{ label: 'Overview', href: '/' },
			{ label: 'How It Works', href: '/how-it-works' },
			{ label: 'Demo', href: '/demo' },
		],
	},
	{
		heading: 'Access',
		links: [
			{ label: 'Log In', href: '/login' },
			{ label: 'Request Access', href: '/register' },
		],
	},
];

const Footer = () => (
	<footer className="o-footer o-invert">
		<Chevrons className="o-footer__chevrons" />

		<div className="o-footer__inner">
			<div className="o-footer__brand">
				<Link href="/" className="o-footer__mark" aria-label="Orchard home">
					<Image src="/orchardedulogowhite.png" alt="" width={52} height={52} />
					<span>
						<span className="o-footer__name">Orchard</span>
						<span className="o-footer__sub">Edu</span>
					</span>
				</Link>
				<p className="o-footer__tagline">Giving every classroom an extra teacher.</p>
				<p className="o-footer__note">
					A curriculum-grounded intelligence layer for the learning management systems
					institutions already run.
				</p>
			</div>

			<div className="o-footer__columns">
				{COLUMNS.map((column) => (
					<div key={column.heading} className="o-footer__column">
						<h4 className="o-caps">{column.heading}</h4>
						<ul>
							{column.links.map((link) => (
								<li key={link.href}>
									<Link href={link.href}>{link.label}</Link>
								</li>
							))}
						</ul>
					</div>
				))}
				<div className="o-footer__column">
					<h4 className="o-caps">Contact</h4>
					<ul>
						<li>
							<a href="mailto:bskandhasuhas@gmail.com">Skandha Suhas Badrinarayan</a>
						</li>
						<li>
							<a href="mailto:jonnyjamesrice@gmail.com">Jonathan James Rice</a>
						</li>
					</ul>
				</div>
			</div>
		</div>

		<div className="o-footer__base">
			<p>&copy; {new Date().getFullYear()} Orchard EDU. All rights reserved.</p>
			<p className="o-footer__compliance">FERPA &amp; GDPR aligned &middot; Data stays institutional</p>
		</div>
	</footer>
);

export default Footer;
