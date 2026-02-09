import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

import { FaHandHoldingHeart, FaHome, FaTshirt, FaHeartbeat, FaGraduationCap, FaTint, FaUsers, FaUtensils, FaBook, FaUserNurse, FaArrowRight, FaCheckCircle, FaFileContract, FaShieldAlt, FaChartLine, FaGlobe, FaCertificate, FaFileInvoiceDollar } from 'react-icons/fa';


import Glide from '@glidejs/glide';
import '@glidejs/glide/dist/css/glide.core.min.css';
import '@glidejs/glide/dist/css/glide.theme.min.css';
import './Home.css';

const Home = () => {
    useEffect(() => {
        new Glide('.glide', {
            type: 'carousel',
            perView: 3, // Matches the screenshot's focused look
            focusAt: 'center',
            gap: 30, // Increased gap for the 3D effect space
            autoplay: 2500, // Automatic movement
            hoverpause: true,
            animationDuration: 800,
            breakpoints: {
                1024: { perView: 2 },
                600: { perView: 1 }
            }
        }).mount();
    }, []);

    const [lightboxImage, setLightboxImage] = React.useState(null);

    return (
        <>
            <div className="home-page">
                {/* Lightbox Modal */}
                {lightboxImage && (
                    <div className="lightbox-overlay" onClick={() => setLightboxImage(null)}>
                        <div
                            className="lightbox-content"
                            onClick={(e) => e.stopPropagation()}
                            onMouseLeave={() => setLightboxImage(null)}
                        >
                            <img src={lightboxImage} alt="Enlarged" className="lightbox-img" />
                            <button className="lightbox-close" onClick={() => setLightboxImage(null)}>&times;</button>
                        </div>
                    </div>
                )}

                {/* Hero Section */}
                <section className="hero-section">
                    <video
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="hero-video"
                    >
                        <source src="/hero.mp4" type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                    <div className="hero-overlay"></div>
                    <div className="container hero-content text-center">
                        <h1 className="hero-title animate-fade-in">Bharath Cares Life Line Foundation</h1>
                        <p className="hero-tagline animate-fade-in" style={{ animationDelay: '0.2s' }}>
                            “Rise & Rebuild – A Society Without Begging”
                        </p>
                        <div className="hero-buttons animate-fade-in" style={{ animationDelay: '0.4s' }}>
                            <Link to="/donate" className="btn btn-primary" style={{ marginRight: '15px' }}>Donate Now</Link>
                            <Link to="/volunteer" className="btn btn-secondary">Join as Volunteer</Link>
                        </div>
                    </div>
                </section>

                <marquee style={{ background: '#1a365d', color: 'white', padding: '10px 0', fontSize: '1rem', fontWeight: 'bold' }}>
                    🌍 Bharath Cares Life Line Foundation – Working towards a society without begging through rehabilitation, education & employment.
                </marquee>
                <marquee behavior="alternate" style={{ background: '#f8fafc', color: '#1a365d', padding: '5px 0', fontSize: '0.9rem', fontWeight: 'bold', borderBottom: '1px solid #e2e8f0' }}>
                    🤝 Transparency | Accountability | Social Impact | Dignity for All
                </marquee>

                {/* Who We Are Section - Visual Update */}
                <section className="section intro-section">
                    <div className="container">
                        <div className="intro-content text-center">
                            <h2 className="section-title">Who We Are</h2>
                            <p className="section-text" style={{ maxWidth: '800px', margin: '0 auto 40px' }}>
                                Bharath Cares Life Line Foundation envisions a nation where every individual lives with dignity.
                                We go beyond charity to eradicate begging through holistic rehabilitation, skill development,
                                and sustainable employment.
                            </p>

                        </div>
                    </div>
                </section>

                {/* The Problem We Address Section */}
                <section className="section problem-section">
                    <div className="container">
                        <div className="problem-content text-center">
                            <h2 className="section-title">The Problem We Address</h2>
                            <h3 className="problem-headline">
                                "Begging Is Not a Choice. It’s a Failure of Opportunity."
                            </h3>
                            <p className="problem-text-highlight">
                                Millions are pushed into begging not by choice, but by broken systems.
                                Lack of shelter, education, and support turns survival into dependency.
                                We believe this cycle can be broken — with the right intervention.
                            </p>

                            <div className="problem-icons">
                                <div className="problem-item">
                                    <FaHome />
                                    <p>No Shelter</p>
                                </div>
                                <div className="problem-item">
                                    <FaGraduationCap />
                                    <p>No Education</p>
                                </div>
                                <div className="problem-item">
                                    <FaHandHoldingHeart />
                                    <p>No Support</p>
                                </div>
                            </div>

                            <div className="problem-bridge">
                                This is where rehabilitation begins — not with charity, but with opportunity.
                            </div>
                        </div>
                    </div>
                </section>

                {/* Our Approach Section */}
                <section className="section why-rehab-section">
                    <div className="container">
                        <h2 className="section-title text-center">Our Approach</h2>
                        <p className="text-center section-text" style={{ fontStyle: 'italic', color: 'var(--primary)', fontWeight: '600' }}>
                            This is where trust starts.
                        </p>
                        <div className="why-rehab-grid">
                            <WhyCard
                                image="/image copy.png"
                                title="Rehabilitation, not handouts"
                                desc="Holistic healing and psychological support."
                                example="Ex: We restore dignity first."
                            />
                            <WhyCard
                                image="/image copy 2.png"
                                title="Skill Development"
                                desc="Teaching trades like tailoring, computers, and crafts."
                                example="Ex: 50+ women now earn through tailoring."
                            />
                            <WhyCard
                                image="/image copy 3.png"
                                title="Employment & Reintegration"
                                desc="Connecting trained individuals with jobs."
                                example="Ex: Partnered with 10+ local MSMEs for hiring."
                            />
                        </div>
                    </div>
                </section>

                {/* Our Core Programs - With Images & Benefits */}
                <section className="section bg-light programs-preview">
                    <div className="container">
                        <h2 className="section-title text-center">Our Core Programs</h2>
                        <p className="text-center section-text">Real solutions for real problems. See how we help:</p>
                        <div className="core-programs-grid">
                            <ProgramCard
                                id="meal"
                                image="/image copy 4.png"
                                title="Give a Meal"
                                desc="Nutritious food for the hungry."
                                benefit="Benefit: Prevents starvation and builds trust for rehabilitation."
                            />
                            <ProgramCard
                                id="bed"
                                image="/image copy 5.png"
                                title="A Bed, A Dream"
                                desc="Shelter and dignity for the homeless."
                                benefit="Benefit: Provides safety and a fixed address for ID proofs."
                            />
                            <ProgramCard
                                id="cloth"
                                image="/image copy 6.png"
                                title="Clothe a Child"
                                desc="Clothing support for children."
                                benefit="Benefit: Restores dignity and protection from harsh weather."
                            />
                            <ProgramCard
                                id="health"
                                image="/image copy 7.png"
                                title="Health & Happiness"
                                desc="Medical camps and assistance."
                                benefit="Benefit: Treat chronic ailments & improve life expectancy."
                            />
                            <ProgramCard
                                id="home"
                                image="/image copy 8.png"
                                title="Home of Hope"
                                desc="Shelter for orphans & elderly."
                                benefit="Benefit: A loving family environment for the abandoned."
                            />
                            <ProgramCard
                                id="scholar"
                                image="/image copy 9.png"
                                title="Scholarships"
                                desc="Education support for students."
                                benefit="Benefit: Breaks the poverty cycle through higher education."
                            />
                            <ProgramCard
                                id="rehab"
                                image="/image copy 10.png"
                                title="Rehabilitation"
                                desc="Skill development & training."
                                benefit="Benefit: Vocational skills lead to financial independence."
                            />
                            <ProgramCard
                                id="fellowship"
                                status="Starting Tomorrow"
                                image="/ChatGPT Image Jan 6, 2026, 12_48_48 PM.png"
                                title="Fellowship"
                                desc="Youth leadership program."
                                benefit="Benefit: Creates the next generation of social changemakers."
                            />
                        </div>
                    </div>
                </section>



                {/* Impact Section */}
                <section className="section impact-section">
                    <div className="container">
                        <h2 className="section-title text-center text-white">Real Impact</h2>
                        <div className="impact-grid">
                            <ImpactStat icon={<FaUtensils />} number="250,000+" label="Meals Served" desc="Preventing Hunger Daily" />
                            <ImpactStat icon={<FaUsers />} number="450+" label="People Rehabilitated" desc="Lives Transformed" />
                            <ImpactStat icon={<FaGraduationCap />} number="1,200+" label="Students Supported" desc="Scholarships Awarded" />
                            <ImpactStat icon={<FaUsers />} number="300+" label="Volunteers Active" desc="Changemakers" />
                            <ImpactStat icon={<FaGlobe />} number="12" label="Districts Covered" desc="Expanding Reach" />
                        </div>
                    </div>
                </section>

                {/* Make an Instant Impact Section */}
                <section className="section donate-now-section">
                    <div className="container">
                        <div className="donate-wrapper">
                            <div className="donate-content">
                                <h2 className="section-title text-left">Make an Instant Impact</h2>
                                <p className="donate-text">
                                    Your contribution, no matter how small, fuels our mission.
                                    Direct money transfers ensure 100% of your donation reaches those in need.
                                </p>
                                <div className="donate-features">
                                    <div className="feature-item" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1594708767771-a7502209ff51?auto=format&fit=crop&w=400&q=80')" }}>
                                        <div className="feature-overlay"></div>
                                        <span className="feature-text">Feed a hungry soul</span>
                                    </div>
                                    <div className="feature-item" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=400&q=80')" }}>
                                        <div className="feature-overlay"></div>
                                        <span className="feature-text">Educate a child</span>
                                    </div>
                                    <div className="feature-item" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=400&q=80')" }}>
                                        <div className="feature-overlay"></div>
                                        <span className="feature-text">Save a life</span>
                                    </div>
                                </div>
                                <Link to="/donate" className="btn btn-primary btn-lg mt-4">Donate Online</Link>
                            </div>

                            <div className="donate-card-container">
                                <div className="donate-card">
                                    <div className="donate-header">
                                        <h3>Direct Bank Transfer</h3>
                                        <span className="badge">Tax Exempt</span>
                                    </div>
                                    <div className="bank-details">
                                        <div className="detail-row" onClick={() => { navigator.clipboard.writeText('Bharath Cares Life Line Foundation'); alert('Name Copied!'); }} title="Click to copy">
                                            <div className="label-with-icon">
                                                <FaUsers className="detail-icon" />
                                                <span className="label">Account Name:</span>
                                            </div>
                                            <span className="value">Bharath Cares Life Line Foundation</span>
                                        </div>
                                        <div className="detail-row" onClick={() => { navigator.clipboard.writeText('INDIAN BANK'); alert('Bank Name Copied!'); }} title="Click to copy">
                                            <div className="label-with-icon">
                                                <FaHome className="detail-icon" />
                                                <span className="label">Bank Name:</span>
                                            </div>
                                            <span className="value">INDIAN BANK</span>
                                        </div>
                                        <div className="detail-row" onClick={() => { navigator.clipboard.writeText('8139736308'); alert('Account No Copied!'); }} title="Click to copy">
                                            <div className="label-with-icon">
                                                <FaShieldAlt className="detail-icon" />
                                                <span className="label">Account No:</span>
                                            </div>
                                            <span className="value">8139736308</span>
                                        </div>
                                        <div className="detail-row" onClick={() => { navigator.clipboard.writeText('IDIB000M604'); alert('IFSC Code Copied!'); }} title="Click to copy">
                                            <div className="label-with-icon">
                                                <FaCertificate className="detail-icon" />
                                                <span className="label">IFSC Code:</span>
                                            </div>
                                            <span className="value">IDIB000M604</span>
                                        </div>
                                        <div className="detail-row">
                                            <div className="label-with-icon">
                                                <FaGlobe className="detail-icon" />
                                                <span className="label">Branch:</span>
                                            </div>
                                            <span className="value">Mangalagiri, Guntur</span>
                                        </div>
                                    </div>
                                    <div className="qr-code-section">
                                        <p className="qr-label">Scan to Donate via UPI</p>
                                        <div className="qr-placeholder">
                                            <img src="/Bharath%20Cares%20Life%20Line_qr_code.png" alt="Donate UPI" />
                                        </div>
                                        <div className="payment-apps" style={{ display: 'flex', gap: '25px', justifyContent: 'center', marginTop: '20px', alignItems: 'center' }}>
                                            <img src="/gpay-logo.png" alt="Google Pay" style={{ height: '35px', objectFit: 'contain' }} />
                                            <img src="/phonepe-logo.png" alt="PhonePe" style={{ height: '35px', objectFit: 'contain' }} />
                                            <img src="/paytm-logo.png" alt="Paytm" style={{ height: '30px', objectFit: 'contain' }} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* How Your Donation Helps Section - Premium Accordion */}
                <section className="section donation-breakdown-section">
                    <div className="container">
                        <h2 className="section-title text-center">How Your Donation Helps</h2>
                        <p className="text-center section-text">Your contribution creates immediate, tangible change.</p>
                        <div className="donation-grid">
                            <div className="donation-card donate-card-meal">
                                <div className="card-overlay"></div>
                                <div className="donation-content">

                                    <h3 className="donation-label">Sponsor a Meal</h3>
                                    <div className="donation-price-container">
                                        <span className="donation-price">₹30</span>
                                    </div>
                                    <p className="donation-desc">Provide a hot, nutritious meal to someone sleeping hungry tonight.</p>
                                    <a href="upi://pay?pa=bclftrust@indianbk&pn=Nalluri%20Vigneswar&am=30&cu=INR" className="btn-donate-link">Donate ₹30 <FaArrowRight /></a>
                                </div>
                            </div>
                            <div className="donation-card donate-card-edu">
                                <div className="card-overlay"></div>
                                <div className="donation-content">

                                    <h3 className="donation-label">Support Education</h3>
                                    <span className="donation-price">₹1,000<small>/mo</small></span>
                                    <p className="donation-desc">Cover school fees, books, and uniforms for a child's bright future.</p>
                                    <a href="upi://pay?pa=bclftrust@indianbk&pn=Bharath Cares Life Line&am=1000&cu=INR" className="btn-donate-link">Donate ₹1,000 <FaArrowRight /></a>
                                </div>
                            </div>
                            <div className="donation-card donate-card-rehab">
                                <div className="card-overlay"></div>
                                <div className="donation-content">

                                    <h3 className="donation-label">Sponsor Rehabilitation</h3>
                                    <span className="donation-price">₹5,000</span>
                                    <p className="donation-desc">Fund complete shelter, skill training, and medical care for one month.</p>
                                    <a href="upi://pay?pa=bclftrust@indianbk&pn=Bharath Cares Life Line&am=5000&cu=INR" className="btn-donate-link">Donate ₹5,000 <FaArrowRight /></a>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                {/* Stories of Change Section */}
                <section className="section stories-section">
                    <div className="container">
                        <h2 className="section-title text-center">Stories of Change</h2>
                        <div className="stories-grid">
                            <div className="story-card">
                                <div className="story-img-wrapper">
                                    <img src="/wmremove-transformed (1).jpeg" alt="Ravi's Success" className="story-img" />
                                </div>
                                <div className="story-content">
                                    <span className="story-tag">Rehabilitation</span>
                                    <h3 className="story-title">Ravi’s New Beginning</h3>
                                    <p className="story-text">
                                        "I lived on the railway platform for 5 years. I thought this was my fate. Bharath Cares didn't just give me food; they trained me."
                                    </p>
                                    <p className="story-result">Before: Begging at station<br />Now: Employed as a Security Guard</p>
                                </div>
                            </div>
                            <div className="story-card">
                                <div className="story-img-wrapper">
                                    <img src="/happy-indian-school-girl-standing-260nw-2184618575.jpg" alt="Anita's Hope" className="story-img" />
                                </div>
                                <div className="story-content">
                                    <span className="story-tag">Education</span>
                                    <h3 className="story-title">Anita’s Dream</h3>
                                    <p className="story-text">
                                        "My parents couldn't afford school. Now I have a uniform and books. I want to be a teacher."
                                    </p>
                                    <p className="story-result">Before: Collecting scrap<br />Now: Top of her class in Grade 5</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section >

                {/* Gallery Snapshot Section */}
                < section className="section gallery-section" >
                    <div className="container">
                        <h2 className="section-title text-center">Life on the Field</h2>
                        <p className="section-text text-center">Real moments of change, captured daily.</p>

                        <div className="glide gallery-slider">
                            <div className="glide__track" data-glide-el="track">
                                <ul
                                    className="glide__slides"
                                    onClick={(e) => {
                                        const item = e.target.closest('.gallery-item');
                                        if (item) {
                                            const src = item.getAttribute('data-full-img');
                                            if (src) setLightboxImage(src);
                                        }
                                    }}
                                >
                                    <li className="glide__slide">
                                        <div className="gallery-item" data-full-img="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1200">
                                            <img src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=500" alt="Gallery 1" className="gallery-img" />
                                            <div className="gallery-overlay"></div>
                                        </div>
                                    </li>
                                    <li className="glide__slide">
                                        <div className="gallery-item" data-full-img="https://images.unsplash.com/photo-1593113598332-cd288d649433?w=1200">
                                            <img src="https://images.unsplash.com/photo-1593113598332-cd288d649433?w=500" alt="Gallery 2" className="gallery-img" />
                                            <div className="gallery-overlay"></div>
                                        </div>
                                    </li>
                                    <li className="glide__slide">
                                        <div className="gallery-item" data-full-img="https://images.unsplash.com/photo-1542810634-71277d95dcbb?w=1200">
                                            <img src="https://images.unsplash.com/photo-1542810634-71277d95dcbb?w=500" alt="Gallery 3" className="gallery-img" />
                                            <div className="gallery-overlay"></div>
                                        </div>
                                    </li>
                                    <li className="glide__slide">
                                        <div className="gallery-item" data-full-img="https://images.unsplash.com/photo-1532629345422-7515f4d16b5a?w=1200">
                                            <img src="https://images.unsplash.com/photo-1532629345422-7515f4d16b5a?w=500" alt="Gallery 4" className="gallery-img" />
                                            <div className="gallery-overlay"></div>
                                        </div>
                                    </li>
                                    <li className="glide__slide">
                                        <div className="gallery-item" data-full-img="https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=1200">
                                            <img src="https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=500" alt="Gallery 5" className="gallery-img" />
                                            <div className="gallery-overlay"></div>
                                        </div>
                                    </li>
                                    <li className="glide__slide">
                                        <div className="gallery-item" data-full-img="https://images.unsplash.com/photo-1628102491629-778571d893a3?w=1200">
                                            <img src="https://images.unsplash.com/photo-1628102491629-778571d893a3?w=500" alt="Gallery 6" className="gallery-img" />
                                            <div className="gallery-overlay"></div>
                                        </div>
                                    </li>
                                    <li className="glide__slide">
                                        <div className="gallery-item" data-full-img="https://images.unsplash.com/photo-1510590337019-5ef2d3977e2e?w=1200">
                                            <img src="https://images.unsplash.com/photo-1510590337019-5ef2d3977e2e?w=500" alt="Gallery 7" className="gallery-img" />
                                            <div className="gallery-overlay"></div>
                                        </div>
                                    </li>
                                    <li className="glide__slide">
                                        <div className="gallery-item" data-full-img="https://images.unsplash.com/photo-1555529902-5261145633bf?w=1200">
                                            <img src="https://images.unsplash.com/photo-1555529902-5261145633bf?w=500" alt="Gallery 8" className="gallery-img" />
                                            <div className="gallery-overlay"></div>
                                        </div>
                                    </li>
                                </ul>
                            </div>

                            <div className="glide__arrows" data-glide-el="controls">
                                <button className="glide__arrow glide__arrow--left" data-glide-dir="<">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" fill="#fff" /></svg>
                                </button>
                                <button className="glide__arrow glide__arrow--right" data-glide-dir=">">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" fill="#fff" /></svg>
                                </button>
                            </div>


                        </div>

                        <div className="view-gallery-btn-wrapper">
                            <Link to="/gallery" className="btn btn-gallery-view">
                                View Full Gallery <FaArrowRight className="btn-icon" />
                            </Link>
                        </div>
                    </div>
                </section >

                {/* Get Involved Section - Visual Cards */}
                < section className="section join-section bg-light" >
                    <div className="container">
                        <h2 className="section-title text-center">Get Involved</h2>
                        <div className="join-options">
                            <JoinCard
                                image="/image.png"
                                title="Donate"
                                desc="Fuel our daily food runs and shelter maintenance."
                                btnText="Donate Now"
                                link="/donate"
                                btnClass="btn-primary"
                            />
                            <JoinCard
                                image="https://images.unsplash.com/photo-1599059813005-11265ba4b4ce?w=500"
                                title="Volunteer"
                                desc="Join us on the ground for food drives and teaching."
                                btnText="Join Us"
                                link="/volunteer"
                                btnClass="btn-secondary"
                            />
                            <JoinCard
                                image="https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=500"
                                title="Fellowship"
                                desc="Commit to a long-term leadership role."
                                btnText="Apply Now"
                                link="/fellowship"
                                btnClass="btn-primary"
                            />
                        </div>
                    </div>
                </section>

                {/* Trust Section */}
                <section className="section trust-section">
                    <div className="container text-center">
                        <h2 className="section-title">Trust & Transparency</h2>
                        <div className="trust-grid">
                            {/* Revised Trust Items using React Icons */}
                            <div className="trust-item">
                                <FaCertificate className="trust-icon" />
                                <h3>Registered NGO</h3>
                                <p>Govt Recognized</p>
                            </div>
                            <div className="trust-item">
                                <FaFileInvoiceDollar className="trust-icon" />
                                <h3>Open Reports</h3>
                                <p>Annual Audits</p>
                            </div>
                            <div className="trust-item">
                                <FaShieldAlt className="trust-icon" />
                                <h3>Secure Banking</h3>
                                <p>Transparent Funds</p>
                            </div>
                            <div className="trust-item">
                                <FaFileContract className="trust-icon" />
                                <h3>Tax Benefits</h3>
                                <p>80G Exempt</p>
                            </div>
                            <div className="trust-item">
                                <FaChartLine className="trust-icon" />
                                <h3>Verified Impact</h3>
                                <p>Real-time Tracking</p>
                            </div>
                            <div className="trust-item">
                                <FaGlobe className="trust-icon" />
                                <h3>Global Reach</h3>
                                <p>Intl. Standards</p>
                            </div>
                        </div>
                    </div>
                </section>

                <marquee style={{ background: '#1A365D', color: 'white', padding: '12px 0', fontSize: '1rem', fontWeight: 'bold' }}>
                    📊 Thousands of lives impacted through food drives, scholarships, health camps & rehabilitation programs.
                </marquee>
                <marquee behavior="alternate" style={{ background: '#f8fafc', color: '#1A365D', padding: '8px 0', fontSize: '0.9rem', fontWeight: 'bold', borderTop: '1px solid #e2e8f0' }}>
                    ❤️ Donate | Volunteer | Partner | Transform Lives
                </marquee>
                <marquee style={{ background: '#2C5282', color: 'white', padding: '10px 0', fontSize: '0.95rem', fontWeight: 'bold' }}>
                    🏛️ CSR & Government collaboration welcome | Fully compliant with NGO audit & reporting norms.
                </marquee>
            </div>
        </>
    );
};

