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
                            <h3>Shri Vamsi Reddy Akkala</h3>
                            <span className="role">Founder & Director</span>
                            <span className="specialization">Community-Based Beggar Rehabilitation & Social Welfare Initiatives</span>
                            <div className="bio-content">
                                <p>
                                    Shri Vamsi Reddy Akkala is a committed social reformer and development professional, widely recognized
                                    for his grassroots leadership in community-based beggar rehabilitation, poverty eradication, and
                                    inclusive social welfare programs. He is the Founder and Director of Bharat Cares Life Line Foundation,
                                    a registered non-profit organization dedicated to building a beggar-free, dignified, and self-reliant society.
                                </p>
                                <p>
                                    With a strong vision rooted in social justice and human dignity, Shri Vamsi Reddy Akkala has pioneered
                                    expense-efficient, sustainable, and impact-oriented rehabilitation models for marginalized and destitute
                                    communities. His work focuses on identification, rescue, counselling, skill development, livelihood
                                    generation, and long-term rehabilitation of persons involved in begging.
                                </p>
                                <p>
                                    Under his leadership, the Foundation actively collaborates with government departments, local administrations,
                                    police, urban bodies, NGOs, volunteers, and community stakeholders to implement structured rehabilitation
                                    programs aligned with national and state welfare schemes. His approach emphasizes community participation,
                                    transparency, accountability, and measurable social outcomes.
                                </p>
                                <p>
                                    Shri Vamsi Reddy Akkala has been instrumental in designing and executing initiatives such as:
                                </p>
                                <ul>
                                    <li>Beggar Identification & Rehabilitation Programs</li>
                                    <li>Skill Training & MSME-based Livelihood Support</li>
                                    <li>Shelter, Food, Health & Counselling Services</li>
                                    <li>Scholarships for Orphans and Single-Parent Children</li>
                                    <li>Volunteer Mobilization & Youth Leadership Programs</li>
                                    <li>Digital Governance and NGO Management Systems</li>
                                </ul>
                                <p className="closing-statement">
                                    Known for his ethical leadership, administrative clarity, and hands-on involvement, he strongly believes
                                    that rehabilitation is not charity but empowerment. His mission is to transform vulnerable lives into
                                    productive, independent, and respected members of society.
                                </p>
                                <p>
                                    Shri Vamsi Reddy Akkala continues to work relentlessly toward building inclusive communities, strengthening
                                    social protection systems, and contributing meaningfully to nation-building and social development.
                                </p>
                            </div>
                        </div>

                        <div className="founder-card">
                            <h3>Shri Ajay Puchakayala</h3>
                            <span className="role">Co-Founder & Chief Executive Officer (CEO)</span>
                            <span className="specialization">Program Management, Design, Development & Government Liaison</span>
                            <div className="bio-content">
                                <p>
                                    Shri Ajay Puchakayala is the Co-Founder and Chief Executive Officer (CEO) of Bharat Cares Life Line Foundation,
                                    playing a pivotal role in the strategic planning, design, development, funding, and execution of all foundation programs.
                                    He is responsible for the overall management and coordination of operations, ensuring that each initiative
                                    aligns with the Foundation’s mission and statutory objectives.
                                </p>
                                <p>
                                    As the chief architect of program frameworks, Shri Ajay Puchakayala leads the design and development of social welfare,
                                    rehabilitation, education, livelihood, and community development projects. He oversees funding strategies,
                                    CSR partnerships, donor engagement, and resource mobilization, ensuring sustainable financial support for long-term impact.
                                </p>
                                <p>
                                    Shri Ajay Puchakayala also manages government scheme integration and coordination, working closely with central and state
                                    government departments, urban and rural local bodies, and statutory authorities. His expertise includes
                                    aligning foundation initiatives with government programs and welfare schemes, enabling effective implementation and compliance.
                                </p>
                                <p>
                                    In addition, he supervises the entire backend operations of the Foundation, including:
                                </p>
                                <ul>
                                    <li>Program planning & execution</li>
                                    <li>Funding, CSR & donor management</li>
                                    <li>Government scheme convergence</li>
                                    <li>Monitoring, evaluation & reporting</li>
                                    <li>Systems, documentation & compliance</li>
                                    <li>Inter-departmental coordination</li>
                                </ul>
                                <p className="closing-statement">
                                    Known for his strategic insight, operational discipline, and results-driven leadership,
                                    Shri Ajay Puchakayala ensures that the Foundation functions with efficiency, transparency, and accountability,
                                    translating vision into measurable social outcomes.
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
