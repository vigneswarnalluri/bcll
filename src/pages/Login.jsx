import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
    const [role, setRole] = useState('employee'); // 'admin' or 'employee'
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        // Mock login logic
        if (role === 'admin') {
            if (credentials.username === 'admin' && credentials.password === 'admin') {
                navigate('/admin-dashboard');
            } else {
                alert('Invalid Admin Credentials (Try: admin/admin)');
            }
        } else {
            if (credentials.username === 'emp' && credentials.password === 'emp') {
                navigate('/employee-dashboard');
            } else {
                alert('Invalid Employee Credentials (Try: emp/emp)');
            }
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <div className="login-header">
                    <h2>BCLLF e-Office</h2>
                    <p>Secure Login System</p>
                </div>

                <div className="role-switch">
                    <button
                        className={`role-btn ${role === 'admin' ? 'active' : ''}`}
                        onClick={() => setRole('admin')}
                    >
                        Admin
                    </button>
                    <button
                        className={`role-btn ${role === 'employee' ? 'active' : ''}`}
                        onClick={() => setRole('employee')}
                    >
                        Employee
                    </button>
                </div>

                <form onSubmit={handleLogin} className="login-form">
                    <div className="form-group">
                        <label>Username / ID</label>
                        <input
                            type="text"
                            value={credentials.username}
                            onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                            placeholder={role === 'admin' ? "Admin ID" : "Employee ID"}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            value={credentials.password}
                            onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                            placeholder="Enter Password"
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary full-width">Login</button>
                </form>
                <div className="login-footer">
                    <p>Restricted access for foundation staff only.</p>
                </div>
            </div>
        </div>
    );
};

export default Login;
