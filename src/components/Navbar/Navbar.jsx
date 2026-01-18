import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaBars, FaTimes, FaPhone, FaEnvelope, FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaYoutube, FaSearch, FaArrowRight } from 'react-icons/fa';
import './Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [navSearchQuery, setNavSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);

    // Update Document Title based on path
    const path = location.pathname;
    let title = 'Bharath Cares Life Line Foundation';
    if (path === '/about') title = 'About Us - BCLLF';
    else if (path === '/programs') title = 'Our Programs - BCLLF';
    else if (path === '/fellowship') title = 'Fellowship Program - BCLLF';
    else if (path === '/gallery') title = 'Media Gallery - BCLLF';
    else if (path === '/reports') title = 'Transparency Reports - BCLLF';
    else if (path === '/volunteer') title = 'Join as Volunteer - BCLLF';
    else if (path === '/contact') title = 'Contact Us - BCLLF';
    else if (path === '/donate') title = 'Donate - BCLLF';
    else if (path === '/login') title = 'Staff Login - BCLLF';
    else if (path === '/admin-dashboard') title = 'Admin Control Panel - BCLLF';
    else if (path === '/employee-dashboard') title = 'Employee Portal - BCLLF';

    document.title = title;

    return () => window.removeEventListener('scroll', handleScroll);
  }, [location]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Programs', path: '/programs' },
    { name: 'Fellowship', path: '/fellowship' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'Reports', path: '/reports' },
    { name: 'Volunteer', path: '/volunteer' },
    { name: 'Contact', path: '/contact' },
    { name: 'Login', path: '/login' },
  ];

  /* Pages with light backgrounds where navbar needs to be dark/scrolled by default */
  const isProgramDetail = location.pathname.startsWith('/programs/') && location.pathname !== '/programs';
  const lightPages = [];
  const isLightPage = lightPages.includes(location.pathname) || isProgramDetail;

  return (
    <header className="app-header">
      {/* Official Government Announcement Banner */}
      <div className="announcement-banner">
        <div className="banner-track">
          <div className="banner-content">
            <span className="banner-badge">OFFICIAL NOTICE</span>
            <p><strong>GOVERNMENT OF ANDHRA PRADESH CO-ALIGNMENT:</strong> Viksit Bharat Fellowship (2026 Batch) Enrollments are <strong>ONGOING</strong>. <Link to="/fellowship" className="banner-link">Apply via State Portal <FaArrowRight /></Link></p>
          </div>
          {/* Duplicated for seamless sliding */}
          <div className="banner-content" aria-hidden="true">
            <span className="banner-badge">OFFICIAL NOTICE</span>
            <p><strong>GOVERNMENT OF ANDHRA PRADESH CO-ALIGNMENT:</strong> Viksit Bharat Fellowship (2026 Batch) Enrollments are <strong>ONGOING</strong>. <Link to="/fellowship" className="banner-link">Apply via State Portal <FaArrowRight /></Link></p>
          </div>
        </div>
      </div>
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <div className={`top-bar ${scrolled ? 'hidden' : ''}`}>
        <div className="container top-bar-content">
          <div className="top-info">
            <a href="https://wa.me/917382321315" target="_blank" rel="noopener noreferrer" className="top-phone-link">
              <FaPhone /> +91 73823 21315
            </a>
            <span style={{ marginLeft: '25px' }}><FaEnvelope /> info@bcllf.org</span>
          </div>
          <div className="top-socials">
            <a href="#" aria-label="Facebook"><FaFacebook /></a>
            <a href="#" aria-label="Twitter"><FaTwitter /></a>
            <a href="https://www.instagram.com/bharathcaresindia?igsh=cWFxa3JqbTFtMDBo" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><FaInstagram /></a>
            <a href="#" aria-label="LinkedIn"><FaLinkedin /></a>
            <a href="https://youtube.com/@bharathcaresindia?si=hAh-xCJVMXOgTX8Q" target="_blank" rel="noopener noreferrer" aria-label="YouTube"><FaYoutube /></a>
          </div>
        </div>
      </div>

      <nav className={`navbar ${scrolled ? 'scrolled' : (isLightPage ? 'navbar-light-mode' : '')}`} aria-label="Main Navigation">
        <div className="container navbar-container">
          <Link to="/" className="navbar-logo">
            <img src="/logo-CYlp3-fg__1_-removebg-preview.svg" alt="BCLL Logo" className="logo-img" />
            <div className="logo-text-group">
              <span className="logo-main">Bharath Cares</span>
              <span className="logo-sub">Life Line Foundation</span>
            </div>
          </Link>

          <div className={`menu-icon ${isOpen ? 'active' : ''}`} onClick={() => setIsOpen(!isOpen)} aria-label="Toggle Menu" role="button" aria-expanded={isOpen}>
            <span></span>
            <span></span>
            <span></span>
          </div>

          <ul className={`nav-menu ${isOpen ? 'active' : ''}`}>
            <li className="mobile-menu-header">
              <h3>Navigation</h3>
            </li>
            {navLinks.map((link, index) => (
              <li key={index} className="nav-item" style={{ "--index": index }}>
                <Link
                  to={link.path}
                  className={`nav-links ${location.pathname === link.path ? 'active-link' : ''}`}
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </Link>
              </li>
            ))}
            <li className="nav-item donate-nav-item" style={{ "--index": navLinks.length }}>
              <Link to="/donate" className="donate-btn-nav" onClick={() => setIsOpen(false)}>Donate Now</Link>
            </li>

            <li className="mobile-menu-footer" style={{ "--index": navLinks.length + 1 }}>
              <div className="mobile-contact">
                <p><FaPhone /> +91 73823 21315</p>
                <p><FaEnvelope /> info@bcllf.org</p>
              </div>
              <div className="mobile-socials">
                <a href="#" aria-label="Facebook"><FaFacebook /></a>
                <a href="https://www.instagram.com/bharathcaresindia?igsh=cWFxa3JqbTFtMDBo" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><FaInstagram /></a>
                <a href="https://youtube.com/@bharathcaresindia?si=hAh-xCJVMXOgTX8Q" target="_blank" rel="noopener noreferrer" aria-label="YouTube"><FaYoutube /></a>
                <a href="#" aria-label="LinkedIn"><FaLinkedin /></a>
              </div>
            </li>
          </ul>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
