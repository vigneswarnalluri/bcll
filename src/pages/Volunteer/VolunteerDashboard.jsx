import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { FaHandsHelping, FaTasks, FaFileUpload, FaIdCard, FaCheckCircle, FaExclamationCircle, FaUserCircle, FaSignOutAlt, FaCertificate, FaHistory, FaPlus, FaCalendarAlt, FaClock } from 'react-icons/fa';
import '../Dashboard/Dashboard.css';
import { useNavigate } from 'react-router-dom';

const VolunteerDashboard = () => {
    const navigate = useNavigate();
    const [volunteer, setVolunteer] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('profile');
    const [isLogModalOpen, setIsLogModalOpen] = useState(false);
    const [isProofModalOpen, setIsProofModalOpen] = useState(false);
    const [currentTask, setCurrentTask] = useState(null);
    const [proofDetails, setProofDetails] = useState('');
    const [uploading, setUploading] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [newActivity, setNewActivity] = useState({ type: 'Field Work', description: '', hours: '', date: new Date().toISOString().split('T')[0], proof_url: null });

    useEffect(() => {
        fetchVolunteerData();
        const interval = setInterval(fetchVolunteerData, 10000);
        return () => clearInterval(interval);
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
                const [taskRes, actRes] = await Promise.all([
                    supabase.from('volunteer_tasks').select('*').eq('volunteer_id', profile.id).order('deadline', { ascending: true }),
                    supabase.from('volunteer_activities').select('*').eq('volunteer_id', profile.id).order('activity_date', { ascending: false })
                ]);

                setTasks(taskRes.data || []);
                setActivities(actRes.data || []);
            }
        } catch (err) {
            console.error('Error fetching volunteer data:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="loading-state">Syncing Volunteer HQ...</div>;
    if (!volunteer) return <div className="error-state">Access Denied: Volunteer profile not found.</div>;

    const completedMissions = tasks.filter(t => t.status === 'Completed' || t.status === 'Verified').length;
    const taskHours = tasks.filter(t => t.status === 'Verified').length * 4; // Only verified logs count for official certificates
    const activityHours = activities.filter(a => a.status === 'Approved').reduce((acc, curr) => acc + (parseFloat(curr.hours_spent) || 0), 0);
    const totalImpactHours = taskHours + activityHours;

    const handleLogActivity = async (e) => {
        e.preventDefault();
        try {
            const { error } = await supabase.from('volunteer_activities').insert([{
                volunteer_id: volunteer.id,
                activity_type: newActivity.type,
                description: newActivity.description,
                hours_spent: newActivity.hours,
                activity_date: newActivity.date,
                status: 'Pending',
                proof_url: uploadedFiles.length > 0 ? JSON.stringify(uploadedFiles) : null
            }]);

            if (error) throw error;
            setIsLogModalOpen(false);
            setNewActivity({ type: 'Field Work', description: '', hours: '', date: new Date().toISOString().split('T')[0], proof_url: null });
            setUploadedFiles([]);
            alert('Activity logged successfully! Waiting for approval.');
            fetchVolunteerData();
        } catch (err) {
            console.error('Error logging activity:', err);
            alert('Failed to log activity.');
        }
    };

    const handleOpenProofModal = (task) => {
        setCurrentTask(task);
        setProofDetails('');
        setUploadedFiles([]);
        setIsProofModalOpen(true);
    };

    const handleFileUpload = async (e) => {
        try {
            const file = e.target.files[0];
            if (!file) return;

            setUploading(true);
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${volunteer.id}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('volunteer-uploads')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('volunteer-uploads')
                .getPublicUrl(filePath);

            setUploadedFiles(prev => [...prev, publicUrl]);
            alert('Evidence uploaded successfully!');
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Error uploading image: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    const handleSubmitProof = async (e) => {
        e.preventDefault();
        try {
            let finalDetails = proofDetails;
            if (uploadedFiles.length > 0) {
                finalDetails += `\n\n[Proof Artifacts]:\n${uploadedFiles.map((url, i) => `Image ${i + 1}: ${url}`).join('\n')}`;
            }

            const { error } = await supabase
                .from('volunteer_tasks')
                .update({
                    status: 'Completed',
                    proof_details: finalDetails,
                    updated_at: new Date().toISOString()
                })
                .eq('id', currentTask.id);

            if (error) throw error;

            setIsProofModalOpen(false);
            alert('Proof submitted successfully! Task marked as completed.');
            fetchVolunteerData(); // Refresh list to show updated status
        } catch (err) {
            console.error('Error submitting proof:', err);
            alert(`Failed to submit proof: ${err.message || err.error_description || 'Unknown error'}`);
        }
    };

    const menuItems = [
        { id: 'profile', icon: <FaUserCircle />, label: 'Registration Profile' },
        { id: 'tasks', icon: <FaTasks />, label: 'Missions & Tasks' },
        { id: 'activities', icon: <FaHistory />, label: 'Activity Log' },
        { id: 'certificates', icon: <FaCertificate />, label: 'Certificates' },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'profile':
                return (
                    <div className="content-panel">
                        <div style={{ display: 'flex', gap: '40px', alignItems: 'flex-start' }}>
                            <div className="profile-large-avatar" style={{
                                width: '120px',
                                height: '120px',
                                background: volunteer.photograph_url ? `url(${volunteer.photograph_url})` : 'var(--primary)',
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                color: 'white',
                                borderRadius: '25px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '3rem',
                                fontWeight: '800',
                                overflow: 'hidden'
                            }}>
                                {!volunteer.photograph_url && (volunteer.full_name?.split(' ').map(n => n[0]).join('') || '?')}
                            </div>
                            <div style={{ flex: 1 }}>
                                <h2 style={{ margin: 0, color: 'var(--primary)' }}>{volunteer.full_name}</h2>
                                <p style={{ color: '#666', fontSize: '1.1rem', margin: '5px 0' }}>Social Impact Volunteer • {volunteer.area_of_interest}</p>
                                <span className="badge success">{volunteer.status} Member</span>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', background: '#f8fafc', padding: '20px', borderRadius: '15px', marginTop: '20px' }}>
                                    <div><strong>Volunteer ID:</strong><br />VOL-{volunteer.id.substring(0, 8).toUpperCase()}</div>
                                    <div><strong>Gender:</strong><br />{volunteer.gender || 'Not Specified'}</div>
                                    <div><strong>Email:</strong><br />{volunteer.email}</div>
                                    <div><strong>Phone:</strong><br />{volunteer.phone}</div>
                                    <div><strong>DOB:</strong><br />{volunteer.dob}</div>
                                    <div><strong>Aadhaar:</strong><br />**** **** {volunteer.aadhaar_number?.slice(-4) || 'N/A'}</div>
                                    <div><strong>College/Org:</strong><br />{volunteer.organization_name || 'N/A'}</div>
                                    <div><strong>Address:</strong><br />{volunteer.address}</div>
                                    <div><strong>Blood Group:</strong><br />{volunteer.blood_group}</div>
                                    <div><strong>Interest:</strong><br />{volunteer.area_of_interest}</div>
                                    <div><strong>Location:</strong><br />{volunteer.preferred_location || 'Not Set'}</div>
                                    <div><strong>Availability:</strong><br />{volunteer.availability}</div>
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
                                    <span className="stat-val" style={{ display: 'block', fontSize: '2rem', fontWeight: 'bold' }}>{totalImpactHours}h</span>
                                    <span className="stat-label">Total Hours</span>
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
                                            {t.status === 'Completed' || t.status === 'Verified' ?
                                                <span style={{
                                                    color: t.status === 'Verified' ? '#2f855a' : '#2b6cb0',
                                                    fontWeight: 'bold',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '5px'
                                                }}>
                                                    {t.status === 'Verified' ? <><FaCheckCircle /> Verified</> : <><FaClock /> Pending Review</>}
                                                </span> :
                                                <button className="btn-small" style={{ background: 'var(--primary)', color: 'white', border: 'none' }} onClick={() => handleOpenProofModal(t)}>Submit Proof</button>
                                            }
                                        </div>
                                    </div>
                                )) : <p style={{ color: '#999', fontStyle: 'italic' }}>No active missions assigned.</p>}
                            </div>
                        </div>

                        {isProofModalOpen && (
                            <div className="modal-overlay">
                                <div className="modal-content">
                                    <h3>Submit Mission Proof</h3>
                                    <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '20px' }}>
                                        Please provide details or links to verify completion of: <strong>{currentTask?.title}</strong>
                                    </p>
                                    <form onSubmit={handleSubmitProof}>
                                        <div className="form-group">
                                            <label>Proof / Completion Details</label>
                                            <textarea
                                                rows="5"
                                                className="form-control"
                                                value={proofDetails}
                                                onChange={(e) => setProofDetails(e.target.value)}
                                                placeholder="Describe the work done..."
                                                required
                                            ></textarea>
                                        </div>

                                        <div className="form-group">
                                            <label>Attach Photo / Proof (Optional)</label>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileUpload}
                                                className="form-control"
                                                disabled={uploading}
                                            />
                                            {uploading && <span style={{ fontSize: '0.8rem', color: '#666' }}>Uploading...</span>}
                                            {uploadedFileUrl && <div style={{ marginTop: '10px', color: 'green', fontSize: '0.9rem' }}>✔ Image Attached Successfully</div>}
                                        </div>

                                        <div style={{ display: 'flex', gap: '10px', marginTop: '20px', justifyContent: 'flex-end' }}>
                                            <button type="button" className="btn btn-secondary" onClick={() => setIsProofModalOpen(false)}>Cancel</button>
                                            <button type="submit" className="btn btn-primary" disabled={uploading}>
                                                {uploading ? 'Uploading...' : 'Mark Completed'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>
                );
            case 'activities':
                return (
                    <div className="content-panel">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3>Activity Log</h3>
                            <button className="btn btn-primary" onClick={() => { setUploadedFiles([]); setIsLogModalOpen(true); }}><FaPlus /> Log Activity</button>
                        </div>

                        {activities.length > 0 ? (
                            <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: '#f8fafc', textAlign: 'left' }}>
                                        <th style={{ padding: '12px' }}>Date</th>
                                        <th style={{ padding: '12px' }}>Activity</th>
                                        <th style={{ padding: '12px' }}>Description</th>
                                        <th style={{ padding: '12px' }}>Hours</th>
                                        <th style={{ padding: '12px' }}>Proof</th>
                                        <th style={{ padding: '12px' }}>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {activities.map(act => (
                                        <tr key={act.id} style={{ borderBottom: '1px solid #eee' }}>
                                            <td style={{ padding: '12px' }}>{new Date(act.activity_date).toLocaleDateString()}</td>
                                            <td style={{ padding: '12px' }}>{act.activity_type}</td>
                                            <td style={{ padding: '12px' }}>{act.description}</td>
                                            <td style={{ padding: '12px' }}>{act.hours_spent}</td>
                                            <td style={{ padding: '12px' }}>
                                                {act.proof_url ? (
                                                    <div style={{ display: 'flex', gap: '5px' }}>
                                                        {(() => {
                                                            try {
                                                                const urls = JSON.parse(act.proof_url);
                                                                return Array.isArray(urls) ? urls.map((url, i) => (
                                                                    <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                                                                        <img src={url} alt={`Proof ${i}`} style={{ width: '35px', height: '35px', borderRadius: '5px', objectFit: 'cover' }} />
                                                                    </a>
                                                                )) : (
                                                                    <a href={act.proof_url} target="_blank" rel="noopener noreferrer">
                                                                        <img src={act.proof_url} alt="Proof" style={{ width: '35px', height: '35px', borderRadius: '5px', objectFit: 'cover' }} />
                                                                    </a>
                                                                );
                                                            } catch (e) {
                                                                return (
                                                                    <a href={act.proof_url} target="_blank" rel="noopener noreferrer">
                                                                        <img src={act.proof_url} alt="Proof" style={{ width: '35px', height: '35px', borderRadius: '5px', objectFit: 'cover' }} />
                                                                    </a>
                                                                );
                                                            }
                                                        })()}
                                                    </div>
                                                ) : <span style={{ color: '#cbd5e0' }}>No Proof</span>}
                                            </td>
                                            <td style={{ padding: '12px' }}>
                                                <span className={`badge ${act.status === 'Approved' ? 'success' : act.status === 'Rejected' ? 'failure' : 'warning'}`}>
                                                    {act.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p style={{ color: '#666', fontStyle: 'italic', textAlign: 'center', padding: '20px' }}>No activities logged yet.</p>
                        )}

                        {isLogModalOpen && (
                            <div className="modal-overlay">
                                <div className="modal-content">
                                    <h3>Log New Activity</h3>
                                    <form onSubmit={handleLogActivity}>
                                        <div className="form-group">
                                            <label>Activity Type</label>
                                            <select
                                                value={newActivity.type}
                                                onChange={e => setNewActivity({ ...newActivity, type: e.target.value })}
                                                className="form-control"
                                            >
                                                <option>Field Work</option>
                                                <option>Event Support</option>
                                                <option>Administrative</option>
                                                <option>Fundraising</option>
                                                <option>Other</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Date</label>
                                            <input
                                                type="date"
                                                value={newActivity.date}
                                                onChange={e => setNewActivity({ ...newActivity, date: e.target.value })}
                                                required
                                                className="form-control"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Hours Spent</label>
                                            <input
                                                type="number"
                                                step="0.5"
                                                value={newActivity.hours}
                                                onChange={e => setNewActivity({ ...newActivity, hours: e.target.value })}
                                                required
                                                className="form-control"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Description</label>
                                            <textarea
                                                rows="3"
                                                value={newActivity.description}
                                                onChange={e => setNewActivity({ ...newActivity, description: e.target.value })}
                                                required
                                                className="form-control"
                                            ></textarea>
                                        </div>
                                        <div className="form-group">
                                            <label>Evidence / Proof Images (Multiple Allowed)</label>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <input type="file" accept="image/*" multiple onChange={handleFileUpload} className="form-control" />
                                                {uploading && <span style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>Uploading...</span>}
                                            </div>
                                            {uploadedFiles.length > 0 && (
                                                <div style={{ marginTop: '15px', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                                    {uploadedFiles.map((url, i) => (
                                                        <div key={i} style={{ position: 'relative' }}>
                                                            <img src={url} alt="Preview" style={{ width: '80px', height: '80px', borderRadius: '10px', objectFit: 'cover', border: '2px solid #e2e8f0' }} />
                                                            <button
                                                                type="button"
                                                                onClick={() => setUploadedFiles(prev => prev.filter((_, idx) => idx !== i))}
                                                                style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'red', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', fontSize: '10px' }}
                                                            >X</button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <div style={{ display: 'flex', gap: '10px', marginTop: '20px', justifyContent: 'flex-end' }}>
                                            <button type="button" className="btn btn-secondary" onClick={() => setIsLogModalOpen(false)}>Cancel</button>
                                            <button type="submit" className="btn btn-primary">Submit Log</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}
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
                        <div className="avatar" style={{
                            background: volunteer.photograph_url ? `url(${volunteer.photograph_url})` : 'var(--primary)',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            overflow: 'hidden',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 'bold'
                        }}>
                            {!volunteer.photograph_url && volunteer.full_name[0]}
                        </div>
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
