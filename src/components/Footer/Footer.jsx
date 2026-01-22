import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaMapMarkerAlt, FaPhone, FaEnvelope, FaYoutube } from 'react-icons/fa';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-content">
                    <div className="footer-section about">
                        <h3>Bharath Cares Life Line</h3>
                        <p className="footer-desc">
                            Bharath Cares Life Line Foundation is committed to creating a begging-free, dignified, and self-reliant society.
                        </p>
                        <div className="social-links">
                            <a href="#" className="social-icon"><FaFacebook /></a>
                            <a href="#" className="social-icon"><FaTwitter /></a>
                            <a href="https://www.instagram.com/bharathcaresindia?igsh=cWFxa3JqbTFtMDBo" target="_blank" rel="noopener noreferrer" className="social-icon"><FaInstagram /></a>
                            <a href="#" className="social-icon"><FaLinkedin /></a>
                            <a href="https://youtube.com/@bharathcaresindia?si=hAh-xCJVMXOgTX8Q" target="_blank" rel="noopener noreferrer" className="social-icon"><FaYoutube /></a>
                        </div>
                    </div>

                    <div className="footer-section links">
                        <h3>Quick Links</h3>
                        <ul>
                            <li><Link to="/">Home</Link></li>
                            <li><Link to="/about">About Us</Link></li>
                            <li><Link to="/programs">Our Programs</Link></li>
                            <li><Link to="/fellowship">Fellowship</Link></li>
                            <li><Link to="/gallery">Gallery</Link></li>
                            <li><Link to="/reports">Reports</Link></li>
                            <li><Link to="/contact">Contact Us</Link></li>
                        </ul>
                    </div>

                    <div className="footer-section programs">
                        <h3>Our Programs</h3>
                        <ul>
                            <li><Link to="/programs#food">Give a Meal</Link></li>
                            <li><Link to="/programs#shelter">A Bed, A Dream</Link></li>
                            <li><Link to="/programs#education">Scholarships</Link></li>
                            <li><Link to="/programs#rehab">Rehabilitation</Link></li>
                        </ul>
                    </div>

                    <div className="footer-section contact">
                        <h3>Contact Us</h3>
                        <div className="contact-item">
                            <FaMapMarkerAlt className="contact-icon" />
                            <span>D.No:135-3-38, 7th line, Vijayapuri Colony, JKC Road, Guntur-522006, AP</span>
                        </div>
                        <div className="contact-item">
                            <FaPhone className="contact-icon" />
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                <a href="https://wa.me/917382321315?text=Hello!%20I%20would%20like%20to%20know%20more%20about%20Bharath%20Cares." target="_blank" rel="noopener noreferrer" className="footer-phone-link">+91 73823 21315</a>
                                <a href="https://wa.me/918632321315?text=Hello!%20I%20would%20like%20to%20know%20more%20about%20Bharath%20Cares." target="_blank" rel="noopener noreferrer" className="footer-phone-link">+91 86323 21315</a>
                                <a href="https://wa.me/919490991752?text=Hello!%20I%20would%20like%20to%20know%20more%20about%20the%20Fellowship%20Program." target="_blank" rel="noopener noreferrer" className="footer-phone-link">+91 94909 91752 (Fellowship)</a>
                            </div>
                        </div>
                        <div className="contact-item">
                            <FaEnvelope className="contact-icon" />
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                <a href="mailto:info@bharathcaresindia.org" style={{ color: 'inherit', textDecoration: 'none' }}>info@bharathcaresindia.org</a>
                                <a href="mailto:fellowship@bharathcaresindia.org" style={{ color: 'inherit', textDecoration: 'none' }}>fellowship@bharathcaresindia.org</a>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>&copy; {new Date().getFullYear()} Bharath Cares Life Line Foundation. All rights reserved.</p>
                    <p className="developer-credit">
                        Designed & Developed by <a href="https://fraylontech.com" target="_blank" rel="noopener noreferrer">Fraylon Technologies</a>
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
