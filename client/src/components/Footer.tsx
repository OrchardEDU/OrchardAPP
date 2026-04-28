'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import './Footer.css';

const Footer = () => {
	return (
		<footer className="footer">
			<div className="container">
				<div className="footer-content">
					<div className="footer-brand">
						<Link href="/" className="footer-logo-link">
							<Image 
								src="/orchardedulogowhite.png" 
								alt="Orchard Logo" 
								width={40} 
								height={40}
								className="footer-logo"
							/>
							<h3>Orchard</h3>
						</Link>
						<p>Giving every classroom an extra teacher.</p>
					</div>
					<div className="footer-links">
						<div className="link-group">
							<h4>Product</h4>
							<Link href="/#features">Features</Link>
						</div>
						<div className="link-group">
							<h4>Company</h4>
							<a href="#">About Us</a>
							<a href="mailto:support@orchardedu.com">Email Us</a>
						</div>
					</div>
				</div>
				<div className="footer-bottom">
					<p>&copy; {new Date().getFullYear()} Orchard. All rights reserved.</p>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
