import React, { useState, useEffect, useRef } from 'react';
import {
    HiOutlineShieldCheck,
    HiOutlineDesktopComputer,
    HiOutlineLightBulb,
    HiOutlineAcademicCap,
    HiOutlineOfficeBuilding,
    HiOutlineBriefcase,
    HiOutlineUserGroup,
    HiOutlineArrowNarrowRight,
    HiOutlineClipboardCheck,
    HiOutlineCloud,
    HiOutlineDeviceMobile,
    HiOutlinePresentationChartLine,
    HiOutlineChatAlt2,
    HiOutlineBadgeCheck,
    HiOutlinePhone,
    HiOutlineMail,
    HiOutlineDownload,
} from 'react-icons/hi';
import { FaWhatsapp } from 'react-icons/fa';
import './Fellowship.css';
import { supabase } from '../../lib/supabase';
import { COLLEGES } from '../../data/fellowshipOptions';

// Import Assets
import heroImg from '../../assets/viksit_bharat_fellowship_hero_1768564664062.png';
import quantumImg from '../../assets/quantum_computing_track_1768564684280.png';
import cloudImg from '../../assets/cloud_computing_track_1768564703263.png';
import mobileImg from '../../assets/mobile_app_dev_track_1768564724458.png';

const colleges = COLLEGES;