const ProgramCard = ({ id, image, title, desc, benefit, status }) => (
    <Link to={`/programs/${id}`} className="program-card">
        <div className="program-card-img-wrapper">
            <img src={image} alt={title} className="card-img" />
            {status && <div className="program-status-badge">{status}</div>}
        </div>
        <div className="card-content">
            <h3 className="program-title">{title}</h3>
            <p className="program-desc">{desc}</p>
            <p className="program-benefit">
                <FaCheckCircle style={{ color: '#FFD700', fontSize: '1.2rem' }} />
                <span>{benefit.replace('Benefit: ', '')}</span>
            </p>
        </div>
    </Link>
);

const WhyCard = ({ image, title, desc, example }) => (
    <div className="why-card">
        <img src={image} alt={title} className="why-img" />
        <div className="why-content">
            <h3>{title}</h3>
            <p>{desc}</p>
            <p className="why-example"><em>{example}</em></p>
        </div>
    </div>
);

const JoinCard = ({ image, title, desc, btnText, link, btnClass }) => (
    <div className="join-card">
        <img src={image} alt={title} className="join-img" />
        <div className="join-content-inner">
            <h3>{title}</h3>
            <p>{desc}</p>
            <Link to={link} className={`btn ${btnClass}`}>{btnText}</Link>
        </div>
    </div>
);

const ImpactStat = ({ icon, number, label, desc }) => (
    <div className="impact-stat">
        <div className="stat-icon-wrapper">{icon}</div>
        <h3 className="stat-number">{number}</h3>
        <p className="stat-label">{label}</p>
        <p className="stat-desc">{desc}</p>
    </div>
);

export default Home;
