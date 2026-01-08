import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaBars, FaTimes, FaPhone, FaEnvelope, FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaYoutube, FaSearch } from 'react-icons/fa';
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
      setScrolled(window.scrollY > 40);
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
    { name: 'Portal', path: '/login' },
  ];

  const searchItems = [
    { name: 'Home', path: '/' },
    { name: 'About Us', path: '/about' },
    { name: 'Programs', path: '/programs' },
    { name: 'Fellowship', path: '/fellowship' },
    { name: 'Media Gallery', path: '/gallery' },
    { name: 'Reports', path: '/reports' },
    { name: 'Contact', path: '/contact' },
    { name: 'Donate Now', path: '/donate' },
    { name: 'Staff Login', path: '/login' },
    { name: 'Give a Meal', path: '/programs/meal' },
    { name: 'Scholarships', path: '/programs/scholar' },
    { name: 'Rehabilitation', path: '/programs/rehab' },
  ];

  const filteredSearch = searchItems.filter(item =>
    item.name.toLowerCase().includes(navSearchQuery.toLowerCase())
  );

  /* Pages with light backgrounds where navbar needs to be dark/scrolled by default */
  const lightPages = [];
  const isLightPage = lightPages.includes(location.pathname);

  return (
    <header className="app-header">
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

          <div className="menu-icon" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle Menu" role="button" aria-expanded={isOpen}>
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
            <li className="nav-item search-trigger-item">
              <button
                className="nav-search-btn"
                onClick={() => setIsSearchOpen(true)}
                aria-label="Open Search"
              >
                <FaSearch />
              </button>
            </li>
            <li className="nav-item">
              <Link to="/donate" className="donate-btn-nav" onClick={() => setIsOpen(false)}>Donate</Link>
            </li>
          </ul>
        </div>
      </nav>

      {/* SEARCH OVERLAY */}
      {isSearchOpen && (
        <div className="search-overlay" onClick={() => setIsSearchOpen(false)}>
          <div className="search-modal" onClick={e => e.stopPropagation()}>
            <div className="search-input-group">
              <FaSearch className="modal-search-icon" />
              <input
                type="text"
                placeholder="What are you looking for?"
                autoFocus
                value={navSearchQuery}
                onChange={e => setNavSearchQuery(e.target.value)}
              />
              <button className="close-search" onClick={() => setIsSearchOpen(false)} aria-label="Close search">
                <FaTimes />
              </button>
            </div>
            <div className="search-results">
              {navSearchQuery && filteredSearch.length > 0 ? (
                <ul>
                  {filteredSearch.map((item, idx) => (
                    <li key={idx}>
                      <Link to={item.path} onClick={() => { setIsSearchOpen(false); setNavSearchQuery(''); }}>
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : navSearchQuery ? (
                <p className="no-search-results">No matches found for "{navSearchQuery}"</p>
              ) : (
                <div className="search-suggestions">
                  <p>Recent Searches:</p>
                  <div className="tags">
                    <span onClick={() => setNavSearchQuery('Scholar')}>Scholarship</span>
                    <span onClick={() => setNavSearchQuery('Rehab')}>Rehabilitation</span>
                    <span onClick={() => setNavSearchQuery('Help')}>Donate</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
