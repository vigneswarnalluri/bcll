import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import {
    FaCalendarCheck, FaMoneyBillWave, FaTasks, FaSignOutAlt,
    FaClock, FaCheckCircle, FaExclamationCircle, FaDownload, FaFileUpload, FaPlus,
    FaUserCircle, FaEdit, FaFileSignature, FaIdCard, FaPlane, FaEnvelopeOpenText,
    FaDatabase, FaUserPlus, FaHandsHelping, FaGraduationCap, FaUniversity, FaBriefcase, FaUserLock, FaMapMarkerAlt, FaPhone,
    FaHeartbeat, FaBalanceScale, FaUserShield
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
                .eq('id', user.id)
                .single();

            if (profile && ['Admin', 'Super Admin', 'Co-Admin'].includes(profile.role_type)) {
                navigate('/admin-dashboard');
                return;
            }

            // Fetch core employee record
            const { data: emp, error } = await supabase
                .from('employees')
                .select('*')
                .eq('email', user.email)
                .single();

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
                    .eq('employee_id', emp.id)
                    .order('created_at', { ascending: false });

                if (fieldReports) {
                    setReports(fieldReports.map(r => ({
                        id: r.id,
                        date: new Date(r.created_at).toLocaleDateString(),
                        task: r.report_title || 'Field Report',
                        status: 'Submitted'
                    })));
                }

                // Fetch Attendance Logs for Current Month
                const today = new Date();
                const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
                const todayStr = today.toISOString().split('T')[0];

                const { data: attendanceLogs } = await supabase
                    .from('attendance_logs')
                    .select('*')
                    .eq('employee_id', emp.id)
                    .gte('date', startOfMonth);

                let markedToday = false;
                let presentDays = 0;
                let history = Array.from({ length: 31 }, (_, i) => ({ day: i + 1, status: 'none' }));

                if (attendanceLogs) {
                    presentDays = attendanceLogs.length;
                    markedToday = attendanceLogs.some(log => log.date === todayStr);

                    history = history.map(d => {
                        // Safe date parsing (YYYY-MM-DD -> DD)
                        const isPresent = attendanceLogs.some(log => parseInt(log.date.split('-')[2]) === d.day);
                        return { ...d, status: isPresent ? 'present' : 'none' };
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

                // Fetch Salary Slips (Finance Logs)
                const { data: salaryData } = await supabase
                    .from('finance_logs')
                    .select('*')
                    .eq('type', 'Payroll') // Assuming 'Payroll' logs are salary slips
                    //.eq('reference_id', emp.id) // Uncomment if reference_id links to employee
                    .order('transaction_date', { ascending: false });

                if (salaryData) {
                    // Filter locally if needed or rely on RLS/Specific Query
                    setSalarySlips(salaryData.map(s => ({
                        id: s.id,
                        cycle: `${new Date(s.transaction_date).toLocaleString('default', { month: 'short', year: 'numeric' })} Cycle`,
                        amount: s.amount
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
                    .from('attendance_logs')
                    .insert([{
                        employee_id: employeeData.id,
                        date: todayStr,
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

    const submitReport = (e) => {
        e.preventDefault();
        const taskText = e.target.task.value;
        const newReport = {
            id: Date.now(),
            date: new Date().toLocaleDateString('en-GB', { day: '2d', month: 'short', year: 'numeric' }),
            task: taskText,
            status: 'Pending'
        };
        setReports([newReport, ...reports]);
        setIsModalOpen(false);
    };

    const menuItems = [
        { id: 'profile', icon: <FaUserCircle />, label: 'My Personnel File' },
        { id: 'reports', icon: <FaTasks />, label: 'Daily Work Log' },
        { id: 'attendance', icon: <FaCalendarCheck />, label: 'Attendance & Pay' },
        { id: 'data-entry', icon: <FaDatabase />, label: 'Field Operations' },
        { id: 'benefits', icon: <FaPlane />, label: 'Leave & TA Claims' },
        { id: 'official', icon: <FaEnvelopeOpenText />, label: 'Official Requests' },
        { id: 'id-card', icon: <FaIdCard />, label: 'ID Card System' },
    ];

    if (loading) return <div className="loading-state">Syncing Professional Record...</div>;
    if (!employeeData) return <div className="loading-state">Record not found. Please contact Admin.</div>;

    const renderContent = () => {
        switch (activeTab) {
            case 'profile': return <ProfileTab data={employeeData} />;
            case 'reports': return <ReportsTab reports={reports} onAddNew={() => { setModalType('report'); setIsModalOpen(true); }} />;
            case 'attendance': return <AttendanceTab attendance={attendance} salarySlips={salarySlips} onMark={markAttendance} />;
            case 'data-entry': return <DataEntryTab />;
            case 'benefits': return <BenefitsTab requests={requests} onApply={(type) => { setModalType(type); setIsModalOpen(true); }} />;
            case 'official': return <OfficialLettersTab requests={[]} />;
            case 'id-card': return <IDCardTab />;
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
                            {modalType === 'report' && (
                                <form onSubmit={submitReport}>
                                    <h3 style={{ marginBottom: '20px' }}>Log Operation Activity</h3>
                                    <div className="form-group" style={{ marginBottom: '20px' }}>
                                        <textarea name="task" rows="5" className="form-control" style={{ width: '100%', padding: '15px', borderRadius: '10px', border: '1px solid #e2e8f0' }} placeholder="Detail your field work or beneficiary interaction..."></textarea>
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

const ProfileTab = ({ data }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
        <div className="content-panel">
            <div style={{ display: 'flex', gap: '40px', alignItems: 'flex-start' }}>
                <div className="profile-large-avatar" style={{ width: '140px', height: '140px', background: 'var(--primary)', color: 'white', borderRadius: '25px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3.5rem', fontWeight: '800' }}>
                    VK
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <div>
                            <h2 style={{ margin: 0, color: 'var(--primary)' }}>{data.full_name}</h2>
                            <p style={{ color: '#666', fontSize: '1.1rem', margin: '5px 0' }}>{data.designation} • {data.department}</p>
                            <span className="badge success">{data.status} Account</span>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button className="btn-small"><FaEdit /> Update Credentials</button>
                            <button className="btn-small" style={{ background: '#718096' }}><FaDownload /> Full CV</button>
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
                    <span>Rating: <strong>{data.performance_rating}</strong></span>
                    <span className="badge success">Good Standing</span>
                </div>
                <p style={{ fontSize: '0.85rem', marginTop: '10px' }}>Remarks: {data.performance_remarks}<br />Warnings: {data.warning_notices}</p>
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
                <div style={{ flex: 1, padding: '15px', border: '1px solid #ddd', borderRadius: '12px', textAlign: 'center' }}><FaIdCard /> ID Card Copy</div>
                <div style={{ flex: 1, padding: '15px', border: '1px solid #ddd', borderRadius: '12px', textAlign: 'center' }}><FaFileSignature /> Appt. Letter</div>
                <div style={{ flex: 1, padding: '15px', border: '1px solid #ddd', borderRadius: '12px', textAlign: 'center' }}><FaUniversity /> Bank Passbook</div>
                <div style={{ flex: 1, padding: '15px', border: '1px solid #ddd', borderRadius: '12px', textAlign: 'center' }}><FaGraduationCap /> Edu certificates</div>
            </div>
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
                        <td style={{ fontWeight: '500' }}>{r.task}</td>
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
                        <div key={day.day} style={{ padding: '15px', textAlign: 'center', borderRadius: '10px', background: day.status === 'present' ? '#e6fffa' : '#f7fafc', color: day.status === 'present' ? '#2c7a7b' : '#a0aec0', border: day.status === 'present' ? '1px solid #b2f5ea' : '1px solid #edf2f7', fontWeight: 'bold' }}>
                            {day.day}
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
                                <div><strong>{slip.cycle}</strong><br /><small style={{ color: 'green' }}>₹ {Number(slip.amount).toLocaleString()} Disbursed</small></div>
                                <button className="btn-icon"><FaDownload /></button>
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

const DataEntryTab = () => (
    <div className="content-panel">
        <h3 style={{ marginBottom: '30px' }}>Digital Field Data Terminals</h3>
        <div className="data-entry-options" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            <div className="folder-vox" style={{ padding: '30px', border: '1px solid #edf2f7', borderRadius: '20px', textAlign: 'center', cursor: 'pointer', background: '#fcfcfc' }}>
                <FaGraduationCap style={{ fontSize: '3rem', color: 'var(--primary)', marginBottom: '15px' }} />
                <h4>Scholarship Registry</h4>
                <button className="btn-add" style={{ margin: '20px auto' }}><FaPlus /> Open Terminal</button>
            </div>
        </div>
    </div>
);

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

const OfficialLettersTab = ({ requests }) => (
    <div className="content-panel">
        <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px' }}>
            <h3>Credentialing & Authorizations</h3>
            <button className="btn-small">Request Authorization</button>
        </div>
        <table className="data-table">
            <thead><tr><th>Authorization Ref</th><th>Transmission Date</th><th>Status</th><th>Inspect</th></tr></thead>
            <tbody>
                {requests.map(r => (
                    <tr key={r.id}>
                        <td><strong>{r.title}</strong></td>
                        <td>{r.date}</td>
                        <td><span className="badge success">Verified</span></td>
                        <td><button className="btn-icon"><FaFileSignature /></button></td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

const IDCardTab = () => (
    <div className="content-panel" style={{ maxWidth: '650px', margin: '0 auto' }}>
        <h3 className="text-center">Official Foundation Identity</h3>
        <div style={{ padding: '40px', border: '1px solid #edf2f7', borderRadius: '25px', marginTop: '30px', background: '#f8fafc' }}>
            <div className="id-card-status" style={{ display: 'flex', alignItems: 'center', gap: '30px', marginBottom: '40px' }}>
                <div style={{ width: '70px', height: '70px', background: '#e6fffa', color: '#2c7a7b', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}><FaCheckCircle /></div>
                <div><h4 style={{ margin: 0, fontSize: '1.25rem' }}>Active Artifact Found</h4><p style={{ margin: 0, color: '#666' }}>Credential Ref: BCLL-ID-2024-X</p></div>
            </div>
            <p style={{ color: '#4a5568', lineHeight: '1.6' }}>Your digital identity is verified for field use. If physical hardware is damaged, initiate a replication request below.</p>
            <div style={{ display: 'flex', gap: '20px', marginTop: '40px' }}><button className="btn-add full-width">Request Replica</button></div>
        </div>
    </div>
);

const StatCard = ({ title, count, color, icon }) => (
    <div className={`stat-card ${color}`} style={{ padding: '25px', borderRadius: '20px' }}>
        <div className="stat-content"><h3 style={{ fontSize: '2rem' }}>{count}</h3><p style={{ fontWeight: '600' }}>{title}</p></div>
        <div className="stat-icon-overlay" style={{ fontSize: '3rem' }}>{icon}</div>
    </div>
);

export default EmployeeDashboard;
