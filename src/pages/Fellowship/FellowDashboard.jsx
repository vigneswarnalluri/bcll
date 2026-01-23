import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { FaGraduationCap, FaFileSignature, FaMoneyCheckAlt, FaClock, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import './Fellowship.css';

const FellowDashboard = () => {
    const [fellow, setFellow] = useState(null);
    const [reports, setReports] = useState([]);
    const [stipends, setStipends] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFellowData();
    }, []);

    const fetchFellowData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Fetch fellow profile (linked to students table)
            const { data: profile } = await supabase
                .from('students')
                .select('*')
                .eq('email', user.email)
                .single();

            if (profile) {
                setFellow(profile);
                // Fetch reports and stipends
                const [repData, stipData] = await Promise.all([
                    supabase.from('fellow_reports').select('*').eq('student_id', profile.id).order('created_at', { ascending: false }),
                    supabase.from('stipends').select('*').eq('student_id', profile.id).order('month', { ascending: false })
                ]);
                setReports(repData.data || []);
                setStipends(stipData.data || []);
            }
        } catch (err) {
            console.error('Error fetching fellow data:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="loading-state">Syncing Fellow Hub...</div>;
    if (!fellow) return <div className="error-state">Access Denied: Fellow profile not found.</div>;

    return (
        <div className="fellow-dashboard">
            <header className="dash-header">
                <div>
                    <h1>Fellowship Control Center</h1>
                    <p>Welcome back, {fellow.student_name}</p>
                </div>
                <div className="status-badge active">Active Fellow</div>
            </header>

            <div className="dash-grid">
                {/* Profile Overview */}
                <div className="dash-card">
                    <h3><FaGraduationCap /> Academic Track</h3>
                    <div className="info-row">
                        <span>Program:</span>
                        <strong>{fellow.program}</strong>
                    </div>
                    <div className="info-row">
                        <span>Institution:</span>
                        <strong>{fellow.college_org}</strong>
                    </div>
                </div>

                {/* Stipend Tracker */}
                <div className="dash-card">
                    <h3><FaMoneyCheckAlt /> Stipend Status</h3>
                    <div className="stipend-list">
                        {stipends.length > 0 ? stipends.map(s => (
                            <div key={s.id} className="stipend-item">
                                <span>{s.month}</span>
                                <span className={`badge ${s.status === 'Paid' ? 'success' : 'pending'}`}>₹{s.amount} - {s.status}</span>
                            </div>
                        )) : <p className="empty-text">No stipend records yet.</p>}
                    </div>
                </div>

                {/* Progress Reports */}
                <div className="dash-card wide">
                    <div className="card-header">
                        <h3><FaFileSignature /> Learning Reports</h3>
                        <button className="btn-small btn-add">Submit New Report</button>
                    </div>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Report Period</th>
                                <th>Submission Date</th>
                                <th>Status</th>
                                <th>Feedback</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reports.map(r => (
                                <tr key={r.id}>
                                    <td>{r.period}</td>
                                    <td>{new Date(r.created_at).toLocaleDateString()}</td>
                                    <td><span className={`badge ${r.status === 'Approved' ? 'success' : 'blue'}`}>{r.status}</span></td>
                                    <td>{r.feedback || 'Pending Review'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default FellowDashboard;
