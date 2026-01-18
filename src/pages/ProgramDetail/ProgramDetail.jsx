import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaArrowLeft, FaCheckCircle, FaHandHoldingHeart, FaDonate, FaGraduationCap } from 'react-icons/fa';
import './ProgramDetail.css';

const ProgramDetail = () => {
    const { id } = useParams();
    const [isScholarshipModalOpen, setIsScholarshipModalOpen] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const programData = {
        'meal': {
            title: 'Give a Meal',
            desc: 'Fighting hunger with nutritious meals.',
            fullDesc: 'The "Give a Meal" program is our daily feeding initiative. We identify clusters of hungry individuals including beggars, orphans, and abandoned elderly and provide them with fresh, nutritious meals prepared in a hygienic environment.',
            impact: 'Over 50,000 meals served across Guntur and surrounding districts.',
            features: ['Daily meal distribution', 'Nutritional monitoring', 'Hygienic preparation', 'Volunteer-led drives'],
            img: '/image copy 4.png'
        },
        'bed': {
            title: 'A Bed, A Dream',
            desc: 'Providing bedding for the homeless.',
            fullDesc: 'Many homeless individuals sleep on bare pavements in extreme weather. This program provides basic bedding including mats, blankets, and pillows to ensure a dignified and safe night’s sleep.',
            impact: '3,000+ bedding sets distributed to date.',
            features: ['Seasonal blanket drives', 'Durable mats', 'Identifying night shelter needs', 'Emergency support'],
            img: '/image copy 5.png'
        },
        'cloth': {
            title: 'Clothe a Child',
            desc: 'Dignity through proper clothing.',
            fullDesc: 'Distributing clean and new clothing to children and adults living in extreme poverty, helping them stay protected from the elements and restoring their sense of dignity.',
            impact: '10,000+ clothes distributed across 20+ villages.',
            features: ['New dress distribution', 'Winter kit support', 'School uniform assistance', 'Community collection drives'],
            img: '/image copy 6.png'
        },
        'health': {
            title: 'Health & Happiness',
            desc: 'Free medical camps & healthcare.',
            fullDesc: 'Ensuring health for the marginalized through mobile clinics and free health camps. We focus on diagnosis, medicine distribution, and referral services for beneficiaries.',
            impact: '4,000+ beneficiaries treated at our mobile camps.',
            features: ['Weekly mobile clinics', 'Medicine distribution', 'Eye and dental checkups', 'Health awareness workshops'],
            img: '/image copy 7.png'
        },
        'home': {
            title: 'Home of Hope',
            desc: 'Shelter for the abandoned & in crisis.',
            fullDesc: 'Providing temporary and permanent shelter for those who have no place to go. Our shelters provide a safe environment with food, medical care, and community support.',
            impact: '80+ residents living safely in our community shelters.',
            features: ['24/7 safe environment', 'Regular health checkups', 'Recreational activities', 'Rehabilitation guidance'],
            img: '/image copy 8.png'
        },
        'scholar': {
            title: 'Scholarships for All',
            desc: 'Supporting students with tuition fees.',
            fullDesc: 'We believe education is the only exit route from poverty. We support bright students from economically backward families with tuition fees, books, and laptops to ensure they don’t drop out.',
            impact: '120+ students pursuing higher education through our support.',
            features: ['Tuition fee coverage', 'Study materials', 'Mentorship', 'Career guidance'],
            img: '/image copy 9.png',
            canApply: true
        },
        'rehab': {
            title: 'Beggar Rehabilitation',
            tag: 'Flagship',
            desc: 'Transforming lives through skills.',
            fullDesc: 'Our most comprehensive program. We don’t just feed; we fix. We identify individuals in begging, provide counseling, vocational training, and help them find jobs or start small micro-businesses.',
            impact: '450+ individuals successfully transitioned out of begging into dignified jobs.',
            features: ['Psychological counseling', 'Skill workshops', 'Job placement support', 'Continuous monitoring'],
            img: '/image copy 10.png'
        },
        'elderly': {
            title: 'Elderly & Orphan Support',
            desc: 'Care for the aged and orphaned.',
            fullDesc: 'Focusing on the most vulnerable groups—elderly who have been abandoned by their families and children who have lost their parents. We provide emotional support and essential resources.',
            impact: 'Supporting 250+ elderly and children daily.',
            features: ['Emotional health support', 'Regular nutritional supply', 'Safe housing', 'Social engagement'],
            img: '/image copy.png'
        }
    };

    const prog = programData[id] || programData['meal'];

    if (isSubmitted) {
        return (
            <div className="program-detail-page">
                <div className="container" style={{ textAlign: 'center', padding: '100px 20px' }}>
                    <FaCheckCircle style={{ fontSize: '4rem', color: '#2ecc71', marginBottom: '20px' }} />
                    <h1>Application Submitted!</h1>
                    <p>Your scholarship application is now with our verification team. Keep your documents ready.</p>
                    <button className="btn btn-primary" onClick={() => setIsSubmitted(false)} style={{ marginTop: '20px' }}>Back to Program</button>
                </div>
            </div>
        );
    }

    return (
        <div className="program-detail-page">
            <div className="container">
                <Link to="/programs" className="back-link"><FaArrowLeft /> Back to Programs</Link>

                <div className="prog-detail-header">
                    <div className="header-text">
                        {prog.tag && <span className="prog-badge">{prog.tag} Program</span>}
                        <h1>{prog.title}</h1>
                        <p className="lead">{prog.desc}</p>
                    </div>
                </div>

                <div className="prog-detail-grid">
                    <div className="prog-visual">
                        <img src={prog.img} alt={prog.title} className="main-prog-img" />
                    </div>
                    <div className="prog-content-main">
                        <section className="detail-section">
                            <h3>Program Overview</h3>
                            <p>{prog.fullDesc}</p>
                        </section>

                        <section className="detail-section">
                            <h3>Key Features</h3>
                            <ul className="feature-list">
                                {prog.features.map((f, i) => (
                                    <li key={i}><FaCheckCircle className="feat-icon" /> {f}</li>
                                ))}
                            </ul>
                        </section>

                        <section className="detail-section impact-box">
                            <h3>Real Impact</h3>
                            <p>{prog.impact}</p>
                        </section>

                        <div className="detail-cta">
                            {prog.canApply && (
                                <button className="btn btn-secondary" onClick={() => setIsScholarshipModalOpen(true)}>
                                    <FaGraduationCap /> Apply for Scholarship
                                </button>
                            )}
                            <Link to="/donate" className="btn btn-primary"><FaDonate /> Support This Initiative</Link>
                            <Link to="/volunteer" className="btn btn-outline-primary"><FaHandHoldingHeart /> Volunteer</Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* SCHOLARSHIP MODAL */}
            {isScholarshipModalOpen && (
                <div className="modal-overlay" onClick={() => setIsScholarshipModalOpen(false)} style={{ zIndex: 5000 }}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ width: '600px', maxWidth: '95%' }}>
                        <div style={{ padding: '30px' }}>
                            <h2 style={{ marginBottom: '10px' }}>Scholarship Application</h2>
                            <p style={{ color: '#666', marginBottom: '25px' }}>Please provide accurate details for verification.</p>

                            <form onSubmit={(e) => { e.preventDefault(); setIsSubmitted(true); setIsScholarshipModalOpen(false); }}>
                                <div className="form-group" style={{ marginBottom: '15px' }}>
                                    <label>Full Name</label>
                                    <input type="text" required style={inputStyle} placeholder="Student Name" />
                                </div>
                                <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                                    <div className="form-group">
                                        <label>College/School</label>
                                        <input type="text" required style={inputStyle} />
                                    </div>
                                    <div className="form-group">
                                        <label>Academic Year</label>
                                        <input type="text" required style={inputStyle} placeholder="e.g., 2025-26" />
                                    </div>
                                </div>
                                <div className="form-group" style={{ marginBottom: '15px' }}>
                                    <label>Annual Family Income</label>
                                    <input type="number" required style={inputStyle} placeholder="₹ Yearly Income" />
                                </div>
                                <div className="form-group" style={{ marginBottom: '25px' }}>
                                    <label>Upload Income Certificate / ID (PDF/Image)</label>
                                    <input type="file" required style={{ width: '100%', marginTop: '5px' }} />
                                </div>
                                <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end' }}>
                                    <button type="button" className="btn-small" onClick={() => setIsScholarshipModalOpen(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary">Submit Application</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const inputStyle = {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    marginTop: '5px',
    outline: 'none'
};

export default ProgramDetail;
