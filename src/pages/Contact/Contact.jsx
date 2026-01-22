import React, { useState } from 'react';
import { FaMapMarkerAlt, FaPhone, FaEnvelope } from 'react-icons/fa';
import './Contact.css';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        mobile: '',
        email: '',
        subject: '',
        message: ''
    });

    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitted(true);
    };

    if (isSubmitted) {
        return (
            <div className="contact-page">
                <div className="page-header contact-header">
                    <div className="container">
                        <h1>Message Sent!</h1>
                        <p>Thank you for reaching out. Our team will get back to you within 24-48 hours.</p>
                        <button className="btn btn-primary" onClick={() => setIsSubmitted(false)} style={{ marginTop: '20px' }}>Send Another</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="contact-page">
            <div className="page-header contact-header">
                <div className="container">
                    <h1>Contact Us</h1>
                    <p>We welcome your questions, suggestions, partnerships, and support.</p>
                </div>
            </div>

            <div className="container section">
                <div className="contact-layout">
                    <div className="contact-details">
                        <h2>Get In Touch</h2>
                        <div className="contact-card">
                            <div className="icon-box"><FaMapMarkerAlt /></div>
                            <div className="info">
                                <h3>Office Address</h3>
                                <p>Bharath Cares Life Line Foundation</p>
                                <p>Guntur D.No: 135-3-38, 7th line, Vijayapuri Colony</p>
                                <p>JKC Road, Guntur-522006, Andhra Pradesh, India</p>
                            </div>
                        </div>

                        <div className="contact-card">
                            <div className="icon-box"><FaPhone /></div>
                            <div className="info">
                                <h3>Phone Numbers</h3>
                                <p><a href="https://wa.me/917382321315?text=Hello!%20I%20would%20like%20to%20know%20more%20about%20Bharath%20Cares." target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>+91 73823 21315</a></p>
                                <p><a href="https://wa.me/918632321315?text=Hello!%20I%20would%20like%20to%20know%20more%20about%20Bharath%20Cares." target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>+91 86323 21315</a></p>
                                <p><strong>Fellowship Helpline:</strong> <a href="https://wa.me/919490991752?text=Hello!%20I%20would%20like%20to%20know%20more%20about%20the%20Fellowship%20Program." target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>+91 94909 91752</a></p>
                            </div>
                        </div>

                        <div className="contact-card">
                            <div className="icon-box"><FaEnvelope /></div>
                            <div className="info">
                                <h3>Email Address</h3>
                                <p><a href="mailto:info@bharathcaresindia.org" style={{ color: 'inherit', textDecoration: 'none' }}>info@bharathcaresindia.org</a></p>
                                <p><a href="mailto:fellowship@bharathcaresindia.org" style={{ color: 'inherit', textDecoration: 'none' }}>fellowship@bharathcaresindia.org</a> (Fellowship Inquiries)</p>
                                <p><a href="mailto:volunteer@bharathcaresindia.org" style={{ color: 'inherit', textDecoration: 'none' }}>volunteer@bharathcaresindia.org</a></p>
                            </div>
                        </div>

                        {/* Google Map Embedded */}
                        <div className="map-container">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3828.892529716497!2d80.4164210102561!3d16.328434632382443!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a358b003a558783%3A0x7a744eae8fa86fec!2sBHARATH%20CARES%20LIFELINE%20FOUNDATION!5e0!3m2!1sen!2sin!4v1767708190892!5m2!1sen!2sin"
                                width="100%"
                                height="250"
                                style={{ border: 0, borderRadius: '8px' }}
                                allowFullScreen=""
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                title="Bharath Cares Office Location"
                            ></iframe>
                        </div>
                    </div>

                    <div className="contact-form-wrapper">
                        <h2 style={{ marginBottom: '30px' }}>Send Us a Message</h2>
                        <form className="contact-form" onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Full Name</label>
                                <input type="text" name="name" value={formData.name} onChange={handleChange} required />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Mobile Number</label>
                                    <input type="tel" name="mobile" value={formData.mobile} onChange={handleChange} required />
                                </div>
                                <div className="form-group">
                                    <label>Email Address</label>
                                    <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Subject</label>
                                <input type="text" name="subject" value={formData.subject} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label>Message</label>
                                <textarea name="message" value={formData.message} onChange={handleChange} rows="5" required></textarea>
                            </div>

                            <button type="submit" className="btn btn-primary">Submit Message</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
