import React from 'react';
import { FaUsers, FaUserShield, FaHandHoldingUsd, FaFileAlt, FaSignOutAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const AdminDashboard = () => {
    const navigate = useNavigate();

    return (
        <div className="dashboard-container">
            <div className="sidebar">
                <div className="sidebar-header">
                    <h3>BCLLF Admin</h3>
                </div>
                <ul className="sidebar-menu">
                    <li className="active"><FaUserShield /> Dashboard</li>
                    <li><FaUsers /> Employees</li>
                    <li><FaHandHoldingUsd /> Volunteers</li>
                    <li><FaFileAlt /> Reports</li>
                    <li><FaUsers /> Students</li>
                    <li onClick={() => navigate('/login')} className="logout-btn"><FaSignOutAlt /> Logout</li>
                </ul>
            </div>

            <div className="main-content">
                <div className="dash-header">
                    <h2>Admin Dashboard</h2>
                    <div className="user-profile">
                        <span>Welcome, Super Admin</span>
                        <div className="avatar">SA</div>
                    </div>
                </div>

                <div className="stats-grid">
                    <StatCard title="Total Employees" count="45" color="blue" />
                    <StatCard title="Active Volunteers" count="120" color="green" />
                    <StatCard title="Donations this Month" count="₹ 5.2L" color="gold" />
                    <StatCard title="Pending Approvals" count="12" color="red" />
                </div>

                <div className="content-panel">
                    <h3>Recent Activities</h3>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Activity</th>
                                <th>User</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>05 Jan 2026</td>
                                <td>New Volunteer Registration</td>
                                <td>Rahul K.</td>
                                <td><span className="badge pending">Pending</span></td>
                            </tr>
                            <tr>
                                <td>04 Jan 2026</td>
                                <td>Salary Disbursement</td>
                                <td>Finance Team</td>
                                <td><span className="badge success">Completed</span></td>
                            </tr>
                            <tr>
                                <td>04 Jan 2026</td>
                                <td>Scholarship Application</td>
                                <td>Priya S.</td>
                                <td><span className="badge pending">Verifying</span></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ title, count, color }) => (
    <div className={`stat-card ${color}`}>
        <h3>{count}</h3>
        <p>{title}</p>
    </div>
);

export default AdminDashboard;
