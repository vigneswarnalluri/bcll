import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaArrowLeft, FaUserShield } from 'react-icons/fa';
import { supabase } from '../../lib/supabase';
import './Login.css';

const Login = () => {
    const [role, setRole] = useState('admin');
    const [loginStep, setLoginStep] = useState('credentials'); // 'credentials' or 'otp'
    const [identifier, setIdentifier] = useState(''); // Can be Username or Email
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [tempUser, setTempUser] = useState(null);
    const [mfaData, setMfaData] = useState(null); // { factorId, challengeId, type: 'verify' | 'enroll', qrCode: '', secret: '' }
    const navigate = useNavigate();

    console.log('Login Terminal State:', {
        loginStep,
        mfaType: mfaData?.type,
        hasTempUser: !!tempUser,
        hasError: !!error
    });

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            let emailToUse = identifier;

            // 1. Username/Email Flex Logic
            if (!identifier.includes('@')) {
                // If it doesn't look like an email, treat as Username
                const { data: profile, error: uError } = await supabase
                    .from('profiles')
                    .select('email')
                    .eq('username', identifier)
                    .maybeSingle();

                if (uError) throw uError;
                if (!profile) throw new Error("Terminal Identifier (Username) not found in registry.");
                emailToUse = profile.email;
            }

            // 2. Initial Auth Gate
            const { data: { user }, error: authError } = await supabase.auth.signInWithPassword({
                email: emailToUse,
                password: password,
            });

            if (authError) throw authError;

            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('role_type, full_name')
                .eq('user_id', user.id)
                .maybeSingle();

            console.log('Terminal Auth Profile Verified:', profile);

            if (profileError) throw profileError;

            const adminRoles = [
                'Super Admin', 'Admin', 'Co-Admin',
                'Founder / Director', 'Executive Director',
                'Chief Advisory Secretary', 'Admin Head',
                'Finance Head', 'HR Manager', 'Supervisor', 'Finance Executive'
            ];

            const userRole = profile?.role_type?.trim();
            const isAdmin = adminRoles.some(r => r.toLowerCase() === userRole?.toLowerCase());

            console.log('Access Authorization Result:', { isAdmin, userRole });

            if (isAdmin) {
                try {
                    // 4. MFA Subsystem Activation
                    const { data: factorsData, error: factorsError } = await supabase.auth.mfa.listFactors();
                    if (factorsError) throw factorsError;

                    const factors = factorsData?.all || [];
                    const totpFactor = factors.find(f => f.factor_type === 'totp' && f.status === 'verified');

                    if (totpFactor) {
                        // A: Verification Flow (Already Enrolled)
                        const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId: totpFactor.id });
                        if (challengeError) throw challengeError;

                        setTempUser({ user, profile });
                        setMfaData({
                            factorId: totpFactor.id,
                            challengeId: challenge?.id,
                            type: 'verify'
                        });
                        setLoginStep('otp');
                    } else {
                        // B: Enrollment Flow (First Time)
                        // Pre-emptive Cleanup: Remove any stale unverified factors
                        const unverified = factors.filter(f => f.status === 'unverified');
                        for (const factor of unverified) {
                            try {
                                await supabase.auth.mfa.unenroll({ factorId: factor.id });
                            } catch (e) { console.warn('Cleanup non-critical error:', e); }
                        }

                        // Generate New Enrollment
                        const { data: enrollment, error: enrollError } = await supabase.auth.mfa.enroll({ factorType: 'totp' });
                        if (enrollError) throw enrollError;

                        // Create Verification Challenge for this enrollment
                        const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId: enrollment.id });
                        if (challengeError) throw challengeError;

                        setTempUser({ user, profile });
                        setMfaData({
                            factorId: enrollment?.id,
                            challengeId: challenge?.id,
                            type: 'enroll',
                            qrCode: enrollment?.totp?.qr_code || '',
                            secret: enrollment?.totp?.secret || ''
                        });
                        setLoginStep('otp');
                    }
                } catch (mfaErr) {
                    console.error('SEC-MFA-SUBSYSTEM-ERROR:', mfaErr);
                    throw new Error(`MFA Security Subsystem Error: ${mfaErr.message || 'Unknown Failure'}`);
                }
            } else {
                // Direct access for standard personnel
                navigate('/employee-dashboard');
            }

        } catch (error) {
            console.error('Terminal Security Alert:', error);
            setError(error.message || 'Access Denied: Invalid Credentials');
        } finally {
            setLoading(false);
        }
    };

    const handleOtpVerify = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        const code = otp.join('');

        try {
            if (mfaData.type === 'enroll') {
                // Verify the enrollment challenge
                const { error: verifyError } = await supabase.auth.mfa.verify({
                    factorId: mfaData.factorId,
                    challengeId: mfaData.challengeId,
                    code: code
                });

                if (verifyError) throw verifyError;

                // Enrollment success, now log in fully
                navigate('/admin-dashboard');
            } else {
                // Standard challenge verification
                const { error: verifyError } = await supabase.auth.mfa.verify({
                    factorId: mfaData.factorId,
                    challengeId: mfaData.challengeId,
                    code: code
                });

                if (verifyError) throw verifyError;
                navigate('/admin-dashboard');
            }
        } catch (err) {
            console.error('MFA Verification Failure:', err);
            setError(err.message || "Invalid OTP Code. Please try again.");
            setOtp(['', '', '', '', '', '']);
        } finally {
            setLoading(false);
        }
    };

    const handleOtpChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value.substring(value.length - 1);
        setOtp(newOtp);
        if (value && index < 5) {
            document.getElementById(`otp-${index + 1}`).focus();
        }
    };

    if (loginStep === 'otp') {
        const isEnrollment = mfaData?.type === 'enroll';

        return (
            <div className="login-container">
                <div className="login-box animate-fade-in" style={{ textAlign: 'center', maxWidth: '500px' }}>
                    <div className="security-icon" style={{ fontSize: '3rem', color: '#e53e3e', marginBottom: '20px' }}>
                        <FaUserShield />
                    </div>
                    <div className="login-header">
                        <h2>{isEnrollment ? 'Secure MFA Enrollment' : 'Administrative MFA'}</h2>
                        <p>Identity Verification for <strong>{tempUser?.profile.full_name}</strong></p>
                    </div>

                    <form onSubmit={handleOtpVerify}>
                        {isEnrollment ? (
                            <div style={{ marginBottom: '25px' }}>
                                <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '20px' }}>
                                    To protect your administrative account, please scan the QR code with an authenticator app (Google/Microsoft Authenticator) and enter the 6-digit code.
                                </p>
                                <div style={{ background: 'white', padding: '15px', borderRadius: '15px', display: 'inline-block', marginBottom: '15px', border: '1px solid #e2e8f0' }}>
                                    {mfaData?.qrCode ? (
                                        <img
                                            src={mfaData.qrCode}
                                            alt="MFA Security QR"
                                            style={{ width: '180px', height: '180px', display: 'block' }}
                                        />
                                    ) : (
                                        <div style={{ width: '180px', height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                                            Generating Secure QR...
                                        </div>
                                    )}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic' }}>
                                    Secret Key: <code style={{ background: '#f1f5f9', padding: '2px 5px', borderRadius: '4px' }}>{mfaData?.secret}</code>
                                </div>
                            </div>
                        ) : (
                            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '25px' }}>
                                Enter the 6-digit code from your registered authenticator device to finalized access.
                            </p>
                        )}

                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '30px' }}>
                            {otp.map((digit, i) => (
                                <input
                                    key={i}
                                    id={`otp-${i}`}
                                    type="text"
                                    value={digit}
                                    onChange={(e) => handleOtpChange(i, e.target.value)}
                                    autoFocus={i === 0}
                                    style={{
                                        width: '45px',
                                        height: '55px',
                                        textAlign: 'center',
                                        fontSize: '1.5rem',
                                        fontWeight: '800',
                                        borderRadius: '12px',
                                        border: '2px solid #e2e8f0',
                                        background: '#f8fafc'
                                    }}
                                />
                            ))}
                        </div>

                        {error && <div className="login-error" style={{ marginBottom: '20px' }}>{error}</div>}

                        <button type="submit" className="btn-secure" disabled={loading}>
                            {loading ? 'Verifying...' : isEnrollment ? 'Verify & Finalize' : 'Finalize Access'}
                        </button>
                    </form>

                    <button
                        className="back-btn-top"
                        style={{ position: 'relative', marginTop: '20px', left: 0 }}
                        onClick={() => {
                            setLoginStep('credentials');
                            setMfaData(null);
                        }}
                    >
                        Re-enter Credentials
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="login-container">
            <Link to="/" className="back-btn-top">
                <FaArrowLeft /> Back to Website
            </Link>
            <div className="login-box animate-fade-in">
                <div className="login-header">
                    <h2>BCLLF e-Office</h2>
                    <p>Secure Institutional Access Terminal</p>
                </div>

                <div className="role-switch">
                    <button
                        className={`role-btn ${role === 'admin' ? 'active' : ''}`}
                        onClick={() => setRole('admin')}
                    >
                        Authorities
                    </button>
                    <button
                        className={`role-btn ${role === 'employee' ? 'active' : ''}`}
                        onClick={() => setRole('employee')}
                    >
                        Personnel
                    </button>
                </div>

                {error && <div className="login-error">{error}</div>}

                <form onSubmit={handleLogin} className="login-form">
                    <div className="form-group">
                        <label>Institutional Identifier (Username/Email)</label>
                        <input
                            type="text"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            placeholder="admin_id or director@bc-india.org"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Secure Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    <button type="submit" className="btn-secure" disabled={loading}>
                        {loading ? 'Authenticating Terminal...' : 'Authenticate Access'}
                    </button>
                </form>
                <div className="login-footer">
                    <p>Restricted access for BCLLF Foundation authorized staff only. Unauthorized entry is logged in the forensic audit.</p>
                </div>
            </div>
        </div>
    );
};

export default Login;
