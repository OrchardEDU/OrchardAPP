import React, { useState, useEffect } from 'react';
import logo from '../assets/logo.png';
import './Header.css';

const Header = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`header ${scrolled ? 'scrolled' : ''}`}>
      <div className="container header-container">
        <div className="logo">
          <img src={logo} alt="Orchard Logo" />
          <span>Orchard</span>
        </div>
        <nav>
          <ul>
            <li><a href="#features">Features</a></li>
            <li><a href="#how-it-works">How it Works</a></li>

          </ul>
        </nav>
        <div className="header-actions">
          <a href="#" className="btn btn-secondary btn-sm">Log In</a>
          <a href="mailto:support@orchardedu.com" className="btn btn-primary btn-sm">Get Updates</a>
        </div>
      </div>
    </header>
  );
};

export default Header;
