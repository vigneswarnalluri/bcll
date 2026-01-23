import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { FaHandsHelping, FaTasks, FaFileUpload, FaIdCard, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import './Volunteer.css';

const VolunteerDashboard = () => {
    const [volunteer, setVolunteer] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

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

    return (
        <div className="volunteer-dashboard">
            <header className="dash-header">
                <div>
                    <h1>Volunteer Operations</h1>
                    <p>Impact Mode: {volunteer.full_name}</p>
                </div>
                <div className="status-badge active">{volunteer.status}</div>
            </header>

            <div className="dash-grid">
                {/* ID & Designation */}
                <div className="dash-card">
                    <h3><FaIdCard /> Official ID</h3>
                    <div className="id-preview">
                        <div className="id-header">BHARATH CARES</div>
                        <div className="id-body">
                            <h4>{volunteer.full_name}</h4>
                            <p>{volunteer.area_of_interest}</p>
                            <small>ID: VOL-{volunteer.id.substring(0, 6).toUpperCase()}</small>
                        </div>
                    </div>
                </div>

                {/* Active Tasks */}
                <div className="dash-card wide">
                    <div className="card-header">
                        <h3><FaTasks /> Mission Queue</h3>
                    </div>
                    <div className="tasks-grid">
                        {tasks.length > 0 ? tasks.map(t => (
                            <div key={t.id} className="task-card">
                                <div className="task-header">
                                    <h4>{t.title}</h4>
                                    <span className={`task-priority ${t.priority.toLowerCase()}`}>{t.priority}</span>
                                </div>
                                <p>{t.description}</p>
                                <div className="task-footer">
                                    <span>Deadline: {new Date(t.deadline).toLocaleDateString()}</span>
                                    <button className="btn-small success-btn"><FaFileUpload /> Submit Proof</button>
                                </div>
                            </div>
                        )) : (
                            <div className="empty-state">
                                <FaCheckCircle style={{ fontSize: '3rem', color: '#e2e8f0', marginBottom: '15px' }} />
                                <p>No active missions assigned. Stay prepared!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VolunteerDashboard;
