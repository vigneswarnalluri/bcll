import React from 'react';
import { Link } from 'react-router-dom';
import {
    FaSearch, FaHandHoldingHeart, FaUserCheck, FaArrowRight,
    FaUtensils, FaBed, FaTshirt, FaHeartbeat, FaHome, FaGraduationCap, FaUsers, FaSmile,
    FaDonate, FaHandsHelping, FaHandshake
} from 'react-icons/fa';
import './Programs.css';

const Programs = () => {
    const processSteps = [
        { icon: <FaSearch />, title: "Identify", desc: "Identify individuals in vulnerable situations" },
        { icon: <FaHandHoldingHeart />, title: "Support", desc: "Provide structured support (food, shelter, health)" },
        { icon: <FaUserCheck />, title: "Reintegrate", desc: "Enable rehabilitation through skills & employment" }
    ];

    const programList = [
        { id: 'meal', icon: <FaUtensils />, title: 'Give a Meal', desc: 'Fighting hunger with nutritious meals.', img: '/image copy 4.png' },
        { id: 'bed', icon: <FaBed />, title: 'A Bed, A Dream', desc: 'Providing bedding for the homeless.', img: '/image copy 5.png' },
        { id: 'cloth', icon: <FaTshirt />, title: 'Clothe a Child', desc: 'Dignity through proper clothing.', img: '/image copy 6.png' },
        { id: 'health', icon: <FaHeartbeat />, title: 'Health & Happiness', desc: 'Free medical camps & healthcare.', img: '/image copy 7.png' },
        { id: 'home', icon: <FaHome />, title: 'Home of Hope', desc: 'Shelter for the abandoned & in crisis.', img: '/image copy 8.png' },
        { id: 'scholar', icon: <FaGraduationCap />, title: 'Scholarships', desc: 'Supporting students with tuition fees.', img: '/image copy 9.png' },
        { id: 'rehab', icon: <FaUsers />, title: 'Beggar Rehab', desc: 'Transforming lives through skills.', img: '/image copy 10.png' },
        { id: 'elderly', icon: <FaSmile />, title: 'Elderly Support', desc: 'Care for the aged and orphaned.', img: '/image copy.png' },
    ];

    return (
        <div className="programs-page-v2">

            {/* 1. HERO - Simple & Focused */}
            <section className="prog-hero">
                <div className="container">
                    <h1>Our Programs</h1>
                    <p>Our programs address immediate needs while creating long-term, sustainable impact through rehabilitation and opportunity.</p>
                </div>
            </section>

            {/* 2. HOW IT WORKS - Process Flow */}
            <section className="prog-process section">
                <div className="container">
                    <h2 className="section-title text-center">How It Works</h2>
                    <div className="process-flow">
                        {processSteps.map((step, index) => (
                            <div key={index} className="process-step">
                                <div className="p-icon-circle">{step.icon}</div>
                                <h3>{step.title}</h3>
                                <p>{step.desc}</p>
                                {index !== processSteps.length - 1 && <div className="p-line"></div>}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 3. CORE PROGRAMS GRID */}
            <section className="prog-grid-section section">
                <div className="container">
                    <h2 className="section-title text-center">Our Initiatives</h2>
                    <div className="programs-grid">
                        {programList.map((prog) => (
                            <div key={prog.id} className="prog-card">
                                <div className="prog-img-container">
                                    <img src={prog.img} alt={prog.title} />
                                </div>
                                <div className="prog-info">
                                    <h3>{prog.title}</h3>
                                    <p>{prog.desc}</p>
                                    <Link to={`/programs/${prog.id}`} className="learn-more-link">
                                        Learn More <FaArrowRight />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 4. FLAGSHIP HIGHLIGHT */}
            <section className="prog-flagship section">
                <div className="container">
                    <div className="flagship-content">
                        <div className="flagship-text">
                            <span className="badge-flagship">Flagship Program</span>
                            <h2>Beggar Rehabilitation – Rise & Rebuild</h2>
                            <p>
                                This is not just food distribution — it’s transformation. We identify individuals forced into begging,
                                provide them with safe shelter, train them in vocational skills, and help them find dignified employment.
                            </p>
                            <div className="flagship-flow">
                                <span>Identify</span> <span>→</span> <span>Train</span> <span>→</span> <span>Employ</span>
                            </div>
                            <Link to="/programs/rehab" className="btn btn-primary">Support This Program</Link>
                        </div>
                        <div className="flagship-img">
                            <img src="https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&w=800&q=80" alt="Rehabilitation" />
                        </div>
                    </div>
                </div>
            </section>

            {/* 6. IMPACT SNAPSHOT */}
            <section className="prog-impact section">
                <div className="container">
                    <div className="impact-list">
                        <div className="impact-item">✔ Food & shelter support across districts</div>
                        <div className="impact-item">✔ Students supported through scholarships</div>
                        <div className="impact-item">✔ Individuals rehabilitated into livelihoods</div>
                    </div>
                </div>
            </section>

            {/* 7. SUPPORT OPTIONS - Split Layout */}
            <section className="prog-support section">
                <div className="container">
                    <h2 className="section-title text-center" style={{ marginBottom: '60px' }}>How You Can Help</h2>
                    <div className="support-split-list">

                        {/* Donate Card */}
                        <div className="split-card">
                            <div className="split-img">
                                <img src="https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=800&q=80" alt="Donate" />
                            </div>
                            <div className="split-content">
                                <h3>Donate</h3>
                                <p>Fuel our daily food runs and shelter maintenance. Your contribution creates immediate impact.</p>
                                <Link to="/donate" className="btn btn-primary btn-lg">DONATE NOW</Link>
                            </div>
                        </div>

                        {/* Volunteer Card */}
                        <div className="split-card reverse">
                            <div className="split-img" style={{ order: 0 }}> {/* Keep Image Left for consistency with screenshot if desired, or alternate. User screenshot showed Image Left for both? Let's check. Actually screenshot usually implies alternating or consistent. I will stick to consistent Image Left, Content Right as per screenshot appearance which shows stacked items. Wait, screenshot shows Image Left for Top, Image Left for Bottom. */}
                                <img src="https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=800&q=80" alt="Volunteer" />
                            </div>
                            <div className="split-content">
                                <h3>Volunteer</h3>
                                <p>Join us on the ground for food drives, teaching, and bringing smiles to faces.</p>
                                <Link to="/volunteer" className="btn btn-secondary btn-lg" style={{ color: '#000' }}>JOIN US</Link>
                            </div>
                        </div>

                        {/* Partner Card */}
                        <div className="split-card">
                            <div className="split-img">
                                <img src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=800&q=80" alt="Partner" />
                            </div>
                            <div className="split-content">
                                <h3>Partner</h3>
                                <p>CSR opportunities and corporate partnerships to drive large-scale change.</p>
                                <Link to="/contact" className="btn btn-outline-primary btn-lg">PARTNER WITH US</Link>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* 8. TRANSPARENCY NOTE */}
            <section className="prog-transparency">
                <div className="container text-center">
                    <p>All programs are executed with proper documentation, monitoring, and transparent reporting.</p>
                    <Link to="/reports" className="view-reports-link">View Reports <FaArrowRight /></Link>
                </div>
            </section>

        </div>
    );
};

export default Programs;
