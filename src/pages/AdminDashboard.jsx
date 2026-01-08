import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import {
    FaUsers, FaUserShield, FaHandHoldingUsd, FaFileAlt, FaSignOutAlt,
    FaUserPlus, FaCheckCircle, FaGraduationCap, FaFileInvoiceDollar,
    FaFolderOpen, FaClipboardCheck, FaChartLine, FaTrash, FaEdit, FaEye, FaFileUpload, FaTasks, FaPlus, FaPlusCircle,
    FaIdCard, FaUniversity, FaBriefcase, FaUserLock, FaExclamationTriangle, FaHeartbeat, FaFileSignature,
    FaMapMarkerAlt, FaPhone, FaUserCheck, FaBalanceScale, FaHistory, FaShieldAlt, FaDesktop, FaUnlockAlt,
    FaDownload, FaUserTie, FaFileContract, FaHandshake, FaRegIdCard, FaEnvelope,
    FaBuilding, FaGavel, FaUserTimes, FaClock, FaFingerprint
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');

    // --- REAL DATABASE STATE ---
    // --- REAL DATABASE STATE ---
    const [employees, setEmployees] = useState([]);
    const [activityLogs, setActivityLogs] = useState([]);
    const [coAdmins, setCoAdmins] = useState([]);
    const [volunteers, setVolunteers] = useState([]);
    const [students, setStudents] = useState([]);
    const [scholarships, setScholarships] = useState([]);
    const [finances, setFinances] = useState([]);
    const [requests, setRequests] = useState([]);
    const [docFiles, setDocFiles] = useState([]);
    const [categories, setCategories] = useState([]);

    const [adminProfile, setAdminProfile] = useState({
        id: '...',
        name: 'Loading...',
        role: 'Verifying Access...',
        dept: '...',
        level: '...',
        status: '...'
    });

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            // 1. Fetch Employees
            const { data: emps } = await supabase.from('employees').select('*');
            if (emps) setEmployees(emps);

            // 2. Fetch all other operational modules
            const { data: volData } = await supabase.from('volunteers').select('*').order('created_at', { ascending: false });
            if (volData) setVolunteers(volData);

            const { data: scholData } = await supabase.from('scholarships').select('*').order('created_at', { ascending: false });
            if (scholData) setScholarships(scholData);

            const { data: studData } = await supabase.from('students').select('*').order('created_at', { ascending: false });
            if (studData) setStudents(studData);

            const { data: finData } = await supabase.from('finance_logs').select('*').order('transaction_date', { ascending: false });
            if (finData) setFinances(finData);

            // Fetch Leave Requests for "Approvals" tab
            const { data: reqData } = await supabase.from('leave_requests').select('*, employees(full_name, designation)').order('created_at', { ascending: false });
            if (reqData) {
                // Transform for the UI
                const formattedRequests = reqData.map(l => ({
                    id: l.id,
                    type: l.leave_type || 'Leave Request',
                    requester: l.employees?.full_name || 'Unknown',
                    details: l.reason,
                    date: l.start_date,
                    status: l.status
                }));
                setRequests(formattedRequests);
            }

            // Fetch Organization Docs & Categories
            const { data: catData } = await supabase.from('organization_categories').select('*').order('name');
            if (catData) setCategories(catData);

            const { data: docs } = await supabase.from('organization_docs').select('*').order('created_at', { ascending: false });
            if (docs) setDocFiles(docs);

            // 3. Fetch Audit Logs
            const { data: logs } = await supabase
                .from('audit_logs')
                .select('*')
                .order('created_at', { ascending: false });
            if (logs) setActivityLogs(logs);

            // 4. Fetch the logged-in admin profile AND controls
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (profile) {
                    // RBAC CHECK: If Employee, redirect out
                    if (profile.role_type === 'Employee') {
                        navigate('/employee-dashboard');
                        return;
                    }

                    // Fetch permissions/controls if they exist
                    const { data: controls } = await supabase
                        .from('admin_controls')
                        .select('*')
                        .eq('admin_profile_id', user.id)
                        .single();

                    // Update Co-Admins list (Anyone with 'Admin' role in profiles, excluding current user)
                    const { data: otherAdmins } = await supabase.from('profiles').select('*').neq('id', user.id).in('role_type', ['Admin', 'Super Admin', 'Co-Admin']);
                    if (otherAdmins) setCoAdmins(otherAdmins);

                    setAdminProfile({
                        id: profile.id,
                        name: profile.full_name,
                        role: profile.role_type,
                        dept: 'Executive / Board', // Default for admins
                        level: controls?.authority_level || 'L1 (Prov)',
                        status: 'Active',
                        financials: {
                            salaryLimit: controls?.salary_approval_limit ? `₹ ${controls.salary_approval_limit}` : 'Unlimited',
                            bankAccess: controls?.perm_bank_access ? 'Authorized' : 'Restricted',
                            fundUtilization: controls?.fund_utilization_auth ? 'Authorized' : 'Restricted',
                            donationAccess: 'Full Access'
                        }
                    });
                }
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        }
    };

    // ... rest of component ...

    // UPDATE OverviewTab STATS
    /*
    const OverviewTab = ({ employees, volunteers, requests }) => (
    <>
        <div className="stats-grid">
            <StatCard title="Active Personnel" count={employees.filter(e => e.status === 'Active').length} color="blue" icon={<FaUsers />} />
            <StatCard title="Co-Admins" count={coAdmins.length} color="green" icon={<FaUserShield />} />
            ...
    */

    const [searchTerm, setSearchTerm] = useState('');
    const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState('');
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [selectedVolunteer, setSelectedVolunteer] = useState(null);
    const [selectedFolder, setSelectedFolder] = useState(null);

    // --- HELPERS ---
    const logActivity = async (action, type = 'System') => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            await supabase.from('audit_logs').insert([{
                actor_id: user?.id,
                action,
                sub_system: type,
                ip_address: 'Logged Session'
            }]);
            fetchDashboardData(); // Refresh UI
        } catch (e) { console.error('Logging failed', e); }
    };

    // --- HANDLERS ---
    const handleAction = async (type, id, action) => {
        let table = '';
        let updateData = {};

        // STANDARD APPROVAL FLOWS
        if (type === 'volunteer') {
            table = 'volunteers';
            updateData = { status: action === 'approve' ? 'Approved' : 'Rejected' };
            setVolunteers(prev => prev.map(v => v.id === id ? { ...v, status: updateData.status } : v));
        } else if (type === 'scholarship') {
            table = 'scholarships';
            updateData = { status: action === 'approve' ? 'Approved' : 'Rejected' };
            setScholarships(prev => prev.map(s => s.id === id ? { ...s, status: updateData.status } : s));
        } else if (type === 'request') { // Leave Request
            table = 'leave_requests';
            updateData = { status: action === 'approve' ? 'Approved' : 'Rejected' };
            setRequests(prev => prev.map(r => r.id === id ? { ...r, status: updateData.status } : r));
        }

        if (table) {
            const { data, error } = await supabase
                .from(table)
                .update(updateData)
                .eq('id', id)
                .select();

            if (!error) {
                if (data && data.length > 0) {
                    logActivity(`Processed ${type} request (${action}): ID ${id}`, 'Operations');
                    fetchDashboardData();
                } else {
                    alert('Update failed: You do not have permission to modify this record.');
                    // Revert optimistic update by re-fetching immediately
                    fetchDashboardData();
                }
            } else {
                console.error('Action failed:', error);
                alert('Database update failed. Check console.');
            }
        }
    };

    const toggleEmployeeStatus = async (emp) => {
        const newStatus = emp.status === 'Active' ? 'Inactive' : 'Active';
        const { error } = await supabase
            .from('employees')
            .update({ status: newStatus })
            .eq('id', emp.id);

        if (!error) {
            logActivity(`Changed status of ${emp.full_name} to ${newStatus}`, 'HR');
            fetchDashboardData();
        }
    };

    const deleteEmployee = async (id, name) => {
        if (window.confirm(`PERMANENT ACTION: Delete personnel record for ${name}?`)) {
            const { error } = await supabase.from('employees').delete().eq('id', id);
            if (!error) {
                logActivity(`Deleted employee record: ${name}`, 'HR');
                fetchDashboardData();
            }
        }
    };

    const deleteVolunteer = async (id, name) => {
        if (window.confirm(`PERMANENT ACTION: Remove volunteer record for ${name}?`)) {
            const { error } = await supabase.from('volunteers').delete().eq('id', id);
            if (!error) {
                logActivity(`Deleted volunteer record: ${name}`, 'HR');
                fetchDashboardData();
            } else {
                alert('Failed to delete volunteer. Check console.');
                console.error(error);
            }
        }
    };

    const menuItems = [
        { id: 'overview', icon: <FaChartLine />, label: 'Overview' },
        { id: 'admin-profile', icon: <FaShieldAlt />, label: 'My Admin Profile' },
        { id: 'co-admins', icon: <FaUserShield />, label: 'Admin Management' },
        { id: 'employees', icon: <FaUsers />, label: 'Staff Directory' },
        { id: 'volunteers', icon: <FaHandHoldingUsd />, label: 'Volunteers' },
        { id: 'students', icon: <FaGraduationCap />, label: 'Registrations' },
        { id: 'scholarships', icon: <FaClipboardCheck />, label: 'Scholarships' },
        { id: 'finance', icon: <FaFileInvoiceDollar />, label: 'Fund & Payroll' },
        { id: 'reports', icon: <FaFileAlt />, label: 'Field Reports' },
        { id: 'e-office', icon: <FaFolderOpen />, label: 'Digital Filing' },
        { id: 'activity-logs', icon: <FaHistory />, label: 'Audit Trail' },
        { id: 'approvals', icon: <FaCheckCircle />, label: 'OPS Control' },
    ];

    const renderContent = () => {
        const query = searchTerm.toLowerCase();
        switch (activeTab) {
            case 'overview': return <OverviewTab employees={employees} volunteers={volunteers} requests={requests} coAdmins={coAdmins} />;
            case 'admin-profile': return <AdminProfileTab admin={adminProfile} onModifyLevel={() => { setModalType('admin-level'); setIsModalOpen(true); }} />;
            case 'activity-logs': return <ActivityLogsTab logs={activityLogs} />;
            case 'employees':
                const filteredEmps = employees.filter(e => e.full_name.toLowerCase().includes(query) || (e.employee_id && e.employee_id.toLowerCase().includes(query)));
                return <EmployeeTab employees={filteredEmps} toggleStatus={toggleEmployeeStatus} deleteEmp={deleteEmployee} onView={(emp) => { setSelectedEmployee(emp); setModalType('emp-details'); setIsModalOpen(true); }} onAdd={() => { setModalType('employee'); setIsModalOpen(true); }} />;
            case 'volunteers':
                const filteredVols = volunteers.filter(v => v.full_name?.toLowerCase().includes(query) || v.area_of_interest?.toLowerCase().includes(query));
                return <VolunteerTab volunteers={filteredVols} handleAction={handleAction} onDelete={deleteVolunteer} onView={(v) => { setSelectedVolunteer(v); setModalType('volunteer-details'); setIsModalOpen(true); }} onViewID={(v) => { setSelectedVolunteer(v); setModalType('volunteer-id'); setIsModalOpen(true); }} />;
            case 'students':
                const filteredStuds = students.filter(s => s.student_name?.toLowerCase().includes(query) || s.college_org?.toLowerCase().includes(query));
                return <StudentTab students={filteredStuds} />;
            case 'scholarships':
                const filteredSchols = scholarships.filter(s => s.applicant_name?.toLowerCase().includes(query) || s.application_id?.toLowerCase().includes(query));
                return <ScholarshipTab scholarships={filteredSchols} handleAction={handleAction} />;
            case 'finance': return <FinanceTab finances={finances} />;
            case 'reports': return <ReportsTab onAdd={() => { setModalType('report'); setIsModalOpen(true); }} />;
            case 'e-office': return (
                <EOfficeTab
                    docFiles={docFiles}
                    categories={categories}
                    onUpload={() => { setModalType('upload-doc'); setIsModalOpen(true); }}
                    onAddFolder={() => { setModalType('create-folder'); setIsModalOpen(true); }}
                    onRenameFolder={(f) => { setSelectedFolder(f); setModalType('rename-folder'); setIsModalOpen(true); }}
                    refreshData={fetchDashboardData}
                />
            );
            case 'approvals':
                const filteredReqs = requests.filter(r => r.requester.toLowerCase().includes(query) || r.type.toLowerCase().includes(query));
                return <ApprovalsTab requests={filteredReqs} handleAction={handleAction} />;
            case 'co-admins': return <CoAdminTab coAdmins={coAdmins} onAdd={() => { setModalType('co-admin'); setIsModalOpen(true); }} />;
            default: return <OverviewTab employees={employees} volunteers={volunteers} requests={requests} />;
        }
    };

    return (
        <div className="dashboard-container">
            <div className="sidebar">
                <div className="sidebar-header">
                    <img src="/logo-CYlp3-fg__1_-removebg-preview.svg" alt="Logo" className="dash-logo" style={{ width: '40px' }} />
                    <h3 style={{ fontSize: '1rem' }}>Admin Control</h3>
                </div>
                <div className="sidebar-scroll custom-scroll">
                    <ul className="sidebar-menu" role="menu">
                        {menuItems.map(item => (
                            <li key={item.id} className={activeTab === item.id ? 'active' : ''} onClick={() => setActiveTab(item.id)} role="menuitem" tabIndex="0">
                                {item.icon} <span>{item.label}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="sidebar-footer">
                    <ul className="sidebar-menu">
                        <li onClick={async () => { await supabase.auth.signOut(); navigate('/login'); }} className="logout-btn" role="menuitem"><FaSignOutAlt /> <span>Logout</span></li>
                    </ul>
                </div>
            </div>

            <div className="main-content">
                <div className="dash-header">
                    <div className="header-title">
                        <h2>{menuItems.find(i => i.id === activeTab)?.label}</h2>
                        <nav aria-label="Breadcrumb">
                            <p className="breadcrumb">
                                <span className="breadcrumb-link" onClick={() => setActiveTab('overview')}>Admin HQ</span>
                                <span className="breadcrumb-sep">/</span>
                                <span className="breadcrumb-current">{menuItems.find(i => i.id === activeTab)?.label}</span>
                            </p>
                        </nav>
                    </div>
                    <div className="dash-search-container">
                        <div className="search-bar-wrapper">
                            <FaTasks className="search-icon" />
                            <input type="text" placeholder="Search Console..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        </div>
                        <div className="quick-actions-dropdown">
                            <button className="btn-quick-act" onClick={() => setIsQuickActionOpen(!isQuickActionOpen)}><FaPlus /> Command</button>
                            {isQuickActionOpen && (
                                <div className="qa-menu" onMouseLeave={() => setIsQuickActionOpen(false)}>
                                    <button onClick={() => { setModalType('co-admin'); setIsModalOpen(true); setIsQuickActionOpen(false); }}>New Co-Admin</button>
                                    <button onClick={() => { setModalType('employee'); setIsModalOpen(true); setIsQuickActionOpen(false); }}>Hire Staff</button>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="user-profile">
                        <div className="user-info">
                            <span className="user-name">{adminProfile.name}</span>
                            <span className="user-role">{adminProfile.role}</span>
                        </div>
                        <div className="avatar">VK</div>
                    </div>
                </div>
                <div className="tab-content-wrapper">{renderContent()}</div>
            </div>

            {/* EXPANDED MODALS */}
            {isModalOpen && (
                <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="modal-content custom-scroll" style={{
                        width: modalType === 'report' ? '600px' : (modalType.includes('details') ? '1400px' : '1000px'),
                        maxHeight: '92vh',
                        overflowY: 'auto',
                        borderRadius: '28px',
                        border: '1px solid rgba(255,255,255,0.1)'
                    }} onClick={e => e.stopPropagation()}>
                        {modalType === 'employee' && (
                            <EmployeeForm
                                onClose={() => setIsModalOpen(false)}
                                onSave={async (newEmp) => {
                                    const { error } = await supabase.from('employees').insert([newEmp]);
                                    if (!error) {
                                        logActivity(`Hired New Personnel: ${newEmp.full_name}`, 'HR');
                                        setIsModalOpen(false);
                                    }
                                }}
                            />
                        )}
                        {modalType === 'co-admin' && (
                            <AdminForm
                                onClose={() => setIsModalOpen(false)}
                                onSave={async (newAdm) => {
                                    // Normally we would call a Supabase function to create user + profile,
                                    // for now we'll just insert into profile to show database impact.
                                    const { error } = await supabase.from('profiles').insert([newAdm]);
                                    if (!error) {
                                        logActivity(`Provisioned New Co-Admin: ${newAdm.full_name}`, 'Security');
                                        setIsModalOpen(false);
                                    }
                                }}
                            />
                        )}
                        {modalType === 'admin-level' && (
                            <AdminLevelModal
                                currentLevel={adminProfile.level}
                                onClose={() => setIsModalOpen(false)}
                                onSave={async (newLevel) => {
                                    const { error } = await supabase
                                        .from('admin_controls')
                                        .update({ authority_level: newLevel.split(' ')[0] })
                                        .eq('admin_profile_id', adminProfile.id);

                                    if (!error) {
                                        logActivity(`Elevated/Modified Admin Level to ${newLevel}`, 'Security');
                                        setIsModalOpen(false);
                                    }
                                }}
                            />
                        )}
                        {modalType === 'emp-details' && <EmployeeDetailsView emp={selectedEmployee} onClose={() => setIsModalOpen(false)} />}
                        {modalType === 'report' && <ReportForm onClose={() => setIsModalOpen(false)} />}
                        {modalType === 'volunteer-id' && <VolunteerIDCard volunteer={selectedVolunteer} onClose={() => setIsModalOpen(false)} />}
                        {modalType === 'volunteer-details' && (
                            <VolunteerDetailsView
                                volunteer={selectedVolunteer}
                                onClose={() => setIsModalOpen(false)}
                                onApprove={() => {
                                    handleAction('volunteer', selectedVolunteer.id, 'approve');
                                    setIsModalOpen(false);
                                }}
                            />
                        )}
                        {modalType === 'upload-doc' && (
                            <UploadArtifactModal
                                onClose={() => setIsModalOpen(false)}
                                categories={categories}
                                onSave={async (docData) => {
                                    // Resolve category_id
                                    const cat = categories.find(c => c.name === docData.category);
                                    const dataToInsert = {
                                        ...docData,
                                        category_id: cat?.id
                                    };
                                    const { error } = await supabase.from('organization_docs').insert([dataToInsert]);
                                    if (!error) {
                                        logActivity(`Uploaded new regulatory artifact: ${docData.name}`, 'Legal');
                                        fetchDashboardData();
                                        setIsModalOpen(false);
                                    } else {
                                        alert('Upload failed: ' + error.message);
                                    }
                                }}
                            />
                        )}
                        {modalType === 'create-folder' && (
                            <FolderFormModal
                                onClose={() => setIsModalOpen(false)}
                                onSave={async (name) => {
                                    const { error } = await supabase.from('organization_categories').insert([{ name }]);
                                    if (!error) {
                                        logActivity(`Created new filing folder: ${name}`, 'Legal');
                                        fetchDashboardData();
                                        setIsModalOpen(false);
                                    } else {
                                        alert('Error creating folder: ' + error.message);
                                    }
                                }}
                            />
                        )}
                        {modalType === 'rename-folder' && (
                            <FolderFormModal
                                folder={selectedFolder}
                                onClose={() => setIsModalOpen(false)}
                                onSave={async (newName) => {
                                    const { error } = await supabase.from('organization_categories').update({ name: newName }).eq('id', selectedFolder.id);
                                    if (!error) {
                                        logActivity(`Renamed filing folder to: ${newName}`, 'Legal');
                                        fetchDashboardData();
                                        setIsModalOpen(false);
                                    } else {
                                        alert('Error renaming folder: ' + error.message);
                                    }
                                }}
                            />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

/* --- TAB COMPONENTS --- */

const OverviewTab = ({ employees, volunteers, requests, coAdmins }) => {
    const pendingVols = volunteers.filter(v => v.status === 'New').length;
    const pendingReqs = requests.filter(r => r.status === 'Pending').length;

    return (
        <>
            <div className="stats-grid">
                <StatCard title="Active Personnel" count={employees.filter(e => e.status === 'Active').length} color="blue" icon={<FaUsers />} />
                <StatCard title="Pending Volunteers" count={pendingVols} color="purple" icon={<FaHandHoldingUsd />} />
                <StatCard title="System Uptime" count="99.9%" color="gold" icon={<FaDesktop />} />
                <StatCard title="Total Alerts" count={pendingVols + pendingReqs} color="red" icon={<FaExclamationTriangle />} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginTop: '30px' }}>
                <div className="content-panel">
                    <h3>Critical Approvals Required</h3>
                    <table className="data-table">
                        <thead><tr><th>Task Type</th><th>Pending Item</th><th>Urgency</th></tr></thead>
                        <tbody>
                            {pendingVols > 0 && (
                                <tr><td>Volunteer Registry</td><td>{pendingVols} New Applications</td><td><span className="badge red-badge">Action Required</span></td></tr>
                            )}
                            {pendingReqs > 0 && (
                                <tr><td>Staff Requests</td><td>{pendingReqs} Pending Approvals</td><td><span className="badge red-badge">Action Required</span></td></tr>
                            )}
                            {pendingVols === 0 && pendingReqs === 0 && (
                                <tr><td colSpan="3" style={{ textAlign: 'center', color: '#718096' }}>All systems clear. No pending approvals.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="content-panel">
                    <h3>System Health & Infrastructure</h3>
                    <table className="data-table">
                        <thead><tr><th>Service ID</th><th>Component</th><th>Connection</th></tr></thead>
                        <tbody>
                            <tr><td>supa-pg-01</td><td>Shared Database</td><td><span className="badge success">Active</span></td></tr>
                            <tr><td>supa-auth</td><td>Access Control</td><td><span className="badge success">Secure</span></td></tr>
                            <tr><td>supa-vault</td><td>Artifact Storage</td><td><span className="badge success">Encrypted</span></td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

const AdminProfileTab = ({ admin, onModifyLevel }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
        <div className="content-panel">
            <div style={{ display: 'flex', gap: '40px', alignItems: 'flex-start' }}>
                <div style={{ width: '150px', height: '150px', background: '#2d3748', color: 'white', borderRadius: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem', fontWeight: '800' }}>
                    VK
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <div>
                            <h2 style={{ margin: 0, color: '#2d3748' }}>{admin.name}</h2>
                            <p style={{ color: '#4a5568', fontSize: '1.2rem', fontWeight: '600' }}>{admin.role} • {admin.id}</p>
                            <span className="badge success" style={{ padding: '5px 15px', fontSize: '0.9rem' }}>{admin.status}</span>
                        </div>
                        <button className="btn-add" onClick={onModifyLevel}><FaEdit /> Modify Admin Level</button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', background: '#f8fafc', padding: '20px', borderRadius: '15px' }}>
                        <div><strong>Authority:</strong><br />{admin.level}</div>
                        <div><strong>Department:</strong><br />{admin.dept}</div>
                        <div><strong>Joined HQ:</strong><br />{admin.appointmentDate}</div>
                        <div><strong>Official Email:</strong><br />{admin.email}</div>
                        <div><strong>Official Mobile:</strong><br />{admin.mobile}</div>
                        <div><strong>DOB / Gender:</strong><br />{admin.dob} / {admin.gender}</div>
                    </div>
                </div>
            </div>
            <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #edf2f7', borderRadius: '10px' }}>
                <strong>Personal Address:</strong> {admin.address} | <strong>Emergency Contact:</strong> {admin.emergency}
            </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
            {/* SECURITY CATEGORY 3 */}
            <div className="content-panel">
                <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '15px', marginBottom: '20px' }}><FaShieldAlt /> System Access & Security</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div><strong>2FA Status:</strong><br /><span className="badge success">{admin.security?.auth2FA || 'Active'}</span></div>
                    <div><strong>Account Lock:</strong><br /><span className="badge success">Unlocked</span></div>
                    <div><strong>Last Login:</strong><br />{admin.security?.lastLogin || 'Now'}</div>
                    <div><strong>Access Device:</strong><br />{admin.security?.device || 'Secure Session'}</div>
                    <div style={{ gridColumn: 'span 2' }}><strong>Login IP:</strong> {admin.security?.lastIP || 'Protected'}</div>
                </div>
            </div>

            {/* FINANCIAL AUTH CATEGORY 5 */}
            <div className="content-panel" style={{ background: '#fffaf0', border: '1px solid #ecc94b' }}>
                <h3 style={{ borderBottom: '1px solid #ecc94b', paddingBottom: '15px', marginBottom: '20px', color: '#b7791f' }}><FaFileInvoiceDollar /> Financial Authorization</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div><strong>Salary Limit:</strong><br />{admin.financials?.salaryLimit}</div>
                    <div><strong>Bank Access:</strong><br />{admin.financials?.bankAccess}</div>
                    <div><strong>Fund Approval:</strong><br />{admin.financials?.fundUtilization}</div>
                    <div><strong>Donation Log:</strong><br />{admin.financials?.donationAccess}</div>
                </div>
            </div>
        </div>

        {/* Removed Secure Credential Archive per user request */}
    </div>
);

const ActivityLogsTab = ({ logs }) => (
    <div className="content-panel">
        <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px' }}>
            <h3>Category 7: Forensic Audit Trail</h3>
            <button className="btn-small"><FaDownload /> Export CSV</button>
        </div>
        <table className="data-table">
            <thead>
                <tr><th>Event Timestamp</th><th>Actor Profile</th><th>Action Performed</th><th>Sub-system</th></tr>
            </thead>
            <tbody>
                {logs.map(log => (
                    <tr key={log.id}>
                        <td>{new Date(log.created_at).toLocaleString()}</td>
                        <td><strong>{log.actor_id ? 'Admin Access' : 'System Gen'}</strong></td>
                        <td>{log.action}</td>
                        <td><span className="badge">{log.sub_system}</span></td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

const EmployeeTab = ({ employees, toggleStatus, deleteEmp, onView, onAdd }) => (
    <div className="content-panel">
        <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px' }}>
            <h3>Personnel Directory</h3>
            <button className="btn-add" onClick={onAdd}><FaUserPlus /> Hire New Staff</button>
        </div>
        <table className="data-table">
            <thead>
                <tr><th>Identity</th><th>Role & Dept</th><th>Work Type</th><th>Attendance</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
                {employees.map(emp => (
                    <tr key={emp.id}>
                        <td><strong>{emp.full_name}</strong><br /><small>{emp.employee_id}</small></td>
                        <td>{emp.designation}<br /><small>{emp.department}</small></td>
                        <td>{emp.employment_type}</td>
                        <td><span className="badge">Verified</span></td>
                        <td><span className={`badge ${emp.status === 'Active' ? 'success' : 'red-badge'}`}>{emp.status}</span></td>
                        <td>
                            <div className="action-buttons">
                                <button className="btn-icon" onClick={() => onView(emp)} title="Detailed View"><FaEye /></button>
                                <button className="btn-icon" onClick={() => toggleStatus(emp)} title="Toggle Status"><FaUserCheck /></button>
                                <button className="btn-icon danger" onClick={() => deleteEmp(emp.id, emp.full_name)} title="Delete"><FaTrash /></button>
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

const VolunteerTab = ({ volunteers, handleAction, onDelete, onView, onViewID }) => (
    <div className="content-panel">
        <h3>Volunteer Onboarding</h3>
        <table className="data-table">
            <thead><tr><th>Name</th><th>Area of Interest</th><th>Contact</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
                {volunteers.map(v => (
                    <tr key={v.id}>
                        <td>{v.full_name}</td>
                        <td>{v.area_of_interest}</td>
                        <td>{v.phone || v.email}</td>
                        <td><span className={`badge ${v.status === 'New' ? 'blue' : v.status === 'Approved' ? 'success' : 'red'}`}>{v.status}</span></td>
                        <td style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <button className="btn-icon" onClick={() => onView(v)} title="View Full Profile"><FaEye /></button>
                            {v.status === 'New' && (
                                <>
                                    <button className="btn-small success-btn" onClick={() => handleAction('volunteer', v.id, 'approve')}>Approve</button>
                                    <button className="btn-small danger-btn" onClick={() => handleAction('volunteer', v.id, 'reject')} style={{ marginLeft: '5px' }}>Reject</button>
                                </>
                            )}
                            {v.status === 'Approved' && (
                                <button className="btn-small" onClick={() => onViewID(v)}><FaIdCard /> ID Card</button>
                            )}
                            <button className="btn-icon danger" onClick={() => onDelete(v.id, v.full_name)} title="Remove Record" style={{ marginLeft: 'auto' }}><FaTrash /></button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

const StudentTab = ({ students }) => (
    <div className="content-panel">
        <h3>Academic Registrations</h3>
        <table className="data-table">
            <thead><tr><th>Student Name</th><th>College/Org</th><th>Program</th><th>Current Status</th></tr></thead>
            <tbody>
                {students.map(s => (
                    <tr key={s.id}>
                        <td>{s.student_name}</td>
                        <td>{s.college_org}</td>
                        <td>{s.program}</td>
                        <td><span className="badge success">{s.status}</span></td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

const ScholarshipTab = ({ scholarships, handleAction }) => (
    <div className="content-panel">
        <h3>Scholarship Verification</h3>
        <table className="data-table">
            <thead><tr><th>ID</th><th>Applicant</th><th>Income Status</th><th>Academic</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
                {scholarships.map(s => (
                    <tr key={s.id}>
                        <td>{s.application_id}</td>
                        <td>{s.applicant_name}</td>
                        <td>{s.income_status}</td>
                        <td>{s.academic_score}</td>
                        <td><span className="badge">{s.status}</span></td>
                        <td>
                            {s.status === 'Awaiting Approval' && (
                                <button className="btn-small success-btn" onClick={() => handleAction('scholarship', s.id, 'approve')}>Approve Application</button>
                            )}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

const FinanceTab = ({ finances }) => (
    <div className="content-panel">
        <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px' }}>
            <h3>Treasury & Payroll Log</h3>
            <button className="btn-small"><FaFileInvoiceDollar /> Generate Salary Slips</button>
        </div>
        <table className="data-table">
            <thead><tr><th>Date</th><th>Type</th><th>Allocation Context</th><th>Amount</th><th>Audit</th></tr></thead>
            <tbody>
                {finances.map(f => (
                    <tr key={f.id}>
                        <td>{f.transaction_date || f.date}</td>
                        <td>{f.type}</td>
                        <td>{f.category_context || f.program || '-'}</td>
                        <td><strong>₹ {Number(f.amount).toLocaleString()}</strong></td>
                        <td><span className="badge success">{f.status || 'Audited'}</span></td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

const ReportsTab = ({ onAdd }) => (
    <div className="content-panel">
        <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px' }}>
            <h3>Impact & Program Reports</h3>
            <button className="btn-add" onClick={onAdd}><FaFileUpload /> Upload New Report</button>
        </div>
        <div className="reports-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
            <div className="report-card" style={{ padding: '20px', border: '1px solid #eee', borderRadius: '15px' }}>
                <FaFileAlt style={{ fontSize: '2rem', color: 'var(--primary)', marginBottom: '10px' }} />
                <h4>Quarterly Rehab Report</h4>
                <p>Q4 2025 • Verified</p>
            </div>
            <div className="report-card" style={{ padding: '20px', border: '1px solid #eee', borderRadius: '15px' }}>
                <FaFileAlt style={{ fontSize: '2rem', color: 'var(--primary)', marginBottom: '10px' }} />
                <h4>Flood Relief Impact</h4>
                <p>Dec 2025 • Public</p>
            </div>
        </div>
    </div>
);



const EOfficeTab = ({ docFiles, categories, onUpload, refreshData, onAddFolder, onRenameFolder }) => {
    const [view, setView] = useState('folders');
    const [activeFolder, setActiveFolder] = useState(null);

    const handleDeleteFolder = async (id, name) => {
        if (!confirm(`Are you sure you want to delete the folder "${name}"? This will not delete the files but they will become uncategorized.`)) return;
        const { error } = await supabase.from('organization_categories').delete().eq('id', id);
        if (error) alert("Error deleting folder: " + error.message);
        else refreshData();
    };

    const handleWipeVault = async () => {
        if (!confirm("CRITICAL ACTION: Are you sure you want to delete ALL documents in the vault? This cannot be undone.")) return;
        const { error } = await supabase.from('organization_docs').delete().neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
        if (error) alert("Error wiping vault: " + error.message);
        else {
            alert("Vault wiped successfully.");
            refreshData();
        }
    };

    const currentFiles = activeFolder ? (docFiles || []).filter(d => d.category === activeFolder.name || d.category_id === activeFolder.id) : [];

    return (
        <div className="content-panel">
            <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px', alignItems: 'center' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {view === 'files' && <button className="btn-icon" onClick={() => setView('folders')}><FaHistory /></button>}
                    {view === 'folders' ? 'Digital Filing System (Regulatory Vault)' : `Vault: ${activeFolder?.name || '...'}`}
                </h3>
                <div style={{ display: 'flex', gap: '10px' }}>
                    {view === 'folders' && (
                        <>
                            <button className="btn-small" onClick={onAddFolder} style={{ background: '#48bb78', color: 'white' }}><FaPlusCircle /> New Folder</button>
                            <button className="btn-small danger-btn" onClick={handleWipeVault}><FaTrash /> Wipe Vault</button>
                        </>
                    )}
                    <button className="btn-add" onClick={onUpload}><FaFileUpload /> Upload Artifact</button>
                </div>
            </div>

            {view === 'folders' ? (
                <div className="folders-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '25px' }}>
                    {(categories || []).length > 0 ? (categories.map(f => {
                        const count = (docFiles || []).filter(d => d.category === f.name || d.category_id === f.id).length;
                        return (
                            <div key={f.id} className="folder-card" onClick={() => { setActiveFolder(f); setView('files'); }}
                                style={{ padding: '30px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '20px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.3s ease', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', position: 'relative' }}
                                onMouseOver={e => e.currentTarget.style.transform = 'translateY(-5px)'}
                                onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '5px' }}>
                                    <button className="btn-icon" onClick={(e) => { e.stopPropagation(); onRenameFolder(f); }} title="Rename"><FaEdit style={{ fontSize: '0.8rem' }} /></button>
                                    <button className="btn-icon danger" onClick={(e) => { e.stopPropagation(); handleDeleteFolder(f.id, f.name); }} title="Delete Folder"><FaTrash style={{ fontSize: '0.8rem' }} /></button>
                                </div>
                                <div style={{ fontSize: '3.5rem', color: '#ecc94b', marginBottom: '15px' }}><FaFolderOpen /></div>
                                <h4 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '8px', color: '#2d3748' }}>{f.name}</h4>
                                <p style={{ fontSize: '0.8rem', color: '#718096' }}>{count} Verified Artifacts</p>
                            </div>
                        );
                    })) : (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '100px', background: '#f8fafc', borderRadius: '25px', border: '2px dashed #cbd5e0' }}>
                            <FaFolderOpen style={{ fontSize: '4rem', color: '#cbd5e0', marginBottom: '20px' }} />
                            <h3 style={{ color: '#4a5568', marginBottom: '10px' }}>No Vault Folders Detected</h3>
                            <p style={{ color: '#718096' }}>Run the <b>UPGRADE_FOLDERS.sql</b> script in Supabase or use <b>+ New Folder</b> above to get started.</p>
                        </div>
                    )}
                </div>
            ) : (
                <table className="data-table">
                    <thead><tr><th>File Name</th><th>Date Uploaded</th><th>Size</th><th>Actions</th></tr></thead>
                    <tbody>
                        {currentFiles.length > 0 ? currentFiles.map((file) => (
                            <tr key={file.id}>
                                <td style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><FaFileAlt style={{ color: '#e53e3e' }} /> {file.name}</td>
                                <td>{new Date(file.created_at).toLocaleDateString()}</td>
                                <td>{file.size || 'Unknown'}</td>
                                <td>
                                    <div className="action-buttons">
                                        <button className="btn-icon" title="Preview" onClick={() => alert(`Opening Secure Preview: ${file.name}\nEstablishing encrypted tunnel...`)}><FaEye /></button>
                                        <button className="btn-icon" title="Download" onClick={() => alert(`Downloading: ${file.name}\nFile size: ${file.size || '1.2 MB'}`)}><FaDownload /></button>
                                        <button className="btn-icon danger" title="Delete Artifact" onClick={async () => {
                                            if (confirm(`Remove "${file.name}" from the vault forever?`)) {
                                                const { error } = await supabase.from('organization_docs').delete().eq('id', file.id);
                                                if (!error) refreshData();
                                                else alert("Error deleting file: " + error.message);
                                            }
                                        }}><FaTrash /></button>
                                    </div>
                                </td>
                            </tr>
                        )) : <tr><td colSpan="4" style={{ textAlign: 'center', color: '#718096', padding: '20px' }}>No files in this folder.</td></tr>}
                    </tbody>
                </table>
            )}
        </div>
    );
};

const ApprovalsTab = ({ requests, handleAction }) => (
    <div className="content-panel">
        <h3>Operational Desktop (Real-time Approvals)</h3>
        <table className="data-table">
            <thead><tr><th>Req Type</th><th>From Staff</th><th>Context</th><th>Date</th><th>Decisive Action</th></tr></thead>
            <tbody>
                {requests.map(r => (
                    <tr key={r.id}>
                        <td><strong>{r.type}</strong></td>
                        <td>{r.requester}</td>
                        <td>{r.details}</td>
                        <td>{r.date}</td>
                        <td>
                            {r.status === 'Pending' ? (
                                <>
                                    <button className="btn-small success-btn" onClick={() => handleAction('request', r.id, 'approve')}>Digitally Sign</button>
                                    <button className="btn-small danger-btn" onClick={() => handleAction('request', r.id, 'reject')} style={{ marginLeft: '5px' }}>Decline</button>
                                </>
                            ) : <span className={`badge ${r.status === 'Approved' ? 'success' : 'red'}`}>{r.status}</span>}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

const CoAdminTab = ({ coAdmins, onAdd }) => (
    <div className="content-panel">
        <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px' }}>
            <h3>Administrative Control Board</h3>
            <button className="btn-add" onClick={onAdd}><FaUserShield /> Provision New Account</button>
        </div>
        <table className="data-table">
            <thead><tr><th>Admin Ref</th><th>Identity Profile</th><th>Role & Dept</th><th>Last Activity</th><th>Status</th><th>Access Control</th></tr></thead>
            <tbody>
                {coAdmins.map(adm => (
                    <tr key={adm.id}>
                        <td><strong>{adm.id ? adm.id.substring(0, 8) : 'Pending'}</strong></td>
                        <td style={{ fontWeight: '600' }}>{adm.full_name || 'Processing...'}</td>
                        <td><small>{adm.role_type}</small><br />Executive / Board</td>
                        <td>{adm.last_login ? new Date(adm.last_login).toLocaleString() : 'Never'}</td>
                        <td><span className={`badge ${adm.last_login ? 'success' : 'red-badge'}`}>{adm.last_login ? 'Active' : 'Inactive'}</span></td>
                        <td>
                            <div className="action-buttons">
                                <button className="btn-icon" title="View Permission Matrix"><FaUnlockAlt /></button>
                                <button className="btn-icon" title="Edit Profile"><FaEdit /></button>
                                <button className="btn-icon danger" title="Revoke Access"><FaUserLock /></button>
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

/* --- FORMS --- */

const AdminForm = ({ onClose, onSave }) => {
    const [step, setStep] = useState(1);
    const categories = ['Core Profile', 'Login & Auth', 'Custom Permissions', 'Fin / Documents', 'Declaration'];

    return (
        <div style={{ padding: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h3>Provision Administrative Account (Step {step}/5)</h3>
                <button className="btn-icon" onClick={onClose}>&times;</button>
            </div>

            <div className="form-steps-indicator" style={{ display: 'flex', gap: '8px', marginBottom: '30px' }}>
                {categories.map((c, i) => (
                    <div key={c} style={{ flex: 1, padding: '10px 3px', background: step === i + 1 ? '#2d3748' : '#edf2f7', color: step === i + 1 ? 'white' : '#718096', textAlign: 'center', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 'bold' }}>{c}</div>
                ))}
            </div>

            <div className="form-content" style={{ minHeight: '500px' }}>
                {step === 1 && (
                    <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div className="form-group"><label>Full Name</label><input className="form-control" type="text" /></div>
                        <div className="form-group"><label>Official Email ID</label><input className="form-control" type="email" /></div>
                        <div className="form-group"><label>Role Type</label><select className="form-control"><option>Admin</option><option>Co-Admin</option><option>Field Super</option></select></div>
                        <div className="form-group"><label>Department</label><input className="form-control" type="text" /></div>
                        <div className="form-group"><label>Authority Level</label><select className="form-control"><option>L2 - High</option><option>L3 - Mid</option><option>L4 - Base</option></select></div>
                        <div className="form-group"><label>Reporting To</label><input className="form-control" type="text" value="Super Admin" readOnly /></div>
                        <div className="form-group"><label>DOB</label><input className="form-control" type="date" /></div>
                        <div className="form-group"><label>Emergency Contact</label><input className="form-control" type="tel" /></div>
                    </div>
                )}
                {step === 2 && (
                    <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div className="form-group"><label>System Username</label><input className="form-control" type="text" /></div>
                        <div className="form-group"><label>Initial Password</label><input className="form-control" type="password" /></div>
                        <div className="form-group" style={{ gridColumn: 'span 2' }}>
                            <label style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <input type="checkbox" style={{ width: '18px', height: '18px' }} defaultChecked />
                                <span>Enforce Mandatory Two-Factor Authentication (2FA)</span>
                            </label>
                        </div>
                    </div>
                )}
                {step === 3 && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                        <div>
                            <h5 style={{ marginBottom: '15px', color: 'var(--primary)' }}>Staff & Finance Control</h5>
                            {['View Employee Details', 'Edit Accounts', 'Approve Leaves', 'Process Salary', 'Bank Details Access'].map(p => (
                                <label key={p} style={{ display: 'flex', gap: '10px', marginBottom: '10px', fontSize: '0.9rem' }}>
                                    <input type="checkbox" /> {p}
                                </label>
                            ))}
                        </div>
                        <div>
                            <h5 style={{ marginBottom: '15px', color: 'var(--primary)' }}>Operations & Programs</h5>
                            {['Volunteer Approval', 'Scholarship Verify', 'Upload Reports', 'Create Programs', 'Create Co-Admins'].map(p => (
                                <label key={p} style={{ display: 'flex', gap: '10px', marginBottom: '10px', fontSize: '0.9rem' }}>
                                    <input type="checkbox" /> {p}
                                </label>
                            ))}
                        </div>
                    </div>
                )}
                {step === 4 && (
                    <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div className="form-group"><label>Salary Approval Limit (₹)</label><input className="form-control" type="number" placeholder="50000" /></div>
                        <div className="form-group"><label>Fund Utilization Approval</label><select className="form-control"><option>No</option><option>Yes</option></select></div>
                        <div className="form-group" style={{ gridColumn: 'span 2' }}><label>Upload Authorization Letter (PDF Scan)</label><input className="form-control" type="file" /></div>
                    </div>
                )}
                {step === 5 && (
                    <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '15px' }}>
                        <h4 style={{ marginBottom: '20px' }}>Compliance Agreement</h4>
                        <p style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
                            By creating this account, the Admin acknowledges full responsibility for data confidentiality,
                            NGO security protocols, and operational integrity. All actions will be recorded in the forensic audit trail.
                        </p>
                        <label style={{ display: 'flex', gap: '10px', marginTop: '30px' }}>
                            <input type="checkbox" required />
                            <span>I confirm acceptance of the official Admin Code of Ethics & Confidentiality.</span>
                        </label>
                    </div>
                )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px' }}>
                <button className="btn-small" disabled={step === 1} onClick={() => setStep(step - 1)}>Back</button>
                {step < 5 ? <button className="btn-add" onClick={() => setStep(step + 1)}>Continue</button> : <button className="btn-add" onClick={() => { onSave({ id: 'BCLL-ADM-10' + Math.floor(Math.random() * 9), name: 'New Admin', role: 'Co-Admin', dept: 'Operations', status: 'Active', lastLogin: 'Just Provisioned' }); onClose(); }}>Securely Provision Admin</button>}
            </div>
        </div>
    );
}

const EmployeeForm = ({ onClose, onSave }) => {
    const [step, setStep] = useState(1);
    const categories = ['Basic Info', 'Identity & KYC', 'Employment', 'Payroll & Bank', 'Compliance & Emergency'];

    return (
        <div style={{ padding: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h3>Hire New Personnel (Step {step}/5)</h3>
                <button className="btn-icon" onClick={onClose}>&times;</button>
            </div>

            <div className="form-steps-indicator" style={{ display: 'flex', gap: '8px', marginBottom: '30px' }}>
                {categories.map((c, i) => (
                    <div key={c} style={{ flex: 1, padding: '10px 5px', background: step === i + 1 ? 'var(--primary)' : '#edf2f7', color: step === i + 1 ? 'white' : '#718096', textAlign: 'center', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 'bold' }}>{c}</div>
                ))}
            </div>

            <div className="form-content" style={{ minHeight: '450px' }}>
                {step === 1 && (
                    <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div className="form-group"><label>Full Name (as per Aadhaar)</label><input className="form-control" type="text" placeholder="John Doe" /></div>
                        <div className="form-group"><label>Gender</label><select className="form-control"><option>Male</option><option>Female</option><option>Other</option></select></div>
                        <div className="form-group"><label>Date of Birth</label><input className="form-control" type="date" /></div>
                        <div className="form-group"><label>Marital Status</label><select className="form-control"><option>Single</option><option>Married</option><option>Divorced</option></select></div>
                        <div className="form-group"><label>Blood Group</label><select className="form-control"><option>O+</option><option>A+</option><option>B+</option><option>AB+</option><option>O-</option></select></div>
                        <div className="form-group"><label>Mobile Number</label><input className="form-control" type="tel" /></div>
                        <div className="form-group"><label>Email ID</label><input className="form-control" type="email" /></div>
                        <div className="form-group"><label>Current Address</label><input className="form-control" type="text" /></div>
                        <div className="form-group" style={{ gridColumn: 'span 2' }}><label>Permanent Address</label><textarea className="form-control" rows="2"></textarea></div>
                    </div>
                )}
                {step === 2 && (
                    <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div className="form-group"><label>Aadhaar Number</label><input className="form-control" type="text" /></div>
                        <div className="form-group"><label>PAN Number</label><input className="form-control" type="text" /></div>
                        <div className="form-group"><label>Voter ID / Driving License</label><input className="form-control" type="text" /></div>
                        <div className="form-group"><label>Passport Number</label><input className="form-control" type="text" /></div>
                        <div className="form-group" style={{ gridColumn: 'span 2' }}><label>Upload Documents (All-in-one PDF/ZIP)</label><input className="form-control" type="file" /></div>
                    </div>
                )}
                {step === 3 && (
                    <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div className="form-group"><label>Designation / Role</label><input className="form-control" type="text" /></div>
                        <div className="form-group"><label>Department</label><select className="form-control"><option>Field Work</option><option>Education</option><option>Healthcare</option><option>Rehab</option></select></div>
                        <div className="form-group"><label>Employment Type</label><select className="form-control"><option>Full-Time</option><option>Part-Time</option><option>Volunteer</option><option>Contract</option></select></div>
                        <div className="form-group"><label>Reporting Manager</label><input className="form-control" type="text" placeholder="e.g., Alok Singh" /></div>
                        <div className="form-group"><label>Work Location</label><input className="form-control" type="text" /></div>
                        <div className="form-group"><label>Attendance Type</label><select className="form-control"><option>Office</option><option>Field</option><option>Hybrid</option></select></div>
                        <div className="form-group"><label>Office Timings</label><input className="form-control" type="text" placeholder="09:00 AM - 06:30 PM" /></div>
                    </div>
                )}
                {step === 4 && (
                    <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div className="form-group"><label>Monthly Salary Amount</label><input className="form-control" type="number" /></div>
                        <div className="form-group"><label>Bank Name</label><input className="form-control" type="text" /></div>
                        <div className="form-group"><label>Account Holder Name</label><input className="form-control" type="text" /></div>
                        <div className="form-group"><label>Account Number</label><input className="form-control" type="text" /></div>
                        <div className="form-group"><label>IFSC Code</label><input className="form-control" type="text" /></div>
                        <div className="form-group"><label>UPI ID (optional)</label><input className="form-control" type="text" /></div>
                        <div className="form-group"><label>Payment Mode</label><select className="form-control"><option>Bank Transfer</option><option>Cheque</option></select></div>
                    </div>
                )}
                {step === 5 && (
                    <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div className="form-group"><label>Emergency Contact Name</label><input className="form-control" type="text" /></div>
                        <div className="form-group"><label>Relationship</label><input className="form-control" type="text" /></div>
                        <div className="form-group"><label>Emergency Contact Number</label><input className="form-control" type="tel" /></div>
                        <div className="form-group"><label>Emergency Address</label><input className="form-control" type="text" /></div>
                        <div className="form-group" style={{ gridColumn: 'span 2', marginTop: '30px', padding: '15px', background: '#f7fafc', borderRadius: '10px' }}>
                            <label style={{ display: 'flex', gap: '10px', alignItems: 'center', cursor: 'pointer' }}>
                                <input type="checkbox" style={{ width: '20px', height: '20px' }} />
                                <span>I hereby declare that all information is correct and I accept NGO policies. <strong>(Signatory Acceptance)</strong></span>
                            </label>
                        </div>
                    </div>
                )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px' }}>
                <button className="btn-small" disabled={step === 1} onClick={() => setStep(step - 1)}>Previous</button>
                {step < 5 ? <button className="btn-add" onClick={() => setStep(step + 1)}>Next Section</button> : <button className="btn-add" onClick={() => { onSave({ id: 'BCLL-' + (1026 + Math.floor(Math.random() * 100)), name: 'New Staff', role: 'Intern', dept: 'Field Work', status: 'Active' }); onClose(); }}>Digitally Generate Profile</button>}
            </div>
        </div>
    );
}

const EmployeeDetailsView = ({ emp, onClose }) => {
    const details = emp || {};

    const Field = ({ icon, label, value, color = '#718096' }) => (
        <div style={{
            background: '#F8F9FA',
            padding: '20px',
            borderRadius: '16px',
            border: '1px solid #EDF2F7',
            transition: 'all 0.2s'
        }}>
            <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                color: color,
                fontSize: '0.75rem',
                fontWeight: '800',
                textTransform: 'uppercase',
                letterSpacing: '1.5px',
                marginBottom: '10px'
            }}>
                <span style={{ fontSize: '1.1rem' }}>{icon}</span> {label}
            </label>
            <div style={{ color: '#1A202C', fontSize: '1.1rem', fontWeight: '700' }}>{value || '—'}</div>
        </div>
    );

    return (
        <div style={{ background: '#FFFFFF' }}>
            {/* STICKY HEADER AREA */}
            <div style={{
                background: 'linear-gradient(135deg, #1A365D 0%, #0F172A 100%)',
                padding: '50px 60px',
                color: 'white',
                position: 'relative',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div style={{ display: 'flex', gap: '40px', alignItems: 'center' }}>
                    <div style={{
                        width: '140px',
                        height: '140px',
                        background: 'rgba(255,255,255,0.1)',
                        backdropFilter: 'blur(12px)',
                        borderRadius: '35px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '4rem',
                        border: '2px solid rgba(255,255,255,0.2)',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
                    }}>
                        {details.full_name?.charAt(0) || <FaFingerprint />}
                    </div>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                            <h2 style={{ fontSize: '3rem', margin: '0', fontWeight: '900', letterSpacing: '-1.5px' }}>{details.full_name}</h2>
                            <span style={{
                                padding: '8px 20px',
                                background: details.status === 'Active' ? '#48BB78' : '#F56565',
                                borderRadius: '50px',
                                fontSize: '0.85rem',
                                fontWeight: '900',
                                textTransform: 'uppercase',
                                letterSpacing: '2px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                            }}>{details.status}</span>
                        </div>
                        <p style={{ margin: '15px 0 0', opacity: 0.8, fontSize: '1.2rem', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <FaBriefcase style={{ color: '#ECC94B' }} /> {details.designation} <span style={{ opacity: 0.5 }}>|</span> <FaBuilding /> {details.department}
                        </p>
                    </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.9rem', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '3px', fontWeight: '700', marginBottom: '8px' }}>Internal Identifier</div>
                    <div style={{ fontSize: '2rem', fontWeight: '800', color: '#63B3ED' }}>#{details.employee_id || 'PENDING'}</div>
                    <button onClick={onClose} style={{
                        marginTop: '25px',
                        padding: '12px 30px',
                        borderRadius: '12px',
                        background: 'rgba(255,255,255,0.1)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        color: 'white',
                        cursor: 'pointer',
                        fontWeight: '700'
                    }}>Close Archive</button>
                </div>
            </div>

            {/* HIGH-DENSITY GRID DATA */}
            <div style={{ padding: '60px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '30px' }}>

                    {/* CORE SECTION */}
                    <div style={{ gridColumn: 'span 4', display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '10px' }}>
                        <div style={{ height: '4px', flex: 1, background: '#F1F5F9' }}></div>
                        <h4 style={{ textTransform: 'uppercase', letterSpacing: '4px', color: '#94A3B8', fontWeight: '900', fontSize: '0.9rem' }}>Personnel Biometrics & Legal</h4>
                        <div style={{ height: '4px', flex: 1, background: '#F1F5F9' }}></div>
                    </div>

                    <Field icon={<FaUsers />} label="Gender" value={details.gender} />
                    <Field icon={<FaClipboardCheck />} label="Birth Date" value={details.dob} />
                    <Field icon={<FaHeartbeat />} label="Blood Marker" value={details.blood_group} />
                    <Field icon={<FaCheckCircle />} label="Marital Status" value={details.marital_status} />
                    <Field icon={<FaShieldAlt />} label="Aadhaar Verification" value={details.aadhaar_number ? 'XXXX-XXXX-' + details.aadhaar_number.slice(-4) : '—'} />
                    <Field icon={<FaFileContract />} label="Tax ID (PAN)" value={details.pan_number} />
                    <Field icon={<FaEnvelope />} label="Sytem Email" value={details.email} />
                    <Field icon={<FaPhone />} label="Primary Comm" value={details.mobile} />

                    <div style={{ gridColumn: 'span 2' }}>
                        <Field icon={<FaMapMarkerAlt />} label="Registered Residence" value={details.current_address} />
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                        <Field icon={<FaMapMarkerAlt />} label="Permanent Domicile" value={details.permanent_address} />
                    </div>

                    {/* EMPLOYMENT SECTION */}
                    <div style={{ gridColumn: 'span 4', display: 'flex', alignItems: 'center', gap: '20px', margin: '40px 0 10px' }}>
                        <div style={{ height: '4px', flex: 1, background: '#F1F5F9' }}></div>
                        <h4 style={{ textTransform: 'uppercase', letterSpacing: '4px', color: '#94A3B8', fontWeight: '900', fontSize: '0.9rem' }}>Operational Workflow</h4>
                        <div style={{ height: '4px', flex: 1, background: '#F1F5F9' }}></div>
                    </div>

                    <Field icon={<FaClock />} label="Joining Data" value={details.date_of_joining} />
                    <Field icon={<FaMapMarkerAlt />} label="Base Station" value={details.work_location} />
                    <Field icon={<FaUserLock />} label="Contract Type" value={details.employment_type} />
                    <Field icon={<FaTasks />} label="Track Type" value={details.attendance_type} />

                    {/* FINANCIALS SECTION */}
                    <div style={{ gridColumn: 'span 4', display: 'flex', alignItems: 'center', gap: '20px', margin: '40px 0 10px' }}>
                        <div style={{ height: '4px', flex: 1, background: '#F1F5F9' }}></div>
                        <h4 style={{ textTransform: 'uppercase', letterSpacing: '4px', color: '#94A3B8', fontWeight: '900', fontSize: '0.9rem' }}>Treasury & Remittance</h4>
                        <div style={{ height: '4px', flex: 1, background: '#F1F5F9' }}></div>
                    </div>

                    <Field icon={<FaFileInvoiceDollar />} label="Monthly Retainer" value={`₹ ${details.salary_amount || 0}`} />
                    <Field icon={<FaUniversity />} label="Institution" value={details.bank_name} />
                    <Field icon={<FaFingerprint />} label="IFSC Protocol" value={details.ifsc_code} />
                    <Field icon={<FaUniversity />} label="Account Ending" value={details.acc_number ? '****' + details.acc_number.slice(-4) : '—'} />

                    {/* EMERGENCY SECTION */}
                    <div style={{ gridColumn: 'span 4', display: 'flex', alignItems: 'center', gap: '20px', margin: '40px 0 10px' }}>
                        <div style={{ height: '4px', flex: 1, background: '#F1F5F9' }}></div>
                        <h4 style={{ textTransform: 'uppercase', letterSpacing: '4px', color: '#94A3B8', fontWeight: '900', fontSize: '0.9rem' }}>Emergency Command & Compliance</h4>
                        <div style={{ height: '4px', flex: 1, background: '#F1F5F9' }}></div>
                    </div>

                    <Field icon={<FaUserShield />} label="Primary Kin" value={details.emergency_name} color="#E53E3E" />
                    <Field icon={<FaPhone />} label="Kin Hotline" value={details.emergency_mobile} color="#E53E3E" />
                    <Field icon={<FaGavel />} label="Policy Governance" value={details.signed_policy ? 'VERIFIED' : 'PENDING'} />
                    <Field icon={<FaUserCheck />} label="Security clearance" value="GRANTED" />
                </div>
            </div>
        </div>
    );
};

const VolunteerDetailsView = ({ volunteer, onClose, onApprove }) => {
    const v = volunteer || {};

    const Field = ({ icon, label, value, centered = false }) => (
        <div style={{
            background: '#F8F9FA',
            padding: centered ? '30px' : '20px',
            borderRadius: '20px',
            border: '1px solid #EDF2F7',
            textAlign: centered ? 'center' : 'left'
        }}>
            <label style={{
                display: 'flex',
                alignItems: centered ? 'center' : 'flex-start',
                justifyContent: centered ? 'center' : 'flex-start',
                gap: '10px',
                color: '#718096',
                fontSize: '0.75rem',
                fontWeight: '900',
                textTransform: 'uppercase',
                letterSpacing: '2px',
                marginBottom: '12px'
            }}>
                <span style={{ fontSize: '1.2rem', color: '#3182CE' }}>{icon}</span> {label}
            </label>
            <div style={{ color: '#1A202C', fontSize: centered ? '1.5rem' : '1.15rem', fontWeight: '800' }}>{value || '—'}</div>
        </div>
    );

    return (
        <div style={{ background: '#FFFFFF' }}>
            {/* LARGE HERO TOP */}
            <div style={{
                background: 'linear-gradient(135deg, #2B6CB0 0%, #1A365D 100%)',
                padding: '70px 80px',
                color: 'white',
                position: 'relative'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', gap: '50px', alignItems: 'center' }}>
                        <div style={{
                            width: '160px',
                            height: '160px',
                            background: 'rgba(255,255,255,0.15)',
                            backdropFilter: 'blur(15px)',
                            borderRadius: '45px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '5rem',
                            border: '3px solid rgba(255,255,255,0.3)',
                            boxShadow: '0 25px 50px rgba(0,0,0,0.4)',
                            transform: 'rotate(-5deg)'
                        }}>
                            <FaHandHoldingUsd />
                        </div>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
                                <h1 style={{ fontSize: '4rem', margin: '0', fontWeight: '900', letterSpacing: '-2px' }}>{v.full_name}</h1>
                                <div style={{
                                    padding: '8px 24px',
                                    background: v.status === 'New' ? '#ECC94B' : '#48BB78',
                                    color: v.status === 'New' ? '#744210' : 'white',
                                    borderRadius: '50px',
                                    fontSize: '1rem',
                                    fontWeight: '900',
                                    boxShadow: '0 8px 16px rgba(0,0,0,0.2)'
                                }}>{v.status?.toUpperCase()}</div>
                            </div>
                            <div style={{ marginTop: '20px', fontSize: '1.4rem', opacity: 0.9, fontWeight: '600', display: 'flex', alignItems: 'center', gap: '20px' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><FaTasks /> {v.area_of_interest || 'General Social Support'}</span>
                                <span style={{ opacity: 0.4 }}>|</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><FaFingerprint /> VOL-{v.id?.substring(0, 10).toUpperCase()}</span>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '15px' }}>
                        <button onClick={onClose} style={{
                            padding: '15px 40px',
                            borderRadius: '15px',
                            background: 'white',
                            color: '#1A365D',
                            border: 'none',
                            fontWeight: '800',
                            fontSize: '1rem',
                            cursor: 'pointer',
                            boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
                        }}>Dismiss Profile</button>
                    </div>
                </div>
            </div>

            {/* DASHBOARD BODY */}
            <div style={{ padding: '80px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '40px' }}>

                    {/* PERSONAL BLOCK */}
                    <div style={{ gridColumn: 'span 2' }}>
                        <h3 style={{ fontSize: '1.8rem', fontWeight: '900', color: '#1A365D', marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                            <FaIdCard /> Identity Management
                            <div style={{ flex: 1, height: '2px', background: '#E2E8F0' }}></div>
                        </h3>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
                            <Field icon={<FaUsers />} label="Full Registry Name" value={v.full_name} />
                            <Field icon={<FaEnvelope />} label="Contact Email" value={v.email} />
                            <Field icon={<FaPhone />} label="Verified Mobile" value={v.phone} />
                            <Field icon={<FaClipboardCheck />} label="Date of Birth" value={v.dob} />
                            <Field icon={<FaHeartbeat />} label="Blood Group" value={v.blood_group} />
                            <Field icon={<FaMapMarkerAlt />} label="Primary Residency" value={v.address} />
                        </div>
                    </div>

                    {/* STATUS BLOCK */}
                    <div style={{ gridColumn: 'span 1' }}>
                        <h3 style={{ fontSize: '1.8rem', fontWeight: '900', color: '#1A365D', marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                            <FaShieldAlt /> System Control
                        </h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                            <Field centered icon={<FaClock />} label="Onboarding Date" value={v.created_at ? new Date(v.created_at).toLocaleDateString() : 'N/A'} />

                            <div style={{
                                background: '#EBF8FF',
                                padding: '40px',
                                borderRadius: '30px',
                                border: '2px dashed #3182CE',
                                textAlign: 'center'
                            }}>
                                <h4 style={{ color: '#2B6CB0', marginBottom: '25px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px' }}>Administrative Actions</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    {v.status === 'New' ? (
                                        <>
                                            <button onClick={onApprove} style={{ padding: '18px', borderRadius: '15px', background: '#3182CE', color: 'white', border: 'none', fontWeight: '800', cursor: 'pointer', fontSize: '1.1rem' }}>Authorize Entry</button>
                                            <button style={{ padding: '15px', borderRadius: '15px', background: 'white', color: '#E53E3E', border: '1px solid #FED7D7', fontWeight: '700', cursor: 'pointer' }}>Reject Submission</button>
                                        </>
                                    ) : (
                                        <div style={{ background: '#F0FFF4', padding: '20px', borderRadius: '15px', color: '#2F855A', fontWeight: '800' }}>
                                            <FaUserCheck style={{ fontSize: '2rem', marginBottom: '10px' }} /><br />
                                            RECORD VERIFIED
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* FOOTER AUDIT */}
                    <div style={{ gridColumn: 'span 3', marginTop: '50px', padding: '40px', background: '#F7FAFC', borderRadius: '30px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ fontSize: '0.8rem', color: '#718096', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '2px' }}>Data Integrity Protocol</div>
                            <div style={{ color: '#4A5568', fontWeight: '600', marginTop: '5px' }}>Digitally signed and cryptographically verified record.</div>
                        </div>
                        <div style={{ display: 'flex', gap: '20px' }}>
                            <FaFingerprint style={{ fontSize: '2rem', color: '#CBD5E0' }} />
                            <FaShieldAlt style={{ fontSize: '2rem', color: '#CBD5E0' }} />
                            <FaGavel style={{ fontSize: '2rem', color: '#CBD5E0' }} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ReportForm = ({ onClose }) => {
    const [formData, setFormData] = useState({ title: '', category: 'Impact', status: 'Draft' });

    const handleSave = async () => {
        const { error } = await supabase.from('field_reports').insert([formData]);
        if (!error) {
            alert('Report Uploaded Successfully');
            onClose();
        } else {
            alert('Failed to upload report');
        }
    };

    return (
        <div style={{ padding: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h3>Upload Field Report</h3>
                <button className="btn-icon" onClick={onClose}>&times;</button>
            </div>
            <div className="form-group" style={{ marginBottom: '20px' }}>
                <label>Report Title</label>
                <input className="form-control" type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
            </div>
            <div className="form-group" style={{ marginBottom: '20px' }}>
                <label>Category</label>
                <select className="form-control" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                    <option>Impact</option>
                    <option>Financial</option>
                    <option>Rehab</option>
                    <option>General</option>
                </select>
            </div>
            <div className="form-group" style={{ marginBottom: '30px' }}>
                <label>Status</label>
                <select className="form-control" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                    <option>Draft</option>
                    <option>Public</option>
                </select>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px' }}>
                <button className="btn-small" onClick={onClose}>Cancel</button>
                <button className="btn-add" onClick={handleSave}><FaFileUpload /> Upload Report</button>
            </div>
        </div>
    );
};

const AdminLevelModal = ({ currentLevel, onClose, onSave }) => {
    const [level, setLevel] = useState(currentLevel);
    return (
        <div style={{ padding: '40px' }}>
            <h3 style={{ marginBottom: '20px' }}>Adjust Administrative Authority</h3>
            <p style={{ color: '#718096', marginBottom: '30px' }}>Elevating or restricting admin levels will immediately synchronize permissions across all connected devices.</p>

            <div className="form-group" style={{ marginBottom: '30px' }}>
                <label>Select Authority Tier</label>
                <select className="form-control" value={level} onChange={(e) => setLevel(e.target.value)}>
                    <option>L1 - Full Authority</option>
                    <option>L2 - High Operations</option>
                    <option>L3 - Mid Management</option>
                    <option>L4 - Base Support</option>
                </select>
            </div>

            <div style={{ padding: '20px', background: '#fffaf0', border: '1px solid #ecc94b', borderRadius: '15px', marginBottom: '30px' }}>
                <h5 style={{ color: '#b7791f', display: 'flex', alignItems: 'center', gap: '10px' }}><FaShieldAlt /> Restriction Warning</h5>
                <p style={{ fontSize: '0.85rem', margin: '10px 0 0' }}>Changing levels may revoke access to financial data or audit logs. Ensure this action is authorized by the board.</p>
            </div>

            <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end' }}>
                <button className="btn-small" onClick={onClose}>Cancel</button>
                <button className="btn-add" onClick={() => onSave(level)}>Commit Level Change</button>
            </div>
        </div>
    );
};

const UploadArtifactModal = ({ onClose, onSave, categories }) => {
    const [formData, setFormData] = useState({ name: '', category: (categories || [])[0]?.name || '', size: '1 MB' });

    return (
        <div style={{ padding: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h3>Upload Regulatory Artifact</h3>
                <button className="btn-icon" onClick={onClose}>&times;</button>
            </div>
            <div className="form-group" style={{ marginBottom: '20px' }}>
                <label>Document Name</label>
                <input className="form-control" type="text" placeholder="e.g. Trust Deed 2025" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <div className="form-group" style={{ marginBottom: '20px' }}>
                <label>Filing Category (Vault)</label>
                <select className="form-control" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                    {categories.map(cat => (
                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                </select>
            </div>
            <div className="form-group" style={{ marginBottom: '30px' }}>
                <label>File Attachment</label>
                <input className="form-control" type="file" onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) setFormData({ ...formData, size: (file.size / 1024 / 1024).toFixed(2) + ' MB' });
                }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px' }}>
                <button className="btn-small" onClick={onClose}>Cancel</button>
                <button className="btn-add" onClick={() => onSave(formData)}><FaFileUpload /> Upload & Verify</button>
            </div>
        </div>
    );
};

const FolderFormModal = ({ onClose, onSave, folder = null }) => {
    const [name, setName] = useState(folder ? folder.name : '');

    return (
        <div style={{ padding: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h3>{folder ? 'Rename Folder' : 'Create New Vault Folder'}</h3>
                <button className="btn-icon" onClick={onClose}>&times;</button>
            </div>
            <div className="form-group" style={{ marginBottom: '30px' }}>
                <label>Folder Name</label>
                <input
                    className="form-control"
                    type="text"
                    placeholder="e.g. Audit Reports 2026"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    autoFocus
                />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px' }}>
                <button className="btn-small" onClick={onClose}>Cancel</button>
                <button className="btn-add" onClick={() => onSave(name)} disabled={!name}>
                    {folder ? 'Update Name' : 'Initialize Folder'}
                </button>
            </div>
        </div>
    );
};

const StatCard = ({ title, count, color, icon }) => (
    <div className={`stat-card ${color}`} style={{ padding: '30px', borderRadius: '25px' }}>
        <div className="stat-content">
            <h3 style={{ fontSize: '2.5rem', marginBottom: '5px' }}>{count}</h3>
            <p style={{ fontWeight: '600', opacity: 0.8 }}>{title}</p>
        </div>
        <div className="stat-icon-overlay" style={{ fontSize: '4rem' }}>{icon}</div>
    </div>
);

const VolunteerIDCard = ({ volunteer, onClose }) => (
    <div style={{ padding: '20px', textAlign: 'center' }}>
        <h3 style={{ marginBottom: '20px' }}>Official Volunteer Identification</h3>
        <div style={{
            width: '350px',
            height: '220px',
            background: 'linear-gradient(135deg, #1A365D 0%, #2D3748 100%)',
            borderRadius: '15px',
            padding: '20px',
            color: 'white',
            margin: '0 auto 30px',
            position: 'relative',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            display: 'flex',
            textAlign: 'left',
            overflow: 'hidden'
        }}>
            <div style={{ marginRight: '20px', zIndex: 1 }}>
                <div style={{
                    width: '85px',
                    height: '85px',
                    background: '#fff',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#1A365D',
                    fontWeight: '800',
                    fontSize: '2.4rem',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                }}>
                    {volunteer.full_name?.charAt(0)}
                </div>
                <div style={{ marginTop: '15px', fontSize: '0.65rem', opacity: 0.9, fontWeight: '700' }}>REG: VOL-{volunteer.id?.substring(0, 6).toUpperCase()}</div>
            </div>
            <div style={{ flex: 1, zIndex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <img src="/logo-CYlp3-fg__1_-removebg-preview.svg" alt="" style={{ width: '22px' }} />
                    <span style={{ fontSize: '0.85rem', fontWeight: '900', letterSpacing: '1.5px', color: '#63B3ED' }}>BHARATH CARES</span>
                </div>
                <h2 style={{ fontSize: '1.4rem', margin: '5px 0 2px', fontWeight: '800', color: 'white' }}>{volunteer.full_name}</h2>
                <p style={{ fontSize: '0.8rem', margin: 0, color: '#A0AEC0', fontWeight: '600' }}>Official Social Volunteer</p>
                <div style={{ marginTop: '18px', fontSize: '0.75rem', background: 'rgba(255,255,255,0.1)', padding: '6px 10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <strong style={{ color: '#63B3ED' }}>Focus Area:</strong><br />
                    {volunteer.area_of_interest || 'General Welfare'}
                </div>
            </div>

            {/* Background elements for ID card aesthetic */}
            <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '150px', height: '150px', background: 'rgba(255,255,255,0.03)', borderRadius: '50%' }}></div>
            <div style={{ position: 'absolute', bottom: '15px', right: '20px', width: '45px', height: '45px', background: 'white', padding: '4px', borderRadius: '4px' }}>
                <div style={{ width: '100%', height: '100%', border: '2px solid #1A365D' }}></div>
            </div>
        </div>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button className="btn-small" onClick={onClose} style={{ padding: '10px 25px' }}>Close</button>
            <button className="btn-add" onClick={() => alert('Processing secure ID card generation...')}>Download Secure ID</button>
        </div>
    </div>
);

export default AdminDashboard;
