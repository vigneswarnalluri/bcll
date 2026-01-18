import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import { supabase } from '../../lib/supabase';
import './Login.css';

const Login = () => {
    const [role, setRole] = useState('admin');
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { data, error: authError } = await supabase.auth.signInWithPassword({
                email: credentials.email,
                password: credentials.password,
            });

            if (authError) throw authError;

            // Fetch profile - checks both possible ID columns to ensure resilience
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('role_type')
                .or(`user_id.eq.${data.user.id},id.eq.${data.user.id}`)
                .maybeSingle();

            if (profileError) throw profileError;

            // Secure Redirect based on verified DB role (including new specialized roles)
            const adminRoles = ['Super Admin', 'Admin', 'Co-Admin', 'HR Manager', 'Finance Officer', 'Field Super'];
            if (adminRoles.includes(profile.role_type)) {
                navigate('/admin-dashboard');
            } else {
                navigate('/employee-dashboard');
            }

        } catch (error) {
            // Filter out the generic PostgREST schema error to prevent it from blocking the UI
            const msg = error.message || '';
            if (msg.toLowerCase().includes('querying schema') || msg.toLowerCase().includes('internal server error')) {
                console.warn('Backend is refreshing, retrying...');
                // If it's the 500 error, we show a friendlier message
                setError("System is synchronizing. Please wait 2 seconds and try again.");
            } else {
                setError(msg || 'Authentication Failed');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <Link to="/" className="back-btn-top">
                <FaArrowLeft /> Back to Website
            </Link>
            <div className="login-box animate-fade-in">
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

                {error && <div className="login-error">{error}</div>}

                <form onSubmit={handleLogin} className="login-form">
                    <div className="form-group">
                        <label>Official Email ID</label>
                        <input
                            type="email"
                            value={credentials.email}
                            onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                            placeholder="administration@bharathcaresindia.org"
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
                    <button type="submit" className="btn-secure" disabled={loading}>
                        {loading ? 'Authenticating...' : 'Secure Login'}
                    </button>
                </form>
                <div className="login-footer">
                    <p>Restricted access for foundation staff only.</p>
                </div>
            </div>
        </div>
    );
};

export default Login;
