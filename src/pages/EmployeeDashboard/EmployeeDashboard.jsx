import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import {
    FaCalendarCheck, FaMoneyBillWave, FaTasks, FaSignOutAlt,
    FaClock, FaCheckCircle, FaExclamationCircle, FaDownload, FaFileUpload, FaPlus,
    FaUserCircle, FaEdit, FaFileSignature, FaIdCard, FaPlane, FaEnvelopeOpenText,
    FaDatabase, FaUserPlus, FaHandsHelping, FaGraduationCap, FaUniversity, FaBriefcase, FaUserLock, FaMapMarkerAlt, FaPhone,
    FaHeartbeat, FaBalanceScale, FaUserShield, FaGavel, FaLock, FaEye, FaCloudUploadAlt
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import '../Dashboard/Dashboard.css';

const EmployeeDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(true);

    // --- REAL DATABASE STATE ---
    const [employeeData, setEmployeeData] = useState(null);

    useEffect(() => {
        fetchEmployeeDetails();
    }, []);

    const fetchEmployeeDetails = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                navigate('/login');
                return;
            }

            // RBAC CHECK
            const { data: profile } = await supabase
                .from('profiles')
                .select('role_type')
                .eq('user_id', user.id)
                .single();

            const adminRoles = [
                'Super Admin', 'Admin', 'Co-Admin', 'Founder / Director',
                'Executive Director', 'Chief Advisory Secretary', 'Admin Head', 'Finance Head'
            ];

            if (profile && adminRoles.some(r => r.toLowerCase() === profile.role_type?.trim().toLowerCase())) {
                console.log('Admin detected in Employee HQ: Redirecting to Command Center');
                navigate('/admin-dashboard');
                return;
            }

            // Enhanced lookup: Try user_id first, then fallback to email
            let { data: emp, error: empError } = await supabase
                .from('employees')
                .select('*')
                .eq('user_id', user.id)
                .maybeSingle();

            if (!emp) {
                const cleanEmail = user.email?.trim().toLowerCase();
                const { data: empByEmail } = await supabase
                    .from('employees')
                    .select('*')
                    .ilike('email', cleanEmail)
                    .maybeSingle();

                if (empByEmail) {
                    emp = empByEmail;
                    // Auto-link to user_id if this is their first login
                    if (!emp.user_id) {
                        await supabase
                            .from('employees')
                            .update({ user_id: user.id })
                            .eq('id', emp.id);
                        emp.user_id = user.id;
                    }
                }
            }

            if (emp) {
                setEmployeeData(emp);

                // Fetch Leave Requests for this employee
                const { data: leaves } = await supabase
                    .from('leave_requests')
                    .select('*')
                    .eq('employee_id', emp.id)
                    .order('created_at', { ascending: false });

                if (leaves) {
                    setRequests(leaves.map(l => {
                        const start = new Date(l.start_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                        const end = l.end_date ? new Date(l.end_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : start;
                        return {
                            id: l.id,
                            type: l.leave_type || 'Leave',
                            date: l.start_date,
                            reason: l.reason,
                            status: l.status,
                            amount: start === end ? start : `${start} - ${end}`
                        };
                    }));
                }

                // Fetch Field Reports
                const { data: fieldReports } = await supabase
                    .from('field_reports')
                    .select('*')
                    .eq('posted_by', user.id)
                    .order('created_at', { ascending: false });

                if (fieldReports) {
                    setReports(fieldReports.map(r => ({
                        id: r.id,
                        date: new Date(r.created_at).toLocaleDateString(),
                        title: r.title,
                        task: r.content,
                        status: r.status || 'Submitted'
                    })));
                }

                // Fetch Attendance Logs for Current Month
                const today = new Date();
                const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
                const todayStr = today.toISOString().split('T')[0];

                const { data: attendanceLogs } = await supabase
                    .from('attendance')
                    .select('*')
                    .eq('employee_id', emp.id)
                    .gte('attendance_date', startOfMonth);

                let markedToday = false;
                let presentDays = 0;
                let history = Array.from({ length: 31 }, (_, i) => ({ day: i + 1, status: 'none' }));

                if (attendanceLogs) {
                    presentDays = attendanceLogs.filter(log => log.status === 'Present').length;
                    markedToday = attendanceLogs.some(log => log.attendance_date === todayStr);

                    history = history.map(d => {
                        const log = attendanceLogs.find(l => parseInt(l.attendance_date.split('-')[2]) === d.day);
                        return {
                            ...d,
                            status: log ? (log.status === 'Present' ? 'present' : 'absent') : 'none',
                            isLocked: log?.is_locked || false
                        };
                    });
                }

                // Calculate leaves taken (Approved ones)
                const approvedLeaves = leaves ? leaves.filter(l => l.status === 'Approved').length : 0;
                setAttendance({
                    markedToday,
                    presentDays,
                    leavesTaken: approvedLeaves,
                    history
                });

                // Fetch Salary Slips (Payroll Records)
                const { data: salaryData } = await supabase
                    .from('payroll_records')
                    .select('*')
                    .eq('employee_id', emp.id)
                    .order('created_at', { ascending: false });

                if (salaryData) {
                    setSalarySlips(salaryData.map(s => ({
                        id: s.id,
                        cycle: s.month,
                        amount: s.net_salary,
                        status: s.status
                    })));
                }
            }
        } catch (error) {
            console.error('Core data fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    // --- APP STATE ---
    const [reports, setReports] = useState([]);

    const [attendance, setAttendance] = useState({
        markedToday: false,
        presentDays: 0,
        leavesTaken: 0,
        history: []
    });

    const [requests, setRequests] = useState([]);
    const [salarySlips, setSalarySlips] = useState([]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState('report');

    // --- HANDLERS ---
    const markAttendance = async () => {
        if (!attendance.markedToday && employeeData) {
            try {
                const todayStr = new Date().toISOString().split('T')[0];
                const { error } = await supabase
                    .from('attendance')
                    .insert([{
                        employee_id: employeeData.id,
                        attendance_date: todayStr,
                        status: 'Present'
                    }]);

                if (error) throw error;

                // Refresh data to show reflected state
                await fetchEmployeeDetails();
                alert('Attendance marked successfully for today!');
            } catch (err) {
                console.error('Attendance Error:', err);
                alert('Failed to mark attendance. You may have already marked it today.');
            }
        }
    };

    const submitGeneralRequest = async (type, details) => {
        if (!employeeData) return;
        setLoading(true);
        try {
            const { error } = await supabase.from('approval_requests').insert([{
                type: type,
                initiated_by: employeeData.user_id,
                details: details,
                level_1_status: 'Pending',
                final_status: 'Pending'
            }]);

            if (error) throw error;
            alert(`${type} Transmitted to Registry HQ Successfully.`);
        } catch (err) {
            console.error('Request Error:', err);
            alert('Failed to transmit request: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const submitRequest = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);

        if (modalType === 'leave') {
            const { error } = await supabase.from('leave_requests').insert([{
                employee_id: employeeData.id,
                leave_type: formData.get('subType'),
                start_date: formData.get('startDate'),
                end_date: formData.get('endDate') || formData.get('startDate'),
                reason: formData.get('reason'),
                status: 'Pending'
            }]);

            if (!error) {
                alert('Leave Request Submitted Successfully');
                setIsModalOpen(false);
                fetchEmployeeDetails(); // Refresh list
            }
        } else {
            alert('TA Claims module is currently updating... Try Leave Request instead.');
            setIsModalOpen(false);
        }
    };

    const submitReport = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            const { error } = await supabase
                .from('field_reports')
                .insert([{
                    title: formData.get('title'),
                    category: formData.get('category'),
                    content: formData.get('content'),
                    posted_by: user.id,
                    status: 'Submitted'
                }]);

            if (error) throw error;

            alert('Mission Report Logged Successfully');
            setIsModalOpen(false);
            fetchEmployeeDetails();
        } catch (err) {
            console.error('Report submission error:', err);
            alert('Failed to log report. Please check your connection.');
        }
    };

    const handleFileUpload = async (type, file) => {
        if (!employeeData || !file) return;
        setLoading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${employeeData.id}/${type}_${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('employee-docs')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('employee-docs')
                .getPublicUrl(filePath);

            const columnMap = {
                'id_card': 'doc_id_card',
                'appt_letter': 'doc_appointment_letter',
                'bank_passbook': 'doc_bank_passbook',
                'edu_certs': 'doc_education_certs'
            };

            const { error: updateError } = await supabase
                .from('employees')
                .update({ [columnMap[type]]: publicUrl })
                .eq('id', employeeData.id);

            if (updateError) throw updateError;

            alert('Mission Artifact Vaulted Successfully.');
            await fetchEmployeeDetails();
        } catch (err) {
            console.error('Vault Error:', err);
            alert('Failed to vault artifact: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const menuItems = [
        { id: 'profile', icon: <FaUserCircle />, label: 'My Personnel File' },
        { id: 'reports', icon: <FaTasks />, label: 'Daily Work Log' },
        { id: 'attendance', icon: <FaCalendarCheck />, label: 'Attendance & Pay' },
        { id: 'data-entry', icon: <FaDatabase />, label: 'Field Operations' },
        { id: 'benefits', icon: <FaPlane />, label: 'Leave & TA Claims' },
        { id: 'official', icon: <FaEnvelopeOpenText />, label: 'Official Requests' },
        { id: 'id-card', icon: <FaIdCard />, label: 'ID Card System' },
        { id: 'policies', icon: <FaGavel />, label: 'Governance & Policies' },
    ];

    if (loading) return <div className="loading-state">Syncing Professional Record...</div>;
    if (!employeeData) return <div className="loading-state">Record not found. Please contact Admin.</div>;

    const renderContent = () => {
        switch (activeTab) {
            case 'profile': return <ProfileTab data={employeeData} onUpdate={() => { setModalType('edit-profile'); setIsModalOpen(true); }} onUpload={handleFileUpload} />;
            case 'reports': return <ReportsTab reports={reports} onAddNew={() => { setModalType('report'); setIsModalOpen(true); }} />;
            case 'attendance': return <AttendanceTab attendance={attendance} salarySlips={salarySlips} onMark={markAttendance} />;
            case 'data-entry': return <DataEntryTab onOpenTerminal={(type) => { setModalType(type); setIsModalOpen(true); }} />;
            case 'benefits': return <BenefitsTab requests={requests} onApply={(type) => { setModalType(type); setIsModalOpen(true); }} />;
            case 'official': return <OfficialLettersTab onSubmit={(details) => submitGeneralRequest('Credentialing Authorization', details)} />;
            case 'id-card': return <IDCardTab onReplicaRequest={() => submitGeneralRequest('ID Card Replication', { reason: 'Hardware Damaged', requested_at: new Date().toISOString() })} />;
            case 'policies': return <EmployeePoliciesTab />;
            case 'scholarship-form': return <ScholarshipForm onClose={() => setIsModalOpen(false)} onRefresh={fetchEmployeeDetails} />;
            default: return <ProfileTab data={employeeData} />;
        }
    };

    return (
        <div className="dashboard-container">
            <div className="sidebar">
                <div className="sidebar-header">
                    <img src="/logo-CYlp3-fg__1_-removebg-preview.svg" alt="Logo" className="dash-logo" style={{ width: '40px' }} />
                    <h3 style={{ fontSize: '1rem' }}>BCLLF E-Office</h3>
                </div>
                <ul className="sidebar-menu" role="menu">
                    {menuItems.map(item => (
                        <li key={item.id} className={activeTab === item.id ? 'active' : ''} onClick={() => setActiveTab(item.id)} role="menuitem" tabIndex="0">
                            {item.icon} <span>{item.label}</span>
                        </li>
                    ))}
                    <li onClick={async () => { await supabase.auth.signOut(); navigate('/login'); }} className="logout-btn" role="menuitem"><FaSignOutAlt /> <span>Exit Portal</span></li>
                </ul>
            </div>

            <div className="main-content">
                <marquee behavior="alternate" style={{ background: '#fffaf0', color: '#b7791f', padding: '10px 0', fontSize: '0.9rem', fontWeight: 'bold' }}>
                    🕘 Employees must mark daily attendance before 10:00 AM | Attendance is linked to salary processing.
                </marquee>
                <marquee direction="right" style={{ background: '#f8fafc', color: '#1a365d', padding: '5px 0', fontSize: '0.85rem', fontWeight: 'bold', borderBottom: '1px solid #e2e8f0' }}>
                    📄 Attendance once locked cannot be edited without Director approval.
                </marquee>
                <div className="dash-header">
                    <div className="header-title">
                        <h2>{menuItems.find(i => i.id === activeTab)?.label}</h2>
                        <nav aria-label="Breadcrumb">
                            <p className="breadcrumb">
                                <span className="breadcrumb-link" onClick={() => setActiveTab('profile')}>Professional</span>
                                <span className="breadcrumb-sep">/</span>
                                <span className="breadcrumb-current">{menuItems.find(i => i.id === activeTab)?.label}</span>
                            </p>
                        </nav>
                    </div>
                    <div className="user-profile">
                        <div className="user-info">
                            <span className="user-name">{employeeData.full_name}</span>
                            <span className="user-role">{employeeData.employee_id} • {employeeData.designation}</span>
                        </div>
                        <div className="avatar">{employeeData.full_name.split(' ').map(n => n[0]).join('')}</div>
                    </div>
                </div>

                <div className="tab-content-wrapper">{renderContent()}</div>
            </div>

            {/* SHARED MODAL */}
            {isModalOpen && (
                <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div style={{ padding: '30px' }}>
                            {modalType === 'scholarship' && (
                                <ScholarshipForm
                                    onClose={() => setIsModalOpen(false)}
                                    onRefresh={() => {
                                        fetchEmployeeDetails();
                                        setIsModalOpen(false);
                                    }}
                                />
                            )}
                            {modalType === 'edit-profile' && (
                                <UpdateCredentialsForm
                                    data={employeeData}
                                    onClose={() => setIsModalOpen(false)}
                                    onRefresh={() => {
                                        fetchEmployeeDetails();
                                        setIsModalOpen(false);
                                    }}
                                />
                            )}
                            {modalType === 'report' && (
                                <form onSubmit={submitReport}>
                                    <h3 style={{ marginBottom: '20px' }}>Log Operation Activity</h3>

                                    <div className="form-group" style={{ marginBottom: '15px' }}>
                                        <label>Report Title</label>
                                        <input name="title" className="form-control" style={{ width: '100%', padding: '12px' }} placeholder="Summary of activity..." required />
                                    </div>

                                    <div className="form-group" style={{ marginBottom: '15px' }}>
                                        <label>Mission Category</label>
                                        <select name="category" className="form-control" style={{ width: '100%', padding: '12px' }}>
                                            <option>Education</option>
                                            <option>Healthcare</option>
                                            <option>Disaster Relief</option>
                                            <option>Community Outreach</option>
                                            <option>Administrative</option>
                                        </select>
                                    </div>

                                    <div className="form-group" style={{ marginBottom: '20px' }}>
                                        <label>Substantive Content</label>
                                        <textarea name="content" rows="5" className="form-control" style={{ width: '100%', padding: '15px', borderRadius: '10px', border: '1px solid #e2e8f0' }} placeholder="Detail your field work or beneficiary interaction..."></textarea>
                                    </div>

                                    <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end' }}>
                                        <button type="button" className="btn-small" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                        <button type="submit" className="btn-add">Log Entry</button>
                                    </div>
                                </form>
                            )}
                            {['leave', 'ta'].includes(modalType) && (
                                <form onSubmit={submitRequest}>
                                    <h3 style={{ marginBottom: '20px' }}>Initiate {modalType === 'leave' ? 'Leave' : 'TA / Claim'} Request</h3>
                                    <input type="hidden" name="reqType" value={modalType} />

                                    <div className="form-group" style={{ marginBottom: '15px' }}>
                                        <label>{modalType === 'leave' ? 'Leave Type' : 'Claim Type'}</label>
                                        <select name="subType" className="form-control" style={{ width: '100%', padding: '12px' }}>
                                            <option>Sick Leave</option>
                                            <option>Casual Leave</option>
                                            <option>Earned Leave</option>
                                            <option>Travel Allowance</option>
                                            <option>Medical Reimbursement</option>
                                        </select>
                                    </div>

                                    <div className="form-group" style={{ marginBottom: '15px' }}>
                                        <label>Start / Transaction Date</label>
                                        <input type="date" name="startDate" className="form-control" style={{ width: '100%', padding: '12px' }} required />
                                    </div>

                                    {modalType === 'leave' && (
                                        <div className="form-group" style={{ marginBottom: '15px' }}>
                                            <label>End Date (Optional)</label>
                                            <input type="date" name="endDate" className="form-control" style={{ width: '100%', padding: '12px' }} />
                                        </div>
                                    )}

                                    <div className="form-group" style={{ marginBottom: '15px' }}>
                                        <label>Explanation / Reasoning</label>
                                        <textarea name="reason" rows="3" className="form-control" style={{ width: '100%', padding: '12px' }} required></textarea>
                                    </div>

                                    <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end' }}>
                                        <button type="button" className="btn-small" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                        <button type="submit" className="btn-add">Submit to Registry</button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

/* --- ENHANCED PROFILE COMPONENT --- */

const ProfileTab = ({ data, onUpdate, onUpload }) => {
    const triggerFileSelect = (type) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.pdf,.jpg,.jpeg,.png';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) onUpload(type, file);
        };
        input.click();
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            <div className="content-panel">
                <div style={{ display: 'flex', gap: '40px', alignItems: 'flex-start' }}>
                    <div className="profile-large-avatar" style={{ width: '140px', height: '140px', background: 'var(--primary)', color: 'white', borderRadius: '25px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3.5rem', fontWeight: '800' }}>
                        {data.full_name?.split(' ').map(n => n[0]).join('') || '?'}
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                            <div>
                                <h2 style={{ margin: 0, color: 'var(--primary)' }}>{data.full_name}</h2>
                                <p style={{ color: '#666', fontSize: '1.1rem', margin: '5px 0' }}>{data.designation} • {data.department}</p>
                                <span className="badge success">{data.status} Account</span>
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button className="btn-small" onClick={onUpdate}><FaEdit /> Update Credentials</button>
                                <button className="btn-small" style={{ background: '#718096' }} onClick={() => alert('CV Artifact generation currently in queue.')}><FaDownload /> Full CV</button>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', background: '#f8fafc', padding: '20px', borderRadius: '15px' }}>
                            <div><strong>Gender:</strong><br />{data.gender}</div>
                            <div><strong>DOB:</strong><br />{data.dob}</div>
                            <div><strong>Marital Status:</strong><br />{data.marital_status}</div>
                            <div><strong>Blood Group:</strong><br />{data.blood_group}</div>
                            <div><strong>Mobile:</strong><br />{data.mobile}</div>
                            <div><strong>Official Email:</strong><br />{data.email}</div>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginTop: '30px' }}>
                    <div>
                        <strong>Current Address:</strong><p style={{ margin: '5px 0', fontSize: '0.9rem' }}>{data.current_address}</p>
                    </div>
                    <div>
                        <strong>Permanent Address:</strong><p style={{ margin: '5px 0', fontSize: '0.9rem' }}>{data.permanent_address}</p>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px' }}>
                {/* EMPLOYMENT DETAIL CATEGORY 3 & 7 */}
                <div className="content-panel">
                    <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '15px', marginBottom: '20px' }}><FaBriefcase /> Employment & System Info</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div><strong>Reporting Manager:</strong><br />{data.reporting_manager_id || 'Foundation HQ'}</div>
                        <div><strong>Location:</strong><br />{data.work_location}</div>
                        <div><strong>Joining Date:</strong><br />{data.date_of_joining}</div>
                        <div><strong>Employment Type:</strong><br />{data.employment_type}</div>
                        <div><strong>Attendance Mode:</strong><br />{data.attendance_type}</div>
                        <div><strong>Office Timings:</strong><br />{data.office_timings}</div>
                        <div><strong>Access Level:</strong><br />Personnel</div>
                        <div><strong>Account Since:</strong><br />{new Date(data.created_at).toLocaleDateString()}</div>
                    </div>
                </div>

                {/* IDENTITY & FINANCIAL CATEGORY 2 & 4 */}
                <div className="content-panel" style={{ border: '1px solid #ecc94b', background: '#fffaf0' }}>
                    <h3 style={{ borderBottom: '1px solid #ecc94b', paddingBottom: '15px', marginBottom: '20px', color: '#b7791f' }}><FaUserLock /> Secure KYC & Financials</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div><strong>Aadhaar No:</strong><br />{data.aadhaar_masked}</div>
                        <div><strong>PAN Card:</strong><br />{data.pan_number}</div>
                        <div><strong>Voter ID:</strong><br />{data.voter_id}</div>
                        <div><strong>Passport:</strong><br />{data.passport_number}</div>
                        <div><strong>Bank Name:</strong><br />{data.bank_name}</div>
                        <div><strong>Acc Holder:</strong><br />{data.acc_holder_name}</div>
                        <div><strong>UPI ID:</strong><br />{data.upi_id}</div>
                        <div><strong>Pay Mode:</strong><br />{data.payment_mode}</div>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '30px' }}>
                {/* EMERGENCY CATEGORY 9 */}
                <div className="content-panel" style={{ border: '1px solid #bee3f8', background: '#ebf8ff' }}>
                    <h4 style={{ marginBottom: '15px' }}><FaHeartbeat /> Emergency Contact</h4>
                    <p><strong>{data.emergency_name}</strong> ({data.emergency_relation})<br />{data.emergency_mobile}<br /><small>Verified Registry Contact</small></p>
                </div>

                {/* PERFORMANCE CATEGORY 10 */}
                <div className="content-panel">
                    <h4 style={{ marginBottom: '15px' }}><FaBalanceScale /> Performance Audit</h4>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>Rating: <strong>{data.performance_rating || 'N/A'}</strong></span>
                        <span className="badge success">Good Standing</span>
                    </div>
                    <p style={{ fontSize: '0.85rem', marginTop: '10px' }}>Remarks: {data.performance_remarks || 'No active remarks'}<br />Warnings: {data.warning_notices || 0}</p>
                </div>

                {/* COMPLIANCE CATEGORY 11 */}
                <div className="content-panel">
                    <h4 style={{ marginBottom: '15px' }}><FaCheckCircle /> Policy Compliance</h4>
                    <p style={{ fontSize: '0.85rem' }}>Status: <strong>{data.signed_policy ? 'Accepted' : 'Pending'}</strong><br />Acknowledged on: {data.policy_signed_date || 'Pending'}</p>
                    <button className="btn-small" style={{ width: '100%', marginTop: '5px' }}>View NGO Handbook</button>
                </div>
            </div>

            {/* DOCUMENTS CATEGORY 8 */}
            <div className="content-panel">
                <h3 style={{ marginBottom: '20px' }}><FaFileUpload /> Category 8: Digital Document Vault</h3>
                <div style={{ display: 'flex', gap: '20px' }}>
                    <DocumentCard title="ID Card Copy" icon={<FaIdCard />} url={data.doc_id_card} onUpload={() => triggerFileSelect('id_card')} />
                    <DocumentCard title="Appt. Letter" icon={<FaFileSignature />} url={data.doc_appointment_letter} onUpload={() => triggerFileSelect('appt_letter')} />
                    <DocumentCard title="Bank Passbook" icon={<FaUniversity />} url={data.doc_bank_passbook} onUpload={() => triggerFileSelect('bank_passbook')} />
                    <DocumentCard title="Edu certificates" icon={<FaGraduationCap />} url={data.doc_education_certs} onUpload={() => triggerFileSelect('edu_certs')} />
                </div>
            </div>
        </div>
    );
};

const DocumentCard = ({ title, icon, url, onUpload }) => (
    <div style={{ flex: 1, padding: '20px', border: '1px solid #edf2f7', borderRadius: '16px', textAlign: 'center', background: url ? '#f0fff4' : '#fff', transition: 'all 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
        <div style={{ fontSize: '2rem', color: url ? '#38a169' : '#cbd5e0', marginBottom: '10px' }}>{icon}</div>
        <div style={{ fontWeight: '700', fontSize: '0.85rem', marginBottom: '15px', color: '#4a5568' }}>{title}</div>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
            {url ? (
                <>
                    <button className="btn-icon blue" onClick={() => window.open(url, '_blank')} title="View Document"><FaEye /></button>
                    <button className="btn-icon" onClick={() => onUpload()} title="Replace Document"><FaCloudUploadAlt /></button>
                </>
            ) : (
                <button className="btn-add" style={{ padding: '5px 12px', fontSize: '0.75rem' }} onClick={() => onUpload()}>
                    <FaCloudUploadAlt /> Vault it
                </button>
            )}
        </div>
    </div>
);

/* --- SHARED TABS (Stay as provided) --- */
const ReportsTab = ({ reports, onAddNew }) => (
    <div className="content-panel">
        <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px' }}>
            <h3>Verified Operational Logs</h3>
            <button className="btn-add" onClick={onAddNew}><FaPlus /> Log Field Entry</button>
        </div>
        <table className="data-table">
            <thead>
                <tr><th>Entry Date</th><th>Substantive Task Description</th><th>Registry Status</th></tr>
            </thead>
            <tbody>
                {reports.map((r) => (
                    <tr key={r.id}>
                        <td>{r.date}</td>
                        <td>
                            <div style={{ fontWeight: '600', color: 'var(--primary)' }}>{r.title}</div>
                            <div style={{ fontSize: '0.85rem', color: '#666' }}>{r.task}</div>
                        </td>
                        <td>
                            <span className={`badge ${r.status === 'Approved' ? 'success' : 'pending'}`}>
                                {r.status === 'Approved' ? <FaCheckCircle /> : <FaClock />} {r.status}
                            </span>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

const AttendanceTab = ({ attendance, salarySlips, onMark }) => (
    <>
        <div className="stats-grid">
            <StatCard title="Confirmed Present" count={attendance.presentDays} color="blue" icon={<FaCalendarCheck />} />
            <StatCard title="Approved Leaves" count={attendance.leavesTaken} color="red" icon={<FaExclamationCircle />} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: '30px' }}>
            <div className="content-panel">
                <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px' }}>
                    <h3>Monthly Verification Calendar</h3>
                    <button className={`btn-add ${attendance.markedToday ? 'disabled-btn' : ''}`} onClick={onMark} disabled={attendance.markedToday}>
                        {attendance.markedToday ? <><FaCheckCircle /> Logged for Today</> : 'Commit Entry'}
                    </button>
                </div>
                <div className="mock-calendar-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px' }}>
                    {attendance.history.map(day => (
                        <div key={day.day} style={{
                            padding: '15px',
                            textAlign: 'center',
                            borderRadius: '10px',
                            background: day.status === 'present' ? '#e6fffa' : '#f7fafc',
                            color: day.status === 'present' ? '#2c7a7b' : '#a0aec0',
                            border: day.status === 'present' ? '1px solid #b2f5ea' : '1px solid #edf2f7',
                            fontWeight: 'bold',
                            position: 'relative',
                            opacity: day.isLocked ? 0.8 : 1
                        }}>
                            {day.day}
                            {day.isLocked && <FaLock style={{ position: 'absolute', top: '5px', right: '5px', fontSize: '0.6rem', color: '#718096' }} title="Record Locked" />}
                        </div>
                    ))}
                </div>
            </div>
            <div className="content-panel">
                <h3>Salary Artifacts</h3>
                <div className="slip-list" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {salarySlips.length > 0 ? (
                        salarySlips.map(slip => (
                            <div key={slip.id} className="slip-item" style={{ display: 'flex', justifyContent: 'space-between', padding: '15px', border: '1px solid #eee', borderRadius: '12px', background: 'white' }}>
                                <div><strong>{slip.cycle}</strong><br /><small style={{ color: 'green' }}>₹ {Number(slip.amount).toLocaleString()} • {slip.status}</small></div>
                                <button className="btn-icon" onClick={() => alert(`Generating Secure PDF for ${slip.cycle}...`)}><FaDownload /></button>
                            </div>
                        ))
                    ) : (
                        <p style={{ color: '#718096', fontStyle: 'italic', padding: '20px', textAlign: 'center' }}>No salary artifacts found.</p>
                    )}
                </div>
            </div>
        </div>
    </>
);

const DataEntryTab = ({ onOpenTerminal }) => (
    <div className="content-panel">
        <h3 style={{ marginBottom: '30px' }}>Digital Field Data Terminals</h3>
        <div className="data-entry-options" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            <div className="folder-vox" style={{ padding: '30px', border: '1px solid #edf2f7', borderRadius: '20px', textAlign: 'center', cursor: 'pointer', background: '#fcfcfc' }}>
                <FaGraduationCap style={{ fontSize: '3rem', color: 'var(--primary)', marginBottom: '15px' }} />
                <h4>Scholarship Registry</h4>
                <button className="btn-add" style={{ margin: '20px auto' }} onClick={() => onOpenTerminal('scholarship')}><FaPlus /> Open Terminal</button>
            </div>
        </div>
    </div>
);

const ScholarshipForm = ({ onClose, onRefresh }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        applicant_name: '',
        academic_score: '',
        income_status: '',
        college_name: '',
        application_id: 'SCH-' + Math.floor(1000 + Math.random() * 9000),
        status: 'Awaiting Approval'
    });

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { error } = await supabase.from('scholarships').insert([formData]);
            if (error) throw error;
            alert('Scholarship Application Registered Successfully');
            if (onRefresh) onRefresh();
        } catch (err) {
            console.error('Save Error:', err);
            alert('Failed to save application: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSave}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                <h3 style={{ margin: 0 }}>Scholarship Registry Entry</h3>
                <span className="badge blue" style={{ padding: '8px 15px' }}>Ref: {formData.application_id}</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div className="form-group">
                    <label>Applicant Full Name</label>
                    <input className="form-control" value={formData.applicant_name} onChange={e => setFormData({ ...formData, applicant_name: e.target.value })} required />
                </div>
                <div className="form-group">
                    <label>Academic Score / CGPA</label>
                    <input className="form-control" value={formData.academic_score} onChange={e => setFormData({ ...formData, academic_score: e.target.value })} placeholder="e.g. 85% or 8.5" required />
                </div>
                <div className="form-group">
                    <label>Annual Family Income Status</label>
                    <select className="form-control" value={formData.income_status} onChange={e => setFormData({ ...formData, income_status: e.target.value })} required>
                        <option value="">Select Category</option>
                        <option value="Below 1 Lakh">Below 1 Lakh</option>
                        <option value="1-3 Lakhs">1-3 Lakhs</option>
                        <option value="3-5 Lakhs">3-5 Lakhs</option>
                        <option value="Above 5 Lakhs">Above 5 Lakhs</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>Current Institution / College</label>
                    <input className="form-control" value={formData.college_name} onChange={e => setFormData({ ...formData, college_name: e.target.value })} required />
                </div>
            </div>

            <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end', marginTop: '30px' }}>
                <button type="button" className="btn-small" onClick={onClose} disabled={loading}>Cancel</button>
                <button type="submit" className="btn-add" disabled={loading}>
                    {loading ? 'Transmitting...' : 'Register Application'}
                </button>
            </div>
        </form>
    );
};

const BenefitsTab = ({ requests, onApply }) => (
    <>
        <div style={{ display: 'flex', gap: '15px', marginBottom: '30px' }}>
            <button className="btn-add" onClick={() => onApply('leave')}><FaPlus /> Request Absence</button>
            <button className="btn-add" onClick={() => onApply('ta')}><FaPlane /> Claims & Adjustments</button>
        </div>
        <div className="content-panel">
            <h3>Registry Audit (Benefits & Claims)</h3>
            <table className="data-table">
                <thead><tr><th>Artifact Type</th><th>Period / Amount</th><th>Substantiation</th><th>Status</th></tr></thead>
                <tbody>
                    {requests.map(r => (
                        <tr key={r.id}>
                            <td><strong>{r.type}</strong></td>
                            <td>{r.amount || r.date}</td>
                            <td>{r.reason}</td>
                            <td><span className={`badge ${r.status === 'Approved' ? 'success' : 'pending'}`}>{r.status}</span></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </>
);

const OfficialLettersTab = ({ onSubmit }) => (
    <div className="content-panel">
        <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px' }}>
            <h3>Credentialing & Authorizations</h3>
            <button className="btn-small" onClick={() => {
                const subject = prompt('State the Subject/Purpose of Authorization:');
                if (subject) onSubmit({ subject, requested_at: new Date().toISOString() });
            }}>Request Authorization</button>
        </div>
        <div style={{ textAlign: 'center', padding: '40px', background: '#f8fafc', borderRadius: '15px' }}>
            <FaEnvelopeOpenText style={{ fontSize: '3rem', color: '#cbd5e0', marginBottom: '15px' }} />
            <p style={{ color: '#718096' }}>Requests submitted here are routed to the Admin HQ for formal credentialing. Once signed, they will appear in your Digital Vault.</p>
        </div>
    </div>
);

const IDCardTab = ({ onReplicaRequest }) => (
    <div className="content-panel" style={{ maxWidth: '650px', margin: '0 auto' }}>
        <h3 className="text-center">Official Foundation Identity</h3>
        <div style={{ padding: '40px', border: '1px solid #edf2f7', borderRadius: '25px', marginTop: '30px', background: '#f8fafc' }}>
            <div className="id-card-status" style={{ display: 'flex', alignItems: 'center', gap: '30px', marginBottom: '40px' }}>
                <div style={{ width: '70px', height: '70px', background: '#e6fffa', color: '#2c7a7b', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}><FaCheckCircle /></div>
                <div><h4 style={{ margin: 0, fontSize: '1.25rem' }}>Active Artifact Found</h4><p style={{ margin: 0, color: '#666' }}>Credential Ref: BCLL-ID-2024-X</p></div>
            </div>
            <p style={{ color: '#4a5568', lineHeight: '1.6' }}>Your digital identity is verified for field use. If physical hardware is damaged, initiate a replication request below.</p>
            <div style={{ display: 'flex', gap: '20px', marginTop: '40px' }}>
                <button className="btn-add full-width" onClick={() => {
                    if (window.confirm("Verify: Requesting a physical hardware replica requires Director approval. Proceed?")) {
                        onReplicaRequest();
                    }
                }}>Request Replica</button>
            </div>
        </div>
    </div>
);

const StatCard = ({ title, count, color, icon }) => (
    <div className={`stat-card ${color}`} style={{ padding: '25px', borderRadius: '20px' }}>
        <div className="stat-content"><h3 style={{ fontSize: '2rem' }}>{count}</h3><p style={{ fontWeight: '600' }}>{title}</p></div>
        <div className="stat-icon-overlay" style={{ fontSize: '3rem' }}>{icon}</div>
    </div>
);

/* --- CREDENTIALS UPDATE FORM --- */
const UpdateCredentialsForm = ({ data, onClose, onRefresh }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        full_name: data.full_name || '',
        mobile: data.mobile || '',
        current_address: data.current_address || '',
        permanent_address: data.permanent_address || '',
        emergency_name: data.emergency_name || '',
        emergency_relation: data.emergency_relation || '',
        emergency_mobile: data.emergency_mobile || '',
        blood_group: data.blood_group || 'O+',
        marital_status: data.marital_status || 'Single',
        email: data.email || '',
        dob: data.dob || ''
    });

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { error } = await supabase
                .from('employees')
                .update(formData)
                .eq('id', data.id);

            if (error) throw error;

            // Optional: Backup sync with profiles if user_id linked
            if (data.user_id) {
                await supabase
                    .from('profiles')
                    .update({
                        email: formData.email,
                        full_name: formData.full_name,
                        dob: formData.dob
                    })
                    .eq('user_id', data.user_id);
            }

            alert('Personnel credentials updated successfully in the digital registry.');
            if (onRefresh) onRefresh();
            onClose();
        } catch (err) {
            console.error('Update Error:', err);
            alert('Failed to update credentials: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSave}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                <h3 style={{ margin: 0 }}>Update Personnel Credentials</h3>
                <span className="badge blue" style={{ padding: '8px 15px' }}>Ref: {data.employee_id}</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div className="form-group">
                    <label>Full Name</label>
                    <input className="form-control" value={formData.full_name} onChange={e => setFormData({ ...formData, full_name: e.target.value })} required />
                </div>
                <div className="form-group">
                    <label>Mobile Number</label>
                    <input className="form-control" value={formData.mobile} onChange={e => setFormData({ ...formData, mobile: e.target.value })} required />
                </div>
                <div className="form-group">
                    <label>Official Email Address</label>
                    <input className="form-control" type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required />
                </div>
                <div className="form-group">
                    <label>Blood Group</label>
                    <select className="form-control" value={formData.blood_group} onChange={e => setFormData({ ...formData, blood_group: e.target.value })}>
                        <option>O+</option><option>A+</option><option>B+</option><option>AB+</option><option>O-</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>Marital Status</label>
                    <select className="form-control" value={formData.marital_status} onChange={e => setFormData({ ...formData, marital_status: e.target.value })}>
                        <option>Single</option><option>Married</option><option>Divorced</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>Date of Birth</label>
                    <input className="form-control" type="date" value={formData.dob} onChange={e => setFormData({ ...formData, dob: e.target.value })} required />
                </div>
            </div>

            <div className="form-group" style={{ marginBottom: '15px' }}>
                <label>Current Address</label>
                <input className="form-control" value={formData.current_address} onChange={e => setFormData({ ...formData, current_address: e.target.value })} required />
            </div>

            <div className="form-group" style={{ marginBottom: '25px' }}>
                <label>Permanent Address</label>
                <textarea className="form-control" rows="2" value={formData.permanent_address} onChange={e => setFormData({ ...formData, permanent_address: e.target.value })} required />
            </div>

            <h4 style={{ borderTop: '1px solid #eee', paddingTop: '20px', marginBottom: '15px' }}>Emergency Contact Info</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                    <label>Contact Name</label>
                    <input className="form-control" value={formData.emergency_name} onChange={e => setFormData({ ...formData, emergency_name: e.target.value })} required />
                </div>
                <div className="form-group">
                    <label>Relationship</label>
                    <input className="form-control" value={formData.emergency_relation} onChange={e => setFormData({ ...formData, emergency_relation: e.target.value })} required />
                </div>
                <div className="form-group">
                    <label>Mobile Number</label>
                    <input className="form-control" value={formData.emergency_mobile} onChange={e => setFormData({ ...formData, emergency_mobile: e.target.value })} required />
                </div>
            </div>

            <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end', marginTop: '30px' }}>
                <button type="button" className="btn-small" onClick={onClose} disabled={loading}>Cancel</button>
                <button type="submit" className="btn-add" disabled={loading}>
                    {loading ? 'Updating Registry...' : 'Update Credentials'}
                </button>
            </div>
        </form>
    );
};

/* --- EMPLOYEE POLICY TAB (READ-ONLY) --- */
const EmployeePoliciesTab = () => {
    const [policies, setPolicies] = useState([]);
    const [selectedPolicy, setSelectedPolicy] = useState(null);

    useEffect(() => {
        const fetchPolicies = async () => {
            const { data } = await supabase.from('policies').select('*').eq('status', 'Active');
            if (data) setPolicies(data);
        };
        fetchPolicies();
    }, []);

    if (selectedPolicy) {
        return (
            <div className="content-panel">
                <button className="btn-small" onClick={() => setSelectedPolicy(null)} style={{ marginBottom: '20px' }}>&larr; Back to Registry</button>
                <div style={{ padding: '30px', background: '#f8fafc', borderRadius: '20px', border: '1px solid #cbd5e0' }}>
                    <h2 style={{ color: '#1a237e', marginBottom: '10px' }}>{selectedPolicy.title}</h2>
                    <div style={{ display: 'flex', gap: '20px', fontSize: '0.85rem', color: '#64748b', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '15px' }}>
                        <span><strong>Ref:</strong> {selectedPolicy.document_ref || 'INTERNAL'}</span>
                        <span><strong>Version:</strong> {selectedPolicy.version}</span>
                        <span><strong>Effective:</strong> {selectedPolicy.effective_date}</span>
                        <span><strong>Approved By:</strong> {selectedPolicy.approved_by}</span>
                    </div>
                    <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8', color: '#2d3748' }}>
                        {selectedPolicy.content}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="content-panel">
            <h3>Organizational Policies & Governance SOPs</h3>
            <p style={{ color: '#718096', marginBottom: '25px' }}>Authorized digital registry of all active foundation rules. Your acknowledgment is captured in the audit trail during onboarding.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {policies.map(p => (
                    <div key={p.id} className="folder-box" style={{ padding: '25px', border: '1px solid #cbd5e0', borderRadius: '15px', cursor: 'pointer' }} onClick={() => setSelectedPolicy(p)}>
                        <FaGavel style={{ fontSize: '2rem', color: 'var(--primary)', marginBottom: '15px' }} />
                        <h4 style={{ margin: '0 0 10px 0' }}>{p.title}</h4>
                        <div style={{ fontSize: '0.75rem', color: '#718096' }}>
                            Version {p.version} • Effective {p.effective_date}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default EmployeeDashboard;
