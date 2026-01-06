import React from 'react';
import { Link } from 'react-router-dom';
import './About.css';

const About = () => {
    return (
        <div className="about-page">
            {/* 1. About Hero - Simple */}
            <header className="about-hero-simple">
                <div className="container">
                    <h1>About Bharath Cares Life Line Foundation</h1>
                    <p className="hero-subtitle">
                        Building a begging-free, dignified, and self-reliant society through rehabilitation and opportunity.
                    </p>
                </div>
            </header>

            {/* 2. Who We Are */}
            <section className="section about-who-section">
                <div className="container">
                    <div className="who-grid">
                        <div className="who-text">
                            <h2 className="section-title">Who We Are</h2>
                            <p>
                                Bharath Cares Life Line Foundation is a registered non-profit dedicated to transforming lives in Andhra Pradesh.
                                We don't just provide relief; we focus on long-term rehabilitation. Our goal is to shift the paradigm from
                                charity to empowerment, ensuring every individual has the dignity of self-reliance.
                            </p>
                        </div>
                        <div className="who-image">
                            {/* Placeholder for field work/counselling image */}
                            <img src="https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Field Work" />
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. The Problem - Brief & Systemic */}
            <section className="section about-problem-section">
                <div className="container text-center">
                    <h2 className="section-title">The Problem</h2>
                    <p className="problem-statement">
                        Begging is not a personal failure. It is the result of broken systems—lack of shelter, education, healthcare, and employment opportunities.
                    </p>
                </div>
            </section>

            {/* 4. Our Philosophy */}
            <section className="section about-philosophy-section">
                <div className="container">
                    <h2 className="section-title text-center">Our Philosophy</h2>
                    <div className="philosophy-grid">
                        <div className="philosophy-card">
                            <h3>01. Dignity</h3>
                            <p>We prioritize human dignity before delivering aid.</p>
                        </div>
                        <div className="philosophy-card">
                            <h3>02. Rehabilitation</h3>
                            <p>We focus on holistic recovery before temporary relief.</p>
                        </div>
                        <div className="philosophy-card">
                            <h3>03. Employment</h3>
                            <p>We build pathways to earnings before dependency.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 5. Vision, Mission & Values */}
            <section className="section about-vmv-section">
                <div className="container">
                    <div className="vmv-grid">
                        <div className="vmv-card">
                            <h3>Vision</h3>
                            <p>A society where no one is forced to beg to survive.</p>
                        </div>
                        <div className="vmv-card">
                            <h3>Mission</h3>
                            <ul>
                                <li>Rehabilitation</li>
                                <li>Skill development</li>
                                <li>Employment</li>
                                <li>Education</li>
                                <li>Community collaboration</li>
                            </ul>
                        </div>
                        <div className="vmv-card">
                            <h3>Values</h3>
                            <ul>
                                <li>Dignity</li>
                                <li>Accountability</li>
                                <li>Transparency</li>
                                <li>Compassion with structure</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* 6. What We Do (High-Level) */}
            <section className="section about-what-we-do-section">
                <div className="container">
                    <h2 className="section-title">What We Do</h2>
                    <p className="intro-line">Comprehensive support systems for lasting change.</p>
                    {/* Modern Image Grid Layout */}
                    <div className="what-we-do-grid">
                        {[
                            { title: "Food Security", img: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=400&q=80" },
                            { title: "Shelter Support", img: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=400&q=80" },
                            { title: "Healthcare Access", img: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=400&q=80" },
                            { title: "Education", img: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=400&q=80" },
                            { title: "Beggar Rehab", img: "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?auto=format&fit=crop&w=400&q=80" },
                            { title: "Livelihood", img: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=400&q=80" },
                            { title: "Elderly Care", img: "https://images.unsplash.com/photo-1516733968668-dbdce39c4651?auto=format&fit=crop&w=400&q=80" },
                        ].map((item, index) => (
                            <div className="wwd-card" key={index}>
                                <div className="wwd-image" style={{ backgroundImage: `url(${item.img})` }}></div>
                                <div className="wwd-overlay">
                                    <h3>{item.title}</h3>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="what-we-do-cta" style={{ marginTop: '50px' }}>
                        <Link to="/programs" className="btn btn-primary" style={{ padding: '15px 40px' }}>Explore Our Programs</Link>
                    </div>
                </div>
            </section>

            {/* 7. Founders' Message */}
            <section className="section about-founders-section">
                <div className="container">
                    <h2 className="section-title text-center">Leadership Message</h2>
                    <div className="founders-grid">
                        <div className="founder-card">
                            <div className="founder-img">
                                <img src="https://via.placeholder.com/150" alt="Mr. Akkala Vamsi Reddy" />
                            </div>
                            <div className="founder-text">
                                <h3>Mr. Akkala Vamsi Reddy</h3>
                                <span className="role">Founder & Director</span>
                                <p>
                                    "Begging is not a choice; it is the result of opportunity gaps. My vision is to restore dignity to every life we touch."
                                </p>
                            </div>
                        </div>
                        <div className="founder-card">
                            <div className="founder-img">
                                <img src="https://via.placeholder.com/150" alt="Mr. Ajay P" />
                            </div>
                            <div className="founder-text">
                                <h3>Mr. Ajay P</h3>
                                <span className="role">Co-Founder & CEO</span>
                                <p>
                                    "Compassion needs structure. We are building sustainable systems that turn survival into success."
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 8. Legal Status & Transparency */}
            <section className="section about-legal-section">
                <div className="container">
                    <div className="legal-box">
                        <h2 className="section-title">Legal Status & Transparency</h2>
                        <div className="legal-details">
                            <div className="legal-item">
                                <strong>Registered Trust:</strong> Under Andhra Pradesh Government Trust Act.
                            </div>
                            <div className="legal-item">
                                <strong>Compliance:</strong> Fully compliant with Indian laws governing charitable organizations.
                            </div>
                            <div className="legal-item">
                                <strong>Transparency:</strong> Committed to 100% transparent reporting and auditing.
                            </div>
                            {/* <div className="legal-item">
                                <strong>80G & 12A:</strong> Certified for tax exemptions.
                            </div> */}
                        </div>
                    </div>
                </div>
            </section>

            {/* 9. Our Commitment */}
            <section className="section about-commitment-section">
                <div className="container text-center">
                    <h2 className="section-title">Our Commitment</h2>
                    <div className="commitment-statements">
                        <p>We don’t encourage dependency.</p>
                        <p>We measure impact.</p>
                        <p>We work with communities, not over them.</p>
                    </div>
                    <div className="commitment-actions">
                        <Link to="/reports" className="btn btn-outline">View Reports</Link>
                        <Link to="/contact" className="btn btn-secondary">Partner With Us</Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default About;
