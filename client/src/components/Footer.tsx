'use client';

import React from 'react';
import './Footer.css';

const Footer = () => {
	return (
		<footer className="footer">
			<div className="container">
				<div className="footer-content">
					<div className="footer-brand">
						<h3>Orchard</h3>
						<p>Giving every classroom an extra teacher.</p>
					</div>
					<div className="footer-links">
						<div className="link-group">
							<h4>Product</h4>
							<a href="#features">Features</a>
							<a href="/demo">Demo</a>
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
