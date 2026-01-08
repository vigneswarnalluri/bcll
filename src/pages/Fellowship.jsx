import React, { useState } from 'react';
import './Fellowship.css';

const Fellowship = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsModalOpen(false);
        setIsSubmitted(true);
    };

    if (isSubmitted) {
        return (
            <div className="fellowship-page">
                <div className="page-header fellowship-header">
                    <div className="container">
                        <h1>Application Received!</h1>
                        <p>Thank you for applying to the Vikasith Bharat Fellowship. Our academic committee will review your profile and contact you for the next steps.</p>
                        <button className="btn btn-primary" onClick={() => setIsSubmitted(false)} style={{ marginTop: '20px' }}>Back to Fellowship</button>
                    </div>
                </div>
            </div>
        );
    }
    return (
        <div className="fellowship-page">
            <div className="page-header fellowship-header">
                <div className="container">
                    <h1>Vikasith Bharat Fellowship Program</h1>
                    <p>Empowering Youth for Nation Building & Inclusive Development</p>
                </div>
            </div>

            <div className="container section">
                <div className="fellowship-intro text-center">
                    <h2 className="section-title">Program Overview</h2>
                    <p className="section-text">
                        The Vikasith Bharat Fellowship Program is a flagship youth-engagement initiative designed
                        to empower B.Tech and Undergraduate (UG) students to actively contribute to nation-building.
                        By combining academic learning with practical field experience, fellows work on real-world
                        social challenges such as beggar rehabilitation, education support, and community development.
                    </p>
                </div>

                <div className="benefits-section">
                    <h3 className="sub-title text-center">Fellowship Benefits & Support</h3>

                    <div className="fellowship-table-container">
                        <h4 className="table-title">Monthly Fellowship Support (Performance-Based)</h4>
                        <table className="fellowship-table">
                            <thead>
                                <tr>
                                    <th>Performance / Eligibility Score</th>
                                    <th>Monthly Fellowship Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>50% Eligibility</td>
                                    <td>₹1,000 per month</td>
                                </tr>
                                <tr>
                                    <td>70% Eligibility</td>
                                    <td>₹1,500 per month</td>
                                </tr>
                                <tr>
                                    <td>80% & Above Eligibility</td>
                                    <td>₹2,000 per month</td>
                                </tr>
                            </tbody>
                        </table>
                        <p className="note-text">* Fellowship support is provided only to candidates who meet eligibility and performance criteria.</p>
                    </div>

                    <div className="additional-benefits-grid">
                        <BenefitCard title="Free Internship" desc="Gain real-world industry exposure" />
                        <BenefitCard title="Industrial Tour" desc="Visit real-world industries and organizations (Free for qualified fellows)" />
                        <BenefitCard title="Certification" desc="Get Fellowship Completion & Internship Experience Certificates" />
                        <BenefitCard title="Leadership" desc="Performance-based recognition and leadership opportunities" />
                    </div>
                </div>

                <div className="cse-track-section section-gap">
                    <h3 className="sub-title text-center">CSE Student Track Specialization</h3>
                    <p className="text-center section-text">Students from Computer Science & Engineering backgrounds can select one specialization track.</p>

                    <div className="tracks-grid">
                        <TrackCard
                            title="Quantum Computing"
                            tag="Highly Recommended"
                            desc="Introductory-level concepts with career awareness. Designed for future-focused students."
                        />
                        <TrackCard
                            title="Cloud Computing"
                            tag="Basic Level"
                            desc="Fundamentals of cloud technologies and industry-oriented exposure."
                        />
                        <TrackCard
                            title="Web Development"
                            tag="Foundational"
                            desc="Basic web development concepts, HTML, CSS, and foundational tools."
                        />
                    </div>

                    <div className="fee-info-box">
                        <h4>Course Fee: ₹500 (One-time)</h4>
                        <ul className="fee-includes">
                            <li>14 Days of structured classes</li>
                            <li>Complete course required materials</li>
                            <li>Training support & participation</li>
                        </ul>
                        <p className="fee-note">Note: This is a registration & training fee. Providing skills to qualify for the fellowship.</p>
                    </div>
                </div>

                <div className="eligibility-details section-gap">
                    <h2 className="section-title text-center">Student Details Required</h2>
                    <div className="details-grid">
                        <div className="detail-category">
                            <h4>Basic Info</h4>
                            <ul>
                                <li>Full Name (Aadhaar)</li>
                                <li>Student ID (Auto-gen)</li>
                                <li>Contact Details</li>
                                <li>Gender & DOB</li>
                            </ul>
                        </div>
                        <div className="detail-category">
                            <h4>Academic</h4>
                            <ul>
                                <li>College / University</li>
                                <li>Course & Branch</li>
                                <li>Year of Study</li>
                                <li>Roll Number</li>
                            </ul>
                        </div>
                        <div className="detail-category">
                            <h4>Bank Details</h4>
                            <ul>
                                <li>Account Holder Name</li>
                                <li>Account Number</li>
                                <li>IFSC Code & Bank Name</li>
                                <li>(Admin Access Only)</li>
                            </ul>
                        </div>
                    </div>
                    <div className="text-center" style={{ marginTop: '40px' }}>
                        <button className="btn btn-primary lg" onClick={() => setIsModalOpen(true)}>Apply for Fellowship Program</button>
                    </div>
                </div>
            </div>

            {isModalOpen && (
                <div className="modal-overlay" onClick={() => setIsModalOpen(false)} style={{ zIndex: 3000 }}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ width: '800px', maxWidth: '90%' }}>
                        <div className="modal-header">
                            <h3>Fellowship Application Form</h3>
                            <button className="close-modal" onClick={() => setIsModalOpen(false)}>&times;</button>
                        </div>
                        <form className="modal-form" onSubmit={handleSubmit}>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Full Name (As per Aadhaar)</label>
                                    <input type="text" placeholder="John Doe" required />
                                </div>
                                <div className="form-group">
                                    <label>Email ID</label>
                                    <input type="email" placeholder="john@example.com" required />
                                </div>
                                <div className="form-group">
                                    <label>Mobile Number</label>
                                    <input type="tel" placeholder="+91 00000 00000" required />
                                </div>
                                <div className="form-group">
                                    <label>College Name</label>
                                    <input type="text" placeholder="Engineering College" required />
                                </div>
                                <div className="form-group">
                                    <label>Course & Branch</label>
                                    <input type="text" placeholder="B.Tech - CSE" required />
                                </div>
                                <div className="form-group">
                                    <label>Year of Study</label>
                                    <select required>
                                        <option value="">Select Year</option>
                                        <option>1st Year</option>
                                        <option>2nd Year</option>
                                        <option>3rd Year</option>
                                        <option>4th Year</option>
                                    </select>
                                </div>
                                <div className="form-group full-width">
                                    <label>Why do you want to join this fellowship? (Short description)</label>
                                    <textarea rows="3" placeholder="Tell us about your motivation..." required></textarea>
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn-save">Submit Application</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const BenefitCard = ({ title, desc }) => (
    <div className="benefit-card">
        <h4>{title}</h4>
        <p>{desc}</p>
    </div>
);

const TrackCard = ({ title, tag, desc }) => (
    <div className="track-card">
        <span className="track-tag">{tag}</span>
        <h3>{title}</h3>
        <p>{desc}</p>
    </div>
);

export default Fellowship;
