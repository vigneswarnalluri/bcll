import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import './Login.css';

const Login = () => {
    const [role, setRole] = useState('employee');
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: credentials.email,
                password: credentials.password,
            });

            if (error) throw error;

            // Fetch profile to determine dashboard
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('role_type')
                .eq('id', data.user.id)
                .single();

            if (profileError) throw profileError;

            // Secure Redirect based on verified DB role
            if (profile.role_type === 'Super Admin' || profile.role_type === 'Admin' || profile.role_type === 'Co-Admin') {
                navigate('/admin-dashboard');
            } else {
                navigate('/employee-dashboard');
            }

        } catch (error) {
            alert(`Authentication Failed: ${error.message}`);
        } finally {
            setLoading(false);
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
                    <label>Official Email ID</label>
                    <input
                        type="email"
                        value={credentials.email}
                        onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                        placeholder="your.name@bcllf.org"
                        required
                    />
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
                    <button type="submit" className="btn btn-primary full-width" disabled={loading}>
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
