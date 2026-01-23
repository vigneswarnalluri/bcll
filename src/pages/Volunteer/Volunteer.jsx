import React, { useState } from 'react';
import {
    FaHandHoldingHeart, FaChalkboardTeacher, FaUserInjured,
    FaNotesMedical, FaPoll, FaLaptop, FaCheckCircle,
    FaRegIdCard, FaHandsHelping, FaBalanceScale, FaUserFriends,
    FaUsers, FaFileAlt, FaBullhorn, FaClipboardCheck,
    FaIdCard, FaCertificate, FaUserGraduate, FaChartLine,
    FaBriefcase, FaUserClock, FaHeart,
    FaGavel, FaBan, FaHandshake, FaUserShield, FaMoneyBillWave
} from 'react-icons/fa';
import './Volunteer.css';
import { supabase } from '../../lib/supabase';

const Volunteer = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        mobile: '',
        bg: '',
        dob: '',
        address: '',
        interest: 'Food Distribution'
    });
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const { data: newV, error } = await supabase.from('volunteers').insert([{
                full_name: formData.name,
                email: formData.email,
                phone: formData.mobile,
                dob: formData.dob,
                blood_group: formData.bg,
                address: formData.address,
                area_of_interest: formData.interest,
                status: 'New'
            }]).select().single();

            if (error) throw error;

            // Create entry in centralized approval registry
            await supabase.from('approval_requests').insert([{
                type: 'Volunteer Registration',
                requester_name: formData.name,
                requester_id: newV.id,
                details: {
                    interest: formData.interest,
                    mobile: formData.mobile,
                    email: formData.email
                }
            }]);

            setIsSubmitted(true);
        } catch (error) {
            console.error('Submission failed:', error);
            alert('Failed to submit application. Please try again.');
        }
    };

    if (isSubmitted) {
        return (
            <div className="volunteer-page">
                <div className="page-header volunteer-header">
                    <div className="container">
                        <h1>Thank You!</h1>
                        <p>Your volunteer application has been received. Our team will contact you shortly.</p>
                        <button className="btn btn-primary" onClick={() => setIsSubmitted(false)} style={{ marginTop: '20px' }}>Register Another</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="volunteer-page">
            {/* 1. HERO */}
            <div className="page-header volunteer-header">
                <div className="container">
                    <h1>Volunteer With Us</h1>
                    <p>Be part of structured social work that restores dignity and builds long-term impact.</p>
                </div>
            </div>

            <div className="container section">
                <div className="volunteer-layout">

                    {/* LEFT CONTENT COLUMN */}
                    <div className="volunteer-content">

                        {/* 2. WHY VOLUNTEER */}
                        <section className="v-section">
                            <h2>Why Volunteer With Bharath Cares?</h2>
                            <div className="v-grid-2">
                                <div className="v-card-icon">
                                    <FaHandsHelping className="v-icon" />
                                    <div>
                                        <h3>Real Impact</h3>
                                        <p>Work on real, on-ground social programs.</p>
                                    </div>
                                </div>
                                <div className="v-card-icon">
                                    <FaBalanceScale className="v-icon" />
                                    <div>
                                        <h3>Structured Work</h3>
                                        <p>Learn structured rehabilitation & development work.</p>
                                    </div>
                                </div>
                                <div className="v-card-icon">
                                    <FaUserFriends className="v-icon" />
                                    <div>
                                        <h3>Contribution</h3>
                                        <p>Contribute time, skills, and effort meaningfully.</p>
                                    </div>
                                </div>
                                <div className="v-card-icon">
                                    <FaRegIdCard className="v-icon" />
                                    <div>
                                        <h3>Accountability</h3>
                                        <p>Be part of a disciplined, accountable NGO.</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 3. WHO CAN VOLUNTEER */}
                        <section className="v-section bg-light">
                            <h2>Who Can Volunteer</h2>
                            <ul className="v-list-check">
                                <li><FaUserGraduate /> College Students</li>
                                <li><FaBriefcase /> Working Professionals</li>
                                <li><FaUserClock /> Retired Individuals</li>
                                <li><FaHeart /> Socially Motivated Citizens</li>
                            </ul>
                            <p className="v-note"><strong>Note:</strong> Volunteers must be willing to follow NGO guidelines and field protocols.</p>
                        </section>

                        {/* 4. VOLUNTEER ROLES */}
                        <section className="v-section">
                            <h2>Volunteer Roles</h2>
                            <div className="v-roles-grid">
                                <RoleCard icon={<FaHandHoldingHeart />} title="Food Distribution" desc="Assist in organized food drives." />
                                <RoleCard icon={<FaChalkboardTeacher />} title="Education Support" desc="Tutoring & scholarship assistance." />
                                <RoleCard icon={<FaUserInjured />} title="Beggar Rehab" desc="Field outreach & rehabilitation support." />
                                <RoleCard icon={<FaNotesMedical />} title="Health Camps" desc="Coordination for medical camps." />
                                <RoleCard icon={<FaPoll />} title="Field Surveys" desc="Data collection & documentation." />
                                <RoleCard icon={<FaLaptop />} title="Digital Support" desc="Back-office & IT assistance." />
                            </div>
                        </section>

                        {/* 5. WHAT VOLUNTEERS DO */}
                        <section className="v-section">
                            <h2>What Volunteers Actually Do</h2>
                            <ul className="v-list-dot">
                                <li><FaUsers className="task-icon" /> Assist field teams during programs</li>
                                <li><FaHandsHelping className="task-icon" /> Support rehabilitation activities</li>
                                <li><FaFileAlt className="task-icon" /> Help with documentation and coordination</li>
                                <li><FaBullhorn className="task-icon" /> Participate in awareness and outreach</li>
                                <li><FaClipboardCheck className="task-icon" /> Follow reporting and task guidelines</li>
                            </ul>
                        </section>

                        {/* 6. BENEFITS */}
                        <section className="v-section bg-light">
                            <h2>Volunteer Benefits</h2>
                            <ul className="v-list-check">
                                <li><FaIdCard /> Official Volunteer ID Card</li>
                                <li><FaCertificate /> Volunteer Certificate</li>
                                <li><FaUserGraduate /> Field experience in social work</li>
                                <li><FaChartLine /> Skill development & leadership exposure</li>
                            </ul>
                            <p className="v-warning">❌ No jobs or stipends promised. This is pure service.</p>
                        </section>

                        {/* 7. REGISTRATION PROCESS */}
                        <section className="v-section">
                            <h2>Registration Process</h2>
                            <div className="process-steps">
                                <div className="step">1. Fill volunteer registration form</div>
                                <div className="step">2. Pay one-time registration fee (₹100)</div>
                                <div className="step">3. Verification & approval</div>
                                <div className="step">4. Assignment based on availability</div>
                            </div>
                            <p className="v-note-small">The registration fee is used for ID creation, training, and coordination expenses.</p>
                        </section>

                        {/* 8. CODE OF CONDUCT */}
                        <section className="v-section border-red">
                            <h2>Code of Conduct</h2>
                            <ul className="v-list-dot">
                                <li><FaGavel className="task-icon" /> Must follow NGO policies strictly</li>
                                <li><FaBan className="task-icon" /> Misuse of identity is prohibited</li>
                                <li><FaHandshake className="task-icon" /> Respect beneficiaries and staff</li>
                                <li><FaUserShield className="task-icon" /> Field discipline is mandatory</li>
                                <li><FaMoneyBillWave className="task-icon" /> Registration fee is non-refundable</li>
                            </ul>
                        </section>

                        {/* 9. CTA */}
                        <div className="v-cta-bottom">
                            <h3>Ready to contribute meaningfully?</h3>
                            <div className="flex-gap">
                                <button className="btn btn-primary" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Register Now</button>
                                <button className="btn btn-outline-primary">Contact Us</button>
                            </div>
                        </div>

                    </div>

                    {/* RIGHT COLUMN (STICKY FORM) */}
                    <div className="volunteer-sidebar">
                        <div className="sticky-wrapper">
                            <div className="volunteer-form-container">
                                <h3 className="form-title">Registration Form</h3>
                                <form className="volunteer-form" onSubmit={handleSubmit}>

                                    <div className="form-group">
                                        <label>Full Name</label>
                                        <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="As per Aadhaar" />
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Mobile</label>
                                            <input type="tel" name="mobile" value={formData.mobile} onChange={handleChange} required />
                                        </div>
                                        <div className="form-group">
                                            <label>Email</label>
                                            <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                                        </div>
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>DOB</label>
                                            <input type="date" name="dob" value={formData.dob} onChange={handleChange} required />
                                        </div>
                                        <div className="form-group">
                                            <label>Blood Group</label>
                                            <select name="bg" value={formData.bg} onChange={handleChange}>
                                                <option value="">Select</option>
                                                <option value="A+">A+</option>
                                                <option value="B+">B+</option>
                                                <option value="O+">O+</option>
                                                <option value="AB+">AB+</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label>Address</label>
                                        <textarea name="address" value={formData.address} onChange={handleChange} rows="2" required></textarea>
                                    </div>

                                    <div className="form-group">
                                        <label>Interested Role</label>
                                        <select name="interest" value={formData.interest} onChange={handleChange}>
                                            <option value="Food Distribution">Food Distribution</option>
                                            <option value="Education Support">Education Support</option>
                                            <option value="Beggar Rehab">Beggar Rehab</option>
                                            <option value="Health Camps">Health Camps</option>
                                            <option value="Field Surveys">Field Surveys</option>
                                            <option value="Digital Support">Digital Support</option>
                                        </select>
                                    </div>

                                    <button type="submit" className="btn btn-primary full-width">Register & Pay ₹100</button>
                                </form>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

const RoleCard = ({ icon, title, desc }) => (
    <div className="role-card">
        <div className="role-icon">{icon}</div>
        <h4>{title}</h4>
        <p>{desc}</p>
    </div>
);

export default Volunteer;
