import React from 'react';
import { FaCalendarCheck, FaMoneyBillWave, FaTasks, FaSignOutAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const EmployeeDashboard = () => {
    const navigate = useNavigate();

    return (
        <div className="dashboard-container">
            <div className="sidebar">
                <div className="sidebar-header">
                    <h3>BCLLF Employee</h3>
                </div>
                <ul className="sidebar-menu">
                    <li className="active"><FaTasks /> Work Report</li>
                    <li><FaCalendarCheck /> Attendance</li>
                    <li><FaMoneyBillWave /> Salary Slips</li>
                    <li onClick={() => navigate('/login')} className="logout-btn"><FaSignOutAlt /> Logout</li>
                </ul>
            </div>

            <div className="main-content">
                <div className="dash-header">
                    <h2>Employee Dashboard</h2>
                    <div className="user-profile">
                        <span>Welcome, Vamsi Krishna</span>
                        <div className="avatar">VK</div>
                    </div>
                </div>

                <div className="content-panel">
                    <h3>Quick Actions</h3>
                    <div className="action-buttons">
                        <button className="btn btn-primary">Mark Attendance</button>
                        <button className="btn btn-secondary">Submit Daily Report</button>
                        <button className="btn btn-primary" style={{ backgroundColor: '#e0e0e0', color: '#333' }}>Apply Leave</button>
                    </div>
                </div>

                <div className="content-panel">
                    <h3>My Attendance (January 2026)</h3>
                    <div className="calendar-placeholder">
                        {/* Placeholder for calendar */}
                        <p style={{ textAlign: 'center', padding: '20px', color: '#999' }}>Attendance Calendar View</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmployeeDashboard;
