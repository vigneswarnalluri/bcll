import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { FaHandsHelping, FaTasks, FaFileUpload, FaIdCard, FaCheckCircle, FaExclamationCircle, FaUserCircle, FaSignOutAlt, FaCertificate } from 'react-icons/fa';
import '../Dashboard/Dashboard.css';
import { useNavigate } from 'react-router-dom';

const VolunteerDashboard = () => {
    const navigate = useNavigate();
    const [volunteer, setVolunteer] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('profile');

    useEffect(() => {
        fetchVolunteerData();
    }, []);

    const fetchVolunteerData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: profile } = await supabase
                .from('volunteers')
                .select('*')
                .eq('email', user.email)
                .single();

            if (profile) {
                setVolunteer(profile);
                const { data: taskData } = await supabase
                    .from('volunteer_tasks')
                    .select('*')
                    .eq('volunteer_id', profile.id)
                    .order('deadline', { ascending: true });
                setTasks(taskData || []);
            }
        } catch (err) {
            console.error('Error fetching volunteer data:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="loading-state">Syncing Volunteer HQ...</div>;
    if (!volunteer) return <div className="error-state">Access Denied: Volunteer profile not found.</div>;

    const completedMissions = tasks.filter(t => t.status === 'Completed').length;
    const impactHours = completedMissions * 4;

    const menuItems = [
        { id: 'profile', icon: <FaUserCircle />, label: 'Registration Profile' },
        { id: 'tasks', icon: <FaTasks />, label: 'Tasks & Hours' },
        { id: 'certificates', icon: <FaCertificate />, label: 'Certificates' },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'profile':
                return (
                    <div className="content-panel">
                        <div style={{ display: 'flex', gap: '40px', alignItems: 'flex-start' }}>
                            <div className="profile-large-avatar" style={{ width: '120px', height: '120px', background: 'var(--primary)', color: 'white', borderRadius: '25px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', fontWeight: '800' }}>
                                {volunteer.full_name?.split(' ').map(n => n[0]).join('') || '?'}
                            </div>
                            <div style={{ flex: 1 }}>
                                <h2 style={{ margin: 0, color: 'var(--primary)' }}>{volunteer.full_name}</h2>
                                <p style={{ color: '#666', fontSize: '1.1rem', margin: '5px 0' }}>Social Impact Volunteer • {volunteer.area_of_interest}</p>
                                <span className="badge success">{volunteer.status} Member</span>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', background: '#f8fafc', padding: '20px', borderRadius: '15px', marginTop: '20px' }}>
                                    <div><strong>Volunteer ID:</strong><br />VOL-{volunteer.id.substring(0, 8).toUpperCase()}</div>
                                    <div><strong>Email:</strong><br />{volunteer.email}</div>
                                    <div><strong>Phone:</strong><br />{volunteer.phone}</div>
                                    <div><strong>Address:</strong><br />{volunteer.address}</div>
                                    <div><strong>DOB:</strong><br />{volunteer.dob}</div>
                                    <div><strong>Joined On:</strong><br />{new Date(volunteer.created_at).toLocaleDateString()}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'tasks':
                return (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                        <div className="content-panel">
                            <h3><FaCheckCircle /> Impact Analytics</h3>
                            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginTop: '20px' }}>
                                <div className="stat-item" style={{ textAlign: 'center' }}>
                                    <span className="stat-val" style={{ display: 'block', fontSize: '2rem', fontWeight: 'bold' }}>{tasks.length}</span>
                                    <span className="stat-label">Assigned</span>
                                </div>
                                <div className="stat-item" style={{ textAlign: 'center' }}>
                                    <span className="stat-val" style={{ display: 'block', fontSize: '2rem', fontWeight: 'bold' }}>{completedMissions}</span>
                                    <span className="stat-label">Completed</span>
                                </div>
                                <div className="stat-item" style={{ textAlign: 'center' }}>
                                    <span className="stat-val" style={{ display: 'block', fontSize: '2rem', fontWeight: 'bold' }}>{impactHours}h</span>
                                    <span className="stat-label">Service Hours</span>
                                </div>
                            </div>
                        </div>

                        <div className="content-panel">
                            <h3 style={{ marginBottom: '20px' }}>Mission Queue</h3>
                            <div className="tasks-grid">
                                {tasks.length > 0 ? tasks.map(t => (
                                    <div key={t.id} className="task-card">
                                        <div className="task-header">
                                            <h4 style={{ margin: 0 }}>{t.title}</h4>
                                            <span className={`badge ${t.priority === 'High' ? 'red' : 'blue'}`}>{t.priority}</span>
                                        </div>
                                        <p style={{ fontSize: '0.9rem', color: '#666', margin: '10px 0' }}>{t.description}</p>
                                        <div className="task-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <small style={{ color: '#999' }}>Due: {new Date(t.deadline).toLocaleDateString()}</small>
                                            {t.status === 'Completed' ? <span style={{ color: 'green', fontWeight: 'bold' }}>✔ Verified</span> : <button className="btn-small">Submit Proof</button>}
                                        </div>
                                    </div>
                                )) : <p style={{ color: '#999', fontStyle: 'italic' }}>No active missions assigned.</p>}
                            </div>
                        </div>
                    </div>
                );
            case 'certificates':
                return (
                    <div className="content-panel">
                        <h3><FaCertificate /> Achievements & Certificates</h3>
                        <div style={{ marginTop: '20px' }}>
                            {completedMissions >= 1 ? (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px', border: '1px solid #e2e8f0', borderRadius: '15px', background: '#f0fff4' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                        <FaFileUpload style={{ fontSize: '2rem', color: '#38a169' }} />
                                        <div>
                                            <h4 style={{ margin: 0, color: '#2f855a' }}>Certificate of Service Excellence</h4>
                                            <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>Awarded for completing {completedMissions} successful missions.</p>
                                        </div>
                                    </div>
                                    <button className="btn-premium" onClick={() => alert('Downloading Certificate...')}>Download PDF</button>
                                </div>
                            ) : (
                                <div style={{ padding: '40px', textAlign: 'center', background: '#f7fafc', borderRadius: '15px' }}>
                                    <FaCertificate style={{ fontSize: '3rem', color: '#cbd5e0', marginBottom: '15px' }} />
                                    <p style={{ color: '#718096' }}>Complete at least one mission to unlock your Service Certificate.</p>
                                </div>
                            )}
                        </div>
                    </div>
                );
            default: return null;
        }
    };

    return (
        <div className="dashboard-container">
            <div className="sidebar">
                <div className="sidebar-header">
                    <img src="/logo-CYlp3-fg__1_-removebg-preview.svg" alt="Logo" className="dash-logo" style={{ width: '40px' }} />
                    <h3 style={{ fontSize: '1rem' }}>BCLLF Volunteer HQ</h3>
                </div>
                <ul className="sidebar-menu">
                    {menuItems.map(item => (
                        <li key={item.id} className={activeTab === item.id ? 'active' : ''} onClick={() => setActiveTab(item.id)}>
                            {item.icon} <span>{item.label}</span>
                        </li>
                    ))}
                    <li onClick={async () => { await supabase.auth.signOut(); navigate('/login'); }} className="logout-btn"><FaSignOutAlt /> <span>Exit Portal</span></li>
                </ul>
            </div>

            <div className="main-content">
                <div className="dash-header">
                    <div className="header-title">
                        <h2>{menuItems.find(i => i.id === activeTab)?.label}</h2>
                        <p className="breadcrumb">Volunteer Dashboard / {menuItems.find(i => i.id === activeTab)?.label}</p>
                    </div>
                    <div className="user-profile">
                        <div className="user-info">
                            <span className="user-name">{volunteer.full_name}</span>
                            <span className="user-role">Volunteer ID: {volunteer.id.substring(0, 6)}...</span>
                        </div>
                        <div className="avatar">{volunteer.full_name[0]}</div>
                    </div>
                </div>
                <div className="tab-content-wrapper">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default VolunteerDashboard;
