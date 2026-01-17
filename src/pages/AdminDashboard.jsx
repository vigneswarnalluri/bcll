import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import {
    FaUsers, FaUserShield, FaHandHoldingUsd, FaFileAlt, FaSignOutAlt,
    FaUserPlus, FaCheckCircle, FaGraduationCap, FaFileInvoiceDollar,
    FaFolderOpen, FaClipboardCheck, FaChartLine, FaTrash, FaEdit, FaEye, FaFileUpload, FaTasks, FaPlus, FaPlusCircle,
    FaIdCard, FaUniversity, FaBriefcase, FaUserLock, FaExclamationTriangle, FaHeartbeat, FaFileSignature,
    FaMapMarkerAlt, FaPhone, FaUserCheck, FaBalanceScale, FaHistory, FaShieldAlt, FaDesktop, FaUnlockAlt,
    FaDownload, FaUserTie, FaFileContract, FaHandshake, FaRegIdCard, FaEnvelope,
    FaBuilding, FaGavel, FaUserTimes, FaClock, FaFingerprint, FaSearch
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    // --- REAL DATABASE STATE ---
    const [employees, setEmployees] = useState([]);
    const [activityLogs, setActivityLogs] = useState([]);
    const [coAdmins, setCoAdmins] = useState([]);
    const [volunteers, setVolunteers] = useState([]);
    const [students, setStudents] = useState([]);
    const [scholarships, setScholarships] = useState([]);
    const [finances, setFinances] = useState([]);
    const [requests, setRequests] = useState([]);
    const [reports, setReports] = useState([]);
    const [docFiles, setDocFiles] = useState([]);
    const [categories, setCategories] = useState([]);
    const [efiles, setEfiles] = useState([]);
    const [orgMaster, setOrgMaster] = useState(null);
    const [matchingActions, setMatchingActions] = useState([]);

    const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState('');
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [selectedVolunteer, setSelectedVolunteer] = useState(null);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [selectedFolder, setSelectedFolder] = useState(null);
    const [selectedAdmin, setSelectedAdmin] = useState(null);
    const [step, setStep] = useState(1);

    const [adminProfile, setAdminProfile] = useState({
        id: '...',
        name: 'Loading...',
        role: 'Verifying Access...',
        dept: '...',
        level: '...',
        status: '...',
        security: { auth2FA: 'Verifying...', lastLogin: '...', device: '...', lastIP: '...' },
        financials: { salaryLimit: '...', bankAccess: '...', fundUtilization: '...', donationAccess: '...' },
        permissions: {}
    });

    const availableActions = [
        { label: 'Hire Employee', id: 'employee', keywords: 'hire, add, employee, staff, personnel, recruitment', icon: <FaUserPlus />, action: () => { setModalType('employee'); setIsModalOpen(true); } },
        { label: 'Register Student', id: 'student', keywords: 'student, add, registration, admission, enrollment', icon: <FaGraduationCap />, action: () => { setActiveTab('students'); } },
        { label: 'Add Co-Admin', id: 'co-admin', keywords: 'admin, add, power, management, permissions', icon: <FaUserShield />, action: () => { setModalType('co-admin'); setIsModalOpen(true); } },
        { label: 'Modify Profile', id: 'edit-profile', keywords: 'edit, modify, profile, update, personal, settings', icon: <FaEdit />, action: () => { setModalType('edit-profile'); setIsModalOpen(true); } },
        { label: 'Upload Artifact', id: 'upload-doc', keywords: 'upload, document, file, artifact, digital, storage', icon: <FaFileUpload />, action: () => { setModalType('upload-doc'); setIsModalOpen(true); } },
        { label: 'Create Folder', id: 'create-folder', keywords: 'folder, new, category, storage, organization', icon: <FaFolderOpen />, action: () => { setModalType('create-folder'); setIsModalOpen(true); } },
        { label: 'Post Field Report', id: 'report', keywords: 'report, new, field, activity, update, post', icon: <FaFileAlt />, action: () => { setModalType('report'); setIsModalOpen(true); } },
        { label: 'Security Logout', id: 'logout', keywords: 'logout, signout, exit, leave, session', icon: <FaSignOutAlt />, action: () => { navigate('/login'); } },
    ];

    useEffect(() => {
        fetchDashboardData();
    }, []);

    // --- MODULAR FETCHING ---
    const fetchTabData = async (tabId = activeTab, query = '') => {
        const q = query.trim().toLowerCase();

        // Action Suggester (Command Palette) - Global
        if (q) {
            setMatchingActions(availableActions.filter(a => {
                const p = adminProfile.permissions;
                // Permission checks for matching actions
                if (a.id === 'employee') if (adminProfile.role !== 'Super Admin' && !p.edit_employees) return false;
                if (a.id === 'student') if (adminProfile.role !== 'Super Admin' && !p.student_mgmt) return false;
                if (a.id === 'co-admin') if (adminProfile.role !== 'Super Admin' && !p.manage_admins) return false;
                if (a.id === 'upload-doc') if (adminProfile.role !== 'Super Admin' && !p.vault_access) return false;
                if (a.id === 'create-folder') if (adminProfile.role !== 'Super Admin' && !p.vault_access) return false;
                if (a.id === 'report') if (adminProfile.role !== 'Super Admin' && !p.report_approval) return false;

                return a.label.toLowerCase().includes(q) ||
                    a.keywords.toLowerCase().includes(q);
            }));
        } else {
            setMatchingActions([]);
        }

        try {
            switch (tabId) {
                case 'employees':
                    let empReq = supabase.from('employees').select('*').order('full_name');
                    if (q) empReq = empReq.or(`full_name.ilike.%${q}%,employee_id.ilike.%${q}%,department.ilike.%${q}%,designation.ilike.%${q}%,status.ilike.%${q}%`);
                    const { data: emps } = await empReq;
                    if (emps) setEmployees(emps);
                    break;
                case 'volunteers':
                    let volReq = supabase.from('volunteers').select('*').order('created_at', { ascending: false });
                    if (q) volReq = volReq.or(`full_name.ilike.%${q}%,area_of_interest.ilike.%${q}%,status.ilike.%${q}%,phone.ilike.%${q}%,email.ilike.%${q}%`);
                    const { data: vols } = await volReq;
                    if (vols) setVolunteers(vols);
                    break;
                case 'students':
                    let studReq = supabase.from('students').select('*').order('student_name');
                    if (q) studReq = studReq.or(`student_name.ilike.%${q}%,college_org.ilike.%${q}%,program.ilike.%${q}%,status.ilike.%${q}%`);
                    const { data: studs } = await studReq;
                    if (studs) setStudents(studs);
                    break;
                case 'scholarships':
                    let scholReq = supabase.from('scholarships').select('*').order('created_at', { ascending: false });
                    if (q) scholReq = scholReq.or(`applicant_name.ilike.%${q}%,application_id.ilike.%${q}%,status.ilike.%${q}%,income_status.ilike.%${q}%`);
                    const { data: schols } = await scholReq;
                    if (schols) setScholarships(schols);
                    break;
                case 'finance':
                    let finReq = supabase.from('finance_logs').select('*').order('transaction_date', { ascending: false });
                    if (q) finReq = finReq.or(`type.ilike.%${q}%,category_context.ilike.%${q}%,status.ilike.%${q}%`);
                    const { data: fins } = await finReq;
                    if (fins) setFinances(fins);
                    break;
                case 'reports':
                    let repReq = supabase.from('field_reports').select('*').order('created_at', { ascending: false });
                    if (q) repReq = repReq.or(`title.ilike.%${q}%,category.ilike.%${q}%,status.ilike.%${q}%`);
                    const { data: reps } = await repReq;
                    if (reps) setReports(reps);
                    break;
                case 'activity-logs':
                    let logReq = supabase.from('audit_logs').select('*').order('created_at', { ascending: false });
                    if (q) logReq = logReq.or(`action.ilike.%${q}%,sub_system.ilike.%${q}%`);
                    const { data: logs } = await logReq;
                    if (logs) setActivityLogs(logs);
                    break;
                case 'e-office':
                    const [docsRes, filesRes] = await Promise.all([
                        supabase.from('organization_docs').select('*').order('created_at', { ascending: false }),
                        supabase.from('efiles').select('*').order('file_number', { ascending: false })
                    ]);
                    if (docsRes.data) setDocFiles(docsRes.data);
                    if (filesRes.data) setEfiles(filesRes.data);
                    break;
                case 'org-master':
                    const { data: orgData } = await supabase.from('org_master').select('*').maybeSingle();
                    if (orgData) setOrgMaster(orgData);
                    break;
                case 'approvals':
                    let leaveReq = supabase.from('leave_requests').select('*, employees(full_name, designation)').order('created_at', { ascending: false });
                    if (q) leaveReq = leaveReq.or(`status.ilike.%${q}%,leave_type.ilike.%${q}%,reason.ilike.%${q}%`);
                    const { data: lReqs } = await leaveReq;
                    if (lReqs) {
                        setRequests(lReqs.map(l => ({
                            id: l.id,
                            type: l.leave_type || 'Leave Request',
                            requester: l.employees?.full_name || 'Unknown',
                            details: l.reason,
                            date: l.start_date,
                            status: l.status
                        })));
                    }
                    break;
                case 'co-admins':
                    const { data: cAdms } = await supabase
                        .from('profiles')
                        .select('*, admin_controls(*)')
                        .or(`user_id.is.null,user_id.neq.${(await supabase.auth.getUser()).data.user?.id}`)
                        .in('role_type', ['Admin', 'Super Admin', 'Co-Admin', 'HR Manager', 'Finance Officer', 'Field Super']);
                    if (cAdms) setCoAdmins(cAdms);
                    break;
                case 'overview':
                    if (q) {
                        // Global Search across ALL major tables
                        const [eRes, vRes, rRes, sRes, scRes, fRes] = await Promise.all([
                            supabase.from('employees').select('*').or(`full_name.ilike.%${q}%,employee_id.ilike.%${q}%,department.ilike.%${q}%`),
                            supabase.from('volunteers').select('*').or(`full_name.ilike.%${q}%,area_of_interest.ilike.%${q}%`),
                            supabase.from('leave_requests').select('*, employees(full_name)').or(`status.ilike.%${q}%,leave_type.ilike.%${q}%,reason.ilike.%${q}%`),
                            supabase.from('students').select('*').or(`student_name.ilike.%${q}%,college_org.ilike.%${q}%`),
                            supabase.from('scholarships').select('*').or(`applicant_name.ilike.%${q}%,application_id.ilike.%${q}%`),
                            supabase.from('finance_logs').select('*').or(`type.ilike.%${q}%,category_context.ilike.%${q}%`)
                        ]);
                        if (eRes.data) setEmployees(eRes.data);
                        if (vRes.data) setVolunteers(vRes.data);
                        if (rRes.data) setRequests(rRes.data.map(l => ({
                            id: l.id,
                            type: l.leave_type || 'Leave Request',
                            requester: l.employees?.full_name || 'Unknown',
                            status: l.status
                        })));
                        if (sRes.data) setStudents(sRes.data);
                        if (scRes.data) setScholarships(scRes.data);
                        if (fRes.data) setFinances(fRes.data);
                    } else {
                        fetchDashboardData();
                    }
                    break;
            }
        } catch (err) {
            console.error(`Search failed for ${tabId}:`, err);
        }
    };

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                navigate('/login');
                return;
            }

            // Summary Fetch for totals and initial load
            const [e, v, s, sc, f, l, r, rep] = await Promise.all([
                supabase.from('employees').select('*'),
                supabase.from('volunteers').select('*').order('created_at', { ascending: false }),
                supabase.from('students').select('*'),
                supabase.from('scholarships').select('*'),
                supabase.from('finance_logs').select('*'),
                supabase.from('audit_logs').select('*').order('created_at', { ascending: false }),
                supabase.from('leave_requests').select('*, employees(full_name)'),
                supabase.from('field_reports').select('*').order('created_at', { ascending: false })
            ]);

            if (e.data) setEmployees(e.data);
            if (v.data) setVolunteers(v.data);
            if (s.data) setStudents(s.data);
            if (sc.data) setScholarships(sc.data);
            if (f.data) setFinances(f.data);
            if (l.data) setActivityLogs(l.data);
            if (rep.data) setReports(rep.data);
            if (r.data) setRequests(r.data.map(item => ({
                id: item.id,
                type: item.leave_type || 'Leave Request',
                requester: item.employees?.full_name || 'Unknown',
                details: item.reason,
                date: item.start_date,
                status: item.status
            })));

            if (user) {
                // Fetch the logged-in admin's profile and their control/perms
                const { data: pData } = await supabase
                    .from('profiles')
                    .select('*, admin_controls(*)')
                    .eq('user_id', user.id)
                    .maybeSingle();

                if (pData) {
                    const controls = pData.admin_controls?.[0] || {};
                    setAdminProfile({
                        id: pData.id,
                        name: pData.full_name,
                        role: pData.role_type,
                        dept: pData.department || 'HQ Executive',
                        level: `Level ${controls.authority_level || '3'} (Operational)`,
                        status: 'Active Security Clearance',
                        email: pData.email,
                        mobile: pData.mobile || 'Not Set',
                        dob: pData.dob || 'Not Set',
                        gender: pData.gender || 'Not Set',
                        appointmentDate: pData.appointment_date || 'Not Set',
                        address: pData.address || 'Not Set',
                        emergency: pData.emergency || 'Not Set',
                        security: {
                            auth2FA: 'Active',
                            lastLogin: new Date().toLocaleString(),
                            device: 'Verified Workstation',
                            lastIP: 'Logged Session'
                        },
                        financials: {
                            salaryLimit: `₹ ${Number(controls.salary_approval_limit || 0).toLocaleString()}`,
                            bankAccess: controls.perm_bank_access ? 'Unlocked' : 'Partial',
                            fundUtilization: controls.fund_utilization_auth ? 'Full Authority' : 'Restricted',
                            donationAccess: 'Read/Write'
                        },
                        permissions: {
                            view_employees: controls.perm_view_employees,
                            edit_employees: controls.perm_edit_employees,
                            approve_leaves: controls.perm_approve_leaves,
                            process_salary: controls.perm_process_salary,
                            bank_access: controls.perm_bank_access,
                            volunteer_approval: controls.perm_volunteer_approval,
                            scholarship_verify: controls.perm_scholarship_verify,
                            manage_admins: controls.perm_manage_admins,
                            student_mgmt: controls.perm_student_mgmt,
                            report_approval: controls.perm_report_approval,
                            vault_access: controls.perm_vault_access,
                            audit_logs: controls.perm_audit_logs,
                            org_master: controls.perm_org_master,
                            fin_reports_auth: controls.fin_reports_auth
                        }
                    });

                    const { data: others } = await supabase
                        .from('profiles')
                        .select('*, admin_controls(*)')
                        .or(`user_id.is.null,user_id.neq.${user.id}`)
                        .in('role_type', ['Admin', 'Super Admin', 'Co-Admin', 'HR Manager', 'Finance Officer', 'Field Super']);
                    if (others) setCoAdmins(others);
                }
            }

            // Initial Categories
            const { data: cats } = await supabase.from('organization_categories').select('*').order('name');
            if (cats) setCategories(cats);

            // Fetch Org Master
            const { data: om } = await supabase.from('org_master').select('*').maybeSingle();
            if (om) setOrgMaster(om);

            // Fetch e-Files
            const { data: ef } = await supabase.from('efiles').select('*').order('file_number');
            if (ef) setEfiles(ef);
        } catch (error) {
            console.error('Core Refresh Failed:', error);
        } finally {
            setLoading(false);
        }
    };
    const [tabSearchTerms, setTabSearchTerms] = useState({
        overview: '',
        employees: '',
        volunteers: '',
        students: '',
        scholarships: '',
        finance: '',
        'e-office': '',
        approvals: '',
        'activity-logs': ''
    });
    const searchTerm = tabSearchTerms[activeTab] || '';

    // DEBOUNCED SEARCH EFFECT
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchTabData(activeTab, searchTerm);
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, activeTab]);



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

    const deleteStudent = async (id, name) => {
        if (window.confirm(`PERMANENT ACTION: Delete academic registration for ${name}?`)) {
            const { error } = await supabase.from('students').delete().eq('id', id);
            if (!error) {
                logActivity(`Deleted student registration: ${name}`, 'Academic');
                fetchDashboardData();
            } else {
                alert('Failed to delete student record. Check console.');
                console.error(error);
            }
        }
    };

    const deleteScholarship = async (id, name) => {
        if (window.confirm(`PERMANENT ACTION: Remove scholarship application for ${name}?`)) {
            const { error } = await supabase.from('scholarships').delete().eq('id', id);
            if (!error) {
                logActivity(`Deleted scholarship application: ${name}`, 'Academic');
                fetchDashboardData();
            } else {
                alert('Failed to delete scholarship application. Check console.');
                console.error(error);
            }
        }
    };

    const deleteFinanceEntry = async (id, context) => {
        if (window.confirm(`PERMANENT ACTION: Delete financial transaction "${context}"? This will affect audit records.`)) {
            const { error } = await supabase.from('finance_logs').delete().eq('id', id);
            if (!error) {
                logActivity(`Deleted finance entry: ${context}`, 'Treasury');
                fetchDashboardData();
            }
        }
    };

    const deleteReport = async (id, title) => {
        if (window.confirm(`Delete field report "${title}"?`)) {
            const { error } = await supabase.from('field_reports').delete().eq('id', id);
            if (!error) {
                logActivity(`Deleted report: ${title}`, 'Reports');
                fetchDashboardData();
            }
        }
    };

    const deleteCoAdmin = async (id, name) => {
        if (window.confirm(`REVOKE ACCESS: Remove all administrative privileges for ${name}? This action is logged.`)) {
            const { error } = await supabase.from('profiles').delete().eq('id', id);
            if (!error) {
                logActivity(`Revoked admin access for: ${name}`, 'Security');
                fetchDashboardData();
            } else {
                alert('Revocation failed: ' + error.message);
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
        { id: 'org-master', icon: <FaBuilding />, label: 'Organization Master' },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'overview':
                return <OverviewTab
                    employees={employees}
                    volunteers={volunteers}
                    requests={requests}
                    coAdmins={coAdmins}
                    students={students}
                    scholarships={scholarships}
                    finances={finances}
                    searchTerm={tabSearchTerms.overview}
                    matchingActions={matchingActions}
                    onClearSearch={() => setTabSearchTerms(prev => ({ ...prev, overview: '' }))}
                />;
            case 'admin-profile': return <AdminProfileTab admin={adminProfile} onModifyLevel={() => { setModalType('admin-level'); setIsModalOpen(true); }} onEditProfile={() => { setModalType('edit-profile'); setIsModalOpen(true); }} />;
            case 'activity-logs': return <ActivityLogsTab logs={activityLogs} />;
            case 'employees':
                return <EmployeeTab employees={employees} toggleStatus={toggleEmployeeStatus} deleteEmp={deleteEmployee} onView={(emp) => { setSelectedEmployee(emp); setModalType('emp-details'); setIsModalOpen(true); }} onAdd={() => { setModalType('employee'); setIsModalOpen(true); }} />;
            case 'volunteers':
                return <VolunteerTab volunteers={volunteers} handleAction={handleAction} onDelete={deleteVolunteer} onView={(v) => { setSelectedVolunteer(v); setModalType('volunteer-details'); setIsModalOpen(true); }} onViewID={(v) => { setSelectedVolunteer(v); setModalType('volunteer-id'); setIsModalOpen(true); }} />;
            case 'students':
                return <StudentTab students={students} onDelete={deleteStudent} onView={(s) => { setSelectedStudent(s); setModalType('student-details'); setIsModalOpen(true); }} />;
            case 'scholarships':
                return <ScholarshipTab scholarships={scholarships} handleAction={handleAction} onDelete={deleteScholarship} />;
            case 'finance': return <FinanceTab finances={finances} onDelete={deleteFinanceEntry} />;
            case 'reports': return <ReportsTab reports={reports} onDelete={deleteReport} onAdd={() => { setModalType('report'); setIsModalOpen(true); }} />;
            case 'e-office':
                return (
                    <EOfficeTab
                        docFiles={docFiles}
                        categories={categories}
                        onUpload={() => { setModalType('upload-doc'); setIsModalOpen(true); }}
                        onAddFolder={() => { setModalType('create-folder'); setIsModalOpen(true); }}
                        onRenameFolder={(f) => { setSelectedFolder(f); setModalType('rename-folder'); setIsModalOpen(true); }}
                        refreshData={fetchDashboardData}
                        efiles={efiles}
                    />
                );
            case 'approvals':
                return <ApprovalsTab requests={requests} handleAction={handleAction} />;
            case 'co-admins':
                return (
                    <CoAdminTab
                        admins={coAdmins}
                        onAdd={() => { setSelectedAdmin(null); setModalType('co-admin'); setStep(1); setIsModalOpen(true); }}
                        onDelete={deleteCoAdmin}
                        onEdit={(adm) => { setSelectedAdmin(adm); setModalType('co-admin'); setStep(1); setIsModalOpen(true); }}
                        onManage={(adm) => { setSelectedAdmin(adm); setModalType('co-admin'); setStep(3); setIsModalOpen(true); }}
                    />
                );
            case 'org-master': return <OrgMasterTab org={orgMaster} refreshData={fetchDashboardData} />;
            default:
                return (
                    <OverviewTab
                        employees={employees}
                        volunteers={volunteers}
                        requests={requests}
                        coAdmins={coAdmins}
                        students={students}
                        scholarships={scholarships}
                        finances={finances}
                        searchTerm={tabSearchTerms.overview}
                        matchingActions={matchingActions}
                        onClearSearch={() => setTabSearchTerms(prev => ({ ...prev, overview: '' }))}
                    />
                );
        }
    };

    if (loading) {
        return (
            <div style={{
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                background: '#f8fafc',
                color: '#1a365d'
            }}>
                <img src="/logo-CYlp3-fg__1_-removebg-preview.svg" alt="Loading" style={{ width: '80px', marginBottom: '20px', animation: 'pulse 2s infinite' }} />
                <h2 style={{ fontWeight: '800' }}>Syncing Admin HQ...</h2>
                <p style={{ opacity: 0.6 }}>Establishing Secure Connection</p>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <div className="sidebar">
                <div className="sidebar-header">
                    <img src="/logo-CYlp3-fg__1_-removebg-preview.svg" alt="Logo" className="dash-logo" style={{ width: '40px' }} />
                    <h3 style={{ fontSize: '1rem' }}>Admin Control</h3>
                </div>
                <div className="sidebar-scroll custom-scroll">
                    <ul className="sidebar-menu" role="menu">
                        {menuItems.filter(item => {
                            if (adminProfile.role === 'Super Admin') return true;
                            const p = adminProfile.permissions;
                            if (item.id === 'overview' || item.id === 'admin-profile') return true;
                            if (item.id === 'co-admins') return p.manage_admins;
                            if (item.id === 'employees') return p.view_employees;
                            if (item.id === 'volunteers') return p.volunteer_approval;
                            if (item.id === 'students') return p.student_mgmt;
                            if (item.id === 'scholarships') return p.scholarship_verify;
                            if (item.id === 'finance') return p.process_salary || p.bank_access || p.fin_reports_auth;
                            if (item.id === 'reports') return p.report_approval;
                            if (item.id === 'e-office') return p.vault_access;
                            if (item.id === 'activity-logs') return p.audit_logs;
                            if (item.id === 'approvals') return p.approve_leaves;
                            if (item.id === 'org-master') return p.org_master;
                            return false;
                        }).map(item => (
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
                            <FaSearch className="search-icon" />
                            <input
                                type="text"
                                placeholder={`Search anything...`}
                                value={searchTerm}
                                onChange={(e) => setTabSearchTerms(prev => ({ ...prev, [activeTab]: e.target.value }))}
                            />
                            {matchingActions.length > 0 && (
                                <div className="command-search-dropdown">
                                    <div className="dropdown-header">Action Discovery</div>
                                    {matchingActions.map(action => (
                                        <button key={action.id} className="dropdown-item" onClick={() => { action.action(); setTabSearchTerms(prev => ({ ...prev, [activeTab]: '' })); }}>
                                            <span className="action-icon">{action.icon}</span>
                                            <div className="action-info">
                                                <span className="action-label">{action.label}</span>
                                                <span className="action-keywords">{action.keywords}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="quick-actions-dropdown">
                            <button className="btn-quick-act" onClick={() => setIsQuickActionOpen(!isQuickActionOpen)}><FaPlus /> Command</button>
                            {isQuickActionOpen && (
                                <div className="qa-menu" onMouseLeave={() => setIsQuickActionOpen(false)}>
                                    {(adminProfile.role === 'Super Admin' || adminProfile.permissions.manage_admins) && (
                                        <button onClick={() => { setModalType('co-admin'); setIsModalOpen(true); setIsQuickActionOpen(false); }}>New Co-Admin</button>
                                    )}
                                    {(adminProfile.role === 'Super Admin' || adminProfile.permissions.edit_employees) && (
                                        <button onClick={() => { setModalType('employee'); setIsModalOpen(true); setIsQuickActionOpen(false); }}>Hire Staff</button>
                                    )}
                                    <button onClick={() => { setModalType('edit-profile'); setIsModalOpen(true); setIsQuickActionOpen(false); }}>My Profile</button>
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
                    <div className="modal-content" style={{
                        width: modalType === 'report' ? '600px' : (modalType.includes('details') ? '1400px' : '1000px'),
                        maxHeight: '92vh',
                        display: 'flex',
                        flexDirection: 'column',
                        borderRadius: '28px',
                        backgroundColor: '#fff',
                        border: '1px solid rgba(255,255,255,0.1)',
                        overflow: 'hidden'
                    }} onClick={e => e.stopPropagation()}>
                        {modalType === 'employee' && (
                            <EmployeeForm
                                onClose={() => setIsModalOpen(false)}
                                onSave={async (newEmp) => {
                                    const { error } = await supabase.from('employees').insert([newEmp]);
                                    if (!error) {
                                        await logActivity(`Hired New Personnel: ${newEmp.full_name}`, 'HR');
                                        fetchDashboardData();
                                        setIsModalOpen(false);
                                    } else {
                                        console.error('Hire failed:', error);
                                        alert('Error hiring personnel: ' + error.message);
                                    }
                                }}
                            />
                        )}
                        {modalType === 'co-admin' && (
                            <AdminForm
                                admin={selectedAdmin}
                                initialStep={step || 1}
                                onClose={() => { setIsModalOpen(false); setStep(1); }}
                                onSave={async (newAdm) => {
                                    let linkedAuthId = null;

                                    // If this is a new admin, create their Auth Login via secure RPC
                                    if (!newAdm.id && newAdm.email && newAdm.password) {
                                        const { data: authId, error: authError } = await supabase.rpc('provision_admin_auth', {
                                            email_text: newAdm.email,
                                            password_text: newAdm.password,
                                            full_name_text: newAdm.full_name,
                                            role_text: newAdm.role_type
                                        });

                                        if (authError) {
                                            console.error('Auth provisioning failed:', authError);
                                            alert('Authentication Error: ' + authError.message);
                                            return;
                                        }
                                        linkedAuthId = authId;
                                    }

                                    const profileData = {
                                        full_name: newAdm.full_name,
                                        email: newAdm.email,
                                        role_type: newAdm.role_type,
                                        department: newAdm.department,
                                        mobile: newAdm.mobile,
                                        dob: newAdm.dob,
                                        emergency: newAdm.emergency,
                                        ...(linkedAuthId && { user_id: linkedAuthId })
                                    };

                                    const { data: pData, error: pError } = await supabase
                                        .from('profiles')
                                        .upsert(
                                            [newAdm.id ? { id: newAdm.id, ...profileData } : profileData],
                                            { onConflict: 'email' }
                                        )
                                        .select()
                                        .single();

                                    if (!pError && pData) {
                                        const controlData = {
                                            admin_profile_id: pData.id,
                                            authority_level: newAdm.authority_level,
                                            perm_view_employees: newAdm.perms.view_employees,
                                            perm_edit_employees: newAdm.perms.edit_employees,
                                            perm_approve_leaves: newAdm.perms.approve_leaves,
                                            perm_process_salary: newAdm.perms.process_salary,
                                            perm_bank_access: newAdm.perms.bank_access,
                                            perm_volunteer_approval: newAdm.perms.volunteer_approval,
                                            perm_scholarship_verify: newAdm.perms.scholarship_verify,
                                            perm_manage_admins: newAdm.perms.manage_admins,
                                            perm_student_mgmt: newAdm.perms.student_mgmt,
                                            perm_report_approval: newAdm.perms.report_approval,
                                            perm_vault_access: newAdm.perms.vault_access,
                                            perm_audit_logs: newAdm.perms.audit_logs,
                                            perm_org_master: newAdm.perms.org_master,
                                            fin_reports_auth: newAdm.fin_reports_auth,
                                            statutory_docs_auth: newAdm.statutory_docs_auth,
                                            salary_approval_limit: newAdm.salary_approval_limit || 0,
                                            expenditure_limit: newAdm.expenditure_limit || 0,
                                            fund_utilization_auth: newAdm.fund_utilization_auth
                                        };

                                        const { error: cError } = await supabase
                                            .from('admin_controls')
                                            .upsert([controlData], { onConflict: 'admin_profile_id' });

                                        if (!cError) {
                                            await logActivity(`${newAdm.id ? 'Updated' : 'Provisioned New'} Admin Account: ${newAdm.full_name}`, 'Security');
                                            fetchDashboardData();
                                            alert(`Account ${newAdm.id ? 'updated' : 'provisioned'} successfully.`);
                                            setIsModalOpen(false);
                                            setStep(1);
                                        } else {
                                            alert('Error setting permissions: ' + cError.message);
                                        }
                                    } else {
                                        alert('Database Error: ' + (pError?.message || 'Unknown error'));
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
                                        .upsert({
                                            admin_profile_id: adminProfile.id,
                                            authority_level: newLevel.split(' ')[0]
                                        }, { onConflict: 'admin_profile_id' });

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
                        {modalType === 'student-details' && <StudentDetailsView student={selectedStudent} onClose={() => setIsModalOpen(false)} />}
                        {modalType === 'upload-doc' && (
                            <UploadArtifactModal
                                onClose={() => setIsModalOpen(false)}
                                categories={categories}
                                onSave={async (docData) => {
                                    try {
                                        const file = docData.fileObject;
                                        if (!file) throw new Error("No file selected");

                                        // 1. Upload to Supabase Storage
                                        const fileExt = file.name.split('.').pop();
                                        const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
                                        const filePath = `documents/${fileName}`;

                                        const { error: storageError } = await supabase.storage
                                            .from('vault')
                                            .upload(filePath, file);

                                        if (storageError) throw storageError;

                                        // 2. Insert Metadata into DB
                                        const cat = categories.find(c => c.name === docData.category);
                                        const dataToInsert = {
                                            name: docData.name,
                                            category: docData.category,
                                            size: docData.size,
                                            category_id: cat?.id,
                                            file_path: filePath
                                        };

                                        const { error: dbError } = await supabase.from('organization_docs').insert([dataToInsert]);
                                        if (dbError) throw dbError;

                                        logActivity(`Uploaded new regulatory artifact: ${docData.name}`, 'Legal');
                                        fetchDashboardData();
                                        setIsModalOpen(false);
                                    } catch (error) {
                                        console.error('Upload sequence failed:', error);
                                        alert('Upload failed: ' + error.message + '\nNote: Ensure a "vault" bucket exists in Supabase Storage.');
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
                        {modalType === 'edit-profile' && (
                            <EditProfileModal
                                admin={adminProfile}
                                onClose={() => setIsModalOpen(false)}
                                onSave={async (updatedProfile) => {
                                    const dbProfile = {
                                        full_name: updatedProfile.full_name,
                                        email: updatedProfile.email,
                                        mobile: updatedProfile.mobile,
                                        dob: updatedProfile.dob,
                                        gender: updatedProfile.gender,
                                        address: updatedProfile.address,
                                        emergency: updatedProfile.emergency,
                                        appointment_date: updatedProfile.appointment_date
                                    };

                                    const { error } = await supabase
                                        .from('profiles')
                                        .update(dbProfile)
                                        .eq('id', adminProfile.id);

                                    if (!error) {
                                        logActivity('Updated personal admin profile details', 'Security');
                                        fetchDashboardData();
                                        setIsModalOpen(false);
                                    } else {
                                        alert('Update failed: ' + error.message);
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

const OverviewTab = ({ employees, volunteers, requests, coAdmins, students, scholarships, finances, searchTerm, matchingActions, onClearSearch }) => {
    const isSearching = searchTerm && searchTerm.trim().length > 0;

    // Calculate pending counts
    const pendingVolsCount = (volunteers || []).filter(v => v?.status === 'New').length;
    const pendingReqsCount = (requests || []).filter(r => r?.status === 'Pending').length;

    // Total matching results
    const totalResults = (employees?.length || 0) + (volunteers?.length || 0) + (requests?.length || 0) + (students?.length || 0) + (scholarships?.length || 0) + (finances?.length || 0);

    return (
        <>
            {isSearching && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '30px' }}>
                    <div style={{ padding: '15px', background: '#e6fffa', border: '2px solid #38b2ac', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                        <span style={{ color: '#2c7a7b', fontWeight: '700' }}>
                            <FaSearch style={{ marginRight: '10px' }} /> Overview Results: Found {totalResults} matches for "{searchTerm}"
                        </span>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.8rem', color: '#4a5568', background: '#fff', padding: '2px 8px', borderRadius: '4px' }}>Discovery Active</span>
                            <button onClick={onClearSearch} style={{ background: '#319795', color: 'white', border: 'none', padding: '5px 15px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Clear Search</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="stats-grid">
                <StatCard title="Active Personnel" count={(employees || []).filter(e => e?.status === 'Active').length} color="blue" icon={<FaUsers />} />
                <StatCard title="Pending Volunteers" count={pendingVolsCount} color="purple" icon={<FaHandHoldingUsd />} />
                <StatCard title="System Uptime" count="99.9%" color="gold" icon={<FaDesktop />} />
                <StatCard title="Total Alerts" count={pendingVolsCount + pendingReqsCount} color="red" icon={<FaExclamationTriangle />} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginTop: '30px' }}>
                <div className="content-panel">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <h3 style={{ margin: 0 }}>{isSearching ? 'Matching Records' : 'Critical Approvals Required'}</h3>
                        {isSearching && <span className="badge success">{totalResults} Found</span>}
                    </div>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>{isSearching ? 'Record Type' : 'Task Type'}</th>
                                <th>{isSearching ? 'Name / Subject' : 'Pending Item'}</th>
                                <th>{isSearching ? 'Status' : 'Urgency'}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* When searching, show specific matching names */}
                            {isSearching ? (
                                <>
                                    {(employees || []).map(e => (
                                        <tr key={`search-emp-${e.id}`}>
                                            <td><span style={{ color: '#3182ce', fontWeight: '600' }}>Staff</span></td>
                                            <td>{e.full_name} <br /><small style={{ color: '#718096' }}>{e.department}</small></td>
                                            <td><span className={`badge ${e.status === 'Active' ? 'success' : 'warning'}`}>{e.status}</span></td>
                                        </tr>
                                    ))}
                                    {(volunteers || []).map(v => (
                                        <tr key={`search-vol-${v.id}`}>
                                            <td><span style={{ color: '#805ad5', fontWeight: '600' }}>Volunteer</span></td>
                                            <td>{v.full_name} <br /><small style={{ color: '#718096' }}>{v.area_of_interest}</small></td>
                                            <td><span className={`badge ${v.status === 'Approved' ? 'success' : 'warning'}`}>{v.status}</span></td>
                                        </tr>
                                    ))}
                                    {(requests || []).map(r => (
                                        <tr key={`search-req-${r.id}`}>
                                            <td><span style={{ color: '#e53e3e', fontWeight: '600' }}>Request</span></td>
                                            <td>{r.requester} <br /><small style={{ color: '#718096' }}>{r.type} Leave</small></td>
                                            <td><span className={`badge ${r.status === 'Approved' ? 'success' : 'warning'}`}>{r.status}</span></td>
                                        </tr>
                                    ))}
                                    {(students || []).map(s => (
                                        <tr key={`search-stud-${s.id}`}>
                                            <td><span style={{ color: '#d69e2e', fontWeight: '600' }}>Student</span></td>
                                            <td>{s.student_name} <br /><small style={{ color: '#718096' }}>{s.college_org} • {s.program}</small></td>
                                            <td><span className={`badge ${s.status === 'Active' ? 'success' : 'warning'}`}>{s.status}</span></td>
                                        </tr>
                                    ))}
                                    {(scholarships || []).map(sc => (
                                        <tr key={`search-schol-${sc.id}`}>
                                            <td><span style={{ color: '#38a169', fontWeight: '600' }}>Scholarship</span></td>
                                            <td>{sc.applicant_name} <br /><small style={{ color: '#718096' }}>ID: {sc.application_id}</small></td>
                                            <td><span className={`badge ${sc.status === 'Approved' ? 'success' : 'warning'}`}>{sc.status}</span></td>
                                        </tr>
                                    ))}
                                    {(finances || []).map(f => (
                                        <tr key={`search-fin-${f.id}`}>
                                            <td><span style={{ color: '#dd6b20', fontWeight: '600' }}>Finance</span></td>
                                            <td>{f.category_context} <br /><small style={{ color: '#718096' }}>Type: {f.type} • ₹{Number(f.amount).toLocaleString()}</small></td>
                                            <td><span className="badge success">{f.status}</span></td>
                                        </tr>
                                    ))}
                                    {totalResults === 0 && (
                                        <tr><td colSpan="3" style={{ textAlign: 'center', padding: '40px', color: '#718096' }}>No records found matching "{searchTerm}"</td></tr>
                                    )}
                                </>
                            ) : (
                                <>
                                    {pendingVolsCount > 0 && (
                                        <tr><td>Volunteer Registry</td><td>{pendingVolsCount} New Applications</td><td><span className="badge red-badge">Action Required</span></td></tr>
                                    )}
                                    {pendingReqsCount > 0 && (
                                        <tr><td>Staff Requests</td><td>{pendingReqsCount} Pending Approvals</td><td><span className="badge red-badge">Action Required</span></td></tr>
                                    )}
                                    {pendingVolsCount === 0 && pendingReqsCount === 0 && (
                                        <tr><td colSpan="3" style={{ textAlign: 'center', padding: '20px', color: '#718096' }}>All systems clear. No pending approvals.</td></tr>
                                    )}
                                </>
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

const AdminProfileTab = ({ admin, onModifyLevel, onEditProfile }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
        <div className="content-panel">
            <div style={{ display: 'flex', gap: '40px', alignItems: 'flex-start' }}>
                <div style={{ width: '150px', height: '150px', background: '#2d3748', color: 'white', borderRadius: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem', fontWeight: '800' }}>
                    {admin.name?.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <div>
                            <h2 style={{ margin: 0, color: '#2d3748' }}>{admin.name}</h2>
                            <p style={{ color: '#4a5568', fontSize: '1.2rem', fontWeight: '600' }}>{admin.role}</p>

                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button className="btn-add" onClick={onEditProfile} style={{ background: '#4a5568' }}><FaEdit /> Edit Profile</button>
                            <button className="btn-add" onClick={onModifyLevel}><FaShieldAlt /> Modify Authority</button>
                        </div>
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

const EditProfileModal = ({ admin, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        full_name: admin.name,
        email: admin.email === 'Not Set' ? '' : admin.email,
        mobile: admin.mobile === 'Not Set' ? '' : admin.mobile,
        dob: admin.dob === 'Not Set' ? '' : admin.dob,
        gender: admin.gender === 'Not Set' ? '' : admin.gender,
        address: admin.address === 'Not Set' ? '' : admin.address,
        emergency: admin.emergency === 'Not Set' ? '' : admin.emergency,
        appointment_date: admin.appointmentDate === 'Not Set' ? '' : admin.appointmentDate
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ padding: '30px 30px 0', borderBottom: '1px solid #f1f5f9', marginBottom: '20px' }}>
                <h3 style={{ marginBottom: '25px' }}>Update Admin Profile Details</h3>
            </div>

            <div className="custom-scroll" style={{ flex: 1, overflowY: 'auto', padding: '0 30px' }}>
                <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div className="form-group">
                        <label>Full Name</label>
                        <input name="full_name" className="form-control" type="text" value={formData.full_name} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label>Official Email</label>
                        <input name="email" className="form-control" type="email" value={formData.email} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label>Official Mobile</label>
                        <input name="mobile" className="form-control" type="tel" value={formData.mobile} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label>Date of Birth</label>
                        <input name="dob" className="form-control" type="date" value={formData.dob} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label>Gender</label>
                        <select name="gender" className="form-control" value={formData.gender} onChange={handleChange}>
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Joined HQ Date</label>
                        <input name="appointment_date" className="form-control" type="date" value={formData.appointment_date} onChange={handleChange} />
                    </div>
                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                        <label>Personal Address</label>
                        <input name="address" className="form-control" type="text" value={formData.address} onChange={handleChange} />
                    </div>
                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                        <label>Emergency Contact Info</label>
                        <input name="emergency" className="form-control" type="text" value={formData.emergency} onChange={handleChange} placeholder="Name - Relation - Mobile" />
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end', padding: '30px', borderTop: '1px solid #f1f5f9', background: '#fff' }}>
                <button className="btn-small" onClick={onClose}>Cancel</button>
                <button className="btn-add" onClick={() => onSave(formData)}>Update Profile</button>
            </div>
        </div>
    );
};

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
                {(logs || []).map(log => (
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
                {(employees || []).map(emp => (
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
                {(volunteers || []).map(v => (
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

const StudentTab = ({ students, onView, onDelete }) => (
    <div className="content-panel">
        <h3>Academic Registrations</h3>
        <table className="data-table">
            <thead><tr><th>Student Name</th><th>Register ID</th><th>College/Org</th><th>Program</th><th>Current Status</th><th>Actions</th></tr></thead>
            <tbody>
                {(students || []).map(s => (
                    <tr key={s.id}>
                        <td>{s.student_name}</td>
                        <td>{s.student_id || '—'}</td>
                        <td>{s.college_org}</td>
                        <td>{s.program || '—'}</td>
                        <td><span className="badge success">{s.status}</span></td>
                        <td>
                            <div className="action-buttons">
                                <button className="btn-icon" onClick={() => onView(s)} title="View Details"><FaEye /></button>
                                <button className="btn-icon danger" onClick={() => onDelete(s.id, s.student_name)} title="Delete Record"><FaTrash /></button>
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

const ScholarshipTab = ({ scholarships, handleAction, onDelete }) => (
    <div className="content-panel">
        <h3>Scholarship Verification</h3>
        <table className="data-table">
            <thead><tr><th>ID</th><th>Applicant</th><th>Income Status</th><th>Academic</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
                {(scholarships || []).map(s => (
                    <tr key={s.id}>
                        <td>{s.application_id}</td>
                        <td>{s.applicant_name}</td>
                        <td>{s.income_status}</td>
                        <td>{s.academic_score}</td>
                        <td><span className="badge">{s.status}</span></td>
                        <td>
                            <div className="action-buttons" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                {s.status === 'Awaiting Approval' && (
                                    <button className="btn-small success-btn" onClick={() => handleAction('scholarship', s.id, 'approve')}>Approve</button>
                                )}
                                <button className="btn-icon danger" onClick={() => onDelete(s.id, s.applicant_name)} title="Remove Application"><FaTrash /></button>
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

const FinanceTab = ({ finances, onDelete }) => (
    <div className="content-panel">
        <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px' }}>
            <h3>Treasury & Payroll Log</h3>
            <button className="btn-small"><FaFileInvoiceDollar /> Generate Salary Slips</button>
        </div>
        <table className="data-table">
            <thead><tr><th>Date</th><th>Type</th><th>Allocation Context</th><th>Amount</th><th>Audit</th><th>Actions</th></tr></thead>
            <tbody>
                {(finances || []).map(f => (
                    <tr key={f.id}>
                        <td>{f.transaction_date || f.date}</td>
                        <td>{f.type}</td>
                        <td>{f.category_context || '-'}</td>
                        <td><strong>₹ {Number(f.amount).toLocaleString()}</strong></td>
                        <td><span className="badge success">{f.status || 'Audited'}</span></td>
                        <td>
                            <button className="btn-icon danger" onClick={() => onDelete(f.id, f.category_context || f.type)} title="Delete entry"><FaTrash /></button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

const ReportsTab = ({ reports, onAdd, onDelete }) => (
    <div className="content-panel">
        <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px' }}>
            <h3>Impact & Program Reports</h3>
            <button className="btn-add" onClick={onAdd}><FaFileUpload /> Upload New Report</button>
        </div>
        <div className="reports-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {(reports || []).length > 0 ? reports.map(report => (
                <div key={report.id} className="report-card" style={{ padding: '25px', border: '1px solid #edf2f7', borderRadius: '20px', background: 'white', position: 'relative', transition: 'all 0.3s ease', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                    <div style={{ position: 'absolute', top: '15px', right: '15px' }}>
                        <button className="btn-icon danger" onClick={() => onDelete(report.id, report.title)} title="Delete Report"><FaTrash style={{ fontSize: '0.8rem' }} /></button>
                    </div>
                    <FaFileAlt style={{ fontSize: '2.5rem', color: '#1a365d', marginBottom: '15px', opacity: 0.8 }} />
                    <h4 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '8px', color: '#2d3748' }}>{report.title}</h4>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                        <span className="badge" style={{ background: '#ebf8ff', color: '#2b6cb0' }}>{report.category}</span>
                        <span className={`badge ${report.status === 'Public' ? 'success' : 'pending'}`}>{report.status}</span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: '#718096' }}>Filed: {new Date(report.created_at).toLocaleDateString()}</p>
                </div>
            )) : (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px', background: '#f8fafc', borderRadius: '20px', border: '2px dashed #e2e8f0' }}>
                    <FaFileAlt style={{ fontSize: '3rem', color: '#cbd5e0', marginBottom: '15px' }} />
                    <p style={{ color: '#718096' }}>No field reports found. Post one to begin.</p>
                </div>
            )}
        </div>
    </div>
);



const EOfficeTab = ({ docFiles, categories, onUpload, refreshData, onAddFolder, onRenameFolder, efiles }) => {
    const [view, setView] = useState('folders');
    const [activeFolder, setActiveFolder] = useState(null);
    const [activeEfile, setActiveEfile] = useState(null);

    const handleDownload = async (file) => {
        try {
            if (!file.file_path) {
                alert("This is a legacy record with no linked physical file. Only records uploaded after the storage update can be downloaded.");
                return;
            }

            const { data, error } = await supabase.storage
                .from('vault')
                .createSignedUrl(file.file_path, 60); // 60 seconds link

            if (error) throw error;

            // Simple browser download trigger
            const link = document.createElement('a');
            link.href = data.signedUrl;
            link.download = file.name;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (err) {
            console.error('Download error:', err);
            alert("Could not generate download link: " + err.message);
        }
    };

    const handleDeleteFolder = async (id, name) => {
        if (!confirm(`Are you sure you want to delete the folder "${name}"? This will not delete the files but they will become uncategorized.`)) return;
        const { error } = await supabase.from('organization_categories').delete().eq('id', id);
        if (error) alert("Error deleting folder: " + error.message);
        else refreshData();
    };

    const handleWipeVault = async () => {
        if (!confirm("CRITICAL ACTION: Are you sure you want to delete ALL documents AND all folders in the vault? This will completely reset the Digital Filing system and cannot be undone.")) return;

        try {
            // 1. Delete all documents
            const { error: docError } = await supabase.from('organization_docs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
            if (docError) throw docError;

            // 2. Delete all categories (folders)
            const { error: catError } = await supabase.from('organization_categories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
            if (catError) throw catError;

            alert("Vault and all folders wiped successfully.");
            refreshData();
        } catch (error) {
            console.error('Wipe failed:', error);
            alert("Error wiping vault: " + error.message);
        }
    };

    const currentFiles = activeFolder ? (docFiles || []).filter(d => d.category === activeFolder.name || d.category_id === activeFolder.id) : [];

    return (
        <div className="content-panel">
            <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px', alignItems: 'center' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {view !== 'folders' && <button className="btn-icon" onClick={() => { setView('folders'); setActiveEfile(null); setActiveFolder(null); }}><FaHistory /></button>}
                    {view === 'folders' ? 'Digital Filing & e-Office System' : (view === 'files' ? `Vault: ${activeFolder?.name || '...'}` : (view === 'efiles' ? 'e-File Registry' : `e-File: ${activeEfile?.file_number}`))}
                </h3>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn-small" onClick={() => setView('efiles')}><FaFileSignature /> Manage e-Files</button>
                    <button className="btn-add" onClick={onAddFolder}><FaPlusCircle /> New Folder</button>
                    <button className="btn-add" onClick={onUpload}><FaFileUpload /> Upload Artifact</button>
                    <button className="btn-icon danger" onClick={handleWipeVault} title="Purge Vault"><FaTrash /></button>
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
                            <p style={{ color: '#718096' }}>Use the <b>+ New Folder</b> button above to get started.</p>
                        </div>
                    )}
                </div>
            ) : view === 'efiles' ? (
                <div className="efiles-section">
                    <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '15px', marginBottom: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h4 style={{ margin: 0 }}>Active e-Files (GoI Standards)</h4>
                            <small style={{ color: '#718096' }}>Total: {efiles?.length || 0} Files in Registry</small>
                        </div>
                        <button className="btn-small success-btn" onClick={() => alert('e-File Generation logic pending...')}><FaPlus /> Create New e-File</button>
                    </div>
                    <table className="data-table">
                        <thead><tr><th>File Number</th><th>Subject</th><th>Dept</th><th>Status</th><th>Priority</th><th>Actions</th></tr></thead>
                        <tbody>
                            {(efiles || []).length > 0 ? efiles.map(file => (
                                <tr key={file.id}>
                                    <td><strong>{file.file_number}</strong></td>
                                    <td>{file.subject}</td>
                                    <td>{file.department_name}</td>
                                    <td><span className={`badge ${file.status === 'Open' ? 'blue' : 'success'}`}>{file.status}</span></td>
                                    <td><span className={`badge ${file.priority_level === 'Urgent' ? 'red' : 'neutral'}`}>{file.priority_level}</span></td>
                                    <td>
                                        <div className="action-buttons">
                                            <button className="btn-icon" onClick={() => { setActiveEfile(file); setView('efile-details'); }}><FaEye /></button>
                                            <button className="btn-icon"><FaFileSignature /></button>
                                        </div>
                                    </td>
                                </tr>
                            )) : <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#718096' }}>No digital files found in the registry.</td></tr>}
                        </tbody>
                    </table>
                </div>
            ) : view === 'efile-details' ? (
                <div className="efile-details" style={{ background: 'white', padding: '30px', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', borderBottom: '2px solid #f1f5f9', paddingBottom: '20px' }}>
                        <div>
                            <h2 style={{ margin: 0, color: '#2d3748' }}>{activeEfile?.file_number}</h2>
                            <p style={{ color: '#718096', margin: '5px 0' }}>{activeEfile?.subject}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <span className="badge" style={{ background: '#ebf8ff', color: '#2b6cb0', padding: '8px 15px', borderRadius: '10px' }}>{activeEfile?.status}</span>
                            <div style={{ marginTop: '10px', fontSize: '0.85rem', color: '#a0aec0' }}>Priority: {activeEfile?.priority_level}</div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                        <div>
                            <h4 style={{ color: '#4a5568', borderLeft: '4px solid #3182ce', paddingLeft: '10px', marginBottom: '15px' }}>File Description</h4>
                            <p style={{ color: '#718096', lineHeight: '1.6', background: '#f8fafc', padding: '20px', borderRadius: '12px' }}>
                                {activeEfile?.description || 'No detailed description provided for this digital file.'}
                            </p>
                        </div>
                        <div>
                            <h4 style={{ color: '#4a5568', borderLeft: '4px solid #3182ce', paddingLeft: '10px', marginBottom: '15px' }}>Audit Context</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '10px' }}>
                                    <small style={{ color: '#a0aec0', display: 'block', marginBottom: '5px' }}>Initiated On</small>
                                    <span style={{ fontWeight: '600' }}>{new Date(activeEfile?.created_at).toLocaleDateString()}</span>
                                </div>
                                <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '10px' }}>
                                    <small style={{ color: '#a0aec0', display: 'block', marginBottom: '5px' }}>Department</small>
                                    <span style={{ fontWeight: '600' }}>{activeEfile?.department_name}</span>
                                </div>
                            </div>
                        </div>
                    </div>
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
                                        <button className="btn-icon" title="Download" onClick={() => handleDownload(file)}><FaDownload /></button>
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

const OrgMasterTab = ({ org, refreshData }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState(org || {
        org_name: 'Bharath Cares Life Line Foundation',
        reg_type: 'Trust',
        reg_number: '',
        reg_date: '',
        reg_address: '',
        official_email: '',
        official_phone: '',
        pan_number: '',
        bank_name: '',
        account_number: ''
    });

    const handleSave = async () => {
        const { error } = await supabase.from('org_master').upsert([formData]);
        if (!error) {
            alert('Organization Identity Updated');
            setIsEditing(false);
            refreshData();
        } else {
            alert('Update failed: ' + error.message);
        }
    };

    const DetailField = ({ label, value, icon }) => (
        <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '15px', border: '1px solid #edf2f7' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {icon} {label}
            </label>
            <div style={{ fontSize: '1.1rem', fontWeight: '700', marginTop: '10px', color: '#1e293b' }}>{value || '—'}</div>
        </div>
    );

    return (
        <div className="content-panel">
            <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                    <h3 style={{ margin: 0 }}>NGO Statutory Profile</h3>
                    <p style={{ color: '#718096', fontSize: '0.9rem', margin: '5px 0 0 0' }}>Core Identity & Regulatory Metadata</p>
                </div>
                {!isEditing && <button className="btn-add" onClick={() => setIsEditing(true)}><FaEdit /> Modify Profile</button>}
            </div>

            {isEditing ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                    <div className="form-group">
                        <label>Foundation Name</label>
                        <input className="form-control" value={formData.org_name} onChange={e => setFormData({ ...formData, org_name: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label>Registration Type</label>
                        <select className="form-control" value={formData.reg_type} onChange={e => setFormData({ ...formData, reg_type: e.target.value })}>
                            <option>Trust</option>
                            <option>Society</option>
                            <option>Section 8</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Registration No</label>
                        <input className="form-control" value={formData.reg_number} onChange={e => setFormData({ ...formData, reg_number: e.target.value })} />
                    </div>
                    <div className="form-group" style={{ gridColumn: 'span 3' }}>
                        <label>Registered Address</label>
                        <textarea className="form-control" rows="2" value={formData.reg_address} onChange={e => setFormData({ ...formData, reg_address: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label>PAN Number</label>
                        <input className="form-control" value={formData.pan_number} onChange={e => setFormData({ ...formData, pan_number: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label>Bank Name</label>
                        <input className="form-control" value={formData.bank_name} onChange={e => setFormData({ ...formData, bank_name: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label>Account Number</label>
                        <input className="form-control" value={formData.account_number} onChange={e => setFormData({ ...formData, account_number: e.target.value })} />
                    </div>
                    <div style={{ gridColumn: 'span 3', display: 'flex', justifyContent: 'flex-end', gap: '15px', marginTop: '20px' }}>
                        <button className="btn-small" onClick={() => setIsEditing(false)}>Cancel</button>
                        <button className="btn-add" onClick={handleSave}>Save Identity</button>
                    </div>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '25px' }}>
                    <div style={{ gridColumn: 'span 4', display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '10px' }}>
                        <div style={{ height: '2px', flex: 1, background: '#f1f5f9' }}></div>
                        <h4 style={{ color: '#94a3b8', margin: 0, textTransform: 'uppercase', letterSpacing: '4px', fontSize: '0.8rem' }}>Legal Identity</h4>
                        <div style={{ height: '2px', flex: 1, background: '#f1f5f9' }}></div>
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                        <DetailField label="Foundation Name" value={formData.org_name} icon={<FaBuilding />} />
                    </div>
                    <DetailField label="Reg Type" value={formData.reg_type} icon={<FaBalanceScale />} />
                    <DetailField label="Reg Number" value={formData.reg_number} icon={<FaIdCard />} />
                    <div style={{ gridColumn: 'span 2' }}>
                        <DetailField label="Registered Address" value={formData.reg_address} icon={<FaMapMarkerAlt />} />
                    </div>
                    <DetailField label="Official Email" value={formData.official_email} icon={<FaEnvelope />} />
                    <DetailField label="Official Phone" value={formData.official_phone} icon={<FaPhone />} />

                    <div style={{ gridColumn: 'span 4', display: 'flex', alignItems: 'center', gap: '20px', margin: '20px 0 10px' }}>
                        <div style={{ height: '2px', flex: 1, background: '#f1f5f9' }}></div>
                        <h4 style={{ color: '#94a3b8', margin: 0, textTransform: 'uppercase', letterSpacing: '4px', fontSize: '0.8rem' }}>Bank & Treasury</h4>
                        <div style={{ height: '2px', flex: 1, background: '#f1f5f9' }}></div>
                    </div>
                    <DetailField label="PAN Number" value={formData.pan_number} icon={<FaFileContract />} />
                    <DetailField label="Bank Provider" value={formData.bank_name} icon={<FaUniversity />} />
                    <div style={{ gridColumn: 'span 2' }}>
                        <DetailField label="Account Number" value={formData.account_number} icon={<FaBriefcase />} />
                    </div>
                </div>
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
                {(requests || []).map(r => (
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

const CoAdminTab = ({ admins, onAdd, onDelete, onEdit, onManage }) => (
    <div className="content-panel">
        <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px' }}>
            <h3>Administrative Control Board</h3>
            <button className="btn-add" onClick={onAdd}><FaUserShield /> Provision New Account</button>
        </div>
        <table className="data-table">
            <thead><tr><th>Admin Ref</th><th>Identity Profile</th><th>Role & Dept</th><th>Last Activity</th><th>Status</th><th>Access Control</th></tr></thead>
            <tbody>
                {(admins || []).map(adm => (
                    <tr key={adm.id}>
                        <td><strong>{adm.id ? adm.id.substring(0, 8) : 'Pending'}</strong></td>
                        <td style={{ fontWeight: '600' }}>{adm.full_name || 'Processing...'}</td>
                        <td><small>{adm.role_type}</small><br />{adm.department || 'Executive / Board'}</td>
                        <td>{adm.last_login ? new Date(adm.last_login).toLocaleString() : 'Never'}</td>
                        <td><span className={`badge ${adm.last_login ? 'success' : 'red-badge'}`}>{adm.last_login ? 'Active' : 'Inactive'}</span></td>
                        <td>
                            <div className="action-buttons">
                                <button className="btn-icon" title="View Permission Matrix" onClick={() => onManage(adm)}><FaUnlockAlt /></button>
                                <button className="btn-icon" title="Edit Profile" onClick={() => onEdit(adm)}><FaEdit /></button>
                                <button className="btn-icon danger" title="Revoke Access" onClick={() => onDelete(adm.id, adm.full_name)}><FaUserLock /></button>
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

/* --- FORMS --- */

const AdminForm = ({ onClose, onSave, admin, initialStep = 1 }) => {
    const [step, setStep] = useState(initialStep);
    const existingPerms = admin?.admin_controls?.[0] || {};

    const [formData, setFormData] = useState({
        id: admin?.id || null,
        full_name: admin?.full_name || '',
        email: admin?.email || '',
        role_type: admin?.role_type || 'Admin',
        department: admin?.department || '',
        authority_level: existingPerms.authority_level || 'L3',
        dob: admin?.dob || '',
        mobile: admin?.mobile || '',
        emergency: admin?.emergency || '',
        username: admin?.username || '',
        password: '',
        enforce_2fa: true,
        perms: {
            view_employees: existingPerms.perm_view_employees ?? true,
            edit_employees: existingPerms.perm_edit_employees ?? false,
            approve_leaves: existingPerms.perm_approve_leaves ?? false,
            process_salary: existingPerms.perm_process_salary ?? false,
            bank_access: existingPerms.perm_bank_access ?? false,
            volunteer_approval: existingPerms.perm_volunteer_approval ?? false,
            scholarship_verify: existingPerms.perm_scholarship_verify ?? false,
            manage_admins: existingPerms.perm_manage_admins ?? false,
            student_mgmt: existingPerms.perm_student_mgmt ?? false,
            report_approval: existingPerms.perm_report_approval ?? false,
            vault_access: existingPerms.perm_vault_access ?? false,
            audit_logs: existingPerms.perm_audit_logs ?? false,
            org_master: existingPerms.perm_org_master ?? false
        },
        salary_approval_limit: existingPerms.salary_approval_limit || 0,
        expenditure_limit: existingPerms.expenditure_limit || 0,
        fund_utilization_auth: existingPerms.fund_utilization_auth || false,
        fin_reports_auth: existingPerms.fin_reports_auth || false,
        statutory_docs_auth: existingPerms.statutory_docs_auth || false
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name.startsWith('perm_')) {
            const permKey = name.replace('perm_', '');
            setFormData(prev => ({
                ...prev,
                perms: { ...prev.perms, [permKey]: checked }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }
    };

    const categories = ['Core Profile', 'Login & Auth', 'Custom Permissions', 'Fin / Documents', 'Declaration'];

    const validateStep = (currentStep) => {
        if (currentStep === 1) {
            const fields = ['full_name', 'email', 'role_type', 'department', 'authority_level', 'dob', 'mobile', 'emergency'];
            for (const f of fields) if (!formData[f]) return false;
        }
        if (currentStep === 2) {
            if (!formData.username || (!formData.id && !formData.password)) return false;
        }
        return true;
    };

    const handleNext = () => {
        if (validateStep(step)) {
            setStep(step + 1);
        } else {
            alert("Please fill in all mandatory fields before continuing.");
        }
    };

    const handleFinalSave = () => {
        if (validateStep(step)) {
            onSave(formData);
            onClose();
        } else {
            alert("Please complete all required fields and the declaration.");
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', maxHeight: '92vh' }}>
            <div style={{ padding: '30px 30px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <h3>Provision Administrative Account (Step {step}/5)</h3>
                    <button className="btn-icon" onClick={onClose}>&times;</button>
                </div>

                <div className="form-steps-indicator" style={{ display: 'flex', gap: '8px', marginBottom: '30px' }}>
                    {categories.map((c, i) => (
                        <div key={c} style={{ flex: 1, padding: '10px 3px', background: step === i + 1 ? '#2d3748' : '#edf2f7', color: step === i + 1 ? 'white' : '#718096', textAlign: 'center', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 'bold' }}>{c}</div>
                    ))}
                </div>
            </div>

            <div className="form-content custom-scroll" style={{ flex: 1, overflowY: 'auto', padding: '0 30px', minHeight: '300px' }}>
                {step === 1 && (
                    <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div className="form-group"><label>Full Name</label><input className="form-control" name="full_name" value={formData.full_name} onChange={handleChange} type="text" placeholder="Legal Name" required /></div>
                        <div className="form-group"><label>Official Email ID</label><input className="form-control" name="email" value={formData.email} onChange={handleChange} type="email" placeholder="admin@bharathcares.org" required /></div>
                        <div className="form-group"><label>Role Type</label><select className="form-control" name="role_type" value={formData.role_type} onChange={handleChange} required><option value="">Select Role</option><option>Admin</option><option>Co-Admin</option><option>HR Manager</option><option>Finance Officer</option><option>Field Super</option></select></div>
                        <div className="form-group"><label>Department</label><select className="form-control" name="department" value={formData.department} onChange={handleChange} required><option value="">Select Dept</option><option>HQ Administration</option><option>Human Resources</option><option>Finance & Treasury</option><option>Social Welfare</option><option>IT & Security</option></select></div>
                        <div className="form-group"><label>Authority Level</label><select className="form-control" name="authority_level" value={formData.authority_level} onChange={handleChange} required><option value="L1">L1 - Executive (Full)</option><option value="L2">L2 - High (Command)</option><option value="L3">L3 - Mid (Operational)</option><option value="L4">L4 - Base (View Only)</option></select></div>
                        <div className="form-group"><label>Reporting To</label><input className="form-control" type="text" value="Super Admin (Institutional)" readOnly /></div>
                        <div className="form-group"><label>DOB</label><input className="form-control" name="dob" value={formData.dob} onChange={handleChange} type="date" required /></div>
                        <div className="form-group"><label>Official Mobile</label><input className="form-control" name="mobile" value={formData.mobile} onChange={handleChange} type="tel" required /></div>
                        <div className="form-group"><label>Emergency Contact</label><input className="form-control" name="emergency" value={formData.emergency} onChange={handleChange} type="tel" required /></div>
                    </div>
                )}
                {step === 2 && (
                    <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div className="form-group"><label>System Username</label><input className="form-control" name="username" value={formData.username} onChange={handleChange} type="text" required /></div>
                        <div className="form-group"><label>Initial Password</label><input className="form-control" name="password" value={formData.password} onChange={handleChange} type="password" required={!formData.id} /></div>
                        <div className="form-group" style={{ gridColumn: 'span 2' }}>
                            <label style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <input type="checkbox" name="enforce_2fa" checked={formData.enforce_2fa} onChange={handleChange} style={{ width: '18px', height: '18px' }} />
                                <span>Enforce Mandatory Two-Factor Authentication (2FA)</span>
                            </label>
                        </div>
                    </div>
                )}
                {step === 3 && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '25px' }}>
                        <div>
                            <h5 style={{ marginBottom: '15px', color: 'var(--primary)', fontSize: '0.85rem', textTransform: 'uppercase' }}>HR & Payroll</h5>
                            {[['view_employees', 'View Registry'], ['edit_employees', 'Edit Accounts'], ['approve_leaves', 'Approve Leaves'], ['process_salary', 'Process Salary'], ['bank_access', 'Bank/KYC Access']].map(([key, label]) => (
                                <label key={key} style={{ display: 'flex', gap: '10px', marginBottom: '10px', fontSize: '0.85rem' }}>
                                    <input type="checkbox" name={`perm_${key}`} checked={formData.perms[key]} onChange={handleChange} /> {label}
                                </label>
                            ))}
                        </div>
                        <div>
                            <h5 style={{ marginBottom: '15px', color: 'var(--primary)', fontSize: '0.85rem', textTransform: 'uppercase' }}>Programs & Ops</h5>
                            {[['volunteer_approval', 'Volunteer Lifecycle'], ['scholarship_verify', 'Scholarship Verify'], ['student_mgmt', 'Student Registrations'], ['report_approval', 'Field Report Review'], ['vault_access', 'Digital Vault Access']].map(([key, label]) => (
                                <label key={key} style={{ display: 'flex', gap: '10px', marginBottom: '10px', fontSize: '0.85rem' }}>
                                    <input type="checkbox" name={`perm_${key}`} checked={formData.perms[key]} onChange={handleChange} /> {label}
                                </label>
                            ))}
                        </div>
                        <div>
                            <h5 style={{ marginBottom: '15px', color: 'var(--primary)', fontSize: '0.85rem', textTransform: 'uppercase' }}>Registry & System</h5>
                            {[['org_master', 'Organization Master'], ['audit_logs', 'Audit Trail (Forensic)'], ['manage_admins', 'Manage Co-Admins']].map(([key, label]) => (
                                <label key={key} style={{ display: 'flex', gap: '10px', marginBottom: '10px', fontSize: '0.85rem' }}>
                                    <input type="checkbox" name={`perm_${key}`} checked={formData.perms[key]} onChange={handleChange} /> {label}
                                </label>
                            ))}
                        </div>
                    </div>
                )}
                {step === 4 && (
                    <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div className="form-group"><label>Salary Approval Limit (₹)</label><input className="form-control" name="salary_approval_limit" value={formData.salary_approval_limit} onChange={handleChange} type="number" placeholder="50000" /></div>
                        <div className="form-group"><label>One-time Expenditure Limit (₹)</label><input className="form-control" name="expenditure_limit" value={formData.expenditure_limit} onChange={handleChange} type="number" placeholder="100000" /></div>
                        <div className="form-group"><label>Fund Utilization Approval</label><select className="form-control" name="fund_utilization_auth" value={formData.fund_utilization_auth ? 'Yes' : 'No'} onChange={(e) => setFormData(prev => ({ ...prev, fund_utilization_auth: e.target.value === 'Yes' }))}><option>No</option><option>Yes</option></select></div>
                        <div className="form-group"><label>Financial Report Generation</label><select className="form-control" name="fin_reports_auth" value={formData.fin_reports_auth ? 'Yes' : 'No'} onChange={(e) => setFormData(prev => ({ ...prev, fin_reports_auth: e.target.value === 'Yes' }))}><option>No</option><option>Yes</option></select></div>
                        <div className="form-group"><label>Statutory Doc Management</label><select className="form-control" name="statutory_docs_auth" value={formData.statutory_docs_auth ? 'Yes' : 'No'} onChange={(e) => setFormData(prev => ({ ...prev, statutory_docs_auth: e.target.value === 'Yes' }))}><option>No</option><option>Yes</option></select></div>
                        <div className="form-group" style={{ gridColumn: 'span 1' }}><label>Authorization Type</label><select className="form-control"><option>Institutional Admin</option><option>Program Specific</option></select></div>
                        <div className="form-group" style={{ gridColumn: 'span 2' }}><label>Upload Authorization Appointment Letter (Signed PDF)</label><input className="form-control" type="file" disabled /></div>
                    </div>
                )}
                {step === 5 && (
                    <div style={{ padding: '30px', background: '#f8fafc', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                            <FaShieldAlt style={{ fontSize: '3rem', color: '#2d3748', marginBottom: '15px' }} />
                            <h4 style={{ margin: 0, fontSize: '1.2rem' }}>Administrative Compliance Declaration</h4>
                        </div>
                        <div style={{ fontSize: '0.9rem', lineHeight: '1.8', color: '#4a5568' }}>
                            <p>I, <strong>{formData.full_name || 'the undersigned'}</strong>, hereby affirm that:</p>
                            <ul style={{ paddingLeft: '20px' }}>
                                <li>I will maintain absolute confidentiality of all NGO artifacts, staff records, and financial data.</li>
                                <li>I acknowledge that all my system actions are tracked via a permanent forensic audit trail.</li>
                                <li>I will not share my administrative credentials or circumvent any security protocols.</li>
                                <li>I understand that unauthorized access or data leakage may lead to legal and disciplinary actions.</li>
                            </ul>
                        </div>
                        <label style={{ display: 'flex', gap: '15px', marginTop: '40px', background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #edf2f7', cursor: 'pointer' }}>
                            <input type="checkbox" required style={{ width: '20px', height: '20px', marginTop: '3px' }} />
                            <div>
                                <span style={{ fontWeight: 'bold', display: 'block' }}>Digitally Affirm Declaration</span>
                                <small style={{ color: '#718096' }}>I accept the official Admin Code of Ethics & Confidentiality Agreement of BCLL Foundation.</small>
                            </div>
                        </label>
                    </div>
                )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '30px', borderTop: '1px solid #edf2f7', background: '#fff', borderBottomLeftRadius: '28px', borderBottomRightRadius: '28px' }}>
                <button className="btn-small" disabled={step === 1} onClick={() => setStep(step - 1)}>Back</button>
                {step < 5 ? <button className="btn-add" onClick={handleNext}>Continue</button> : <button className="btn-add" onClick={handleFinalSave}>Securely Provision Admin</button>}
            </div>
        </div>
    );
};

const EmployeeForm = ({ onClose, onSave }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        full_name: '',
        gender: 'Male',
        dob: '',
        marital_status: 'Single',
        blood_group: 'O+',
        mobile: '',
        email: '',
        current_address: '',
        permanent_address: '',
        aadhaar_masked: '',
        pan_number: '',
        voter_id: '',
        passport_number: '',
        designation: '',
        department: 'Field Work',
        employment_type: 'Full-Time',
        reporting_manager_id: null,
        work_location: '',
        attendance_type: 'Office',
        office_timings: '09:00 AM - 06:30 PM',
        salary_amount: 0,
        bank_name: '',
        acc_holder_name: '',
        acc_number_encrypted: '',
        ifsc_code: '',
        upi_id: '',
        payment_mode: 'Bank Transfer',
        emergency_name: '',
        emergency_relation: '',
        emergency_mobile: '',
        status: 'Active'
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const categories = ['Basic Info', 'Identity & KYC', 'Employment', 'Payroll & Bank', 'Compliance & Emergency'];

    const handleFinalSave = () => {
        // Generate a random employee ID
        const empId = 'BCLL-' + (1026 + Math.floor(Math.random() * 1000));
        onSave({ ...formData, employee_id: empId });
        onClose();
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', maxHeight: '92vh' }}>
            <div style={{ padding: '30px 30px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <h3>Hire New Personnel (Step {step}/5)</h3>
                    <button className="btn-icon" onClick={onClose}>&times;</button>
                </div>

                <div className="form-steps-indicator" style={{ display: 'flex', gap: '8px', marginBottom: '30px' }}>
                    {categories.map((c, i) => (
                        <div key={c} style={{ flex: 1, padding: '10px 5px', background: step === i + 1 ? 'var(--primary)' : '#edf2f7', color: step === i + 1 ? 'white' : '#718096', textAlign: 'center', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 'bold' }}>{c}</div>
                    ))}
                </div>
            </div>

            <div className="form-content custom-scroll" style={{ flex: 1, overflowY: 'auto', padding: '0 30px', minHeight: '300px' }}>
                {step === 1 && (
                    <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div className="form-group"><label>Full Name (as per Aadhaar)</label><input className="form-control" name="full_name" value={formData.full_name} onChange={handleChange} type="text" placeholder="John Doe" /></div>
                        <div className="form-group"><label>Gender</label><select className="form-control" name="gender" value={formData.gender} onChange={handleChange}><option>Male</option><option>Female</option><option>Other</option></select></div>
                        <div className="form-group"><label>Date of Birth</label><input className="form-control" name="dob" value={formData.dob} onChange={handleChange} type="date" /></div>
                        <div className="form-group"><label>Marital Status</label><select className="form-control" name="marital_status" value={formData.marital_status} onChange={handleChange}><option>Single</option><option>Married</option><option>Divorced</option></select></div>
                        <div className="form-group"><label>Blood Group</label><select className="form-control" name="blood_group" value={formData.blood_group} onChange={handleChange}><option>O+</option><option>A+</option><option>B+</option><option>AB+</option><option>O-</option></select></div>
                        <div className="form-group"><label>Mobile Number</label><input className="form-control" name="mobile" value={formData.mobile} onChange={handleChange} type="tel" /></div>
                        <div className="form-group"><label>Email ID</label><input className="form-control" name="email" value={formData.email} onChange={handleChange} type="email" /></div>
                        <div className="form-group"><label>Current Address</label><input className="form-control" name="current_address" value={formData.current_address} onChange={handleChange} type="text" /></div>
                        <div className="form-group" style={{ gridColumn: 'span 2' }}><label>Permanent Address</label><textarea className="form-control" name="permanent_address" value={formData.permanent_address} onChange={handleChange} rows="2"></textarea></div>
                    </div>
                )}
                {step === 2 && (
                    <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div className="form-group"><label>Aadhaar Number (Masked)</label><input className="form-control" name="aadhaar_masked" value={formData.aadhaar_masked} onChange={handleChange} type="text" placeholder="XXXX-XXXX-1234" /></div>
                        <div className="form-group"><label>PAN Number</label><input className="form-control" name="pan_number" value={formData.pan_number} onChange={handleChange} type="text" /></div>
                        <div className="form-group"><label>Voter ID / Driving License</label><input className="form-control" name="voter_id" value={formData.voter_id} onChange={handleChange} type="text" /></div>
                        <div className="form-group"><label>Passport Number</label><input className="form-control" name="passport_number" value={formData.passport_number} onChange={handleChange} type="text" /></div>
                        <div className="form-group" style={{ gridColumn: 'span 2' }}><label>Upload Documents (Manual Process)</label><input className="form-control" type="file" disabled /></div>
                    </div>
                )}
                {step === 3 && (
                    <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div className="form-group"><label>Designation / Role</label><input className="form-control" name="designation" value={formData.designation} onChange={handleChange} type="text" /></div>
                        <div className="form-group"><label>Department</label><select className="form-control" name="department" value={formData.department} onChange={handleChange}><option>Field Work</option><option>Education</option><option>Healthcare</option><option>Rehab</option><option>Admin</option></select></div>
                        <div className="form-group"><label>Employment Type</label><select className="form-control" name="employment_type" value={formData.employment_type} onChange={handleChange}><option>Full-Time</option><option>Part-Time</option><option>Volunteer</option><option>Contract</option></select></div>
                        <div className="form-group"><label>Reporting Manager ID (optional)</label><input className="form-control" name="reporting_manager_id" value={formData.reporting_manager_id || ''} onChange={handleChange} type="text" placeholder="UUID" /></div>
                        <div className="form-group"><label>Work Location</label><input className="form-control" name="work_location" value={formData.work_location} onChange={handleChange} type="text" /></div>
                        <div className="form-group"><label>Attendance Type</label><select className="form-control" name="attendance_type" value={formData.attendance_type} onChange={handleChange}><option>Office</option><option>Field</option><option>Hybrid</option></select></div>
                        <div className="form-group"><label>Office Timings</label><input className="form-control" name="office_timings" value={formData.office_timings} onChange={handleChange} type="text" placeholder="09:00 AM - 06:30 PM" /></div>
                    </div>
                )}
                {step === 4 && (
                    <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div className="form-group"><label>Monthly Salary Amount</label><input className="form-control" name="salary_amount" value={formData.salary_amount} onChange={handleChange} type="number" /></div>
                        <div className="form-group"><label>Bank Name</label><input className="form-control" name="bank_name" value={formData.bank_name} onChange={handleChange} type="text" /></div>
                        <div className="form-group"><label>Account Holder Name</label><input className="form-control" name="acc_holder_name" value={formData.acc_holder_name} onChange={handleChange} type="text" /></div>
                        <div className="form-group"><label>Account Number</label><input className="form-control" name="acc_number_encrypted" value={formData.acc_number_encrypted} onChange={handleChange} type="text" /></div>
                        <div className="form-group"><label>IFSC Code</label><input className="form-control" name="ifsc_code" value={formData.ifsc_code} onChange={handleChange} type="text" /></div>
                        <div className="form-group"><label>UPI ID (optional)</label><input className="form-control" name="upi_id" value={formData.upi_id} onChange={handleChange} type="text" /></div>
                        <div className="form-group"><label>Payment Mode</label><select className="form-control" name="payment_mode" value={formData.payment_mode} onChange={handleChange}><option>Bank Transfer</option><option>Cheque</option></select></div>
                    </div>
                )}
                {step === 5 && (
                    <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div className="form-group"><label>Emergency Contact Name</label><input className="form-control" name="emergency_name" value={formData.emergency_name} onChange={handleChange} type="text" /></div>
                        <div className="form-group"><label>Relationship</label><input className="form-control" name="emergency_relation" value={formData.emergency_relation} onChange={handleChange} type="text" /></div>
                        <div className="form-group"><label>Emergency Contact Number</label><input className="form-control" name="emergency_mobile" value={formData.emergency_mobile} onChange={handleChange} type="tel" /></div>
                        <div className="form-group" style={{ gridColumn: 'span 2', marginTop: '30px', padding: '15px', background: '#f7fafc', borderRadius: '10px' }}>
                            <label style={{ display: 'flex', gap: '10px', alignItems: 'center', cursor: 'pointer' }}>
                                <input type="checkbox" style={{ width: '20px', height: '20px' }} required />
                                <span>I hereby declare that all information is correct and I accept NGO policies. <strong>(Signatory Acceptance)</strong></span>
                            </label>
                        </div>
                    </div>
                )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '30px', borderTop: '1px solid #edf2f7', background: '#fff', borderBottomLeftRadius: '28px', borderBottomRightRadius: '28px' }}>
                <button className="btn-small" disabled={step === 1} onClick={() => setStep(step - 1)}>Previous</button>
                {step < 5 ? <button className="btn-add" onClick={() => setStep(step + 1)}>Next Section</button> : <button className="btn-add" onClick={handleFinalSave}>Digitally Generate Profile</button>}
            </div>
        </div>
    );
};

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
                            <h2 style={{ fontSize: '3rem', margin: '0', fontWeight: '900', letterSpacing: '-1.5px', color: '#ffffff' }}>{details.full_name}</h2>
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
                                <h1 style={{ fontSize: '4rem', margin: '0', fontWeight: '900', letterSpacing: '-2px', color: '#ffffff' }}>{v.full_name}</h1>
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
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ padding: '30px 30px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <h3>Upload Field Report</h3>
                    <button className="btn-icon" onClick={onClose}>&times;</button>
                </div>
            </div>

            <div className="custom-scroll" style={{ flex: 1, overflowY: 'auto', padding: '0 30px' }}>
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
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px', padding: '30px', borderTop: '1px solid #f1f5f9' }}>
                <button className="btn-small" onClick={onClose}>Cancel</button>
                <button className="btn-add" onClick={handleSave}><FaFileUpload /> Upload Report</button>
            </div>
        </div>
    );
};

const AdminLevelModal = ({ currentLevel, onClose, onSave }) => {
    const normalizedLevel = currentLevel?.includes('L1') ? 'L1 - Full Authority' :
        currentLevel?.includes('L2') ? 'L2 - High Operations' :
            currentLevel?.includes('L3') ? 'L3 - Mid Management' :
                currentLevel?.includes('L4') ? 'L4 - Base Support' : 'L1 - Full Authority';

    const [level, setLevel] = useState(normalizedLevel);
    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ padding: '40px 40px 0' }}>
                <h3 style={{ marginBottom: '20px' }}>Adjust Administrative Authority</h3>
                <p style={{ color: '#718096', marginBottom: '30px' }}>Elevating or restricting admin levels will immediately synchronize permissions across all connected devices.</p>
            </div>

            <div className="custom-scroll" style={{ flex: 1, overflowY: 'auto', padding: '0 40px' }}>
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
            </div>

            <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end', padding: '30px', borderTop: '1px solid #f1f5f9' }}>
                <button className="btn-small" onClick={onClose}>Cancel</button>
                <button className="btn-add" onClick={() => onSave(level)}>Commit Level Change</button>
            </div>
        </div>
    );
};

const UploadArtifactModal = ({ onClose, onSave, categories }) => {
    const [formData, setFormData] = useState({ name: '', category: (categories || [])[0]?.name || '', size: '0 MB', fileObject: null });

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ padding: '30px 30px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <h3>Upload Regulatory Artifact</h3>
                    <button className="btn-icon" onClick={onClose}>&times;</button>
                </div>
            </div>

            <div className="custom-scroll" style={{ flex: 1, overflowY: 'auto', padding: '0 30px' }}>
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
                        if (file) {
                            setFormData({
                                ...formData,
                                size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
                                fileObject: file,
                                name: formData.name || file.name.split('.')[0] // Autopopulate name if empty
                            });
                        }
                    }} />
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px', padding: '30px', borderTop: '1px solid #f1f5f9' }}>
                <button className="btn-small" onClick={onClose}>Cancel</button>
                <button className="btn-add" onClick={() => onSave(formData)} disabled={!formData.fileObject}><FaFileUpload /> Upload & Verify</button>
            </div>
        </div>
    );
};

const FolderFormModal = ({ onClose, onSave, folder = null }) => {
    const [name, setName] = useState(folder ? folder.name : '');

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ padding: '30px 30px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <h3>{folder ? 'Rename Folder' : 'Create New Vault Folder'}</h3>
                    <button className="btn-icon" onClick={onClose}>&times;</button>
                </div>
            </div>

            <div className="custom-scroll" style={{ flex: 1, overflowY: 'auto', padding: '0 30px' }}>
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
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px', padding: '30px', borderTop: '1px solid #f1f5f9' }}>
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

const StudentDetailsView = ({ student, onClose }) => {
    const s = student || {};

    const Field = ({ icon, label, value }) => (
        <div style={{ background: '#F8F9FA', padding: '20px', borderRadius: '15px', border: '1px solid #EDF2F7' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#718096', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '700', marginBottom: '8px' }}>
                {icon} {label}
            </label>
            <div style={{ fontWeight: '700', color: '#2D3748', fontSize: '1rem' }}>{value || '—'}</div>
        </div>
    );

    return (
        <div className="details-view-container animate-fade-in" style={{ paddingBottom: '30px' }}>
            <div className="details-header" style={{ background: 'linear-gradient(135deg, #1A365D 0%, #2A4365 100%)', padding: '40px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ fontSize: '2rem', marginBottom: '10px', color: '#ffffff' }}>{s.student_name}</h2>
                    <div style={{ display: 'flex', gap: '15px' }}>
                        <span className="badge" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>{s.student_id}</span>
                        <span className="badge success">{s.status}</span>
                    </div>
                </div>
                <button className="btn-small" onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}>Close Archive</button>
            </div>

            <div style={{ padding: '30px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                    <div style={{ gridColumn: 'span 3', borderBottom: '2px solid #F1F5F9', paddingBottom: '10px', marginBottom: '10px', color: '#94A3B8', fontSize: '0.8rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px' }}>Personal Data</div>
                    <Field icon={<FaPhone />} label="Mobile Number" value={s.phone} />
                    <Field icon={<FaEnvelope />} label="Personal Email" value={s.email} />
                    <Field icon={<FaHistory />} label="Date of Birth" value={s.dob} />
                    <Field icon={<FaShieldAlt />} label="Aadhaar ID" value={s.aadhaar_no} />

                    <div style={{ gridColumn: 'span 3', borderBottom: '2px solid #F1F5F9', paddingBottom: '10px', marginBottom: '10px', marginTop: '20px', color: '#94A3B8', fontSize: '0.8rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px' }}>Academic Context</div>
                    <Field icon={<FaUniversity />} label="College / University" value={s.college_org} />
                    <Field icon={<FaGraduationCap />} label="Academic Program" value={s.program} />
                    <Field icon={<FaClock />} label="Current Year" value={s.academic_year} />

                    <div style={{ gridColumn: 'span 3', borderBottom: '2px solid #F1F5F9', paddingBottom: '10px', marginBottom: '10px', marginTop: '20px', color: '#94A3B8', fontSize: '0.8rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px' }}>Financial Remittance Profile</div>
                    <Field icon={<FaUserTie />} label="Account Holder" value={s.acc_holder} />
                    <Field icon={<FaUniversity />} label="Bank Institution" value={s.bank_name} />
                    <Field icon={<FaFingerprint />} label="IFSC Code" value={s.ifsc_code} />
                    <Field icon={<FaUniversity />} label="Account Number" value={s.acc_no} />
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
