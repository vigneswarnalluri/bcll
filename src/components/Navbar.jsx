import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaBars, FaTimes, FaPhone, FaEnvelope, FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaYoutube } from 'react-icons/fa';
import './Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Programs', path: '/programs' },
    { name: 'Fellowship', path: '/fellowship' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'Reports', path: '/reports' },
    { name: 'Volunteer', path: '/volunteer' },
    { name: 'Contact', path: '/contact' },
  ];

  /* Pages with light backgrounds where navbar needs to be dark/scrolled by default */
  const lightPages = [];
  const isLightPage = lightPages.includes(location.pathname);

  return (
    <header className="app-header">
      <div className={`top-bar ${scrolled ? 'hidden' : ''}`}>
        <div className="container top-bar-content">
          <div className="top-info">
            <a href="https://wa.me/917382321315" target="_blank" rel="noopener noreferrer" className="top-phone-link">
              <FaPhone /> +91 73823 21315
            </a>
            <span style={{ marginLeft: '25px' }}><FaEnvelope /> info@bcllf.org</span>
          </div>
          <div className="top-socials">
            <a href="#"><FaFacebook /></a>
            <a href="#"><FaTwitter /></a>
            <a href="https://www.instagram.com/bharathcaresindia?igsh=cWFxa3JqbTFtMDBo" target="_blank" rel="noopener noreferrer"><FaInstagram /></a>
            <a href="#"><FaLinkedin /></a>
            <a href="https://youtube.com/@bharathcaresindia?si=hAh-xCJVMXOgTX8Q" target="_blank" rel="noopener noreferrer"><FaYoutube /></a>
          </div>
        </div>
      </div>

      <nav className={`navbar ${scrolled ? 'scrolled' : (isLightPage ? 'navbar-light-mode' : '')}`}>
        <div className="container navbar-container">
          <Link to="/" className="navbar-logo">
            <img src="/logo-CYlp3-fg__1_-removebg-preview.svg" alt="BCLL Logo" className="logo-img" />
            <div className="logo-text-group">
              <span className="logo-main">Bharath Cares</span>
              <span className="logo-sub">Life Line Foundation</span>
            </div>
          </Link>

          <div className="menu-icon" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <FaTimes /> : <FaBars />}
          </div>

          <ul className={`nav-menu ${isOpen ? 'active' : ''}`}>
            {navLinks.map((link, index) => (
              <li key={index} className="nav-item">
                <Link
                  to={link.path}
                  className={`nav-links ${location.pathname === link.path ? 'active-link' : ''}`}
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </Link>
              </li>
            ))}
            <li className="nav-item">
              <Link to="/donate" className="donate-btn-nav" onClick={() => setIsOpen(false)}>Donate</Link>
            </li>
          </ul>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
