import React, { useState } from 'react';
import { FaUtensils, FaHome, FaTools, FaBookMedical, FaCheckCircle, FaFileContract, FaEye, FaArrowRight, FaUniversity, FaMoneyCheckAlt, FaBuilding, FaQrcode, FaHandHoldingHeart, FaCopy } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import './Donate.css';

const Donate = () => {
    const [amount, setAmount] = useState('1000');
    const [customAmount, setCustomAmount] = useState('');

    const handleAmountSelect = (val) => {
        setAmount(val);
        setCustomAmount(val.toString());
    };

    const handleCustomChange = (e) => {
        const val = e.target.value;
        if (val < 0) return; // Prevent negative input
        setCustomAmount(val);
        setAmount(val);
    };

    const [isSubmitted, setIsSubmitted] = useState(false);

    // Function to handle copying UPI ID
    const copyToClipboard = () => {
        navigator.clipboard.writeText('bclftrust@indianbk');
        alert('UPI ID copied to clipboard!');
    };

    const handleSubmit = (e) => {
        if (e) e.preventDefault();
        const numAmount = parseFloat(amount);

        if (!numAmount || numAmount <= 0) {
            alert("Please select or enter a valid amount.");
            return;
        }

        // IMPORTANT: Most Indian banks limit 'UPI Intent' (clicking a button) to ₹2,000 
        // to prevent fraud. For higher amounts, physical QR scanning is REQUIRED.
        if (numAmount > 2000) {
            alert(`Due to banking security limits on web-links, payments above ₹2,000 should be made by scanning the QR code directly. Your amount (₹${numAmount}) is ready for scanning below.`);
            // Scroll to QR section
            const upiSection = document.querySelector('.donate-upi-section');
            if (upiSection) {
                upiSection.scrollIntoView({ behavior: 'smooth' });
            }
            return;
        }

        const payeeAddress = 'bclftrust@indianbk';
        const payeeName = 'BHARATH CARES LIFE LINE';
        const formattedAmount = numAmount.toFixed(2);
        const trRef = `BCLLF${Date.now().toString().slice(-6)}`;

        const upiLink = `upi://pay?pa=${payeeAddress}&pn=${encodeURIComponent(payeeName)}&am=${formattedAmount}&cu=INR&mc=8398&tr=${trRef}&mode=02&purpose=00`;

        window.location.href = upiLink;
        setIsSubmitted(true);
    };

    if (isSubmitted) {
        return (
            <div className="donate-page">
                <section className="donate-hero">
                    <div className="container" style={{ position: 'relative', zIndex: 10 }}>
                        <h1>Thank You for Your Support!</h1>
                        <p>Your contribution helps us continue our mission of rehabilitation and dignity.</p>
                        <div style={{ marginTop: '30px' }}>
                            <p style={{ marginBottom: '20px', color: '#ffffff', opacity: 0.8 }}>Please share the transaction ID with info@bcllf.org for your 80G receipt.</p>
                            <button className="btn btn-primary" onClick={() => { setIsSubmitted(false); window.scrollTo(0, 0); }}>Back to Donate</button>
                        </div>
                    </div>
                </section>
            </div>
        );
    }

    const upiLink = `upi://pay?pa=bclftrust@indianbk&pn=Bharath Cares Life Line&am=${amount}&cu=INR`;

    return (
        <div className="donate-page">
            {/* 1. HERO - Simple, Trust-first */}
            <section className="donate-hero">
                <div className="container">
                    <h1>Support Our Work</h1>
                    <p>Your contribution helps rehabilitate lives and build long-term dignity — not dependency.</p>
                </div>
            </section>

            <div className="donate-layout container">
                {/* LEFT COLUMN - Main Content */}
                <div className="donate-main-content">

                    {/* 1. DONATE VIA UPI - Top Priority */}
                    <section className="donate-upi-section" style={{ paddingTop: '30px', paddingBottom: '60px', borderBottom: '1px solid #eee' }}>
                        <h2 className="section-title">Scan to Donate</h2>
                        <div className="upi-container">
                            {/* Left: QR Visual */}
                            <div className="upi-qr-block">
                                <div className="qr-frame">
                                    <img src="/Bharath%20Cares%20Life%20Line_qr_code.png" alt="Scan to Donate" />
                                </div>
                                <div className="scan-tag">
                                    <FaQrcode /> Scan via any App
                                </div>
                            </div>

                            {/* Right: Info & Actions */}
                            <div className="upi-details-block">
                                <div className="id-group">
                                    <label>Official UPI-ID</label>
                                    <div className="code-box">
                                        <span>bclftrust@indianbk</span>
                                        <button className="btn-copy" onClick={copyToClipboard} title="Copy UPI ID">
                                            <FaCopy />
                                        </button>
                                    </div>
                                </div>

                                <div className="merchant-info">
                                    <h4>Bharath Cares Life Line Foundation</h4>
                                    <p><FaUniversity className="info-icon" /> Indian Bank &bull; Verified Business</p>
                                </div>

                                <div className="apps-group">
                                    <span>Supported Apps:</span>
                                    <div className="app-icons">
                                        <img src="/gpay-logo.png" alt="Google Pay" title="Google Pay" />
                                        <img src="/phonepe-logo.png" alt="PhonePe" title="PhonePe" />
                                        <img src="/paytm-logo.png" alt="Paytm" title="Paytm" />
                                        <span className="plus-more">+ BHIM & More</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* MOVED: OTHER METHODS (Bank, Cheque, CSR) - Top Priority */}
                    <section className="donate-other" style={{ paddingTop: '60px', paddingBottom: '60px' }}>
                        <div className="other-methods-grid">
                            <div className="method-card">
                                <h3><FaUniversity /> Bank Transfer</h3>
                                <div className="method-details">
                                    <p><strong>Account Name:</strong> Bharath Cares Life Line Foundation</p>
                                    <p><strong>Bank:</strong> INDIAN BANK</p>
                                    <p><strong>Account No:</strong> 8139736308</p>
                                    <p><strong>IFSC Code:</strong> IDIB000M604</p>
                                    <p><strong>Branch:</strong> Mangalagiri, Guntur</p>
                                </div>
                            </div>
                            <div className="method-card">
                                <h3><FaMoneyCheckAlt /> Cheque / DD</h3>
                                <div className="method-details">
                                    <p>Payable to: <strong>Bharath Cares Life Line Foundation</strong></p>
                                    <p>Send to our registered office address.</p>
                                </div>
                            </div>
                            <div className="method-card">
                                <h3><FaBuilding /> CSR / Institutional</h3>
                                <div className="method-details">
                                    <p>For CSR partnerships or bulk donations, please contact:</p>
                                    <p><strong>info@bcllf.org</strong></p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* 2. WHY DONATIONS MATTER */}
                    <section className="donate-why">
                        <div className="impact-strip">
                            <div className="impact-item">
                                <div className="impact-header">
                                    <span className="impact-number">01</span>
                                    <FaHandHoldingHeart className="impact-icon-small" />
                                </div>
                                <p>Funds structured rehabilitation</p>
                            </div>
                            <div className="impact-divider"></div>
                            <div className="impact-item">
                                <div className="impact-header">
                                    <span className="impact-number">02</span>
                                    <FaTools className="impact-icon-small" />
                                </div>
                                <p>Supports long-term skilling</p>
                            </div>
                            <div className="impact-divider"></div>
                            <div className="impact-item">
                                <div className="impact-header">
                                    <span className="impact-number">03</span>
                                    <FaFileContract className="impact-icon-small" />
                                </div>
                                <p>Enables transparent social work</p>
                            </div>
                        </div>
                    </section>

                    {/* 3. HOW YOUR DONATION IS USED - Bento Mosaic */}
                    <section className="donate-usage">
                        <h2 className="section-title">Where The Money Goes</h2>
                        <div className="bento-grid">
                            {/* Card 1: Large (Top Left) - Healthcare (Needs space) */}
                            <div className="bento-card large dark-bg">
                                <div className="bento-content">
                                    <FaBookMedical className="bento-icon gold" />
                                    <h3>Healthcare & Education</h3>
                                    <p>Medical camps and child education support.</p>
                                </div>
                            </div>

                            {/* Card 2: Tall (Right Column) - Shelter */}
                            <div className="bento-card tall gold-bg">
                                <div className="bento-content">
                                    <FaHome className="bento-icon dark" />
                                    <h3>Shelter & Safety</h3>
                                    <p>Safe housing for rehabilitation.</p>
                                </div>
                            </div>

                            {/* Card 3: Small (Bottom Left) - Meals (Fits nicely) */}
                            <div className="bento-card wide blue-gradient">
                                <div className="bento-content">
                                    <FaUtensils className="bento-icon" />
                                    <h3>Meals & Nutrition</h3>
                                    <p>Providing daily sustenance.</p>
                                </div>
                            </div>

                            {/* Card 4: Small (Bottom Middle) - Skills */}
                            <div className="bento-card white-bg">
                                <div className="bento-content">
                                    <FaTools className="bento-icon blue" />
                                    <h3>Skill Training</h3>
                                    <p>Vocational workshops.</p>
                                </div>
                            </div>
                        </div>
                    </section>





                    {/* 6. TRANSPARENCY */}
                    <section className="donate-transparency">
                        <div className="trust-badges">
                            <div className="trust-item">
                                <FaBuilding className="trust-icon" />
                                <span>Registered NGO</span>
                            </div>
                            <div className="trust-item">
                                <FaFileContract className="trust-icon" />
                                <span>Transparent Reporting</span>
                            </div>
                            <div className="trust-item">
                                <FaEye className="trust-icon" />
                                <span>Monitored Programs</span>
                            </div>
                        </div>
                        <Link to="/reports" className="btn-report">
                            View Reports <FaArrowRight />
                        </Link>
                    </section>
                </div>

                {/* RIGHT COLUMN - Sticky Sidebar */}
                <div className="donate-sidebar">
                    <div className="donation-widget-sticky">
                        <h3 style={{ marginBottom: '20px', color: '#1a237e', fontWeight: '800' }}>Make a Donation</h3>
                        <div className="amount-pills">
                            {[500, 1000, 2000, 5000].map((val) => (
                                <button
                                    key={val}
                                    className={`pill-btn ${amount == val ? 'active' : ''}`}
                                    onClick={() => handleAmountSelect(val)}
                                >
                                    ₹{val}
                                </button>
                            ))}
                        </div>

                        <div className="custom-input-group">
                            <span className="currency-symbol">₹</span>
                            <input
                                type="number"
                                min="1"
                                placeholder="Enter amount"
                                value={customAmount}
                                onChange={handleCustomChange}
                                className="amount-input"
                            />
                        </div>

                        <button onClick={handleSubmit} className="donate-submit-btn" style={{ border: 'none', width: '100%', cursor: 'pointer' }}>
                            {parseFloat(amount) > 2000 ? 'Scan QR to Pay' : `Donate ₹${amount || '0'}`} <FaArrowRight />
                        </button>

                        {parseFloat(amount) > 2000 && (
                            <p style={{ fontSize: '0.75rem', color: '#d32f2f', textAlign: 'center', marginTop: '-10px', marginBottom: '15px' }}>
                                Note: Amounts above ₹2,000 require a QR scan for security.
                            </p>
                        )}

                        <div style={{ marginTop: '15px', textAlign: 'center' }}>
                            <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '8px' }}>Button not working? Use manual mode:</p>
                            <button
                                onClick={copyToClipboard}
                                className="btn-small"
                                style={{
                                    background: '#f1f3f5',
                                    color: 'var(--primary)',
                                    width: '100%',
                                    padding: '10px',
                                    borderRadius: '8px',
                                    fontSize: '0.85rem',
                                    fontWeight: '700',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    border: '1px solid #e2e8f0'
                                }}
                            >
                                <FaCopy /> Copy UPI ID: bclftrust@indianbk
                            </button>
                        </div>

                        <p className="secure-note" style={{ marginTop: '15px' }}><FaCheckCircle /> Secure UPI Payment</p>

                        <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #eee' }}>
                            <p style={{ fontSize: '0.9rem', color: '#555', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}>
                                <FaFileContract style={{ color: 'var(--primary)' }} /> 80G Tax Exempt
                            </p>
                            <p style={{ fontSize: '0.8rem', color: '#777', marginTop: '5px' }}>
                                All donations are eligible for tax exemption under Indian Income Tax Act.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Note */}
            <div className="donate-note">
                <p>After donating, share ref no. for receipt. Thank you for your support.</p>
            </div>
        </div>
    );
};

export default Donate;