const Fellowship = () => {
    console.log('Fellowship loaded, colleges count:', COLLEGES.length);
    const [formData, setFormData] = useState(() => {
        const saved = localStorage.getItem('fellowship_form_data');
        return saved ? JSON.parse(saved) : {
            student_name: '',
            aadhaar_no: '',
            dobDay: '',
            dobMonth: '',
            dobYear: '',
            email: '',
            phone: '',
            college_org: '',
            register_id: '',
            year: '',
            program: '',
            acc_holder: '',
            bank_name: '',
            acc_no: '',
            ifsc_code: '',
            utr_number: ''
        };
    });

    const [isModalOpen, setIsModalOpen] = useState(() => {
        return localStorage.getItem('fellowship_modal_open') === 'true';
    });

    const [formStep, setFormStep] = useState(() => {
        const savedStep = localStorage.getItem('fellowship_form_step');
        return savedStep ? parseInt(savedStep) : 1;
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isVerifyingUtr, setIsVerifyingUtr] = useState(false);
    const [isUtrVerified, setIsUtrVerified] = useState(() => {
        return localStorage.getItem('fellowship_utr_verified') === 'true';
    });
    const [isSubmitted, setIsSubmitted] = useState(false);

    // Auto-save form progress to prevent loss when switching apps (like UPI)
    useEffect(() => {
        localStorage.setItem('fellowship_form_data', JSON.stringify(formData));
        localStorage.setItem('fellowship_form_step', formStep.toString());
        localStorage.setItem('fellowship_modal_open', isModalOpen.toString());
        localStorage.setItem('fellowship_utr_verified', isUtrVerified.toString());
    }, [formData, formStep, isModalOpen, isUtrVerified]);

    // Lock body scroll when modal is open
    useEffect(() => {
        if (isModalOpen) {
            document.body.style.overflow = 'hidden';
            document.body.classList.add('modal-open');
        } else {
            document.body.style.overflow = '';
            document.body.classList.remove('modal-open');
        }

        return () => {
            document.body.style.overflow = '';
            document.body.classList.remove('modal-open');
        };
    }, [isModalOpen]);

    const years = Array.from({ length: 47 }, (_, i) => 2012 - i);
    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    const days = Array.from({ length: 31 }, (_, i) => i + 1);


    const [filteredColleges, setFilteredColleges] = useState([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const collegeRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (collegeRef.current && !collegeRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;

        // Account Holder Name - Text only, no numbers
        if (name === 'acc_holder') {
            const textOnly = value.replace(/[0-9]/g, '');
            setFormData(prev => ({ ...prev, [name]: textOnly }));
            return;
        }

        // Bank Name - Letters, Numbers, and Spaces ONLY
        if (name === 'bank_name') {
            const cleanValue = value.replace(/[^a-zA-Z0-9 ]/g, '');
            setFormData(prev => ({ ...prev, [name]: cleanValue }));
            return;
        }

        // IFSC Code - Alphanumeric and Uppercase for consistency
        if (name === 'ifsc_code') {
            const alphaNumericUpper = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
            if (alphaNumericUpper.length > 11) return; // Standard IFSC length
            setFormData(prev => ({ ...prev, [name]: alphaNumericUpper }));
            return;
        }

        // Enforce numeric-only for specific fields
        if (['aadhaar_no', 'phone', 'acc_no', 'utr_number'].includes(name)) {
            const numericValue = value.replace(/\D/g, ''); // Remove non-digits

            // Apply length limits
            if (name === 'aadhaar_no' && numericValue.length > 12) return;
            if (name === 'phone' && numericValue.length > 10) return;
            if (name === 'acc_no' && numericValue.length > 18) return;
            if (name === 'utr_number' && numericValue.length > 12) return;

            // Reset verification if UTR is modified
            if (name === 'utr_number') {
                setIsUtrVerified(false);
            }

            setFormData(prev => ({ ...prev, [name]: numericValue }));
            return;
        }

        if (name === 'college_org') {
            const filtered = colleges.filter(c =>
                c.toLowerCase().includes(value.toLowerCase())
            ).slice(0, 20); // Much smaller slice for better UI space
            setFilteredColleges(filtered);
            setIsDropdownOpen(value.length > 0);
        }

        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectCollege = (name) => {
        setFormData(prev => ({ ...prev, college_org: name }));
        setIsDropdownOpen(false);
    };

    const handleVerifyUtr = async () => {
        if (formData.utr_number.length !== 12) {
            alert('Please enter a valid 12-digit UTR/Transaction ID');
            return;
        }

        setIsVerifyingUtr(true);
        // Simulate bank API check/validation delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        setIsVerifyingUtr(false);
        setIsUtrVerified(true);
    };

    const handleNext = (e) => {
        e.preventDefault();
        setFormStep(prev => prev + 1);
    };

    const handleBack = () => {
        setFormStep(prev => prev - 1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isUtrVerified) {
            alert('Please verify your transaction reference before submitting.');
            return;
        }

        setIsSubmitting(true);

        try {
            const finalDob = `${formData.dobDay} ${formData.dobMonth}, ${formData.dobYear}`;
            const { data: newS, error } = await supabase.from('students').insert([{
                student_name: formData.student_name,
                aadhaar_no: formData.aadhaar_no,
                email: formData.email,
                phone: formData.phone,
                dob: finalDob,
                college_org: formData.college_org,
                student_id: String(formData.register_id),
                academic_year: String(formData.year),
                program: formData.program,
                acc_holder: formData.acc_holder,
                bank_name: formData.bank_name,
                acc_no: formData.acc_no,
                ifsc_code: formData.ifsc_code,
                utr_number: formData.utr_number,
                status: 'Pending'
            }]).select().single();

            if (error) throw error;

            // Create entry in centralized approval registry
            await supabase.from('approval_requests').insert([{
                type: 'Student Registration',
                requester_name: formData.student_name,
                requester_id: newS.id,
                amount: 500, // Registration Fee
                details: {
                    program: formData.program,
                    college: formData.college_org,
                    utr: formData.utr_number
                }
            }]);

            setIsModalOpen(false);
            setIsSubmitted(true);
            setFormStep(1);
            // Clear local storage on successful submission
            localStorage.removeItem('fellowship_form_data');
            localStorage.removeItem('fellowship_form_step');
            localStorage.removeItem('fellowship_modal_open');
            localStorage.removeItem('fellowship_utr_verified');
            window.scrollTo(0, 0);
        } catch (error) {
            console.error('Submission failed:', error);
            alert('Database Connection Error: Could not save registration. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSubmitted) {
        return (
            <div className="fellowship-page">
                <div className="success-overlay">
                    <div className="success-card">
                        <div className="success-icon-circle">✓</div>
                        <h1 className="f-section-title">Submission Confirmed</h1>
                        <p style={{ color: 'var(--f-text-muted)', marginBottom: '32px' }}>
                            Your application for the <strong>Viksit Bharat Fellowship – 2026</strong> has been received by the Academic Review Committee.
                        </p>
                        <button className="f-btn f-btn-primary" onClick={() => setIsSubmitted(false)}>Back to Program Home</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fellowship-page">
            {/* Hero Section */}
            <section className="fellowship-hero">
                <div className="hero-overlay"></div>
                <div className="f-container hero-content">
                    <div className="hero-badge-group">
                        <div className="hero-badge">Official Academic Fellowship – 2026</div>
                        <div className="hero-badge-starting">Batch Starts Tomorrow (Jan 19)</div>
                    </div>
                    <h1 className="hero-title">Viksit Bharat <br />(Developed India) @ 2047</h1>
                    <p className="hero-subtitle">
                        A flagship digital fellowship designed to empower Computer Science Engineering students in alignment with the national vision and AP Government's P4 Model.
                    </p>
                    <div className="hero-actions">
                        <button className="f-btn f-btn-primary f-lg" onClick={() => setIsModalOpen(true)}>Enroll in Program</button>
                        <a href="#overview" className="f-btn f-btn-outline f-lg">Explore Program</a>
                    </div>
                </div>
            </section>

            <marquee style={{ background: '#1a365d', color: 'white', padding: '10px 0', fontSize: '1rem', fontWeight: 'bold' }}>
                🎓 Viksit Bharath Fellowship – Empowering youth leaders for grassroots social transformation.
            </marquee>
            <marquee behavior="alternate" style={{ background: '#f8fafc', color: '#1a365d', padding: '5px 0', fontSize: '0.9rem', fontWeight: 'bold', borderBottom: '1px solid #e2e8f0' }}>
                📑 Fellowship stipend is performance & attendance based and subject to multi-level approval.
            </marquee>

            {/* 1. Program Overview */}
            <section id="overview" className="f-section overview-section">
                <div className="f-container">
                    <div className="f-two-col-grid">
                        <div className="overview-content-left">
                            <span className="f-section-tag">Program Mission</span>
                            <h2 className="f-section-title">Bridging Academia with Next-Gen Industry</h2>
                            <p style={{ fontSize: '1.125rem', color: 'var(--f-text-muted)', marginBottom: '32px' }}>
                                The <strong>Viksit Bharat Fellowship – 2026</strong> is a future-focused digital program designed exclusively for CSE students. It bridges the gap between academic learning and industry-ready skills by providing structured training in areas aligned with the <strong>Quantum Valley</strong> initiative.
                            </p>
                            <p style={{ color: 'var(--f-text-muted)', marginBottom: '40px' }}>
                                Through expert-led virtual training and hand-on projects, the program empowers students with practical exposure, innovation capabilities, and professional competence, fostering a robust talent pipeline for the digital economy.
                            </p>

                            <div className="highlights-stack">
                                <HighlightItem
                                    icon={<HiOutlineShieldCheck />}
                                    title="P4 Model Alignment"
                                    desc="Collaboratively designed under the Public-Private-People-Partnership framework."
                                />
                                <HighlightItem
                                    icon={<HiOutlineDesktopComputer />}
                                    title="Bridge the Gap"
                                    desc="Transforming academic knowledge into industry-ready technological competence."
                                />
                                <HighlightItem
                                    icon={<HiOutlineUserGroup />}
                                    title="Strategic Sovereignty"
                                    desc="Supporting national development goals and public digital infrastructure."
                                />
                            </div>
                        </div>
                        <div className="overview-visual-right">
                            <div className="image-frame">
                                <img
                                    src={heroImg}
                                    alt="Viksit Bharat Vision"
                                />
                                <div className="floating-stat-box">
                                    <span className="stat-num">2047</span>
                                    <span className="stat-label">National Vision</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="f-section-divider"></div>
            </section>

            {/* 2. Technologies Offered */}
            <section className="f-section f-bg-light">
                <div className="f-container">
                    <div className="f-section-header center">
                        <span className="f-section-tag">Technologies Offered (CSE)</span>
                        <h2 className="f-section-title">High-Demand Specialization Tracks</h2>
                        <p style={{ color: 'var(--f-text-muted)', maxWidth: '800px', margin: '0 auto' }}>Students may specialize in one tracked domain carefully selected to match future industry needs and government technology initiatives.</p>
                        <div className="f-title-divider"></div>
                    </div>

                    <div className="tech-grid">
                        <TrackCard
                            isFeatured
                            badge="Highly Recommended"
                            image={quantumImg}
                            title="A) Quantum Computing"
                            features={['Quantum Fundamentals & Qubits', 'Quantum Algorithms & Circuits', 'Real-world Research Applications']}
                            desc="Directly aligned with the AP Government's Quantum Valley Initiative."
                        />
                        <TrackCard
                            image={cloudImg}
                            title="B) Cloud Computing"
                            features={['Virtualization & Networking', 'DevOps & Scalability', 'Enterprise Cloud Solutions']}
                            desc="Focus on real-world cloud platforms and deployment models."
                        />
                        <TrackCard
                            image={mobileImg}
                            title="C) Mobile Application Development"
                            features={['Modern UI/UX Principles', 'APIs & Database Integration', 'Industry-standard Deployment']}
                            desc="Hands-on experience with modern mobile ecosystem tools."
                        />
                    </div>
                </div>
                <div className="f-section-divider"></div>
            </section>

            {/* Fellowship Structure */}
            <section className="f-section roadmap-section">
                <div className="f-container">
                    <div className="f-section-header center">
                        <span className="f-section-tag">Fellowship Structure & Duration</span>
                        <h2 className="f-section-title">A Step-by-Step Skill Pipeline</h2>
                        <p style={{ color: 'var(--f-text-muted)' }}>Combining theory, practical learning, evaluation, and hands-on exposure.</p>
                        <div className="f-title-divider"></div>
                    </div>

                    <div className="f-roadmap-grid">
                        <RoadmapCard icon={<HiOutlineDesktopComputer />} phase="Basic" title="Course Training" desc="Core fundamentals training in your chosen domain. (15 Days)" />
                        <RoadmapCard icon={<HiOutlineClipboardCheck />} phase="Basic" title="Examination" desc="Online MCQ-based evaluation of core knowledge. (1 Day)" />
                        <RoadmapCard icon={<HiOutlinePresentationChartLine />} phase="Advanced" title="Course Training" desc="Intensive advanced-level concept mastery. (15 Days)" />
                        <RoadmapCard icon={<HiOutlineClipboardCheck />} phase="Advanced" title="Examination" desc="Skill & MCQ-based test to assess professional depth. (1 Day)" />
                        <RoadmapCard icon={<HiOutlineBriefcase />} phase="Practical" title="Projects & Internship" desc="Real-world practical implementation with Stipend. (30 Days)" />
                    </div>
                </div>
                <div className="f-section-divider"></div>
            </section>

            {/* 4 & 5. Methodology & Assessment */}
            <section className="f-section f-bg-light">
                <div className="f-container">
                    <div className="f-two-col-grid">
                        <div className="methodology-box">
                            <span className="f-section-tag">Training Methodology</span>
                            <h2 className="f-section-title">Digital-First Learning</h2>
                            <ul className="f-check-list-modern">
                                <li><HiOutlinePresentationChartLine /> 100% Digital Learning Platform</li>
                                <li><HiOutlineChatAlt2 /> Expert-led Live & Recorded Sessions</li>
                                <li><HiOutlineDesktopComputer /> Hands-on Practical with Real-time Tools</li>
                                <li><HiOutlineClipboardCheck /> Continuous Real-time Assignments</li>
                                <li><HiOutlineBadgeCheck /> Industry-oriented Future Curriculum</li>
                            </ul>
                        </div>
                        <div className="assessment-box" style={{ background: 'white', padding: '50px', borderRadius: '24px', boxShadow: 'var(--f-shadow-premium)' }}>
                            <span className="f-section-tag">Assessment Process</span>
                            <h2 className="f-section-title">Ensuring Excellence</h2>
                            <p style={{ color: 'var(--f-text-muted)', marginBottom: '24px' }}>Multi-layered evaluation to ensure competence and accountability:</p>
                            <div className="assessment-steps">
                                <div className="a-step"><HiOutlineClipboardCheck className="a-icon" /> Mandatory Practical Assignments</div>
                                <div className="a-step"><HiOutlinePresentationChartLine className="a-icon" /> Project-based Performance Evaluation</div>
                                <div className="a-step"><HiOutlineDesktopComputer className="a-icon" /> Online Digital Examination</div>
                            </div>
                            <p style={{ marginTop: '24px', fontSize: '0.875rem', padding: '12px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', color: 'var(--f-success)', fontWeight: 700 }}>
                                * Qualification is mandatory for the Internship & Stipend phase.
                            </p>
                        </div>
                    </div>
                </div>
                <div className="f-section-divider"></div>
            </section>

            {/* 6 & 7. Stipend & Industrial Exposure */}
            <section className="f-section f-bg-dark">
                <div className="f-container">
                    <div className="stipend-executive-wrap">
                        <div className="stipend-content">
                            <span className="f-section-tag" style={{ color: 'var(--f-secondary)' }}>Internship & Stipend</span>
                            <h2 className="f-section-title" style={{ color: 'white' }}>Performance Rewards</h2>
                            <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '40px' }}>
                                Designed to motivate consistency, and mastery. Minimum 50% digital class attendance is mandatory for stipend qualification.
                            </p>

                            <div className="stipend-tiers">
                                <div className="tier-row highlighted">
                                    <span className="tier-name">80% & Above Scoring</span>
                                    <span className="tier-amount">₹2,000 <small>/ month</small></span>
                                </div>
                                <div className="tier-row">
                                    <span className="tier-name">70% – 79% Scoring</span>
                                    <span className="tier-amount">₹1,500 <small>/ month</small></span>
                                </div>
                                <div className="tier-row">
                                    <span className="tier-name">50% – 69% Scoring</span>
                                    <span className="tier-amount">₹1,000 <small>/ month</small></span>
                                </div>
                            </div>
                        </div>

                        <div className="industrial-exposure-box">
                            <span className="f-section-tag" style={{ color: 'var(--f-accent)' }}>Industrial Exposure</span>
                            <div className="exposure-header">
                                <HiOutlineOfficeBuilding className="exposure-icon" />
                                <h3 style={{ color: 'white' }}>Free Industrial Visit</h3>
                            </div>
                            <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '32px' }}>Gain insights into industry workflows and professional environments at selected technology facilities.</p>
                            <ul className="exposure-list">
                                <li>Real-world workflow visualization</li>
                                <li>Corporate environment exposure</li>
                                <li>Real-time technology applications</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* 9 & 10. Outcomes & Benefits */}
            <section className="f-section">
                <div className="f-container">
                    <div className="f-section-header center">
                        <span className="f-section-tag">Certification & Outcomes</span>
                        <h2 className="f-section-title">Professional Certification</h2>
                        <div className="f-title-divider"></div>
                    </div>

                    <div className="institutional-grid">
                        <BenefitItem icon={<HiOutlineBadgeCheck />} title="Fellowship Certificate" desc="Viksit Bharat Fellowship Certificate – 2026." />
                        <BenefitItem icon={<HiOutlineBriefcase />} title="Internship Certificate" desc="Official Internship Completion Certificate." />
                        <BenefitItem icon={<HiOutlineDesktopComputer />} title="Hands-on Projects" desc="Real practical experience in advanced tech." />
                        <BenefitItem icon={<HiOutlineBadgeCheck />} title="Digital Skills" desc="Enhanced employability and innovation capacity." />
                    </div>

                    <div style={{ marginTop: '120px' }}>
                        <div className="f-section-header center">
                            <span className="f-section-tag">Benefits to Colleges</span>
                            <h2 className="f-section-title">Institutional Advantages</h2>
                            <div className="f-title-divider"></div>
                        </div>
                        <div className="institutional-grid">
                            <BenefitItem icon={<HiOutlineArrowNarrowRight />} title="Skill Parity" desc="Bridge curriculum gaps with market needs." />
                            <BenefitItem icon={<HiOutlineUserGroup />} title="Govt Alignment" desc="Support state-level digital initiatives like Quantum Valley." />
                            <BenefitItem icon={<HiOutlineLightBulb />} title="Employment" desc="Boost placements via structured certifications." />
                            <BenefitItem icon={<HiOutlineShieldCheck />} title="Recognition" desc="Collaborate with Govt & industry technology boards." />
                        </div>
                    </div>
                </div>
                <div className="f-section-divider"></div>
            </section>

            {/* 11. Alignment with Government Vision */}
            <section className="f-section f-bg-light">
                <div className="f-container">
                    <div className="f-section-header center">
                        <span className="f-section-tag">Alignment with Government Vision</span>
                        <h2 className="f-section-title">Strategic Frameworks</h2>
                        <div className="f-title-divider"></div>
                    </div>
                    <div className="institutional-grid">
                        <BenefitItem icon={<HiOutlineBadgeCheck />} title="Viksit Bharat Mission" desc="Building a skilled, innovation-driven youth workforce." />
                        <BenefitItem icon={<HiOutlineLightBulb />} title="Quantum Valley" desc="Promoting next-gen research and digital leadership." />
                        <BenefitItem icon={<HiOutlineUserGroup />} title="P4 Model" desc="Ensuring collaborative participation (P-P-P-P)." />
                        <BenefitItem icon={<HiOutlineShieldCheck />} title="Digital Inclusion" desc="Technological empowerment across academic ecosystems." />
                    </div>


                </div>
            </section>

            {/* 12. Conclusion & Registration */}
            <section className="f-section">
                <div className="f-container">
                    <div className="conclusion-block" style={{ textAlign: 'center', marginBottom: '80px', maxWidth: '900px', margin: '0 auto 80px' }}>
                        <span className="f-section-tag">Conclusion</span>
                        <h2 className="f-section-title">Equip Yourself for the Future</h2>
                        <p style={{ fontSize: '1.125rem', color: 'var(--f-text-muted)' }}>
                            The <strong>Viksit Bharat Fellowship – 2026</strong> is a high-impact program designed to equip students with future-ready skills, hands-on exposure, and financial support, contributing to nation-building and India's long-term development goals.
                        </p>
                    </div>

                    <div className="premium-cta-card">
                        <div className="cta-info">
                            <span style={{ fontSize: '0.875rem', fontWeight: 800, textTransform: 'uppercase', opacity: 0.8 }}>Registration Portal</span>
                            <h2>Apply for the 2026 Fellowship</h2>
                            <p>Registration Fee: ₹500 (Includes platform access, complete digital materials, assignments & certification)</p>
                        </div>
                        <div className="cta-actions">
                            <button className="f-btn-premium" onClick={() => setIsModalOpen(true)}>
                                Enroll Now <HiOutlineArrowNarrowRight />
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Fellowship Helpline */}
            <section className="f-section f-bg-light">
                <div className="f-container">
                    <div className="f-section-header center">
                        <span className="f-section-tag">Support</span>
                        <h2 className="f-section-title">Fellowship Helpline & Inquiries</h2>
                        <p style={{ color: 'var(--f-text-muted)' }}>Have questions about the fellowship? Our dedicated team is here to help you.</p>
                        <div className="f-title-divider"></div>
                    </div>
                    <div className="institutional-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', justifyContent: 'center' }}>
                        <div className="institutional-card" style={{ textAlign: 'center' }}>
                            <div className="inst-icon"><HiOutlinePhone /></div>
                            <h4 style={{ fontWeight: 800 }}>Call / WhatsApp</h4>
                            <p><a href="https://wa.me/919490991752?text=Hello!%20I%20have%20an%20inquiry%20regarding%20the%20Fellowship%20Program." target="_blank" rel="noopener noreferrer" style={{ color: 'var(--f-primary)', textDecoration: 'none', fontSize: '1.25rem', fontWeight: 700 }}>+91 94909 91752</a></p>
                        </div>
                        <div className="institutional-card" style={{ textAlign: 'center' }}>
                            <div className="inst-icon"><HiOutlineMail /></div>
                            <h4 style={{ fontWeight: 800 }}>Email Us</h4>
                            <p><a href="mailto:fellowship@bharathcaresindia.org" style={{ color: 'var(--f-primary)', textDecoration: 'none', fontSize: '1.1rem', fontWeight: 600 }}>fellowship@bharathcaresindia.org</a></p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Modal */}
            {isModalOpen && (
                <div className="modal-overlay" onClick={() => {
                    // Prevent accidental closing on overlay tap, especially for payment steps
                    if (formStep < 4) {
                        if (window.confirm("Do you want to close the form? Your progress will be saved.")) {
                            setIsModalOpen(false);
                        }
                    } else {
                        // On step 4, be even more strict
                        if (window.confirm("Are you sure? You are at the final payment step. Your progress will be saved.")) {
                            setIsModalOpen(false);
                        }
                    }
                }}>
                    <div className="modal-container" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            {formStep > 1 && (
                                <button
                                    type="button"
                                    className="back-arrow-btn"
                                    onClick={handleBack}
                                    title="Go Back"
                                >
                                    <HiOutlineArrowNarrowRight style={{ transform: 'rotate(180deg)' }} />
                                </button>
                            )}
                            <div>
                                <h2>Fellowship Application</h2>
                                <div className="step-dots">
                                    <span className={formStep >= 1 ? 'active' : ''}></span>
                                    <span className={formStep >= 2 ? 'active' : ''}></span>
                                    <span className={formStep >= 3 ? 'active' : ''}></span>
                                    <span className={formStep >= 4 ? 'active' : ''}></span>
                                </div>
                            </div>
                            <button type="button" className="close-btn" onClick={() => {
                                if (window.confirm("Close registration form? Your data is saved locally.")) {
                                    setIsModalOpen(false);
                                }
                            }}>&times;</button>
                        </div>
                        <div className="modal-body">
                            <form className="formal-form" onSubmit={formStep === 4 ? handleSubmit : handleNext}>
                                {formStep === 1 && (
                                    <div className="form-grid-section animate-slide">
                                        <h4 className="form-sub-header">Student Identification</h4>
                                        <div className="form-row-2">
                                            <div className="form-group"><label>Name (on Aadhaar)</label><input type="text" name="student_name" value={formData.student_name} onChange={handleChange} required placeholder="Enter Full Name" /></div>
                                            <div className="form-group"><label>Aadhaar No</label><input type="text" name="aadhaar_no" value={formData.aadhaar_no} onChange={handleChange} required placeholder="12 Digit Number" inputMode="numeric" pattern="[0-9]{12}" maxLength="12" /></div>
                                        </div>
                                        <div className="form-group" style={{ marginBottom: '12px' }}>
                                            <label>Date of Birth</label>
                                            <div className="dob-grid">
                                                <select name="dobDay" value={formData.dobDay} onChange={handleChange} required>
                                                    <option value="">Day</option>
                                                    {days.map(d => <option key={d} value={d}>{d}</option>)}
                                                </select>
                                                <select name="dobMonth" value={formData.dobMonth} onChange={handleChange} required>
                                                    <option value="">Month</option>
                                                    {months.map(m => <option key={m} value={m}>{m}</option>)}
                                                </select>
                                                <select name="dobYear" value={formData.dobYear} onChange={handleChange} required>
                                                    <option value="">Year</option>
                                                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="form-group"><label>Personal Email</label><input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="example@domain.com" pattern="[^@\s]+@[^@\s]+\.[^@\s]+" title="Please enter a valid email address (e.g., name@domain.com)" /></div>
                                        <div className="form-row-1">
                                            <div className="form-group"><label>Contact No</label><input type="tel" name="phone" value={formData.phone} onChange={handleChange} required placeholder="10 Digit Mobile No" inputMode="tel" pattern="[0-9]{10}" maxLength="10" /></div>
                                        </div>
                                    </div>
                                )}

                                {formStep === 2 && (
                                    <div className="form-grid-section animate-slide">
                                        <h4 className="form-sub-header">Academic Details</h4>
                                        <div className="form-row-1">
                                            <div className="form-group" style={{ position: 'relative' }} ref={collegeRef}>
                                                <label>College Name</label>
                                                <input
                                                    type="text"
                                                    name="college_org"
                                                    value={formData.college_org}
                                                    onChange={handleChange}
                                                    required
                                                    placeholder="Search or Type Your College Name"
                                                    autoComplete="off"
                                                    style={isDropdownOpen && filteredColleges.length > 0 ? {
                                                        borderRadius: '12px 12px 0 0',
                                                        borderBottomColor: 'transparent'
                                                    } : {}}
                                                />

                                                {isDropdownOpen && filteredColleges.length > 0 && (
                                                    <div className="custom-autocomplete-dropdown">
                                                        {filteredColleges.slice(0, 20).map((name, idx) => (
                                                            <div
                                                                key={idx}
                                                                className="autocomplete-item"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleSelectCollege(name);
                                                                }}
                                                            >
                                                                {name}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                <small style={{ display: 'block', marginTop: '4px', opacity: 0.7, fontSize: '0.75rem' }}>
                                                    * If your college is not in the list, please type it manually.
                                                </small>
                                            </div>
                                        </div>
                                        <div className="form-row-2">
                                            <div className="form-group"><label>Register ID / Roll No</label><input type="text" name="register_id" value={formData.register_id} onChange={handleChange} required placeholder="e.g. 21BCS101" /></div>
                                            <div className="form-group">
                                                <label>Current Year</label>
                                                <select name="year" value={formData.year} onChange={handleChange} required>
                                                    <option value="">Select Year</option>
                                                    <option>1st Year</option><option>2nd Year</option><option>3rd Year</option><option>4th Year</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="form-row-1">
                                            <div className="form-group">
                                                <label>Domain Specialization</label>
                                                <select name="program" value={formData.program} onChange={handleChange} required>
                                                    <option value="">Select Track</option>
                                                    <option>Quantum Computing</option><option>Cloud Computing</option><option>Mobile App Dev</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {formStep === 3 && (
                                    <div className="form-grid-section animate-slide">
                                        <h4 className="form-sub-header">Bank Disbursement Info</h4>
                                        <div className="form-row-2">
                                            <div className="form-group"><label>Account Holder Name</label><input type="text" name="acc_holder" value={formData.acc_holder} onChange={handleChange} required placeholder="Name on Passbook" /></div>
                                            <div className="form-group"><label>Bank Name</label><input type="text" name="bank_name" value={formData.bank_name} onChange={handleChange} required placeholder="Bank Branch Name" pattern="[A-Za-z0-9 ]+" title="Letters, numbers and spaces are allowed" /></div>
                                        </div>
                                        <div className="form-row-2">
                                            <div className="form-group"><label>Account No</label><input type="text" name="acc_no" value={formData.acc_no} onChange={handleChange} required inputMode="numeric" pattern="[0-9]*" placeholder="11-18 Digit No" /></div>
                                            <div className="form-group"><label>IFSC Code</label><input type="text" name="ifsc_code" value={formData.ifsc_code} onChange={handleChange} required placeholder="SBIN0001234" /></div>
                                        </div>
                                    </div>
                                )}

                                {formStep === 4 && (
                                    <div className="form-grid-section animate-slide">
                                        <h4 className="form-sub-header">Payment Verification</h4>
                                        <div className="payment-instruction-box" style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid var(--f-border)', marginBottom: '20px' }}>
                                            <div style={{ textAlign: 'center', marginBottom: '15px' }}>
                                                <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--f-primary)', marginBottom: '8px' }}>Scan QR to Pay Registration Fee</p>
                                                <p style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--f-secondary)' }}>₹500.00</p>
                                            </div>
                                            <div className="qr-container-mini" style={{ textAlign: 'center', marginBottom: '15px' }}>
                                                <img
                                                    src="/Bharath Cares Life Line_qr_code.png"
                                                    alt="Payment QR Code"
                                                    style={{ width: '150px', height: '150px', borderRadius: '8px', border: '1px solid #eee' }}
                                                />
                                            </div>
                                            <div style={{ textAlign: 'center' }}>
                                                <p style={{ fontSize: '0.75rem', color: 'var(--f-text-muted)' }}>UPI ID: <strong style={{ color: 'var(--f-dark)' }}>bclftrust@indianbk</strong></p>
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label>Enter Transaction UTR / Ref No</label>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <input
                                                    type="text"
                                                    name="utr_number"
                                                    value={formData.utr_number}
                                                    onChange={handleChange}
                                                    required
                                                    placeholder="12 Digit Transaction ID"
                                                    maxLength="12"
                                                    inputMode="numeric"
                                                    style={{ flex: 1 }}
                                                    disabled={isUtrVerified || isVerifyingUtr}
                                                />
                                                {!isUtrVerified ? (
                                                    <button
                                                        type="button"
                                                        className={`f-btn f-btn-primary ${formData.utr_number.length === 12 && !isVerifyingUtr ? 'pulse-primary' : ''}`}
                                                        onClick={handleVerifyUtr}
                                                        disabled={formData.utr_number.length !== 12 || isVerifyingUtr}
                                                        style={{ padding: '0 20px', fontSize: '0.85rem', minWidth: '100px' }}
                                                    >
                                                        {isVerifyingUtr ? 'Validating...' : 'Verify'}
                                                    </button>
                                                ) : (
                                                    <div style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        background: '#ecfdf5',
                                                        color: '#059669',
                                                        padding: '0 15px',
                                                        borderRadius: '8px',
                                                        fontSize: '0.75rem',
                                                        fontWeight: 700,
                                                        border: '1px solid #10b981'
                                                    }}>
                                                        <span style={{ fontSize: '1rem', marginRight: '4px' }}>✓</span> Logged
                                                    </div>
                                                )}
                                            </div>
                                            {isUtrVerified && (
                                                <p style={{ margin: '8px 0 0', color: '#059669', fontSize: '0.75rem', fontWeight: 600 }}>
                                                    Your payment reference is ready for administrative review.
                                                </p>
                                            )}
                                            <small style={{ display: 'block', marginTop: '6px', color: 'var(--f-text-muted)', fontSize: '0.7rem' }}>
                                                * Mandatory: Enter the 12-digit UTR number from your payment confirmation.
                                            </small>
                                        </div>
                                    </div>
                                )}

                                <div style={{ marginBottom: '16px', textAlign: 'center' }}>
                                    <a
                                        href="/documents/APSCHE_Fellowship_Notification.pdf"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            fontSize: '0.85rem',
                                            color: 'var(--f-primary)',
                                            fontWeight: 600,
                                            textDecoration: 'underline'
                                        }}
                                    >
                                        <HiOutlineDownload style={{ fontSize: '1rem' }} />
                                        Download Official APSCHE Notification (PDF)
                                    </a>
                                </div>

                                <div className="form-support-notice">
                                    <HiOutlinePhone className="support-mini-icon" />
                                    <span>Fellowship Helpline: <strong>+91 94909 91752</strong> (Call/WhatsApp)</span>
                                </div>

                                <div className="form-footer-compact">
                                    {formStep > 1 && (
                                        <button type="button" disabled={isSubmitting} className="f-btn f-btn-outline-modal" onClick={handleBack}>
                                            Back
                                        </button>
                                    )}
                                    <button
                                        type="submit"
                                        disabled={isSubmitting || (formStep === 4 && !isUtrVerified)}
                                        className="f-btn f-btn-primary"
                                    >
                                        {isSubmitting ? 'Processing...' : (formStep === 4 ? 'Submit Application' : 'Continue to Next Step')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Floating WhatsApp Button */}
            <a
                href="https://wa.me/919490991752?text=Hello!%20I%20have%20an%20inquiry%20regarding%20the%20Viksit%20Bharat%20Fellowship%20Program%202026."
                target="_blank"
                rel="noopener noreferrer"
                className="floating-whatsapp-btn"
                title="Chat with us on WhatsApp"
            >
                <FaWhatsapp className="whatsapp-icon" />
            </a>
        </div>
    );
};

/* Components */
const HighlightItem = ({ icon, title, desc }) => (
    <div className="highlight-row">
        <div className="icon-box-formal">{icon}</div>
        <div className="text-box-formal">
            <h4 style={{ fontWeight: 800 }}>{title}</h4>
            <p>{desc}</p>
        </div>
    </div>
);

const TrackCard = ({ image, title, features, desc, isFeatured, badge }) => (
    <div className={`tech-card-formal ${isFeatured ? 'featured' : ''}`}>
        {badge && <span className="tech-badge-formal">{badge}</span>}
        <div className="card-img-wrap"><img src={image} alt={title} /></div>
        <div className="card-info-wrap">
            <h3 style={{ fontSize: '1.25rem' }}>{title}</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--f-text-muted)', marginBottom: '20px' }}>{desc}</p>
            <ul className="feature-list-formal">
                {features.map((f, i) => <li key={i}>{f}</li>)}
            </ul>
        </div>
    </div>
);

const RoadmapCard = ({ phase, icon, title, desc }) => (
    <div className="roadmap-card-formal">
        {phase && <div className="roadmap-phase-indicator">{phase}</div>}
        <div className="roadmap-header">
            <div className="step-circle">
                <span className="step-icon">{icon}</span>
            </div>
        </div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 900, marginBottom: '16px' }}>{title}</h3>
        <p style={{ fontSize: '0.875rem', color: 'var(--f-text-muted)', lineHeight: '1.6' }}>{desc}</p>
    </div>
);

const BenefitItem = ({ icon, title, desc }) => (
    <div className="institutional-card">
        <div className="inst-icon">{icon}</div>
        <h4 style={{ fontWeight: 800 }}>{title}</h4>
        <p>{desc}</p>
    </div>
);

export default Fellowship;
