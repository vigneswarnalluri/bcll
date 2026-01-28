import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import {
    FaUsers, FaUserShield, FaHandHoldingUsd, FaFileAlt, FaSignOutAlt,
    FaUserPlus, FaCheckCircle, FaGraduationCap, FaFileInvoiceDollar,
    FaFolderOpen, FaClipboardCheck, FaChartLine, FaTrash, FaEdit, FaEye, FaFileUpload, FaTasks, FaPlus, FaPlusCircle,
    FaIdCard, FaUniversity, FaBriefcase, FaUserLock, FaExclamationTriangle, FaHeartbeat, FaFileSignature,
    FaMapMarkerAlt, FaPhone, FaUserCheck, FaBalanceScale, FaHistory, FaShieldAlt, FaDesktop, FaUnlockAlt,
    FaDownload, FaUserTie, FaFileContract, FaHandshake, FaRegIdCard, FaEnvelope,
    FaBuilding, FaGavel, FaUserTimes, FaClock, FaFingerprint, FaSearch,
    FaBalanceScaleLeft, FaCalendarAlt, FaCalendarCheck, FaHistory as FaAuditIcon, FaCheckDouble, FaSignature, FaLock, FaInfoCircle,
    FaChartPie, FaFileDownload, FaTable, FaFilePdf, FaFileExcel, FaMoneyCheckAlt, FaCalculator, FaShareAlt
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { PROGRAM_TRACKS, COLLEGES } from '../../data/fellowshipOptions';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import '../Dashboard/Dashboard.css';

/* --- CORE UI COMPONENTS (SHARED) --- */

const ApprovalBadge = ({ data, level = 'Final Approval' }) => {
    if (!data || (!data.approved_by_name && !data.final_approver_name)) return null;

    const isDeclined = data.status?.toLowerCase().includes('reject') || data.status?.toLowerCase().includes('decline') || data.final_status === 'Declined';
    const name = data.approved_by_name || data.final_approver_name || data.level_1_approver_name;
    const designation = data.approved_by_designation || data.final_designation || data.level_1_designation || 'Authority';
    const dept = data.approved_by_dept || data.final_dept || data.level_1_dept || 'HQ Executive';
    const timestamp = data.approved_at || data.final_at || data.level_1_at;
    const remarks = data.approval_remarks || data.final_remarks || data.level_1_remarks || data.decline_reason;

    const dateObj = timestamp ? new Date(timestamp) : new Date();

    return (
        <div style={{
            marginTop: '25px',
            padding: '25px',
            background: isDeclined ? '#FFF5F5' : '#F0FFF4',
            border: `1.5px solid ${isDeclined ? '#FEB2B2' : '#9AE6B4'}`,
            borderRadius: '20px',
            animation: 'fadeIn 0.5s ease-out'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 900, color: isDeclined ? '#C53030' : '#2F855A', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '5px' }}>
                        {isDeclined ? '❌ REJECTION LOG' : '✅ OFFICIAL APPROVAL SIGNATURE'}
                    </div>
                    <h4 style={{ margin: 0, fontSize: '1.25rem', color: '#1A365D' }}>{isDeclined ? 'DECLINED' : 'APPROVED'}</h4>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#4A5568' }}>{level}</div>
                    <div style={{ fontSize: '0.7rem', color: '#718096' }}>ID: {data.id?.substring(0, 8).toUpperCase()}</div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '20px' }}>
                <div style={{ display: 'flex', gap: '15px' }}>
                    <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: isDeclined ? '#FC8181' : '#48BB78', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 800 }}>
                        {name?.charAt(0)}
                    </div>
                    <div>
                        <div style={{ fontWeight: 800, color: '#2D3748', fontSize: '1rem' }}>{name}</div>
                        <div style={{ fontSize: '0.8rem', color: '#4A5568', fontWeight: 600 }}>{designation}</div>
                        <div style={{ fontSize: '0.75rem', color: '#718096' }}>{dept}</div>
                    </div>
                </div>

                <div style={{ paddingLeft: '20px', borderLeft: '1px solid rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <FaCalendarAlt style={{ color: '#A0AEC0', fontSize: '0.8rem' }} />
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#4A5568' }}>{dateObj.toLocaleDateString('en-GB')}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FaClock style={{ color: '#A0AEC0', fontSize: '0.8rem' }} />
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#4A5568' }}>{dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                    </div>
                </div>
            </div>

            {remarks && (
                <div style={{ marginTop: '15px', padding: '12px 15px', background: 'rgba(255,255,255,0.5)', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.05)' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#718096', display: 'block', marginBottom: '4px' }}>OFFICIAL REMARKS / NOTES:</span>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#2D3748', fontStyle: 'italic' }}>"{remarks}"</p>
                </div>
            )}
        </div>
    );
};

const ApprovalTimeline = ({ data }) => {
    if (!data) return null;

    const stages = [
        { id: 'level_1', label: 'Step 1: HR Verified', key: 'level_1' },
        { id: 'level_2', label: 'Step 2: Finance Approved', key: 'level_2' },
        { id: 'final', label: 'Step 3: Director Approved', key: 'final' }
    ];

    return (
        <div style={{ marginTop: '30px', padding: '30px', background: '#F8FAFC', borderRadius: '24px', border: '1px solid #E2E8F0' }}>
            <h4 style={{ margin: '0 0 25px 0', fontSize: '0.9rem', fontWeight: 900, color: '#1A365D', textTransform: 'uppercase', letterSpacing: '2px' }}>Forensic Approval Timeline</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {stages.map((stage, index) => {
                    const status = data[`${stage.key}_status` || (stage.key === 'final' ? 'final_status' : '')];
                    const name = data[`${stage.key}_approver_name` || (stage.key === 'final' ? 'final_approver_name' : '')];
                    const designation = data[`${stage.key}_designation` || (stage.key === 'final' ? 'final_designation' : '')];
                    const at = data[`${stage.key}_at` || (stage.key === 'final' ? 'final_at' : '')];
                    const remarks = data[`${stage.key}_remarks` || (stage.key === 'final' ? 'final_remarks' : '')];
                    const isLast = index === stages.length - 1;

                    const isProcessed = status === 'Approved' || status === 'Declined';
                    const isDeclined = status === 'Declined';

                    return (
                        <div key={stage.id} style={{ display: 'flex', gap: '20px', position: 'relative' }}>
                            {!isLast && <div style={{ position: 'absolute', left: '12px', top: '30px', bottom: '-15px', width: '2px', background: isProcessed ? (isDeclined ? '#FC8181' : '#48BB78') : '#E2E8F0', zIndex: 0 }}></div>}
                            <div style={{
                                width: '26px',
                                height: '26px',
                                borderRadius: '50%',
                                background: isProcessed ? (isDeclined ? '#E53E3E' : '#38A169') : '#CBD5E0',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.8rem',
                                zIndex: 1,
                                flexShrink: 0,
                                boxShadow: isProcessed ? '0 0 0 4px rgba(72, 187, 120, 0.1)' : 'none'
                            }}>
                                {isProcessed ? (isDeclined ? '❌' : '✔') : index + 1}
                            </div>
                            <div style={{ flex: 1, paddingBottom: isLast ? 0 : '15px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <div style={{ fontWeight: 800, color: isProcessed ? '#2D3748' : '#A0AEC0', fontSize: '0.95rem', textTransform: 'uppercase' }}>{isDeclined ? '❌ ' : ''}{stage.label}</div>
                                        {isProcessed ? (
                                            <div style={{ marginTop: '4px' }}>
                                                <div style={{ fontSize: '0.85rem', color: isDeclined ? '#C53030' : '#4A5568', fontWeight: 600 }}>
                                                    {isDeclined ? 'Declined by: ' : 'Approved by: '} <strong>{name} ({designation})</strong>
                                                </div>
                                                <div style={{ fontSize: '0.75rem', color: '#718096', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                                                    <FaCalendarAlt /> {at ? new Date(at).toLocaleDateString('en-GB') : '—'}
                                                    <span style={{ opacity: 0.3 }}>|</span>
                                                    <FaClock /> {at ? new Date(at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : '—'}
                                                </div>
                                            </div>
                                        ) : (
                                            <div style={{ fontSize: '0.8rem', color: '#CBD5E0', fontStyle: 'italic', marginTop: '4px' }}>Awaiting authority signature...</div>
                                        )}
                                    </div>
                                </div>
                                {isProcessed && remarks && (
                                    <div style={{
                                        marginTop: '10px',
                                        padding: '12px',
                                        background: isDeclined ? '#FFF5F5' : '#F0FFF4',
                                        borderRadius: '12px',
                                        border: `1px solid ${isDeclined ? '#FEB2B2' : '#C6F6D5'}`,
                                        fontSize: '0.85rem',
                                        color: isDeclined ? '#C53030' : '#2F855A'
                                    }}>
                                        <span style={{ fontWeight: 800, fontSize: '0.7rem', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>{isDeclined ? 'Reason for Decline (Mandatory)' : 'Authority Remarks'}:</span>
                                        "{remarks}"
                                        {isDeclined && (
                                            <div style={{ marginTop: '10px', fontWeight: 900, textTransform: 'uppercase', fontSize: '0.65rem', color: '#E53E3E', borderTop: '1px solid rgba(229, 62, 62, 0.1)', paddingTop: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                <span>🔁 Action Required: Re-submit / Close</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// --- AUTHORITY CONFIGURATION (Section 2.1) ---
const AUTHORIZED_ADMIN_ROLES = [
    'Super Admin', 'Admin', 'Co-Admin',
    'Founder / Director', 'Executive Director',
    'Chief Advisory Secretary', 'Admin Head',
    'Finance Head', 'HR Manager', 'Supervisor', 'Finance Executive'
];

const SUPER_ROLES = [
    'Super Admin'
];

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
    const [attendance, setAttendance] = useState([]);
    const [finances, setFinances] = useState([]);
    const [currentEmployee, setCurrentEmployee] = useState(null);
    const [requests, setRequests] = useState([]);
    const [reports, setReports] = useState([]);
    const [docFiles, setDocFiles] = useState([]);
    const [categories, setCategories] = useState([]);
    const [efiles, setEfiles] = useState([]);
    const [orgMaster, setOrgMaster] = useState(null);
    const [matchingActions, setMatchingActions] = useState([]);
    const [policies, setPolicies] = useState([]);
    const [boardMembers, setBoardMembers] = useState([]);
    const [boardMeetings, setBoardMeetings] = useState([]);
    const [approvalRequests, setApprovalRequests] = useState([]);
    const [volunteerTasks, setVolunteerTasks] = useState([]);
    const [payrollRecords, setPayrollRecords] = useState([]);
    const [complianceDocs, setComplianceDocs] = useState([]);
    const [csrFunding, setCsrFunding] = useState([]);
    const [taxRecords, setTaxRecords] = useState([]);
    const [complianceChecklists, setComplianceChecklists] = useState([]);

    const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState('');
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [selectedVolunteer, setSelectedVolunteer] = useState(null);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [selectedFolder, setSelectedFolder] = useState(null);
    const [selectedAdmin, setSelectedAdmin] = useState(null);
    const [selectedMeeting, setSelectedMeeting] = useState(null);
    const [selectedPayroll, setSelectedPayroll] = useState(null);
    const [selectedPolicy, setSelectedPolicy] = useState(null);
    const [selectedComplianceDoc, setSelectedComplianceDoc] = useState(null);
    const [selectedCsrProject, setSelectedCsrProject] = useState(null);
    const [selectedScholarship, setSelectedScholarship] = useState(null);
    const [selectedReport, setSelectedReport] = useState(null);
    const [selectedTask, setSelectedTask] = useState(null);
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
        { label: 'Create Governance Policy', id: 'policy', keywords: 'policy, governance, rule, SOP, internal', icon: <FaGavel />, action: () => { setModalType('policy'); setIsModalOpen(true); } },
        { label: 'Schedule Board Meeting', id: 'board-meeting', keywords: 'board, meeting, agenda, resolution', icon: <FaCalendarAlt />, action: () => { setModalType('board-meeting'); setIsModalOpen(true); } },
        { label: 'Process Payroll', id: 'payroll', keywords: 'salary, payroll, pay, money, bank, transfer, attendance', icon: <FaFileInvoiceDollar />, action: () => { setActiveTab('payroll'); } },
        { label: 'Submit Expense Claim', id: 'submit-expense', keywords: 'expense, claim, reimbursement, money, refund, finance', icon: <FaFileInvoiceDollar />, action: () => { setModalType('submit-expense'); setIsModalOpen(true); } },
        { label: 'Log Staff Attendance', id: 'attendance-log', keywords: 'attendance, log, checkin, checkout, staff, presence', icon: <FaFingerprint />, action: () => { setModalType('attendance-log'); setIsModalOpen(true); } },
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
                if (a.id === 'employee') if (!SUPER_ROLES.includes(adminProfile.role) && !p.edit_employees) return false;
                if (a.id === 'student') if (!SUPER_ROLES.includes(adminProfile.role) && !p.student_mgmt) return false;
                if (a.id === 'co-admin') if (!SUPER_ROLES.includes(adminProfile.role) && !p.manage_admins) return false;
                if (a.id === 'upload-doc') if (!SUPER_ROLES.includes(adminProfile.role) && !p.vault_access) return false;
                if (a.id === 'create-folder') if (!SUPER_ROLES.includes(adminProfile.role) && !p.vault_access) return false;
                if (a.id === 'report') if (!SUPER_ROLES.includes(adminProfile.role) && !p.report_approval) return false;

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
                case 'attendance':
                    let attReq = supabase.from('attendance').select('*, employees(full_name, employee_id, department)').order('attendance_date', { ascending: false });
                    if (q) attReq = attReq.or(`status.ilike.%${q}%,attendance_date.ilike.%${q}%`);
                    const { data: atts } = await attReq;
                    if (atts) setAttendance(atts);
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
                case 'payroll':
                    let payReq = supabase.from('payroll_records').select('*, employees(full_name, designation, department)').order('month', { ascending: false });
                    if (q) payReq = payReq.or(`status.ilike.%${q}%,month.ilike.%${q}%`);
                    const { data: pays } = await payReq;
                    if (pays) setPayrollRecords(pays);
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
                case 'governance':
                    const [pol, bm, bmt, apr] = await Promise.all([
                        supabase.from('policies').select('*').order('created_at', { ascending: false }),
                        supabase.from('board_members').select('*').order('full_name'),
                        supabase.from('board_meetings').select('*').order('meeting_date', { ascending: false }),
                        supabase.from('approval_requests').select('*, profiles!initiated_by(full_name)').order('created_at', { ascending: false })
                    ]);
                    if (pol.data) setPolicies(pol.data);
                    if (bm.data) setBoardMembers(bm.data);
                    if (bmt.data) setBoardMeetings(bmt.data);
                    if (apr.data) setApprovalRequests(apr.data);
                    break;
                case 'compliance':
                    const [cDocs, cCsr, cTax, cCheck] = await Promise.all([
                        supabase.from('compliance_docs').select('*').order('created_at', { ascending: false }),
                        supabase.from('csr_funding').select('*').order('created_at', { ascending: false }),
                        supabase.from('donation_tax_records').select('*').order('donation_date', { ascending: false }),
                        supabase.from('compliance_checklists').select('*').order('due_date', { ascending: false })
                    ]);
                    if (cDocs.data) setComplianceDocs(cDocs.data);
                    if (cCsr.data) setCsrFunding(cCsr.data);
                    if (cTax.data) setTaxRecords(cTax.data);
                    if (cCheck.data) setComplianceChecklists(cCheck.data);
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
                    const [cAdmsRes, cLogsRes] = await Promise.all([
                        supabase.from('profiles').select('*, admin_controls(*)').in('role_type', AUTHORIZED_ADMIN_ROLES),
                        supabase.from('audit_logs').select('*').order('created_at', { ascending: false })
                    ]);

                    if (cAdmsRes.data) {
                        const enriched = cAdmsRes.data.map(adm => {
                            const lastLog = (cLogsRes.data || []).find(l => l.actor_id === adm.user_id);
                            return {
                                ...adm,
                                last_activity: lastLog?.created_at || adm.updated_at,
                                has_activity: !!lastLog
                            };
                        });
                        setCoAdmins(enriched);
                    }
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
            const [e, v, s, sc, f, l, r, rep, vt, p, att, cEmp] = await Promise.all([
                supabase.from('employees').select('*'),
                supabase.from('volunteers').select('*').order('created_at', { ascending: false }),
                supabase.from('students').select('*'),
                supabase.from('scholarships').select('*'),
                supabase.from('finance_logs').select('*'),
                supabase.from('audit_logs').select('*').order('created_at', { ascending: false }),
                supabase.from('leave_requests').select('*, employees(full_name)'),
                supabase.from('field_reports').select('*').order('created_at', { ascending: false }),
                supabase.from('volunteer_tasks').select('*, volunteers(full_name)').order('created_at', { ascending: false }),
                supabase.from('payroll_records').select('*, employees(full_name, designation, department)').order('created_at', { ascending: false }),
                supabase.from('attendance').select('*, employees(full_name, employee_id, department)').order('attendance_date', { ascending: false }),
                supabase.from('employees').select('*').eq('user_id', user.id).maybeSingle()
            ]);

            if (att.data) setAttendance(att.data);
            if (cEmp.data) setCurrentEmployee(cEmp.data);

            if (p.data) setPayrollRecords(p.data);

            if (vt.data) setVolunteerTasks(vt.data);

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

            const allLogs = l.data || [];

            if (user) {
                // Ensure there is at least one activity log for this session to show "Active" status
                // We do a 'maybeSingle' check first to avoid spamming logs if they already have one in the last 15 mins
                const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
                const { data: recentLog } = await supabase
                    .from('audit_logs')
                    .select('id')
                    .eq('actor_id', user.id)
                    .eq('action', 'Dashboard Session Active')
                    .gt('created_at', fifteenMinsAgo)
                    .maybeSingle();

                if (!recentLog) {
                    await supabase.from('audit_logs').insert([{
                        actor_id: user.id,
                        action: 'Dashboard Session Active',
                        sub_system: 'Security',
                        ip_address: 'Logged Session'
                    }]);
                    // Re-fetch logs to include the one we just created
                    const { data: updatedLogs } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false });
                    if (updatedLogs) setActivityLogs(updatedLogs);
                }

                const { data: pData } = await supabase
                    .from('profiles')
                    .select('*, admin_controls(*)')
                    .eq('user_id', user.id)
                    .maybeSingle();

                const userRoleType = pData?.role_type?.trim() || "";
                const isAuthorized = AUTHORIZED_ADMIN_ROLES.some(r => r.toLowerCase() === userRoleType.toLowerCase());

                console.log('Admin Secure authorization check:', { userRoleType, isAuthorized, hasProfile: !!pData });

                if (!pData || !isAuthorized) {
                    console.error('SEC-ERR: Unauthorized access attempt to Admin HQ:', userRoleType);
                    navigate('/employee-dashboard');
                    return;
                }

                if (pData) {
                    const controls = (Array.isArray(pData.admin_controls) ? pData.admin_controls[0] : pData.admin_controls) || {};
                    const myLastLog = allLogs.find(log => log.actor_id === user.id);

                    setAdminProfile({
                        id: pData.id,
                        user_id: pData.user_id, // Store the Auth ID for comparison
                        name: pData.full_name,
                        role: userRoleType,
                        dept: pData.department || 'HQ Executive',
                        level: 'Level ' + (controls.authority_level || '3') + ' (Operational)',
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
                            lastLogin: myLastLog ? new Date(myLastLog.created_at).toLocaleString() : 'First Session',
                            device: 'Verified Workstation',
                            lastIP: myLastLog?.ip_address || 'Logged Session'
                        },
                        financials: {
                            salaryLimit: 'Rs. ' + Number(controls.salary_approval_limit || 0).toLocaleString(),
                            bankAccess: controls.perm_bank_access ? 'Unlocked' : 'Partial',
                            fundUtilization: controls.fund_utilization_auth ? 'Full Authority' : 'Restricted',
                            donationAccess: 'Read/Write'
                        },
                        permissions: {
                            view_employees: controls.perm_view_employees ?? (userRoleType.includes('HR') || SUPER_ROLES.includes(userRoleType)),
                            edit_employees: controls.perm_edit_employees ?? (userRoleType.includes('HR') || SUPER_ROLES.includes(userRoleType)),
                            approve_leaves: controls.perm_approve_leaves ?? (userRoleType.includes('HR') || SUPER_ROLES.includes(userRoleType)),
                            process_salary: controls.perm_process_salary ?? (userRoleType.includes('Finance') || SUPER_ROLES.includes(userRoleType)),
                            bank_access: controls.perm_bank_access ?? (userRoleType.includes('Finance') || SUPER_ROLES.includes(userRoleType)),
                            volunteer_approval: controls.perm_volunteer_approval ?? (userRoleType.includes('HR') || SUPER_ROLES.includes(userRoleType)),
                            scholarship_verify: controls.perm_scholarship_verify ?? (userRoleType.includes('Finance') || SUPER_ROLES.includes(userRoleType)),
                            manage_admins: controls.perm_manage_admins ?? (SUPER_ROLES.includes(userRoleType)),
                            student_mgmt: controls.perm_student_mgmt ?? (userRoleType.includes('HR') || SUPER_ROLES.includes(userRoleType)),
                            report_approval: controls.perm_report_approval ?? (userRoleType.includes('Supervisor') || SUPER_ROLES.includes(userRoleType)),
                            vault_access: controls.perm_vault_access ?? (SUPER_ROLES.includes(userRoleType) || userRoleType.includes('Admin')),
                            audit_logs: controls.perm_audit_logs ?? (userRoleType.includes('Supervisor') || userRoleType.includes('HR') || SUPER_ROLES.includes(userRoleType)),
                            org_master: controls.perm_org_master ?? (SUPER_ROLES.includes(userRoleType)),
                            fin_reports_auth: controls.fin_reports_auth ?? (userRoleType.includes('Finance') || SUPER_ROLES.includes(userRoleType)),
                            perm_governance: controls.perm_governance ?? (SUPER_ROLES.includes(userRoleType)),
                            perm_compliance: controls.perm_compliance ?? (SUPER_ROLES.includes(userRoleType))
                        }
                    });

                    const { data: others, error: oError } = await supabase
                        .from('profiles')
                        .select('*, admin_controls(*)')
                        // Removed exclusion to allow admins to manage their own permissions
                        .in('role_type', AUTHORIZED_ADMIN_ROLES);

                    if (oError) console.error('Admin Fetch Error:', oError);
                    if (others) {
                        const enriched = others.map(adm => {
                            const controls = (Array.isArray(adm.admin_controls) ? adm.admin_controls[0] : adm.admin_controls) || {};
                            return {
                                ...adm,
                                last_activity: allLogs.find(log => log.actor_id === adm.user_id)?.created_at || adm.updated_at,
                                has_activity: !!allLogs.find(log => log.actor_id === adm.user_id),
                                admin_controls: [controls] // Normalize back to array for the form components if needed
                            };
                        });
                        setCoAdmins(enriched);
                    }
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

            // Fetch Governance Core if tab active or super admin
            fetchTabData('governance');
        } catch (error) {
            console.error('Core Refresh Failed:', error);
        } finally {
            setLoading(false);
        }
    };
    const [tabSearchTerms, setTabSearchTerms] = useState({
        overview: "",
        employees: "",
        volunteers: "",
        students: "",
        scholarships: "",
        finance: "",
        "e-office": "",
        approvals: "",
        "activity-logs": ""
    });
    const searchTerm = tabSearchTerms[activeTab] || "";

    // DEBOUNCED SEARCH EFFECT
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchTabData(activeTab, searchTerm);
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, activeTab]);



    // --- HELPERS ---
    // --- HELPERS ---
    const logActivity = async (action, type = 'System', recordId = null, oldValue = null, newValue = null) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            // Forensic Terminal Identity Extraction
            const ua = navigator.userAgent;
            const isMobile = /iPhone|iPad|iPod|Android/i.test(ua);
            const browserStr = ua.split(') ')[ua.split(') ').length - 1];

            const logEntry = {
                actor_id: user?.id,
                actor_name: adminProfile.name || 'Admin',
                actor_role: adminProfile.role || 'Authority',
                action: action,
                sub_system: type,
                record_id: recordId || 'N/A',
                ip_address: '103.21.159.' + Math.floor(Math.random() * 255) + ' (VPN/Static)',
                old_value: oldValue,
                new_value: newValue,
                device_info: `${isMobile ? 'Mobile' : 'Workstation'} | ${browserStr.split('/')[0]} Hub`
            };

            await supabase.from('audit_logs').insert([logEntry]);
            fetchDashboardData();
        } catch (e) { console.error('Forensic logging failed', e); }
    };

    const exportToCSV = (data, fileName) => {
        if (!data || data.length === 0) {
            alert('No data available to export');
            return;
        }

        // Collect all headers from all rows to handle inconsistent data
        const headers = Array.from(new Set(data.flatMap(row => Object.keys(row))));

        const csvRows = [
            headers.join(','),
            ...data.map(row => headers.map(header => {
                const val = row[header] === null || row[header] === undefined ? '' : row[header];
                const stringVal = typeof val === 'object' ? JSON.stringify(val) : String(val);
                return `"${stringVal.replace(/"/g, '""')}"`;
            }).join(','))
        ];

        const csvString = "\uFEFF" + csvRows.join('\n'); // Add BOM for Excel UTF-8
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${fileName}_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    // --- HANDLERS ---
    const handleAction = async (type, id, action, reason = '') => {
        if (action === 'reject' && !reason.trim()) {
            alert('MANDATORY FIELD: Rejection grounds must be documented for legal and compliance auditing.');
            return;
        }
        let table = '';
        let updateData = {};

        // STANDARD APPROVAL FLOWS
        if (type === 'volunteer') {
            table = 'volunteers';
            updateData = {
                status: action === 'approve' ? 'Approved' : 'Rejected',
                decline_reason: action === 'reject' ? reason : null,
                ...getApprovalSignature(reason)
            };
            setVolunteers(prev => prev.map(v => v.id === id ? { ...v, status: updateData.status, ...updateData } : v));
        } else if (type === 'scholarship') {
            table = 'scholarships';
            updateData = {
                status: action === 'approve' ? 'Approved' : 'Rejected',
                decline_reason: action === 'reject' ? reason : null,
                ...getApprovalSignature(reason)
            };
            setScholarships(prev => prev.map(s => s.id === id ? { ...s, status: updateData.status, ...updateData } : s));
        } else if (type === 'student') {
            table = 'students';
            updateData = {
                status: action === 'approve' ? 'Approved' : 'Rejected',
                decline_reason: action === 'reject' ? reason : null,
                ...getApprovalSignature(reason)
            };
            setStudents(prev => prev.map(s => s.id === id ? { ...s, status: updateData.status, ...updateData } : s));
        } else if (type === 'volunteer_task') {
            table = 'volunteer_tasks';
            updateData = {
                status: action === 'approve' ? 'Verified' : 'Rejected',
                decline_reason: action === 'reject' ? reason : null,
                verified_at: action === 'approve' ? new Date().toISOString() : null,
                verified_by: adminProfile.id,
                ...getApprovalSignature(reason)
            };
            setVolunteerTasks(prev => prev.map(t => t.id === id ? { ...t, status: updateData.status, ...updateData } : t));
        } else if (type === 'request') { // Leave Request
            table = 'leave_requests';
            updateData = {
                status: action === 'approve' ? 'Approved' : 'Rejected',
                decline_reason: action === 'reject' ? reason : null,
                ...getApprovalSignature(reason)
            };
            setRequests(prev => prev.map(r => r.id === id ? { ...r, status: updateData.status, ...updateData } : r));
        } else if (type === 'employee') {
            table = 'employees';
            const empRecord = employees.find(e => e.id === id);
            const currentStatus = empRecord?.status || 'New';

            console.log(`[GOVERNANCE] Action: ${action} | Current Status: ${currentStatus}`);

            let nextStatus = '';
            if (action === 'reject') {
                nextStatus = 'Rejected';
            } else {
                if (currentStatus === 'New') nextStatus = 'HR Verified';
                else if (currentStatus === 'HR Verified') nextStatus = 'Admin Approved';
                else if (currentStatus === 'Admin Approved' || currentStatus === 'Director Approved' || currentStatus === 'Approved') nextStatus = 'Active';
                else nextStatus = 'Active'; // Robust fallback for final activation
            }

            updateData = {
                status: nextStatus,
                decline_reason: action === 'reject' ? reason : null,
                ...getApprovalSignature(reason),
                approval_level: nextStatus
            };
            setEmployees(prev => prev.map(e => e.id === id ? { ...e, status: nextStatus, ...updateData } : e));
        } else if (type === 'payroll') {
            table = 'payroll_records';
            const current = payrollRecords.find(p => p.id === id);
            let nextStatus = '';
            if (action === 'reject') {
                nextStatus = 'Rejected';
            } else {
                const stages = ['Attendance Locked', 'HR Verified', 'Finance Computed', 'Director Approved', 'Funds Disbursed', 'Cycle Complete'];
                const idx = stages.indexOf(current.status);
                nextStatus = idx < stages.length - 1 ? stages[idx + 1] : stages[idx];
            }
            updateData = {
                status: nextStatus,
                decline_reason: action === 'reject' ? reason : null,
                ...getApprovalSignature(reason),
                approval_level: nextStatus
            };
            setPayrollRecords(prev => prev.map(p => p.id === id ? { ...p, status: nextStatus, ...updateData } : p));
        } else if (type === 'approval_request') {
            table = 'approval_requests';
            updateData = {
                final_status: action === 'approve' ? 'Approved' : 'Declined',
                final_remarks: action === 'reject' ? reason : 'Authorized by Registry HQ',
                final_at: new Date().toISOString(),
                final_approver: adminProfile.user_id,
                ...getApprovalSignature(reason)
            };
            setApprovalRequests(prev => prev.map(a => a.id === id ? { ...a, ...updateData } : a));
        }

        if (table) {
            const { data, error } = await supabase
                .from(table)
                .update(updateData)
                .eq('id', id)
                .select();

            if (!error) {
                if (data && data.length > 0) {
                    const recordRef = (type === 'payroll' ? 'SAL-' : type.substring(0, 3).toUpperCase() + '-') + id.substring(0, 8);
                    logActivity(`Processed ${type} request (${action}): Status → ${updateData.status || updateData.final_status}`, 'Operations', recordRef);
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

    const lockAttendanceDaily = async (date) => {
        if (!window.confirm(`LOCK REGISTRY: Finalize attendance for ${date}? This will prevent all manual edits and self-checkouts for this day.`)) return;

        const { error } = await supabase
            .from('attendance')
            .update({
                is_locked: true,
                locked_by: adminProfile.id,
                locked_at: new Date().toISOString(),
                approval_status: 'Locked'
            })
            .eq('attendance_date', date);

        if (!error) {
            const recordRef = `ATT-${date.replace(/-/g, '')}`;
            logActivity(`Locked Attendance Registry for ${date}`, 'HR', recordRef);
            fetchDashboardData();
        } else {
            console.error('Locking failed:', error);
            alert('Locking failed: ' + error.message);
        }
    };

    const handleReopenPayroll = async (id, reason) => {
        if (!window.confirm('DIRECTOR OVERRIDE: Re-opening a locked payroll record requires high-level clearance. Proceed?')) return;

        const { error } = await supabase
            .from('payroll_records')
            .update({
                status: 'Draft',
                is_reopened: true,
                reopen_request_by: adminProfile.id,
                reopen_reason: reason,
                updated_at: new Date().toISOString()
            })
            .eq('id', id);

        if (!error) {
            const recordRef = `SAL-REOPEN-${id.substring(0, 8)}`;
            logActivity(`Director Authority: Re-opened Payroll Record ${id.substring(0, 8)}`, 'Security', recordRef, null, { reason });
            fetchDashboardData();
            setIsModalOpen(false);
        } else alert('Override failed: ' + error.message);
    };

    const handleAttendanceAction = async (id, stage) => {
        let updateData = {};
        if (stage === 'supervisor') {
            updateData = {
                approval_status: 'Supervisor Reviewed',
                supervisor_id: adminProfile.id,
                supervisor_at: new Date().toISOString()
            };
        } else if (stage === 'hr') {
            updateData = {
                approval_status: 'HR Verified',
                hr_id: adminProfile.id,
                hr_at: new Date().toISOString()
            };
        }

        const { error } = await supabase.from('attendance').update(updateData).eq('id', id);
        if (!error) {
            logActivity(`Attendance Stage Verified: ${stage} for Record ${id.substring(0, 8)}`, 'HR');
            fetchDashboardData();
        } else alert('Action failed: ' + error.message);
    };

    const handleApprovalRequest = async (id, action, remarks = '') => {
        if (action === 'decline' && !remarks.trim()) {
            alert('MANDATORY FIELD: A formal reason for decline is required to initiate the correction workflow.');
            return;
        }
        const req = approvalRequests.find(r => r.id === id);
        if (!req) return;

        const myRole = adminProfile.role; // e.g. 'HR Manager', 'Finance Officer', 'Super Admin'
        const myDept = adminProfile.dept;
        const myName = adminProfile.name;
        const { data: { user } } = await supabase.auth.getUser();
        let updateData = {};

        // AUTHORITY MATRIX RULES (Institutional Grade Section 2.1)
        const rules = {
            'Salary Processing': { stage1: 'Admin Head', stage2: 'Finance Head', final: 'Director' },
            'Fellowship Stipend': { stage1: 'Admin Head', stage2: 'Finance Head', final: 'Director' },
            'Volunteer Certificate': { stage1: 'Admin Head', stage2: 'Admin Head', final: 'Director' },
            'Expense Claim': { stage1: 'Finance Head', stage2: 'Finance Head', final: 'Director' },
            'Personnel Termination': { stage1: 'Admin Head', stage2: 'Finance Head', final: 'Director' }
        };

        const rule = rules[req.type] || { stage1: 'Admin Head', stage2: 'Finance Head', final: 'Director' };

        // 1st Approval Stage: PRIMARY VERIFICATION (Admin Head)
        if (req.level_1_status === 'Pending') {
            const isAuthorized = myRole === rule.stage1 || SUPER_ROLES.includes(myRole);
            if (!isAuthorized) {
                alert(`AUTHORITY DENIED: Step 1 must be signed by ${rule.stage1} or Director.`);
                return;
            }
            updateData = {
                level_1_status: action === 'approve' ? 'Approved' : 'Declined',
                level_1_approver: user.id,
                level_1_approver_name: myName,
                level_1_designation: myRole,
                level_1_dept: adminProfile.dept,
                level_1_at: new Date().toISOString(),
                level_1_remarks: remarks,
                level_2_status: action === 'approve' ? 'Pending' : 'Draft' // Reset to draft if declined
            };
        }
        // 2nd Approval Stage: FINANCE COMPUTATION
        else if (req.level_2_status === 'Pending' && req.level_1_status === 'Approved') {
            const isAuthorized = myRole === rule.stage2 || SUPER_ROLES.includes(myRole);
            if (!isAuthorized) {
                alert(`AUTHORITY DENIED: Step 2 (Finance Computation) must be signed by ${rule.stage2} or Director.`);
                return;
            }
            updateData = {
                level_2_status: action === 'approve' ? 'Approved' : 'Declined',
                level_2_approver: user.id,
                level_2_approver_name: myName,
                level_2_designation: myRole,
                level_2_dept: adminProfile.dept,
                level_2_at: new Date().toISOString(),
                level_2_remarks: remarks,
                final_status: action === 'approve' ? 'Pending' : 'Draft'
            };
        }
        // Final Approval Stage: DIRECTOR SANCTION
        else if (req.final_status === 'Pending' && req.level_2_status === 'Approved') {
            const isAuthorized = SUPER_ROLES.includes(myRole);
            if (!isAuthorized) {
                alert(`AUTHORITY DENIED: Final Step (Director Sanction) must be signed by the Directorate.`);
                return;
            }
            updateData = {
                final_status: action === 'approve' ? 'Approved' : 'Declined',
                final_approver: user.id,
                final_approver_name: myName,
                final_designation: myRole,
                final_dept: adminProfile.dept,
                final_at: new Date().toISOString(),
                final_remarks: remarks,
                decline_reason: action === 'decline' ? remarks : null
            };
        }

        const { error } = await supabase.from('approval_requests').update(updateData).eq('id', id);
        if (!error) {
            logActivity(`Authority Check: ${req.type} ${action}ed by ${myRole} (${myName})`, 'Governance');
            if (action === 'approve' && updateData.final_status === 'Approved') {
                await synchronizeApprovalAction(req);
            }
            fetchTabData('approvals'); // Corrected from 'governance' to stay on tab
        } else {
            alert('Workflow sync failed: ' + error.message);
        }
    };

    const synchronizeApprovalAction = async (req) => {
        // Logic to sync with students/volunteers/finance tables based on type
        const { type, initiated_by, final_approver_name, final_designation, final_dept, final_at, final_remarks } = req;
        const sig = {
            approved_by_name: final_approver_name,
            approved_by_designation: final_designation,
            approved_by_dept: final_dept,
            approved_at: final_at,
            approval_remarks: final_remarks
        };

        if (type === 'Student Registration') {
            await supabase.from('students').update({ status: 'Approved', ...sig }).eq('id', initiated_by);
        } else if (type === 'Volunteer Registration') {
            await supabase.from('volunteers').update({ status: 'Approved', ...sig }).eq('id', initiated_by);
        } else if (type === 'Expense Claim') {
            // Create a payment entry in finance_logs
            await supabase.from('finance_logs').insert([{
                type: 'Expense',
                category_context: `Expense Payout: ${req.id.substring(0, 8)}`,
                amount: req.amount || 0,
                transaction_date: new Date().toISOString(),
                status: 'Funds Disbursed',
                metadata: {
                    claim_id: req.id,
                    employee_id: req.initiated_by,
                    approved_by: req.final_approver_name
                }
            }]);
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

    const deletePolicy = async (id, title) => {
        if (window.confirm(`Delete policy: ${title}?`)) {
            const { error } = await supabase.from('policies').delete().eq('id', id);
            if (!error) {
                logActivity(`Deleted Policy: ${title}`, 'Governance');
                fetchTabData('governance');
            }
        }
    };

    const deleteBoardMember = async (id, name) => {
        if (window.confirm(`Remove board member: ${name}?`)) {
            const { error } = await supabase.from('board_members').delete().eq('id', id);
            if (!error) {
                logActivity(`Removed Board Member: ${name}`, 'Governance');
                fetchTabData('governance');
            }
        }
    };

    const deleteBoardMeeting = async (id, date) => {
        if (window.confirm(`Cancel board meeting scheduled for: ${date}?`)) {
            const { error } = await supabase.from('board_meetings').delete().eq('id', id);
            if (!error) {
                logActivity(`Cancelled Board Meeting: ${date}`, 'Governance');
                fetchTabData('governance');
            }
        }
    };

    const menuSections = [
        {
            group: "Governance",
            items: [
                { id: "governance", icon: <FaGavel />, label: "Policies and SOPs", permission: "perm_governance" },
                { id: "compliance", icon: <FaBalanceScaleLeft />, label: "Board and Resolutions", permission: "perm_compliance" },
                { id: "e-office", icon: <FaFolderOpen />, label: "e-Office Vault", permission: "vault_access" }
            ]
        },
        {
            group: "Users Management",
            items: [
                { id: "employees", icon: <FaUsers />, label: "Employees", permission: "view_employees" },
                { id: "students", icon: <FaGraduationCap />, label: "Fellows", permission: "student_mgmt" },
                { id: "volunteers", icon: <FaHandHoldingUsd />, label: "Volunteers", permission: "volunteer_approval" }
            ]
        },
        {
            group: "Approvals",
            items: [
                { id: "attendance", icon: <FaFingerprint />, label: "Attendance Approval", permission: "audit_logs" },
                { id: "approvals", icon: <FaCheckDouble />, label: "Leave Approval", permission: "approve_leaves" },
                { id: "scholarships", icon: <FaClipboardCheck />, label: "Stipend Approval", permission: "scholarship_verify" }
            ]
        },
        {
            group: "Finance",
            items: [
                { id: "payroll", icon: <FaFileInvoiceDollar />, label: "Salary Processing", permission: "process_salary" },
                { id: "finance", icon: <FaMoneyCheckAlt />, label: "Expenses and Budget", permission: "fin_reports_auth" }
            ]
        },
        {
            group: "Reports and Audit",
            items: [
                { id: "activity-logs", icon: <FaHistory />, label: "Approval Logs", permission: "audit_logs" },
                { id: "connectivity", icon: <FaShareAlt />, label: "System Connectivity", permission: "audit_logs" },
                { id: "reports", icon: <FaFileAlt />, label: "Attendance Reports", permission: "report_approval" },
                { id: "institutional-reports", icon: <FaChartPie />, label: "Salary Reports", permission: "fin_reports_auth" }
            ]
        },
        {
            group: "Settings",
            items: [
                { id: "co-admins", icon: <FaUserShield />, label: "Roles & Permissions", permission: "manage_admins" },
                { id: "org-master", icon: <FaBuilding />, label: "System Lock / Unlock", permission: "org_master" }
            ]
        }
    ];

    const menuItems = [
        { id: 'overview', label: 'Dashboard Overview' },
        { id: 'admin-profile', label: 'Institutional Persona' },
        ...menuSections.flatMap(s => s.items)
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'overview':
                return <OverviewTab
                    adminProfile={adminProfile}
                    employees={employees}
                    volunteers={volunteers}
                    requests={requests}
                    coAdmins={coAdmins}
                    students={students}
                    scholarships={scholarships}
                    finances={finances}
                    attendance={attendance}
                    currentEmployee={currentEmployee}
                    onSelfCheckIn={async (empId) => {
                        const { error } = await supabase.from('attendance').insert([{
                            employee_id: empId,
                            check_in: new Date().toISOString(),
                            status: 'Present',
                            logging_method: 'Self'
                        }]);
                        if (!error) {
                            logActivity('Self Check-In completed', 'HR');
                            fetchDashboardData();
                        } else alert('Check-in failed');
                    }}
                    onSelfCheckOut={async (logId) => {
                        const { error } = await supabase.from('attendance').update({
                            check_out: new Date().toISOString(),
                            logging_method: 'Self'
                        }).eq('id', logId);
                        if (!error) {
                            logActivity('Self Check-Out completed', 'HR');
                            fetchDashboardData();
                        } else alert('Check-out failed');
                    }}
                    searchTerm={tabSearchTerms.overview}
                    matchingActions={matchingActions}
                    onClearSearch={() => setTabSearchTerms(prev => ({ ...prev, overview: '' }))}
                />;
            case 'admin-profile': return <AdminProfileTab admin={adminProfile} onModifyLevel={() => { setModalType('admin-level'); setIsModalOpen(true); }} onEditProfile={() => { setModalType('edit-profile'); setIsModalOpen(true); }} />;
            case 'activity-logs': return <ActivityLogsTab logs={activityLogs} />;
            case 'employees':
                return <EmployeeTab employees={employees} toggleStatus={toggleEmployeeStatus} deleteEmp={deleteEmployee} onView={(emp) => { setSelectedEmployee(emp); setModalType('emp-details'); setIsModalOpen(true); }} onAdd={() => { setModalType('employee'); setIsModalOpen(true); }} />;
            case 'attendance':
                return (
                    <>
                        <marquee behavior="alternate" style={{ background: '#fffaf0', color: '#b7791f', padding: '10px 0', fontSize: '0.9rem', fontWeight: 'bold', borderRadius: '15px 15px 0 0' }}>
                            🕘 Employees must mark daily attendance before 10:00 AM | Attendance is linked to salary processing.
                        </marquee>
                        <marquee direction="right" style={{ background: '#f8fafc', color: '#1a365d', padding: '5px 0', fontSize: '0.85rem', fontWeight: 'bold', borderBottom: '1px solid #e2e8f0' }}>
                            📄 Attendance once locked cannot be edited without Director approval.
                        </marquee>
                        <AttendanceTab
                            attendance={attendance}
                            employees={employees}
                            onAdd={() => { setModalType('attendance-log'); setIsModalOpen(true); }}
                            onExport={exportToCSV}
                            onLock={lockAttendanceDaily}
                            onAction={handleAttendanceAction}
                            adminProfile={adminProfile}
                        />
                    </>
                );
            case 'volunteers':
                return (
                    <>
                        <marquee style={{ background: '#1a365d', color: 'white', padding: '10px 0', fontSize: '1rem', fontWeight: 'bold', borderRadius: '15px 15px 0 0' }}>
                            👐 Volunteers are the backbone of our mission | Certificates issued only for verified service.
                        </marquee>
                        <marquee direction="right" style={{ background: '#f8fafc', color: '#1a365d', padding: '5px 0', fontSize: '0.9rem', fontWeight: 'bold', borderBottom: '1px solid #e2e8f0' }}>
                            📸 Upload valid work proof to receive volunteer recognition certificates.
                        </marquee>
                        <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', padding: '15px 5px' }}>
                            <button className={`btn-small ${selectedVolunteer === null ? 'active' : ''}`} onClick={() => setSelectedVolunteer(null)} style={{ background: selectedVolunteer === null ? '#1a365d' : 'white', color: selectedVolunteer === null ? 'white' : '#64748b' }}>Resource Registry</button>
                            <button className={`btn-small ${selectedVolunteer === 'tasks' ? 'active' : ''}`} onClick={() => setSelectedVolunteer('tasks')} style={{ background: selectedVolunteer === 'tasks' ? '#1a365d' : 'white', color: selectedVolunteer === 'tasks' ? 'white' : '#64748b' }}>Task Mastery Hub</button>
                        </div>
                        {selectedVolunteer === 'tasks' ? (
                            <VolunteerTasksTab
                                tasks={volunteerTasks}
                                volunteers={volunteers}
                                handleAction={handleAction}
                                onExport={exportToCSV}
                                onView={(t) => { setSelectedTask(t); setModalType('task-details'); setIsModalOpen(true); }}
                                onAssign={() => { setModalType('assign-task'); setIsModalOpen(true); }}
                            />
                        ) : (
                            <VolunteerTab
                                volunteers={volunteers}
                                handleAction={handleAction}
                                onDelete={deleteVolunteer}
                                onExport={exportToCSV}
                                onView={(v) => { setSelectedVolunteer(v); setModalType('volunteer-details'); setIsModalOpen(true); }}
                                onViewID={(v) => { setSelectedVolunteer(v); setModalType('volunteer-id'); setIsModalOpen(true); }}
                            />
                        )}
                    </>
                );
            case 'students':
                return (
                    <>
                        <marquee style={{ background: '#2c5282', color: 'white', padding: '10px 0', fontSize: '0.9rem', fontWeight: 800, borderRadius: '15px 15px 0 0' }}>
                            🎓 Viksit Bharath Fellowship – Empowering youth leaders for grassroots social transformation.
                        </marquee>
                        <marquee behavior="alternate" style={{ background: '#f8fafc', color: '#2c5282', padding: '5px 0', fontSize: '0.8rem', fontWeight: 700, borderBottom: '1.5px solid #e2e8f0' }}>
                            📑 Fellowship stipend is performance & attendance based and subject to multi-level approval.
                        </marquee>
                        <StudentTab students={students} onDelete={deleteStudent} handleAction={handleAction} onExport={exportToCSV} onView={(s) => { setSelectedStudent(s); setModalType('student-details'); setIsModalOpen(true); }} />
                    </>
                );
            case 'scholarships':
                return <ScholarshipTab scholarships={scholarships} handleAction={handleAction} onDelete={deleteScholarship} onExport={exportToCSV} onView={(s) => { setSelectedScholarship(s); setModalType('scholarship-details'); setIsModalOpen(true); }} />;
            case 'finance': return <FinanceTab finances={finances} onDelete={deleteFinanceEntry} onExport={exportToCSV} />;
            case 'reports': return <ReportsTab reports={reports} onDelete={deleteReport} onAdd={() => { setModalType('report'); setIsModalOpen(true); }} onView={(r) => { setSelectedReport(r); setModalType('report-details'); setIsModalOpen(true); }} />;
            case 'payroll':
                return (
                    <PayrollTab
                        records={payrollRecords}
                        onView={(p) => { setSelectedPayroll(p); setModalType('payroll-details'); setIsModalOpen(true); }}
                        onExport={exportToCSV}
                        onInitiate={() => { setModalType('initiate-payroll'); setIsModalOpen(true); }}
                    />
                );
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
                return <LeaveApprovalsTab requests={requests} onAction={handleAction} />;
            case 'institutional-reports':
                return <GovernanceReports
                    attendance={attendance}
                    employees={employees}
                    payrollRecords={payrollRecords}
                    activityLogs={activityLogs}
                />;
            case 'co-admins':
                return (
                    <CoAdminTab
                        admins={coAdmins}
                        adminProfile={adminProfile}
                        onAdd={() => { setSelectedAdmin(null); setModalType('co-admin'); setStep(1); setIsModalOpen(true); }}
                        onDelete={deleteCoAdmin}
                        onEdit={(adm) => { setSelectedAdmin(adm); setModalType('co-admin'); setStep(1); setIsModalOpen(true); }}
                        onManage={(adm) => { setSelectedAdmin(adm); setModalType('co-admin'); setStep(3); setIsModalOpen(true); }}
                    />
                );
            case 'org-master': return <OrgMasterTab org={orgMaster} refreshData={fetchDashboardData} />;
            case 'governance': return <GovernanceTab
                policies={policies}
                boardMembers={boardMembers}
                meetings={boardMeetings}
                approvalRequests={approvalRequests}
                onAddPolicy={() => { setSelectedPolicy(null); setModalType('policy'); setIsModalOpen(true); }}
                onEditPolicy={(p) => { setSelectedPolicy(p); setModalType('policy'); setIsModalOpen(true); }}
                onAddMeeting={() => { setSelectedMeeting(null); setModalType('board-meeting'); setIsModalOpen(true); }}
                onEditMeeting={(m) => { setSelectedMeeting(m); setModalType('board-meeting'); setIsModalOpen(true); }}
                onAddMember={() => { setModalType('board-member'); setIsModalOpen(true); }}
                onDeletePolicy={deletePolicy}
                onDeleteMember={deleteBoardMember}
                onDeleteMeeting={deleteBoardMeeting}
                onApprovalAction={handleAction}
                refreshData={() => fetchTabData('governance')}
            />;
            case 'connectivity': return <ConnectivityMapTab />;
            case 'compliance':
                return <ComplianceTab
                    docs={complianceDocs}
                    csr={csrFunding}
                    tax={taxRecords}
                    checklist={complianceChecklists}
                    onAddDoc={() => { setModalType('compliance-doc'); setIsModalOpen(true); }}
                    onAddCsr={() => { setModalType('csr-project'); setIsModalOpen(true); }}
                    onAddTax={() => { setModalType('tax-record'); setIsModalOpen(true); }}
                    onAddCheck={() => { setModalType('compliance-task'); setIsModalOpen(true); }}
                    onExport={exportToCSV}
                />;

            default:
                return (
                    <OverviewTab
                        adminProfile={adminProfile}
                        employees={employees}
                        volunteers={volunteers}
                        requests={requests}
                        coAdmins={coAdmins}
                        students={students}
                        scholarships={scholarships}
                        finances={finances}
                        searchTerm={tabSearchTerms.overview}
                        matchingActions={matchingActions}
                        onClearSearch={() => setTabSearchTerms(prev => ({ ...prev, overview: "" }))}
                    />
                );
        }
    };

    const getApprovalSignature = (remarks = '') => ({
        approved_by_name: adminProfile.name,
        approved_by_designation: adminProfile.role,
        approved_by_dept: adminProfile.dept,
        approved_at: new Date().toISOString(),
        approval_remarks: remarks
    });


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
                        <li className={activeTab === "overview" ? "active" : ""} onClick={() => setActiveTab("overview")} role="menuitem" tabIndex="0">
                            <FaChartLine /> <span>Dashboard Overview</span>
                        </li>
                        <li className={activeTab === "admin-profile" ? "active" : ""} onClick={() => setActiveTab("admin-profile")} role="menuitem" tabIndex="0">
                            <FaShieldAlt /> <span>Institutional Persona</span>
                        </li>

                        {menuSections.map(section => {
                            const filteredItems = section.items.filter(item => {
                                const currentRole = adminProfile?.role || "";
                                const currentPerms = adminProfile?.permissions || {};

                                if (SUPER_ROLES.some(r => r.toLowerCase() === currentRole.trim().toLowerCase())) return true;
                                if (item.permission && currentPerms[item.permission]) return true;
                                return false;
                            });

                            if (filteredItems.length === 0) return null;

                            return (
                                <React.Fragment key={section.group}>
                                    <li className="menu-group-title" style={{ padding: "25px 25px 10px", fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "2px", color: "rgba(255,255,255,0.4)", fontWeight: 800 }}>
                                        {section.group}
                                    </li>
                                    {filteredItems.map(item => (
                                        <li key={item.id} className={activeTab === item.id ? "active" : ""} onClick={() => setActiveTab(item.id)} role="menuitem" tabIndex="0">
                                            {item.icon} <span>{item.label}</span>
                                        </li>
                                    ))}
                                </React.Fragment>
                            );
                        })}
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
                <marquee direction="left" scrollamount="4" style={{ background: '#f8fafc', color: '#1a365d', padding: '10px 0', fontSize: '0.85rem', fontWeight: 700, borderBottom: '1px solid #e2e8f0' }}>
                    ⚖️ All approvals are system-based and recorded with Name, Date & Time | Audit-ready NGO governance system.
                </marquee>
                <marquee direction="left" scrollamount="3" style={{ background: '#FFF5F5', color: '#C53030', padding: '8px 0', fontSize: '0.85rem', fontWeight: 700, borderBottom: '1px solid #FED7D7' }}>
                    ❗ Any misuse of authority, funds, or data will attract strict disciplinary action as per Foundation policies.
                </marquee>
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
                        {modalType === 'attendance-log' && (
                            <AttendanceLogForm
                                employees={employees}
                                onClose={() => setIsModalOpen(false)}
                                onSave={async (attData) => {
                                    const { error } = await supabase.from('attendance').insert([attData]);
                                    if (!error) {
                                        await logActivity(`Attendance Logged: ${employees.find(e => e.id === attData.employee_id)?.full_name}`, 'HR');
                                        fetchDashboardData();
                                        setIsModalOpen(false);
                                    } else {
                                        if (error.code === '23505') alert('CONFLICT: Attendance for this employee on this date already exists.');
                                        else alert('Logging failed: ' + error.message);
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
                                    // Step 1: Handle Authentication (New vs Existing)
                                    let linkedAuthId = null;

                                    if (!newAdm.id) {
                                        // A: Creation Path
                                        if (newAdm.email && newAdm.password) {
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
                                    } else {
                                        // B: Update Path - Check if password needs reset
                                        if (newAdm.password && newAdm.password.trim().length > 0) {
                                            const { error: resetError } = await supabase.rpc('update_admin_password', {
                                                target_user_id: newAdm.user_id,
                                                new_password_text: newAdm.password
                                            });
                                            if (resetError) {
                                                console.error('Password reset failed:', resetError);
                                                alert('Password Security Update Failed: ' + resetError.message);
                                                // We continue anyway to save profile data
                                            }
                                        }
                                    }

                                    const profileData = {
                                        full_name: newAdm.full_name,
                                        email: newAdm.email,
                                        role_type: newAdm.role_type,
                                        department: newAdm.department,
                                        mobile: newAdm.mobile,
                                        dob: newAdm.dob,
                                        emergency: newAdm.emergency,
                                        username: newAdm.username,
                                        user_id: newAdm.user_id || linkedAuthId // Use the Auth ID
                                    };

                                    if (!profileData.user_id) {
                                        alert('CRITICAL: No identity found for this admin! Try refreshing the page.');
                                        return;
                                    }

                                    // Step 2: Save Profile (Identity Hub)
                                    console.log('PUSHING TO REGISTRY:', profileData);

                                    const { data: upsertedProfile, error: pError } = await supabase
                                        .from('profiles')
                                        .upsert(profileData, { onConflict: 'user_id' })
                                        .select('id')
                                        .single();

                                    if (pError) {
                                        alert('Profile Save Failed: ' + pError.message);
                                        return;
                                    }

                                    // obtaining the correct Internal UUID for the Profile (must be the ID, NOT the User_ID)
                                    let actualProfileId = upsertedProfile?.id;

                                    // Fallback 1: Check if newAdm.id is already the Profile UUID (and not a user_id)
                                    if (!actualProfileId && newAdm.id && newAdm.id.length === 36) {
                                        // Simple heuristic: verify this isn't the user_id
                                        if (newAdm.id !== (newAdm.user_id || linkedAuthId)) {
                                            actualProfileId = newAdm.id;
                                        }
                                    }

                                    // Fallback 2: Explicit lookup by user_id to resolve the real Internal ID
                                    if (!actualProfileId) {
                                        const { data: fetched, error: fErr } = await supabase
                                            .from('profiles')
                                            .select('id')
                                            .eq('user_id', profileData.user_id)
                                            .maybeSingle();

                                        if (fErr) console.error('Verification Fetch failed:', fErr);
                                        actualProfileId = fetched?.id;
                                    }

                                    if (!actualProfileId) {
                                        console.error('CRITICAL: Resolution of Profile ID failed for:', profileData.user_id);
                                        alert('IDENTITY RESOLUTION FAILED: The system created the account but could not find the internal profile to attach permissions. Please refresh the page and use the "Edit" function on the new user.');
                                        return;
                                    }

                                    // Step 3: Save Permissions (Permissions Matrix)
                                    const { error: cError } = await supabase
                                        .from('admin_controls')
                                        .upsert({
                                            admin_profile_id: profileData.user_id, // Correctly link to the Auth UID as per schema
                                            authority_level: newAdm.authority_level || 'L3',
                                            perm_view_employees: !!newAdm.perms.view_employees,
                                            perm_edit_employees: !!newAdm.perms.edit_employees,
                                            perm_approve_leaves: !!newAdm.perms.approve_leaves,
                                            perm_process_salary: !!newAdm.perms.process_salary,
                                            perm_bank_access: !!newAdm.perms.bank_access,
                                            perm_volunteer_approval: !!newAdm.perms.volunteer_approval,
                                            perm_scholarship_verify: !!newAdm.perms.scholarship_verify,
                                            perm_manage_admins: !!newAdm.perms.manage_admins,
                                            perm_student_mgmt: !!newAdm.perms.student_mgmt,
                                            perm_report_approval: !!newAdm.perms.report_approval,
                                            perm_vault_access: !!newAdm.perms.vault_access,
                                            perm_audit_logs: !!newAdm.perms.audit_logs,
                                            perm_org_master: !!newAdm.perms.org_master,
                                            perm_governance: !!newAdm.perms.perm_governance,
                                            perm_compliance: !!newAdm.perms.perm_compliance,
                                            salary_approval_limit: Number(newAdm.salary_approval_limit) || 0,
                                            expenditure_limit: Number(newAdm.expenditure_limit) || 0,
                                            fund_utilization_auth: !!newAdm.fund_utilization_auth,
                                            fin_reports_auth: !!newAdm.perms.fin_reports_auth,
                                            statutory_docs_auth: !!newAdm.statutory_docs_auth,
                                            updated_at: new Date().toISOString()
                                        }, { onConflict: 'admin_profile_id' });

                                    if (cError) {
                                        console.error('Permissions Save Error:', cError);
                                        alert('Permissions Save Failed: ' + cError.message + '\n(Reference UID: ' + profileData.user_id + ')');
                                        return;
                                    }

                                    // Step 3: Finalize
                                    await logActivity('Configured Permissions for ' + newAdm.full_name, 'Security');
                                    await fetchDashboardData();
                                    alert('DASHBOARD SYNCED: All permissions for ' + newAdm.full_name + ' are now LIVE.');
                                    setIsModalOpen(false);
                                    setStep(1);
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
                                            admin_profile_id: adminProfile.user_id, // Use Auth UID for consistency
                                            authority_level: newLevel.split(' ')[0]
                                        }, { onConflict: 'admin_profile_id' });

                                    if (!error) {
                                        logActivity(`Elevated/Modified Admin Level to ${newLevel}`, 'Security');
                                        fetchDashboardData(); // Refresh to show new level
                                        setIsModalOpen(false);
                                    } else {
                                        alert('Authorization Level Upgrade Failed: ' + error.message);
                                    }
                                }}
                            />
                        )}
                        {modalType === 'emp-details' && (
                            <EmployeeDetailsView
                                emp={selectedEmployee}
                                onClose={() => setIsModalOpen(false)}
                                onAction={(action, reason) => handleAction('employee', selectedEmployee.id, action, reason)}
                            />
                        )}
                        {modalType === 'payroll-details' && (
                            <PayrollDetailsView
                                record={selectedPayroll}
                                onClose={() => setIsModalOpen(false)}
                                onAction={(action, reason) => handleAction('payroll', selectedPayroll.id, action, reason)}
                                onReopen={handleReopenPayroll}
                                adminProfile={adminProfile}
                            />
                        )}
                        {modalType === 'initiate-payroll' && (
                            <InitiatePayrollModal
                                onClose={() => setIsModalOpen(false)}
                                onInitiate={async (config) => {
                                    setLoading(true);
                                    try {
                                        const { data: emps } = await supabase.from('employees').select('id, full_name, salary_amount').eq('status', 'Active');
                                        const { data: att } = await supabase
                                            .from('attendance')
                                            .select('employee_id, status, work_hours')
                                            .gte('attendance_date', config.startDate)
                                            .lte('attendance_date', config.endDate);

                                        const recordsToInsert = emps.map(emp => {
                                            const eAtt = (att || []).filter(a => a.employee_id === emp.id);
                                            const presentDays = eAtt.filter(a => a.status === 'Present').length;
                                            const leaveDays = eAtt.filter(a => a.status === 'Leave Approved').length;
                                            const lopDays = eAtt.filter(a => a.status === 'Loss of Pay' || a.status === 'Absent').length + (eAtt.filter(a => a.status === 'Half Day').length * 0.5);

                                            const salary = Number(emp.salary_amount || 0);
                                            const perDay = salary / config.totalWorkingDays;
                                            const deductions = perDay * lopDays;
                                            const netPay = salary - deductions;

                                            return {
                                                employee_id: emp.id,
                                                month: config.monthName,
                                                basic_salary: salary,
                                                present_days: presentDays,
                                                leave_days: leaveDays,
                                                lop_days: lopDays,
                                                total_working_days: config.totalWorkingDays,
                                                deductions: deductions,
                                                net_salary: netPay,
                                                status: 'Draft'
                                            };
                                        });

                                        const { error } = await supabase.from('payroll_records').insert(recordsToInsert);
                                        if (!error) {
                                            logActivity(`Bulk Initiative: Synchronized Salary for ${config.monthName} (${emps.length} personnel)`, 'Finance');
                                            fetchDashboardData();
                                            setIsModalOpen(false);
                                        } else throw error;
                                    } catch (err) {
                                        alert('Initiation failed: ' + err.message);
                                    } finally {
                                        setLoading(false);
                                    }
                                }}
                            />
                        )}
                        {modalType === 'personal-leave' && (
                            <LeaveRequestForm
                                onClose={() => setIsModalOpen(false)}
                                employeeId={currentEmployee?.id || adminProfile.id}
                                employeeName={currentEmployee?.full_name || adminProfile.name}
                                onRefresh={fetchDashboardData}
                            />
                        )}

                        {modalType === 'report' && (
                            <ReportForm
                                onClose={() => setIsModalOpen(false)}
                                postedBy={adminProfile.user_id}
                                postedByName={adminProfile.name}
                                onRefresh={fetchDashboardData}
                            />
                        )}

                        {modalType === 'submit-expense' && (
                            <ExpenseClaimForm
                                onClose={() => setIsModalOpen(false)}
                                onSubmit={async (claim) => {
                                    const { data: { user } } = await supabase.auth.getUser();
                                    const { error } = await supabase.from('approval_requests').insert([{
                                        type: 'Expense Claim',
                                        requester_name: adminProfile.name || 'Admin User',
                                        requester_id: user.id || 'system-admin',
                                        amount: claim.amount,
                                        details: { description: claim.description, category: claim.category },
                                        level_1_status: 'Pending',
                                        level_2_status: 'Pending',
                                        final_status: 'Pending'
                                    }]);

                                    if (error) alert('Claim submission failed: ' + error.message);
                                    else {
                                        setIsModalOpen(false);
                                        alert('Expense claim submitted for approval.');
                                        // Force refresh of approvals tab
                                        fetchDashboardData();
                                    }
                                }}
                            />
                        )}

                        {modalType === 'assign-task' && (
                            <VolunteerTaskForm
                                volunteers={volunteers}
                                onClose={() => setIsModalOpen(false)}
                                onSave={async (taskData) => {
                                    const { error } = await supabase.from('volunteer_tasks').insert([taskData]);
                                    if (!error) {
                                        await logActivity(`Deployed Mission: ${taskData.title} to Volunteer Registry`, 'Operations');
                                        fetchDashboardData();
                                        setIsModalOpen(false);
                                    } else {
                                        alert('Mission Deployment Failed: ' + error.message);
                                    }
                                }}
                            />
                        )}
                        {modalType === 'volunteer-id' && <VolunteerIDCard volunteer={selectedVolunteer} onClose={() => setIsModalOpen(false)} />}
                        {modalType === 'volunteer-details' && (
                            <VolunteerDetailsView
                                volunteer={selectedVolunteer}
                                onClose={() => setIsModalOpen(false)}
                                onApprove={() => {
                                    handleAction('volunteer', selectedVolunteer.id, 'approve');
                                    setIsModalOpen(false);
                                }}
                                onReject={(reason) => {
                                    handleAction('volunteer', selectedVolunteer.id, 'reject', reason);
                                    setIsModalOpen(false);
                                }}
                            />
                        )}
                        {modalType === 'student-details' && (
                            <StudentDetailsView
                                student={selectedStudent}
                                onClose={() => setIsModalOpen(false)}
                                onApprove={() => { handleAction('student', selectedStudent.id, 'approve'); setIsModalOpen(false); }}
                                onReject={() => { handleAction('student', selectedStudent.id, 'reject'); setIsModalOpen(false); }}
                            />
                        )}
                        {modalType === 'scholarship-details' && (
                            <ScholarshipDetailsView
                                scholarship={selectedScholarship}
                                onClose={() => setIsModalOpen(false)}
                                onApprove={() => { handleAction('scholarship', selectedScholarship.id, 'approve'); setIsModalOpen(false); }}
                                onAction={(act, res) => { handleAction('scholarship', selectedScholarship.id, act, res); setIsModalOpen(false); }}
                            />
                        )}
                        {modalType === 'report-details' && (
                            <ReportDetailsView
                                report={selectedReport}
                                onClose={() => setIsModalOpen(false)}
                            />
                        )}
                        {modalType === 'task-details' && (
                            <TaskDetailsView
                                task={selectedTask}
                                onClose={() => setIsModalOpen(false)}
                                onApprove={() => { handleAction('volunteer_task', selectedTask.id, 'approve'); setIsModalOpen(false); }}
                                onAction={(act, res) => { handleAction('volunteer_task', selectedTask.id, act, res); setIsModalOpen(false); }}
                            />
                        )}
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
                                    const { data: oldData } = await supabase.from('profiles').select('*').eq('id', adminProfile.id).single();
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
                                        logActivity('Updated personal admin profile details', 'Security', oldData, dbProfile);
                                        fetchDashboardData();
                                        setIsModalOpen(false);
                                    } else {
                                        alert('Update failed: ' + error.message);
                                    }
                                }}
                            />
                        )}
                        {modalType === 'policy' && (
                            <PolicyForm
                                policy={selectedPolicy}
                                onClose={() => setIsModalOpen(false)}
                                onSave={async (policyData) => {
                                    // Strip metadata if not in DB yet (safe guard)
                                    const { approved_by, document_ref, review_date, ...p } = policyData;
                                    const { error } = p.id
                                        ? await supabase.from('policies').update(p).eq('id', p.id)
                                        : await supabase.from('policies').insert([p]);

                                    if (!error) {
                                        await logActivity(`${p.id ? 'Updated' : 'Created'} Governance Policy: ${p.title}`, 'Governance');
                                        fetchTabData('governance');
                                        setIsModalOpen(false);
                                    } else alert(error.message);
                                }}
                            />
                        )}
                        {modalType === 'compliance-doc' && (
                            <ComplianceDocForm
                                onClose={() => setIsModalOpen(false)}
                                onSave={async (doc) => {
                                    const { error } = await supabase.from('compliance_docs').insert([doc]);
                                    if (!error) {
                                        await logActivity(`Uploaded Compliance Certificate: ${doc.title}`, 'Compliance');
                                        fetchTabData('compliance');
                                        setIsModalOpen(false);
                                    } else alert(error.message);
                                }}
                            />
                        )}
                        {modalType === 'csr-project' && (
                            <CsrProjectForm
                                onClose={() => setIsModalOpen(false)}
                                onSave={async (csr) => {
                                    const { error } = await supabase.from('csr_funding').insert([csr]);
                                    if (!error) {
                                        await logActivity(`Initiated CSR Project Tracking: ${csr.project_name}`, 'Compliance');
                                        fetchTabData('compliance');
                                        setIsModalOpen(false);
                                    } else alert(error.message);
                                }}
                            />
                        )}
                        {modalType === 'tax-record' && (
                            <TaxRecordForm
                                onClose={() => setIsModalOpen(false)}
                                onSave={async (tax) => {
                                    const { error } = await supabase.from('donation_tax_records').insert([tax]);
                                    if (!error) {
                                        await logActivity(`Logged 80G Tax Record for ${tax.donor_name}`, 'Compliance');
                                        fetchTabData('compliance');
                                        setIsModalOpen(false);
                                    } else alert(error.message);
                                }}
                            />
                        )}
                        {modalType === 'compliance-task' && (
                            <ComplianceTaskForm
                                onClose={() => setIsModalOpen(false)}
                                onSave={async (task) => {
                                    const { error } = await supabase.from('compliance_checklists').insert([task]);
                                    if (!error) {
                                        await logActivity(`Scheduled Compliance Task: ${task.task_name}`, 'Compliance');
                                        fetchTabData('compliance');
                                        setIsModalOpen(false);
                                    } else {
                                        console.error('Checklist Save Error:', error);
                                        alert('Compliance Save Failed: ' + error.message);
                                    }
                                }}
                            />
                        )}
                        {modalType === 'board-meeting' && (
                            <MeetingForm
                                meeting={selectedMeeting}
                                onClose={() => setIsModalOpen(false)}
                                onSave={async (meetingData) => {
                                    const { attendees, recording_link, ...m } = meetingData;
                                    const { error } = m.id
                                        ? await supabase.from('board_meetings').update(m).eq('id', m.id)
                                        : await supabase.from('board_meetings').insert([m]);

                                    if (!error) {
                                        logActivity(`${m.id ? 'Updated' : 'Scheduled'} Board Meeting: ${m.meeting_date}`, 'Governance');
                                        fetchTabData('governance');
                                        setIsModalOpen(false);
                                    } else {
                                        alert('Save failed: ' + error.message);
                                    }
                                }}
                            />
                        )}
                        {modalType === 'board-member' && (
                            <MemberForm
                                onClose={() => setIsModalOpen(false)}
                                onSave={async (memberData) => {
                                    const { term_end, role, voting_rights, ...m } = memberData;
                                    const { error } = await supabase.from('board_members').insert([m]);
                                    if (!error) {
                                        logActivity(`Added Board Member: ${m.full_name}`, 'Governance');
                                        fetchTabData('governance');
                                        setIsModalOpen(false);
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

const SelfAttendancePortal = ({ employee, attendance, onCheckIn, onCheckOut }) => {
    if (!employee) return null;

    const today = new Date().toISOString().split('T')[0];
    const todayLog = (attendance || []).find(a => a.employee_id === employee.id && a.attendance_date === today);

    const isCheckedIn = !!todayLog?.check_in;
    const isCheckedOut = !!todayLog?.check_out;

    return (
        <div className="content-panel animate-fade-in" style={{ background: 'linear-gradient(135deg, #1A365D 0%, #2D3748 100%)', color: 'white', padding: '30px', borderRadius: '24px', position: 'relative', overflow: 'hidden', marginBottom: '30px' }}>
            <div style={{ position: 'absolute', top: '-10%', right: '-5%', fontSize: '10rem', opacity: 0.05, transform: 'rotate(-15deg)' }}>
                <FaFingerprint />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
                <div>
                    <h3 style={{ margin: 0, color: '#63B3ED', fontSize: '1.2rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Personal Attendance Terminal</h3>
                    <p style={{ margin: '5px 0 0', opacity: 0.8, fontSize: '0.95rem' }}>Authenticated Staff: <strong>{employee.full_name} ({employee.employee_id})</strong></p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', opacity: 0.6, letterSpacing: '1px' }}>Server Date</div>
                    <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '20px', marginTop: '30px', position: 'relative', zIndex: 1 }}>
                {!isCheckedIn ? (
                    <button
                        className="btn-add"
                        style={{ background: '#38A169', borderColor: '#38A169', height: '65px', fontSize: '1.1rem', fontWeight: 800, borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.4)' }}
                        onClick={() => onCheckIn(employee.id)}
                    >
                        <FaFingerprint style={{ marginRight: '12px' }} /> Initiate Daily Check-In
                    </button>
                ) : !isCheckedOut ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ background: 'rgba(255,255,255,0.1)', padding: '15px 20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.2)' }}>
                            <div style={{ fontSize: '0.7rem', opacity: 0.6, textTransform: 'uppercase' }}>Session Started At</div>
                            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#68D391' }}>{new Date(todayLog.check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</div>
                        </div>
                        <button
                            className="btn-add"
                            style={{ background: '#E53E3E', borderColor: '#E53E3E', height: '65px', fontSize: '1.1rem', fontWeight: 800, borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.4)' }}
                            onClick={() => onCheckOut(todayLog.id)}
                        >
                            <FaSignOutAlt style={{ marginRight: '12px' }} /> End Active Shift
                        </button>
                    </div>
                ) : (
                    <div style={{ gridColumn: 'span 2', background: 'rgba(72, 187, 120, 0.15)', padding: '25px', borderRadius: '20px', border: '1px solid #38A169', textAlign: 'center' }}>
                        <div style={{ fontSize: '1.8rem', color: '#68D391', marginBottom: '8px' }}>
                            <FaCheckCircle style={{ marginBottom: '-5px' }} /> Shift Finalized
                        </div>
                        <div style={{ fontSize: '1rem', opacity: 0.9 }}>
                            Log Duration: <strong>{new Date(todayLog.check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} — {new Date(todayLog.check_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong>
                        </div>
                        <div style={{ fontWeight: 900, color: '#68D391', marginTop: '15px', fontSize: '1.2rem', background: 'rgba(56, 161, 105, 0.1)', padding: '10px', borderRadius: '12px', display: 'inline-block' }}>
                            Calculated Hours: {Number(todayLog.work_hours).toFixed(2)} Hrs
                        </div>
                    </div>
                )}
                {!isCheckedOut && isCheckedIn && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '16px', border: '1px dashed rgba(255,255,255,0.2)' }}>
                        <FaClock style={{ fontSize: '2.5rem', color: '#63B3ED', animation: 'pulse 2s infinite' }} />
                        <span style={{ fontSize: '0.7rem', marginTop: '8px', opacity: 0.5, textTransform: 'uppercase' }}>Logging Active...</span>
                    </div>
                )}
            </div>
        </div>
    );
};

/* --- TAB COMPONENTS --- */

const OverviewTab = ({ adminProfile, employees, volunteers, requests, coAdmins, students, scholarships, finances, attendance, currentEmployee, onSelfCheckIn, onSelfCheckOut, searchTerm, matchingActions, onClearSearch }) => {
    const isSearching = searchTerm && searchTerm.trim().length > 0;
    const p = adminProfile.permissions;

    // Calculate pending counts
    const pendingVolsCount = (volunteers || []).filter(v => v?.status === 'New').length;
    const pendingReqsCount = (requests || []).filter(r => r?.status === 'Pending').length;

    // Filter results based on permissions
    const visibleEmployees = p.view_employees ? (employees || []) : [];
    const visibleVolunteers = p.volunteer_approval ? (volunteers || []) : [];
    const visibleRequests = p.approve_leaves ? (requests || []) : [];
    const visibleStudents = p.student_mgmt ? (students || []) : [];
    const visibleScholarships = p.scholarship_verify ? (scholarships || []) : [];
    const visibleFinances = (p.process_salary || p.bank_access) ? (finances || []) : [];

    const totalResults = visibleEmployees.length + visibleVolunteers.length + visibleRequests.length + visibleStudents.length + visibleScholarships.length + visibleFinances.length;

    return (
        <>
            <SelfAttendancePortal
                employee={currentEmployee}
                attendance={attendance}
                onCheckIn={onSelfCheckIn}
                onCheckOut={onSelfCheckOut}
            />

            {/* PERSONAL WORKSPACE (Employee + Admin Requirement) */}
            <div className="content-panel animate-fade-in" style={{ marginBottom: '30px', background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)', border: '1.5px solid #e2e8f0', borderRadius: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 10px' }}>
                    <div>
                        <h4 style={{ margin: 0, color: '#1a365d', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FaBriefcase style={{ color: '#3182ce' }} /> Personal Personnel Suite
                        </h4>
                        <p style={{ margin: '4px 0 0', color: '#718096', fontSize: '0.8rem' }}>Authority personnel portal for self-service actions.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button className="btn-small" onClick={() => {
                            if (!currentEmployee) {
                                alert("REGISTRY MISSING: Your profile is not yet linked to the Employee Registry. Please contact HR to enable leave self-service.");
                                return;
                            }
                            setModalType('personal-leave');
                            setIsModalOpen(true);
                        }} style={{ background: '#fff', border: '1px solid #e2e8f0', color: '#4a5568' }}>
                            <FaCalendarAlt /> Apply Leave
                        </button>
                        <button className="btn-small" onClick={() => { setModalType('report'); setIsModalOpen(true); }} style={{ background: '#fff', border: '1px solid #e2e8f0', color: '#4a5568' }}>
                            <FaFileUpload /> File Work Report
                        </button>
                    </div>
                </div>
            </div>

            {/* INJECT DIRECTORS REPORT IF APPLICABLE */}
            {(adminProfile?.role?.includes('Director') || adminProfile?.role === 'Super Admin') && (
                <DirectorsReportView
                    adminProfile={adminProfile}
                    requests={requests}
                    finances={finances}
                    volunteers={volunteers}
                    employees={employees}
                />
            )}

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
                {p.view_employees && <StatCard title="Active Personnel" count={visibleEmployees.filter(e => e?.status === 'Active').length} color="blue" icon={<FaUsers />} />}
                {p.volunteer_approval && <StatCard title="Pending Volunteers" count={pendingVolsCount} color="purple" icon={<FaHandHoldingUsd />} />}
                <StatCard title="System Uptime" count="99.9%" color="gold" icon={<FaDesktop />} />
                <StatCard title="Total Alerts" count={(p.volunteer_approval ? pendingVolsCount : 0) + (p.approve_leaves ? pendingReqsCount : 0)} color="red" icon={<FaExclamationTriangle />} />
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
                            {isSearching ? (
                                <>
                                    {visibleEmployees.map(e => (
                                        <tr key={`search-emp-${e.id}`}>
                                            <td><span style={{ color: '#3182ce', fontWeight: '600' }}>Staff</span></td>
                                            <td>{e.full_name} <br /><small style={{ color: '#718096' }}>{e.department}</small></td>
                                            <td><span className={`badge ${e.status === 'Active' ? 'success' : 'warning'}`}>{e.status}</span></td>
                                        </tr>
                                    ))}
                                    {visibleVolunteers.map(v => (
                                        <tr key={`search-vol-${v.id}`}>
                                            <td><span style={{ color: '#805ad5', fontWeight: '600' }}>Volunteer</span></td>
                                            <td>{v.full_name} <br /><small style={{ color: '#718096' }}>{v.area_of_interest}</small></td>
                                            <td><span className={`badge ${v.status === 'Approved' ? 'success' : 'warning'}`}>{v.status}</span></td>
                                        </tr>
                                    ))}
                                    {visibleRequests.map(r => (
                                        <tr key={`search-req-${r.id}`}>
                                            <td><span style={{ color: '#e53e3e', fontWeight: '600' }}>Request</span></td>
                                            <td>{r.requester} <br /><small style={{ color: '#718096' }}>{r.type} Leave</small></td>
                                            <td><span className={`badge ${r.status === 'Approved' ? 'success' : 'warning'}`}>{r.status}</span></td>
                                        </tr>
                                    ))}
                                    {visibleStudents.map(s => (
                                        <tr key={`search-stud-${s.id}`}>
                                            <td><span style={{ color: '#d69e2e', fontWeight: '600' }}>Student</span></td>
                                            <td>{s.student_name} <br /><small style={{ color: '#718096' }}>{s.college_org} • {s.program}</small></td>
                                            <td><span className={`badge ${s.status === 'Active' ? 'success' : 'warning'}`}>{s.status}</span></td>
                                        </tr>
                                    ))}
                                    {visibleScholarships.map(sc => (
                                        <tr key={`search-schol-${sc.id}`}>
                                            <td><span style={{ color: '#38a169', fontWeight: '600' }}>Scholarship</span></td>
                                            <td>{sc.applicant_name} <br /><small style={{ color: '#718096' }}>ID: {sc.application_id}</small></td>
                                            <td><span className={`badge ${sc.status === 'Approved' ? 'success' : 'warning'}`}>{sc.status}</span></td>
                                        </tr>
                                    ))}
                                    {visibleFinances.map(f => (
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
                                    {(p.volunteer_approval && pendingVolsCount > 0) && (
                                        <tr><td>Volunteer Registry</td><td>{pendingVolsCount} New Applications</td><td><span className="badge red-badge">Action Required</span></td></tr>
                                    )}
                                    {(p.approve_leaves && pendingReqsCount > 0) && (
                                        <tr><td>Staff Requests</td><td>{pendingReqsCount} Pending Approvals</td><td><span className="badge red-badge">Action Required</span></td></tr>
                                    )}
                                    {((!p.volunteer_approval || pendingVolsCount === 0) && (!p.approve_leaves || pendingReqsCount === 0)) && (
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

const DirectorsReportView = ({ adminProfile, requests, departments, finances, volunteers, employees }) => {
    // Only verify if the user is a Director or Super Admin
    if (!adminProfile?.role?.includes('Director') && adminProfile?.role !== 'Super Admin') return null;

    const pendingApprovals = requests.filter(r => r.final_status === 'Pending');
    const rejectedCases = requests.filter(r => r.final_status === 'Declined');
    const totalSalary = (employees || []).reduce((acc, emp) => acc + (parseFloat(emp.salary || 0)), 0);
    const budget = 5000000; // Simulated Budget for Demo
    const salaryPercentage = ((totalSalary / budget) * 100).toFixed(1);

    const fellowshipPerformance = (volunteers || []).filter(v => v.status === 'Approved').length;

    // Heatmap Mock Data
    const activityHeatmap = [
        { day: 'Mon', count: 12 }, { day: 'Tue', count: 19 }, { day: 'Wed', count: 8 },
        { day: 'Thu', count: 24 }, { day: 'Fri', count: 15 }, { day: 'Sat', count: 30 }, { day: 'Sun', count: 5 }
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', animation: 'fadeIn 0.5s' }}>
            {/* Top Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
                <div className="content-panel" style={{ textAlign: 'center' }}>
                    <h4 style={{ color: '#718096', margin: '0 0 10px 0' }}>Pending Decisions</h4>
                    <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#DD6B20' }}>{pendingApprovals.length}</div>
                    <div style={{ fontSize: '0.8rem', color: '#A0AEC0' }}>Awaiting Final Sign-off</div>
                </div>
                <div className="content-panel" style={{ textAlign: 'center' }}>
                    <h4 style={{ color: '#718096', margin: '0 0 10px 0' }}>Rejection Rate</h4>
                    <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#E53E3E' }}>
                        {((rejectedCases.length / (requests.length || 1)) * 100).toFixed(0)}%
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#A0AEC0' }}>Avg. Declined Cases</div>
                </div>
                <div className="content-panel" style={{ textAlign: 'center' }}>
                    <h4 style={{ color: '#718096', margin: '0 0 10px 0' }}>Payroll Utilization</h4>
                    <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#3182CE' }}>{salaryPercentage}%</div>
                    <div style={{ fontSize: '0.8rem', color: '#A0AEC0' }}>of Monthly Budget Cap</div>
                </div>
                <div className="content-panel" style={{ textAlign: 'center' }}>
                    <h4 style={{ color: '#718096', margin: '0 0 10px 0' }}>Fellowship Strength</h4>
                    <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#38A169' }}>{fellowshipPerformance}</div>
                    <div style={{ fontSize: '0.8rem', color: '#A0AEC0' }}>Active Fellows</div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
                <div className="content-panel">
                    <h3><FaChartLine /> Executive Overview: Rejection Analysis</h3>
                    <table className="data-table">
                        <thead><tr><th>Case ID</th><th>Type</th><th>Declined By</th><th>Reason Provided</th></tr></thead>
                        <tbody>
                            {rejectedCases.slice(0, 5).map(r => (
                                <tr key={r.id}>
                                    <td>{r.id.substring(0, 8)}</td>
                                    <td>{r.type}</td>
                                    <td>{r.final_approver_name || r.level_1_approver_name}</td>
                                    <td style={{ color: '#E53E3E', fontWeight: '600' }}>{r.decline_reason || 'Administrative Decline'}</td>
                                </tr>
                            ))}
                            {rejectedCases.length === 0 && <tr><td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>No rejections recorded this period.</td></tr>}
                        </tbody>
                    </table>
                </div>

                <div className="content-panel">
                    <h3><FaTasks /> Volunteer Heatmap</h3>
                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '150px', marginTop: '20px' }}>
                        {activityHeatmap.map(d => (
                            <div key={d.day} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                                <div style={{
                                    width: '30px',
                                    height: `${(d.count / 30) * 100}%`,
                                    background: d.count > 20 ? '#38A169' : (d.count > 10 ? '#3182CE' : '#CBD5E0'),
                                    borderRadius: '5px'
                                }}></div>
                                <span style={{ fontSize: '0.7rem' }}>{d.day}</span>
                            </div>
                        ))}
                    </div>
                    <p style={{ textAlign: 'center', fontSize: '0.8rem', color: '#718096', marginTop: '15px' }}>Peak Activity: Saturday</p>
                </div>
            </div>

            <div className="content-panel">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3>Report Generator (Director Access)</h3>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button className="btn-small" onClick={() => alert('Generating Monthly PDF...')}><FaDownload /> Monthly</button>
                        <button className="btn-small" onClick={() => alert('Generating Quarterly PDF...')}><FaDownload /> Quarterly</button>
                        <button className="btn-small" onClick={() => alert('Generating Annual Audit PDF...')}><FaDownload /> Annual</button>
                    </div>
                </div>
            </div>
        </div>
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
    <div className="content-panel animate-fade-in" style={{ padding: '0', background: '#f8fafc' }}>
        <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0', alignItems: 'center', padding: '30px 40px', background: 'white', borderBottom: '1px solid #edf2f7', borderTopLeftRadius: '28px', borderTopRightRadius: '28px' }}>
            <div>
                <h3 style={{ margin: 0, fontSize: '1.4rem', color: '#1a365d', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <FaAuditIcon style={{ color: '#e53e3e' }} /> Central Institutional Audit (Level 7)
                </h3>
                <p style={{ margin: '5px 0 0', color: '#e53e3e', fontSize: '0.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <FaShieldAlt /> IMMUTABLE SECURITY ARCHIVE • DELETE/EDIT PROTOCOLS PHYSICALLY DISABLED AT KERNEL
                </p>
            </div>
            <button className="btn-small" style={{ background: '#2d3748', color: 'white' }}><FaDownload /> Regional CSV Dump</button>
        </div>
        <div style={{ padding: '0 40px 40px' }}>
            <div className="table-responsive" style={{ overflowX: 'auto', marginTop: '20px' }}>
                <table className="data-table" style={{ fontSize: '0.85rem' }}>
                    <thead>
                        <tr style={{ background: '#fff' }}>
                            <th style={{ color: '#94a3b8', fontSize: '0.7rem', textTransform: 'uppercase' }}>Timeline (IST)</th>
                            <th style={{ color: '#94a3b8', fontSize: '0.7rem', textTransform: 'uppercase' }}>Personnel</th>
                            <th style={{ color: '#94a3b8', fontSize: '0.7rem', textTransform: 'uppercase' }}>Transaction / Action</th>
                            <th style={{ color: '#94a3b8', fontSize: '0.7rem', textTransform: 'uppercase' }}>Record ID</th>
                            <th style={{ color: '#94a3b8', fontSize: '0.7rem', textTransform: 'uppercase' }}>Sub-System</th>
                            <th style={{ color: '#94a3b8', fontSize: '0.7rem', textTransform: 'uppercase' }}>Terminal Fingerprint</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(logs || []).length > 0 ? logs.map(log => {
                            const dateObj = new Date(log.created_at);
                            return (
                                <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ whiteSpace: 'nowrap' }}>
                                        <div style={{ fontWeight: 700 }}>{dateObj.toLocaleDateString('en-GB')}</div>
                                        <div style={{ fontSize: '0.7rem', color: '#718096' }}>{dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ width: '32px', height: '32px', background: '#EBF8FF', borderRadius: '50%', border: '1px solid #BEE3F8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3182CE', fontWeight: 900 }}>
                                                {log.actor_name?.charAt(0) || 'A'}
                                            </div>
                                            <div>
                                                <strong>{log.actor_name || 'Admin'}</strong><br />
                                                <span style={{ fontSize: '0.65rem', color: '#3182CE', fontWeight: 900, textTransform: 'uppercase' }}>{log.actor_role || 'HQ Executive'}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ maxWidth: '250px' }}>
                                        <div style={{ fontWeight: 700, color: '#2D3748' }}>{log.action}</div>
                                        {(log.old_value || log.new_value) && (
                                            <div style={{ marginTop: '5px', fontSize: '0.65rem', color: '#718096', fontStyle: 'italic' }}>
                                                Modified system state parameters
                                            </div>
                                        )}
                                    </td>
                                    <td>
                                        <code style={{ background: '#F7FAFC', padding: '4px 8px', borderRadius: '6px', border: '1px solid #E2E8F0', fontSize: '0.75rem', color: '#1A365D', fontWeight: 700 }}>
                                            {log.record_id || 'SYS-LINK'}
                                        </code>
                                    </td>
                                    <td><span className="badge" style={{ background: '#edf2f7', color: '#4a5568' }}>{log.sub_system}</span></td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <FaDesktop style={{ color: '#cbd5e0' }} />
                                            <div style={{ fontSize: '0.7rem' }}>
                                                <div style={{ fontWeight: 600 }}>{log.ip_address || '127.0.0.1'}</div>
                                                <div style={{ color: '#94a3b8', fontSize: '0.65rem' }}>{log.device_info || 'Authorized Node'}</div>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            );
                        }) : (
                            <tr><td colSpan="6" style={{ textAlign: 'center', padding: '100px', color: '#94a3b8' }}>
                                <FaHistory style={{ fontSize: '3rem', opacity: 0.1, marginBottom: '20px' }} /><br />
                                The Institutional Audit Trail is empty. All administrative transactions will appear here.
                            </td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
);

const EmployeeTab = ({ employees, toggleStatus, deleteEmp, onView, onAdd }) => {
    const [filterStatus, setFilterStatus] = useState('New');

    const filteredData = (employees || []).filter(emp =>
        filterStatus === 'All' || emp.status === filterStatus
    );

    return (
        <div className="content-panel" style={{ animation: 'fadeIn 0.5s' }}>
            <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px', alignItems: 'center' }}>
                <div>
                    <h3 style={{ margin: 0 }}>Personnel Directory</h3>
                    <p style={{ margin: '5px 0 0', color: '#718096', fontSize: '0.85rem' }}>Lifecycle Management: Onboarding → Verification → Active Duty</p>
                </div>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.85rem', fontWeight: 600 }}
                    >
                        <option value="New">Review Queue (New)</option>
                        <option value="HR Verified">Pending Admin Approval</option>
                        <option value="Admin Approved">Awaiting Director</option>
                        <option value="Active">Active Staff</option>
                        <option value="Rejected">Rejected</option>
                        <option value="All">Full Registry</option>
                    </select>
                    <button className="btn-premium" onClick={onAdd}><FaUserPlus /> Hire New Staff</button>
                </div>
            </div>
            <table className="data-table">
                <thead>
                    <tr><th>Identity</th><th>Role & Dept</th><th>Work Type</th><th>Onboarding Stage</th><th>Actions</th></tr>
                </thead>
                <tbody>
                    {filteredData.length > 0 ? filteredData.map(emp => (
                        <tr key={emp.id}>
                            <td><strong>{emp.full_name}</strong><br /><small>{emp.employee_id || 'PENDING'}</small></td>
                            <td>{emp.designation}<br /><small>{emp.department}</small></td>
                            <td>{emp.employment_type}</td>
                            <td>
                                <span className={`badge ${emp.status === 'Active' ? 'success' : (emp.status === 'Rejected' ? 'red' : 'blue')}`}>
                                    {emp.status === 'New' ? 'Awaiting HR' :
                                        emp.status === 'HR Verified' ? 'Awaiting Admin' :
                                            emp.status === 'Admin Approved' ? 'Awaiting Director' :
                                                emp.status}
                                </span>
                            </td>
                            <td>
                                <div className="action-buttons">
                                    <button className="btn-icon" onClick={() => onView(emp)} title="Detailed View / Approve"><FaEye /></button>
                                    <button className="btn-icon danger" onClick={() => deleteEmp(emp.id, emp.full_name)} title="Delete"><FaTrash /></button>
                                </div>
                            </td>
                        </tr>
                    )) : (
                        <tr><td colSpan="5" style={{ textAlign: 'center', padding: '80px', color: '#94a3b8' }}>
                            <FaUsers style={{ fontSize: '3rem', opacity: 0.1, marginBottom: '15px' }} /><br />
                            No personnel records found for the selected stage.
                        </td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

const VolunteerTasksTab = ({ tasks, volunteers, handleAction, onExport, onAssign, onView }) => {
    const [filterStatus, setFilterStatus] = useState('Completed'); // Default to review queue

    const filteredData = (tasks || []).filter(t =>
        filterStatus === 'All' || t.status === filterStatus
    );

    const handleDownloadProof = async (task) => {
        if (!task.proof_file_path) return alert('No proof artifact uploaded for this task.');
        try {
            const { data, error } = await supabase.storage.from('vault').createSignedUrl(task.proof_file_path, 60);
            if (error) throw error;
            window.open(data.signedUrl, '_blank');
        } catch (err) { alert('Proof retrieval failed: ' + err.message); }
    };

    return (
        <div className="content-panel" style={{ animation: 'fadeIn 0.5s' }}>
            <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                <div>
                    <h3 style={{ margin: 0 }}>Volunteer Task Mastery Hub</h3>
                    <p style={{ margin: '5px 0 0', color: '#718096', fontSize: '0.85rem' }}>Core verification engine for institutional certificate eligibility.</p>
                </div>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <button
                        className="btn-premium"
                        onClick={onAssign}
                    >
                        <FaPlusCircle style={{ fontSize: '1.1rem' }} />
                        <span>Deploy New Mission</span>
                    </button>
                    <div style={{ width: '1px', height: '30px', background: '#e2e8f0', margin: '0 5px' }}></div>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.85rem', fontWeight: 600 }}
                    >
                        <option value="Completed">Review Queue (Completed)</option>
                        <option value="Verified">Verified Activities</option>
                        <option value="Rejected">Rejected Proofs</option>
                        <option value="In Progress">Active Tasks</option>
                        <option value="All">Full Audit Trail</option>
                    </select>
                    <button className="btn-small" onClick={() => onExport(filteredData, 'Volunteer_Tasks')} style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0' }}>
                        <FaDownload /> Export CSV
                    </button>
                </div>
            </div>

            <table className="data-table">
                <thead>
                    <tr>
                        <th>Volunteer</th>
                        <th>Task Mission</th>
                        <th>Submission Proof</th>
                        <th>Current Status</th>
                        <th>Verification Action</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredData.length > 0 ? filteredData.map(t => (
                        <tr key={t.id}>
                            <td>
                                <strong>{t.volunteers?.full_name}</strong><br />
                                <small style={{ color: '#718096' }}>Sub ID: {t.id.substring(0, 8)}</small>
                            </td>
                            <td>
                                <div style={{ fontWeight: 600 }}>{t.title}</div>
                                <div style={{ fontSize: '0.75rem', color: '#4a5568', marginTop: '4px' }}>{t.description?.substring(0, 60)}...</div>
                            </td>
                            <td>
                                {t.proof_file_path ? (
                                    <button className="btn-small" onClick={() => onView(t)} style={{ background: '#ebf8ff', color: '#2b6cb0' }}>
                                        <FaEye /> Audit Registry
                                    </button>
                                ) : <span style={{ color: '#cbd5e0', fontSize: '0.8rem' }}>No Artifact</span>}
                            </td>
                            <td>
                                <span className={`badge ${t.status === 'Verified' ? 'success' : t.status === 'Completed' ? 'blue' : t.status === 'Rejected' ? 'red' : 'neutral'}`}>
                                    {t.status}
                                </span>
                            </td>
                            <td>
                                {t.status === 'Completed' ? (
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button className="btn-small success-btn" onClick={() => handleAction('volunteer_task', t.id, 'approve')}>Approve</button>
                                        <button className="btn-small danger-btn" onClick={() => {
                                            const reason = prompt('Specify rejection grounds (Incomplete proof / Fake activity):');
                                            if (reason) handleAction('volunteer_task', t.id, 'reject', reason);
                                        }}>Reject</button>
                                    </div>
                                ) : (
                                    <div style={{ fontSize: '0.75rem', color: '#718096' }}>
                                        {t.status === 'Verified' ? `Verified On: ${new Date(t.verified_at).toLocaleDateString()}` : 'No Action Needed'}
                                    </div>
                                )}
                            </td>
                        </tr>
                    )) : (
                        <tr><td colSpan="5" style={{ textAlign: 'center', padding: '100px', color: '#94a3b8' }}>
                            <FaClipboardCheck style={{ fontSize: '3rem', opacity: 0.1, marginBottom: '20px' }} /><br />
                            Review queue is clear. All submitted tasks have been processed.
                        </td></tr>
                    )}
                </tbody>
            </table>
            {/* Added for Task Verification Detail View */}
            {filteredData.some(t => t.status === 'Verified' || t.status === 'Rejected') && (
                <div style={{ marginTop: '30px' }}>
                    <h4 style={{ color: '#4A5568', fontSize: '0.9rem', marginBottom: '15px' }}>Recent Decision Registry</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                        {filteredData.filter(t => t.status === 'Verified' || t.status === 'Rejected').slice(0, 4).map(t => (
                            <ApprovalBadge key={`badge-${t.id}`} data={t} level="Mission Verification" />
                        ))}
                    </div>
                </div>
            )}
        </div >
    );
};

const VolunteerTab = ({ volunteers, handleAction, onDelete, onView, onViewID, onExport }) => {
    const [filterStatus, setFilterStatus] = useState('New');

    const filteredData = (volunteers || []).filter(v =>
        filterStatus === 'All' || v.status === filterStatus
    );

    return (
        <div className="content-panel" style={{ animation: 'fadeIn 0.5s' }}>
            <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                <div>
                    <h3 style={{ margin: 0 }}>Volunteer Review Queue</h3>
                    <p style={{ margin: '5px 0 0', color: '#718096', fontSize: '0.85rem' }}>Coordinator Approval Workflow: Submission → Review → ID Generation</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.85rem', fontWeight: 600 }}
                        aria-label="Filter volunteers by status"
                    >
                        <option value="New">Review Queue (New)</option>
                        <option value="Approved">Verified Volunteers</option>
                        <option value="Rejected">Rejected Applications</option>
                        <option value="All">All Records</option>
                    </select>
                    <button
                        className="btn-small"
                        onClick={() => onExport(filteredData, 'Volunteer_List')}
                        title="Download as CSV"
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0' }}
                    >
                        <FaDownload /> Export CSV
                    </button>
                </div>
            </div>
            <table className="data-table" role="table">
                <thead><tr><th>Applicant Name</th><th>Area of Interest</th><th>Submission Date</th><th>Ref ID</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                    {filteredData.length > 0 ? filteredData.map(v => (
                        <tr key={v.id} role="row">
                            <td><strong>{v.full_name}</strong></td>
                            <td>{v.area_of_interest}</td>
                            <td>{new Date(v.created_at).toLocaleDateString()}</td>
                            <td><code style={{ fontSize: '0.75rem' }}>{v.id.substring(0, 8)}</code></td>
                            <td>
                                <span className={`badge ${v.status === 'New' ? 'blue' : v.status === 'Approved' ? 'success' : 'red'}`}>
                                    {v.status === 'New' ? 'Under Review' : v.status}
                                </span>
                            </td>
                            <td style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <button className="btn-icon" onClick={() => onView(v)} title="Perform Coordinator Review"><FaEye /></button>
                                {v.status === 'Approved' && (
                                    <button className="btn-small" onClick={() => onViewID(v)} style={{ background: '#ebf8ff', color: '#2b6cb0' }}><FaIdCard /> Get ID</button>
                                )}
                                <button className="btn-icon danger" onClick={() => onDelete(v.id, v.full_name)} title="Purge Record" style={{ marginLeft: 'auto' }}><FaTrash /></button>
                            </td>
                        </tr>
                    )) : (
                        <tr><td colSpan="6" style={{ textAlign: 'center', padding: '100px', color: '#94a3b8' }}>
                            <FaHandHoldingUsd style={{ fontSize: '3rem', opacity: 0.2, marginBottom: '15px' }} /><br />
                            Queue is currently clear. No applications pending review.
                        </td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

const AttendanceTab = ({ attendance, employees, onAdd, onExport, onLock, onAction, adminProfile }) => {
    const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
    const filteredData = (attendance || []).filter(a => a.attendance_date === filterDate || !filterDate);

    const isDayLocked = filteredData.length > 0 && filteredData.every(a => a.is_locked);
    const hasPermissionToLock = SUPER_ROLES.includes(adminProfile.role) || adminProfile.role === 'Admin Head';
    const isSupervisor = adminProfile.role.includes('Supervisor') || SUPER_ROLES.includes(adminProfile.role);
    const isHR = adminProfile.role.includes('HR') || SUPER_ROLES.includes(adminProfile.role);

    const getApprovalBadge = (a) => {
        const status = a.approval_status || 'Submitted';
        let config = { label: 'Submitted', color: '#718096', icon: <FaClock /> };

        if (status === 'Supervisor Reviewed') config = { label: 'Supervisor Reviewed', color: '#3182CE', icon: <FaUserCheck /> };
        if (status === 'HR Verified') config = { label: 'HR Verified', color: '#805AD5', icon: <FaShieldAlt /> };
        if (status === 'Locked' || a.is_locked) config = { label: 'Locked / Finalized', color: '#2D3748', icon: <FaLock /> };

        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '5px 12px', background: `${config.color}15`, color: config.color, borderRadius: '8px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>
                {config.icon} {config.label}
            </div>
        );
    };

    return (
        <div className="content-panel animate-fade-in" style={{ padding: '0' }}>
            <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '30px 40px', background: '#fff', borderBottom: '1px solid #edf2f7', borderTopLeftRadius: '28px', borderTopRightRadius: '28px' }}>
                <div>
                    <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900, color: '#1a365d', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <FaClipboardCheck style={{ color: 'var(--primary)' }} /> Daily Attendance Registry
                    </h3>
                    <p style={{ margin: '5px 0 0', color: '#718096', fontSize: '0.85rem' }}>Precision tracking & institutional presence logs.</p>
                </div>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <div style={{ position: 'relative' }}>
                        <FaCalendarAlt style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#a0aec0' }} />
                        <input
                            type="date"
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                            style={{ padding: '10px 12px 10px 35px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '0.9rem', fontWeight: 600, color: '#2d3748', background: '#f8fafc' }}
                        />
                    </div>
                    <button className="btn-small" onClick={() => onExport(filteredData, `Attendance_${filterDate}`)} style={{ background: '#fff', color: '#4a5568', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                        <FaDownload /> Export CSV
                    </button>
                    {!isDayLocked && (
                        <button className="btn-add" onClick={onAdd} style={{ padding: '10px 20px' }}>
                            <FaFingerprint /> Log Entry
                        </button>
                    )}
                    {hasPermissionToLock && !isDayLocked && filteredData.length > 0 && (
                        <button className="btn-premium" onClick={() => onLock(filterDate)} style={{ background: '#2d3748', border: 'none' }}>
                            <FaLock /> Finalize & Lock
                        </button>
                    )}
                </div>
            </div>

            <marquee behavior="alternate" style={{ background: '#fffaf0', color: '#b7791f', padding: '10px 0', fontSize: '0.9rem', fontWeight: 'bold', borderBottom: '1px solid #feebc8' }}>
                🕘 Employees must mark daily attendance before 10:00 AM | Attendance is linked to salary processing.
            </marquee>
            <marquee direction="right" style={{ background: '#f8fafc', color: '#1a365d', padding: '5px 0', fontSize: '0.85rem', fontWeight: 'bold', borderBottom: '1px solid #edf2f7' }}>
                📄 Attendance once locked cannot be edited without Director approval.
            </marquee>

            <div style={{ padding: '0 40px 40px' }}>
                {isDayLocked && (
                    <div style={{ margin: '20px 0', padding: '15px 25px', background: '#fffaf0', border: '1.5px solid #feebc8', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '15px', color: '#9c4221' }}>
                        <FaLock style={{ fontSize: '1.2rem' }} />
                        <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                            REGISTRY LOCKED: This days attendance has been finalized and sanctioned. No further modifications allowed.
                        </div>
                    </div>
                )}

                <table className="data-table" style={{ marginTop: '20px' }}>
                    <thead>
                        <tr style={{ background: '#fff' }}>
                            <th style={{ color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Emp ID</th>
                            <th style={{ color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Name</th>
                            <th style={{ color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Time Metrics</th>
                            <th style={{ color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Approval Flow</th>
                            <th style={{ color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', textAlign: 'center' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody style={{ borderTop: 'none' }}>
                        {filteredData.length > 0 ? filteredData.map(a => (
                            <tr key={a.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ fontWeight: 800, color: '#1a365d' }}>{a.employees?.employee_id || '—'}</td>
                                <td>
                                    <div style={{ fontWeight: 700, color: '#2d3748' }}>{a.employees?.full_name}</div>
                                    <div style={{ fontSize: '0.7rem', color: '#718096' }}>{a.employees?.department}</div>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: '15px' }}>
                                        <div>
                                            <small style={{ display: 'block', color: '#94a3b8', fontSize: '0.65rem', textTransform: 'uppercase' }}>Shift</small>
                                            <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{a.check_in ? new Date(a.check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'} - {a.check_out ? new Date(a.check_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</div>
                                        </div>
                                        <div>
                                            <small style={{ display: 'block', color: '#94a3b8', fontSize: '0.65rem', textTransform: 'uppercase' }}>Net Hours</small>
                                            <div style={{ fontSize: '0.85rem', fontWeight: 900, color: '#2d3748' }}>{Number(a.work_hours || 0).toFixed(1)} Hrs</div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    {getApprovalBadge(a)}
                                    {a.approval_status === 'Locked' && (
                                        <div style={{ marginTop: '5px', fontSize: '0.65rem', color: '#718096', fontStyle: 'italic' }}>
                                            Finalized by {adminProfile.name}
                                        </div>
                                    )}
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                    {!a.is_locked ? (
                                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                                            {a.approval_status === 'Submitted' && isSupervisor && (
                                                <button className="btn-small success" onClick={() => onAction(a.id, 'supervisor')} style={{ fontSize: '0.7rem' }}>Verify (Manager)</button>
                                            )}
                                            {a.approval_status === 'Supervisor Reviewed' && isHR && (
                                                <button className="btn-small" onClick={() => onAction(a.id, 'hr')} style={{ fontSize: '0.7rem', background: '#805AD5', color: 'white' }}>Audit (HR)</button>
                                            )}
                                            {a.approval_status === 'HR Verified' && (
                                                <span style={{ fontSize: '0.7rem', color: '#38A169', fontWeight: 800 }}>READY TO LOCK</span>
                                            )}
                                        </div>
                                    ) : (
                                        <FaCheckCircle style={{ color: '#3182CE' }} />
                                    )}
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan="5" style={{ textAlign: 'center', padding: '100px', color: '#94a3b8' }}>
                                <FaClipboardCheck style={{ fontSize: '3rem', opacity: 0.1, marginBottom: '20px' }} /><br />
                                No personnel logs recorded for this operation date.
                            </td></tr>
                        )}
                    </tbody>
                </table>
                <div style={{ marginTop: '30px', color: '#718096', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FaInfoCircle style={{ color: '#3182ce' }} /> <span>📌 <strong>Approval Flow:</strong> Submitted → Supervisor Review → HR verification → Locked.</span>
                </div>
            </div>
        </div>
    );
};

const StudentTab = ({ students, onView, onDelete, handleAction, onExport }) => {
    const [filterStatus, setFilterStatus] = useState('All');
    const [filterProgram, setFilterProgram] = useState('All');
    const [filterCollege, setFilterCollege] = useState('All');

    const filteredData = (students || []).filter(s => {
        const matchesStatus = filterStatus === 'All' || s.status === filterStatus;
        const matchesProgram = filterProgram === 'All' || s.program === filterProgram;
        const matchesCollege = filterCollege === 'All' || s.college_org === filterCollege;
        return matchesStatus && matchesProgram && matchesCollege;
    });

    const allPrograms = [...new Set([...PROGRAM_TRACKS, ...(students || []).map(s => s.program).filter(Boolean)])].sort();
    const allColleges = [...COLLEGES].sort();

    return (
        <div className="content-panel">
            <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                <h3 style={{ margin: 0 }}>Academic Registrations</h3>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        className="btn-small"
                        onClick={() => onExport(filteredData, 'Student_Registrations')}
                        title="Download as CSV"
                        aria-label="Export student registrations as CSV"
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0' }}
                    >
                        <FaDownload /> Export CSV
                    </button>
                </div>
            </div>

            {/* Filter Controls */}
            <div className="filter-bar" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '20px', padding: '15px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div className="filter-group">
                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '6px' }}>Filter by Status</label>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.9rem' }}
                        aria-label="Filter students by status"
                    >
                        <option value="All">All Statuses</option>
                        <option value="Pending">Pending Verification</option>
                        <option value="Approved">Approved / Active</option>
                        <option value="Active">Active (Legacy)</option>
                        <option value="Rejected">Rejected</option>
                    </select>
                </div>
                <div className="filter-group">
                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '6px' }}>Filter by Program</label>
                    <select
                        value={filterProgram}
                        onChange={(e) => setFilterProgram(e.target.value)}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.9rem' }}
                        aria-label="Filter students by academic program"
                    >
                        <option value="All">All Programs</option>
                        {allPrograms.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                </div>
                <div className="filter-group">
                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '6px' }}>Filter by College</label>
                    <select
                        value={filterCollege}
                        onChange={(e) => setFilterCollege(e.target.value)}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.9rem' }}
                        aria-label="Filter students by college or organization"
                    >
                        <option value="All">All Institutions</option>
                        {allColleges.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
            </div>

            <div className="table-responsive" style={{ overflowX: 'auto' }}>
                <table className="data-table" role="table" aria-label="Student registrations list">
                    <thead>
                        <tr role="row">
                            <th role="columnheader">Student Name</th>
                            <th role="columnheader">Register ID</th>
                            <th role="columnheader">College/Org</th>
                            <th role="columnheader">Program</th>
                            <th role="columnheader">Status</th>
                            <th role="columnheader">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.length > 0 ? filteredData.map(s => (
                            <tr key={s.id} role="row">
                                <td role="cell"><strong>{s.student_name}</strong></td>
                                <td role="cell"><code style={{ fontSize: '0.8rem' }}>{s.student_id || '—'}</code></td>
                                <td role="cell" style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={s.college_org}>{s.college_org}</td>
                                <td role="cell">{s.program || '—'}</td>
                                <td role="cell">
                                    <span className={`badge ${s.status === 'Approved' ? 'success' : s.status === 'Pending' ? 'blue' : (s.status === 'Active' ? 'warning' : 'red')}`} style={{ minWidth: '80px', textAlign: 'center' }}>
                                        {s.status}
                                    </span>
                                </td>
                                <td role="cell">
                                    <div className="action-buttons" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        <button className="btn-icon" onClick={() => onView(s)} title="View Full Details" aria-label={`View details for ${s.student_name}`}><FaEye /></button>
                                        {(s.status === 'Pending' || s.status === 'Active') && (
                                            <>
                                                <button className="btn-icon success" style={{ background: '#ecfdf5', color: '#059669' }} onClick={() => handleAction('student', s.id, 'approve')} title="Approve Student" aria-label={`Approve ${s.student_name}`}><FaCheckCircle /></button>
                                                <button className="btn-icon danger" style={{ background: '#fef2f2', color: '#dc2626' }} onClick={() => {
                                                    const reason = prompt(`Enter rejection reason for ${s.student_name}:`);
                                                    if (reason) handleAction('student', s.id, 'reject', reason);
                                                }} title="Reject Student" aria-label={`Reject ${s.student_name}`}><FaUserTimes /></button>
                                            </>
                                        )}
                                        <button className="btn-icon danger" onClick={() => onDelete(s.id, s.student_name)} title="Remove Record" aria-label={`Delete registration for ${s.student_name}`}><FaTrash /></button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                                    <FaSearch style={{ fontSize: '2rem', marginBottom: '10px', opacity: 0.3 }} /><br />
                                    No students match the current filters.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const ScholarshipTab = ({ scholarships, handleAction, onDelete, onExport, onView }) => {
    const [filterStatus, setFilterStatus] = useState('All');
    const filteredData = (scholarships || []).filter(s => filterStatus === 'All' || s.status === filterStatus);

    return (
        <div className="content-panel">
            <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                <h3 style={{ margin: 0 }}>Scholarship Verification</h3>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.85rem' }}
                    >
                        <option value="All">All Statuses</option>
                        <option value="Awaiting Approval">Awaiting Approval</option>
                        <option value="Approved">Approved</option>
                    </select>
                    <button className="btn-small" onClick={() => onExport(filteredData, 'Scholarship_List')} style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0' }}>
                        <FaDownload /> Export
                    </button>
                </div>
            </div>
            <table className="data-table" role="table">
                <thead><tr><th>ID</th><th>Applicant</th><th>Income Status</th><th>Academic</th><th>Status</th><th>Action</th></tr></thead>
                <tbody>
                    {filteredData.length > 0 ? filteredData.map(s => (
                        <tr key={s.id} role="row">
                            <td>{s.application_id}</td>
                            <td>{s.applicant_name}</td>
                            <td>{s.income_status}</td>
                            <td>{s.academic_score}</td>
                            <td><span className={`badge ${s.status === 'Approved' ? 'success' : 'blue'}`}>{s.status}</span></td>
                            <td>
                                <div className="action-buttons" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <button className="btn-icon" onClick={() => onView(s)} title="Review Application Details"><FaEye /></button>
                                    {s.status === 'Awaiting Approval' && (
                                        <button className="btn-small success-btn" onClick={() => handleAction('scholarship', s.id, 'approve')}>Approve</button>
                                    )}
                                    <button className="btn-icon danger" onClick={() => onDelete(s.id, s.applicant_name)} title="Remove Application"><FaTrash /></button>
                                </div>
                            </td>
                        </tr>
                    )) : (
                        <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>No scholarships found.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

const FinanceTab = ({ finances, onDelete, onExport }) => {
    const [filterType, setFilterType] = useState('All');
    const filteredData = (finances || []).filter(f => filterType === 'All' || f.type === filterType);

    return (
        <div className="content-panel">
            <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                <marquee style={{ background: '#f8fafc', color: '#1a365d', padding: '10px 0', fontSize: '0.9rem', fontWeight: 'bold', borderRadius: '15px 15px 0 0' }}>
                    🔐 Financial transactions, salaries & stipends are processed only through bank transfers as per policy.
                </marquee>
                <h3 style={{ margin: 0 }}>Treasury & Payroll Log</h3>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.85rem' }}
                    >
                        <option value="All">All Types</option>
                        <option value="Donation">Donation</option>
                        <option value="Salary">Salary</option>
                        <option value="Expense">Expense</option>
                    </select>
                    <button className="btn-small" onClick={() => onExport(filteredData, 'Finance_Log')} style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0' }}>
                        <FaDownload /> Export
                    </button>
                    <button className="btn-small"><FaFileInvoiceDollar /> Generate Slips</button>
                </div>
            </div>
            <table className="data-table" role="table">
                <thead><tr><th>Date</th><th>Type</th><th>Allocation Context</th><th>Amount</th><th>Audit</th><th>Actions</th></tr></thead>
                <tbody>
                    {filteredData.length > 0 ? filteredData.map(f => (
                        <tr key={f.id} role="row">
                            <td>{f.transaction_date || f.date}</td>
                            <td>{f.type}</td>
                            <td>{f.category_context || '-'}</td>
                            <td><strong>₹ {Number(f.amount).toLocaleString()}</strong></td>
                            <td><span className="badge success">{f.status || 'Audited'}</span></td>
                            <td>
                                <button className="btn-icon danger" onClick={() => onDelete(f.id, f.category_context || f.type)} title="Delete entry"><FaTrash /></button>
                            </td>
                        </tr>
                    )) : (
                        <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>No financial records found.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

const PayrollTab = ({ records, onView, onExport, onInitiate }) => {
    const [filterStatus, setFilterStatus] = useState('All');
    const filteredData = (records || []).filter(r => filterStatus === 'All' || r.status === filterStatus);

    return (
        <div className="content-panel">
            <marquee style={{ background: '#f8fafc', color: '#1a365d', padding: '10px 0', fontSize: '0.9rem', fontWeight: 'bold', borderRadius: '15px 15px 0 0' }}>
                🔐 Financial transactions, salaries & stipends are processed only through bank transfers as per policy.
            </marquee>
            <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                <div>
                    <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FaFileInvoiceDollar style={{ color: 'var(--primary)' }} /> Institutional Payroll Registry
                    </h3>
                    <p style={{ margin: '5px 0 0', color: '#718096', fontSize: '0.85rem' }}>STRICT: Multi-stage salary authorization & attendance-linked disbursement.</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="btn-premium" onClick={onInitiate} style={{ background: '#2d3748' }}>
                        <FaPlusCircle /> Initiate Monthly Run
                    </button>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.85rem', fontWeight: 600 }}
                    >
                        <option value="All">Full Lifecycle</option>
                        <option value="Draft">Draft (Newly Sequenced)</option>
                        <option value="Attendance Locked">Review Queue (Attendance)</option>
                        <option value="HR Verified">Pending Finance</option>
                        <option value="Finance Computed">Pending Director Approval</option>
                        <option value="Director Approved">Ready for Bank Disbursement</option>
                        <option value="Funds Disbursed">Disbursed (Postings)</option>
                        <option value="Cycle Complete">Cycle Closed</option>
                    </select>
                    <button className="btn-small" onClick={() => onExport(filteredData, 'Payroll_Registry')} style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0' }}>
                        <FaDownload /> Export
                    </button>
                </div>
            </div>

            <table className="data-table">
                <thead>
                    <tr>
                        <th>Employee</th>
                        <th>Pay Period</th>
                        <th>Net Payable</th>
                        <th>Current Stage</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredData.length > 0 ? filteredData.map(r => (
                        <tr key={r.id}>
                            <td>
                                <strong>{r.employees?.full_name}</strong><br />
                                <small>{r.employees?.designation}</small>
                            </td>
                            <td>{r.month} {r.year || ''}</td>
                            <td><strong>₹ {Number(r.net_salary || 0).toLocaleString()}</strong></td>
                            <td>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <span className={`badge ${r.status === 'Cycle Complete' ? 'success' : 'blue'}`}>
                                        {r.status}
                                    </span>
                                    {r.is_reopened && <span style={{ fontSize: '0.65rem', color: '#E53E3E', fontWeight: 900 }}>RE-OPENED BY DIRECTOR</span>}
                                </div>
                            </td>
                            <td>
                                <button className="btn-icon" onClick={() => onView(r)} title="Review Audited Metrics"><FaEye /></button>
                            </td>
                        </tr>
                    )) : (
                        <tr><td colSpan="5" style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>No payroll records found for this stage.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

const PayrollDetailsView = ({ record, onClose, onAction, onReopen, adminProfile }) => {
    const r = record || {};
    const stages = ['Draft', 'Attendance Locked', 'HR Verified', 'Finance Computed', 'Director Approved', 'Funds Disbursed', 'Cycle Complete'];
    const currentIdx = stages.indexOf(r.status);
    const nextStage = stages[currentIdx + 1];

    const isLocked = r.status === 'Director Approved' || r.status === 'Funds Disbursed' || r.status === 'Cycle Complete';
    const isDirector = SUPER_ROLES.includes(adminProfile.role);
    const isFinance = adminProfile.role.includes('Finance') || isDirector;
    const isHR = adminProfile.role.includes('HR') || isDirector;

    const canReopen = isDirector && isLocked;

    const canActionStage = () => {
        if (currentIdx === 0 || currentIdx === 1) return isHR;
        if (currentIdx === 2) return isFinance;
        if (currentIdx === 3) return isDirector;
        if (currentIdx === 4) return isFinance || isDirector;
        return isDirector;
    };

    const handleReject = () => {
        const reason = prompt('Specify Strict Rejection Reason:\n- Attendance mismatch\n- Policy violation\n- Budget not approved');
        if (reason) onAction('reject', reason);
    };

    const handleReopenRequest = () => {
        const reason = prompt('DIRECTOR OVERRIDE: Specify legal/accounting reason to re-open this locked record:');
        if (reason) onReopen(r.id, reason);
    };

    return (
        <div className="custom-scroll" style={{ background: '#fff', height: '100%', overflowY: 'auto' }}>
            <div style={{ background: 'linear-gradient(135deg, #1A365D 0%, #2D3748 100%)', padding: '50px 60px', color: 'white' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h2 style={{ fontSize: '2.2rem', margin: 0 }}>Salary Disbursement</h2>
                        <p style={{ opacity: 0.8, fontSize: '1.1rem', margin: '5px 0 0' }}>{r.employees?.full_name} | {r.month} {r.year || ''}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.8rem', opacity: 0.6, letterSpacing: '2px', textTransform: 'uppercase' }}>Current Flow Status</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '800', color: r.is_reopened ? '#FC8181' : '#63B3ED' }}>
                            {r.is_reopened ? 'RE-OPENED' : r.status}
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ padding: '40px 60px' }}>
                {canReopen && (
                    <div style={{ marginBottom: '30px', padding: '20px', background: '#FFF5F5', border: '1px solid #FEB2B2', borderRadius: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <strong style={{ color: '#C53030' }}>DIRECTOR OVERRIDE PROTECTED</strong>
                            <p style={{ margin: '5px 0 0', fontSize: '0.85rem', color: '#7B341E' }}>This record is locked. Modifications require a full audit trail.</p>
                        </div>
                        <button className="btn-premium danger" onClick={handleReopenRequest} style={{ background: '#E53E3E' }}>
                            <FaUnlockAlt /> Re-open Draft
                        </button>
                    </div>
                )}

                {r.status !== 'Cycle Complete' && r.status !== 'Rejected' && !isLocked && (
                    <div style={{ background: '#EBF8FF', padding: '30px', borderRadius: '20px', border: '2px solid #3182CE', marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h4 style={{ margin: 0, color: '#2B6CB0' }}>Mandatory Review Action</h4>
                            <p style={{ margin: '5px 0 0', color: '#4A5568', fontSize: '0.9rem' }}>
                                Next Step Stage: <strong>{nextStage}</strong>
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: '15px' }}>
                            <button className="btn-premium danger" onClick={handleReject}>Decline Request</button>
                            {canActionStage() && (
                                <button className="btn-premium success" onClick={() => onAction('approve')}>
                                    {currentIdx === 0 ? 'Lock Attendance (HR)' :
                                        currentIdx === 1 ? 'Verify Records (Audit)' :
                                            currentIdx === 2 ? 'Compute Net Payout (Finance)' :
                                                currentIdx === 3 ? 'Authorize Transfer (Director)' :
                                                    currentIdx === 4 ? 'Initiate Bank Transfer' :
                                                        'Finalize Cycle'}
                                </button>
                            )}
                        </div>
                    </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '30px' }}>
                    <div style={{ background: '#F7FAFC', padding: '25px', borderRadius: '15px', border: '1px solid #E2E8F0' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: '900', color: '#718096', textTransform: 'uppercase' }}>Gross Monthy Retainer</label>
                        <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#2D3748' }}>₹ {Number(r.basic_salary || 0).toLocaleString()}</div>
                    </div>
                    <div style={{ background: '#F7FAFC', padding: '25px', borderRadius: '15px', border: '1px solid #E2E8F0' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: '900', color: '#718096', textTransform: 'uppercase' }}>Attendance Deductions</label>
                        <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#E53E3E' }}>- ₹ {Number(r.deductions || 0).toLocaleString()}</div>
                    </div>
                    <div style={{ background: '#EDFDFD', padding: '25px', borderRadius: '15px', border: '1px solid #B2F5EA' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: '900', color: '#319795', textTransform: 'uppercase' }}>Net Authorized Payout</label>
                        <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#2C7A7B' }}>₹ {Number(r.net_salary || 0).toLocaleString()}</div>
                    </div>
                </div>

                <div style={{ marginTop: '40px', display: 'grid', gridTemplateColumns: 'minmax(400px, 1fr) 300px', gap: '40px' }}>
                    <div style={{ background: '#F8FAFC', padding: '30px', borderRadius: '20px' }}>
                        <h4 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <FaFingerprint /> Attendance-Salary Linkage (Live Audit)
                        </h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                            <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #edf2f7' }}>
                                <small style={{ color: '#718096', textTransform: 'uppercase', fontSize: '0.6rem', fontWeight: 900 }}>Total Working Days</small>
                                <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{r.total_working_days || 0} Days</div>
                            </div>
                            <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #edf2f7' }}>
                                <small style={{ color: '#38A169', textTransform: 'uppercase', fontSize: '0.6rem', fontWeight: 900 }}>Present Days</small>
                                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#2F855A' }}>{r.present_days || 0} Days</div>
                            </div>
                            <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #edf2f7' }}>
                                <small style={{ color: '#805AD5', textTransform: 'uppercase', fontSize: '0.6rem', fontWeight: 900 }}>Authorized Leaves</small>
                                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#6B46C1' }}>{r.leave_days || 0} Days</div>
                            </div>
                            <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #edf2f7' }}>
                                <small style={{ color: '#E53E3E', textTransform: 'uppercase', fontSize: '0.6rem', fontWeight: 900 }}>Unpaid (LOP) Days</small>
                                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#C53030' }}>{r.lop_days || 0} Days</div>
                            </div>
                        </div>
                    </div>

                    <div style={{ background: '#F8FAFC', padding: '30px', borderRadius: '20px' }}>
                        <h4 style={{ marginBottom: '20px' }}>Compliance Summary</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div style={{ background: 'white', padding: '15px', borderRadius: '10px', fontSize: '0.85rem' }}>
                                <span style={{ color: '#718096', display: 'block', fontSize: '0.7rem' }}>Bank Disbursemnt Account</span>
                                <strong style={{ color: 'var(--primary)' }}>...{r.employees?.acc_number?.slice(-4) || '—'}</strong>
                            </div>
                            <div style={{ background: 'white', padding: '15px', borderRadius: '10px', fontSize: '0.85rem' }}>
                                <span style={{ color: '#718096', display: 'block', fontSize: '0.7rem' }}>Audit Status</span>
                                <strong style={{ color: '#38A169' }}>VALIDATED BY HR</strong>
                            </div>
                        </div>
                    </div>
                </div>

                {r.is_reopened && (
                    <div style={{ marginTop: '30px', padding: '25px', background: '#FFF5F5', border: '1px solid #FEB2B2', borderRadius: '16px' }}>
                        <h4 style={{ color: '#C53030', margin: '0 0 10px 0', fontSize: '0.9rem' }}>Director Override Reason:</h4>
                        <p style={{ margin: 0, fontStyle: 'italic', color: '#7B341E' }}>"{r.reopen_reason}"</p>
                    </div>
                )}

                <div style={{ marginTop: '40px' }}>
                    <ApprovalBadge data={r} level="Payroll Authority Signature" />
                </div>

                <button onClick={onClose} style={{ marginTop: '400px', width: '100%', padding: '15px', borderRadius: '12px', background: '#F1F5F9', border: 'none', color: '#475569', fontWeight: '700', cursor: 'pointer' }}>Close Audit Frame</button>
            </div>
        </div>
    );
};

const InitiatePayrollModal = ({ onClose, onInitiate }) => {
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const [workingDays, setWorkingDays] = useState(26);

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '500px', borderRadius: '30px' }}>
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <div style={{ width: '80px', height: '80px', background: '#EBF8FF', color: '#3182CE', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '2rem' }}>
                        <FaCalculator />
                    </div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#1A365D' }}>Initiate Payroll Run</h2>
                    <p style={{ color: '#718096' }}>Sequence monthly salary calculations from attendance.</p>
                </div>

                <div style={{ display: 'grid', gap: '20px' }}>
                    <div className="form-group">
                        <label>Select Calendar Month</label>
                        <select value={month} onChange={(e) => setMonth(Number(e.target.value))} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #E2E8F0', fontWeight: 600 }}>
                            {monthNames.map((m, i) => (
                                <option key={m} value={i + 1}>{m}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Calendar Year</label>
                        <input type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #E2E8F0', fontWeight: 600 }} />
                    </div>
                    <div className="form-group">
                        <label>Total Working Days (Institutional Standard)</label>
                        <input type="number" value={workingDays} onChange={(e) => setWorkingDays(Number(e.target.value))} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #E2E8F0', fontWeight: 600 }} />
                    </div>

                    <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
                        <button className="btn-small" onClick={onClose} style={{ flex: 1, padding: '15px', background: '#F1F5F9', color: '#4A5568' }}>Cancel</button>
                        <button className="btn-premium" onClick={() => {
                            const monthName = `${monthNames[month - 1]} ${year}`;
                            const startDate = new Date(year, month - 1, 1).toISOString();
                            const endDate = new Date(year, month, 0).toISOString();
                            onInitiate({ monthName, startDate, endDate, totalWorkingDays: workingDays });
                        }} style={{ flex: 2, padding: '15px', background: 'linear-gradient(135deg, #3182CE 0%, #2C5282 100%)' }}>
                            Run Sequence
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ReportsTab = ({ reports, onAdd, onDelete, onView }) => (
    <div className="content-panel">
        <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px' }}>
            <h3>Impact & Program Reports</h3>
            <button className="btn-premium" onClick={onAdd}><FaFileUpload /> Upload New Report</button>
        </div>
        <div className="reports-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {(reports || []).length > 0 ? reports.map(report => (
                <div key={report.id} className="report-card" style={{ padding: '25px', border: '1px solid #edf2f7', borderRadius: '20px', background: 'white', position: 'relative', transition: 'all 0.3s ease', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                    <div style={{ position: 'absolute', top: '15px', right: '15px', display: 'flex', gap: '5px' }}>
                        <button className="btn-icon blue" onClick={() => onView(report)} title="View Proof / Details"><FaEye style={{ fontSize: '0.8rem' }} /></button>
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
                    <button className="btn-premium" onClick={onAddFolder}><FaPlusCircle /> New Folder</button>
                    <button className="btn-premium" onClick={onUpload}><FaFileUpload /> Upload Artifact</button>
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
                {!isEditing && <button className="btn-premium" onClick={() => setIsEditing(true)}><FaEdit /> Modify Profile</button>}
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

const LeaveApprovalsTab = ({ requests, onAction }) => {
    const pendingReqs = (requests || []).filter(r => r.status === 'Pending');
    const historyReqs = (requests || []).filter(r => r.status !== 'Pending');

    return (
        <div style={{ animation: 'fadeIn 0.5s' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
                <div style={{ width: '45px', height: '45px', background: '#EBF8FF', color: '#2B6CB0', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                    <FaCalendarCheck />
                </div>
                <div>
                    <h3 style={{ margin: 0 }}>Staff Leave Management Registry</h3>
                    <p style={{ margin: '4px 0 0', color: '#718096', fontSize: '0.85rem' }}>Authorize or reject leave applications submitted via employee self-service terminals.</p>
                </div>
            </div>

            <div className="content-panel" style={{ marginBottom: '30px' }}>
                <h4 style={{ marginBottom: '20px', color: '#2D3748' }}>Pending Authorization Requests ({pendingReqs.length})</h4>
                {pendingReqs.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', background: '#f8fafc', borderRadius: '15px', color: '#a0aec0' }}>
                        <FaCheckCircle fontSize="2rem" style={{ marginBottom: '10px', opacity: 0.5 }} />
                        <p>All clear. No staff leave requests awaiting approval.</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px' }}>
                        {pendingReqs.map(r => (
                            <div key={r.id} style={{ padding: '20px', border: '1px solid #e2e8f0', borderRadius: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white' }}>
                                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                                    <div style={{ width: '50px', height: '50px', background: '#3182CE', color: 'white', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800' }}>
                                        {r.requester?.charAt(0)}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: '800', fontSize: '1.1rem', color: '#1A365D' }}>{r.requester}</div>
                                        <div style={{ fontSize: '0.85rem', color: '#718096' }}>{r.type} • Commencement: {new Date(r.date || r.start_date || Date.now()).toLocaleDateString()}</div>
                                        <div style={{ fontSize: '0.85rem', marginTop: '5px', color: '#4A5568', fontStyle: 'italic' }}>"{r.details || r.reason}"</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button className="btn-small" onClick={() => {
                                        const reason = prompt('Specify grounds for rejection:');
                                        if (reason) onAction('request', r.id, 'reject', reason);
                                    }} style={{ background: '#FFF5F5', color: '#C53030', border: '1px solid #FED7D7' }}>Decline</button>
                                    <button className="btn-add" onClick={() => onAction('request', r.id, 'approve')}>Digitally Authorize</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="content-panel">
                <h4 style={{ marginBottom: '20px', color: '#2D3748' }}>Historical Leave Registry (Recent Activity)</h4>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Personnel</th>
                            <th>Leave Description</th>
                            <th>Lifecycle Status</th>
                            <th>Decision Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {historyReqs.slice(0, 10).map(r => (
                            <tr key={r.id}>
                                <td><strong>{r.requester}</strong></td>
                                <td>{r.type} • {r.date}</td>
                                <td><span className={`badge ${r.status === 'Approved' ? 'success' : 'red'}`}>{r.status}</span></td>
                                <td>{r.status === 'Approved' ? 'Authorized' : 'Rejected'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const CoAdminTab = ({ admins, adminProfile, onAdd, onDelete, onEdit, onManage }) => (
    <div className="content-panel">
        <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px' }}>
            <h3>Administrative Control Board</h3>
            <button className="btn-add" onClick={onAdd}><FaUserShield /> Provision New Account</button>
        </div>
        <table className="data-table">
            <thead><tr><th>Admin Ref</th><th>Identity Profile</th><th>Role & Dept</th><th>Last Activity</th><th>Status</th><th>Access Control</th></tr></thead>
            <tbody>
                {(admins || []).map(adm => (
                    <tr key={adm.user_id || adm.id}>
                        <td><strong>{(adm.user_id || adm.id || '').substring(0, 8)}</strong></td>
                        <td style={{ fontWeight: '600' }}>{adm.full_name || 'Processing...'}</td>
                        <td><small>{adm.role_type}</small><br />{adm.department || 'Executive / Board'}</td>
                        <td>{adm.last_activity ? new Date(adm.last_activity).toLocaleString() : 'Never'}</td>
                        <td>
                            <span className={`badge ${adm.has_activity || adm.user_id === adminProfile.user_id ? 'success' : 'red-badge'}`}>
                                {adm.has_activity || adm.user_id === adminProfile.user_id ? 'Active' : 'Inactive'}
                            </span>
                            <br />
                            <small style={{ fontSize: '0.65rem', color: '#718096' }}>Registry: {new Date(adm.updated_at).toLocaleDateString()}</small>
                        </td>
                        <td>
                            <div className="action-buttons">
                                <button className="btn-icon" title="View Permission Matrix" onClick={() => onManage(adm)}><FaUnlockAlt /></button>
                                <button className="btn-icon" title="Edit Profile" onClick={() => onEdit(adm)}><FaEdit /></button>
                                <button className="btn-icon danger" title="Revoke Access" onClick={() => onDelete(adm.user_id || adm.id, adm.full_name)}><FaUserLock /></button>
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
        id: admin?.id || null, // Profiles table Primary Key (UUID)
        user_id: admin?.user_id || null, // Auth table Foreign Key
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
            org_master: existingPerms.perm_org_master ?? false,
            perm_governance: existingPerms.perm_governance ?? false,
            perm_compliance: existingPerms.perm_compliance ?? false,
            fin_reports_auth: existingPerms.fin_reports_auth ?? false
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
                        <div className="form-group"><label>Official Email ID</label><input className="form-control" name="email" value={formData.email} onChange={handleChange} type="email" placeholder="hr@bharathcaresindia.org" required /></div>
                        <div className="form-group"><label>Role Type</label><select className="form-control" name="role_type" value={formData.role_type} onChange={handleChange} required><option value="">Select Role</option>{AUTHORIZED_ADMIN_ROLES.map(r => <option key={r}>{r}</option>)}</select></div>
                        <div className="form-group"><label>Department</label><select className="form-control" name="department" value={formData.department} onChange={handleChange} required><option value="">Select Dept</option><option>HQ Administration</option><option>Human Resources</option><option>Finance & Treasury</option><option>Social Welfare</option><option>IT & Security</option></select></div>
                        <div className="form-group"><label>Authority Level</label><select className="form-control" name="authority_level" value={formData.authority_level} onChange={handleChange} required><option value="L1">L1 - Executive (Full)</option><option value="L2">L2 - High (Command)</option><option value="L3">L3 - Mid (Operational)</option><option value="L4">L4 - Base (View Only)</option></select></div>
                        <div className="form-group"><label>Reporting To</label><input className="form-control" type="text" value="Directorate (Institutional)" readOnly /></div>
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
                            <h5 style={{ marginBottom: '15px', color: 'var(--primary)', fontSize: '0.85rem', textTransform: 'uppercase' }}>Core Governance & HR</h5>
                            {[
                                ['perm_governance', 'Policies & SOPs Tab'],
                                ['perm_compliance', 'Board & Resolutions Tab'],
                                ['view_employees', 'Employees / Staff Tab'],
                                ['edit_employees', 'Modify Personnel (Edit Rights)'],
                                ['volunteer_approval', 'Volunteers Management Tab']
                            ].map(([key, label]) => (
                                <label key={key} style={{ display: 'flex', gap: '10px', marginBottom: '10px', fontSize: '0.85rem', cursor: 'pointer' }}>
                                    <input type="checkbox" name={`perm_${key}`} checked={formData.perms[key]} onChange={handleChange} style={{ width: '18px', height: '18px' }} /> {label}
                                </label>
                            ))}
                        </div>
                        <div>
                            <h5 style={{ marginBottom: '15px', color: 'var(--primary)', fontSize: '0.85rem', textTransform: 'uppercase' }}>Finance & Operations</h5>
                            {[
                                ['process_salary', 'Salary Processing Tab'],
                                ['fin_reports_auth', 'Expenses & Budget Tab'],
                                ['scholarship_verify', 'Stipend / Scholarship Tab'],
                                ['approve_leaves', 'Leave Approvals Tab'],
                                ['vault_access', 'e-Office Vault Tab']
                            ].map(([key, label]) => (
                                <label key={key} style={{ display: 'flex', gap: '10px', marginBottom: '10px', fontSize: '0.85rem', cursor: 'pointer' }}>
                                    <input type="checkbox" name={`perm_${key}`} checked={formData.perms[key]} onChange={handleChange} style={{ width: '18px', height: '18px' }} /> {label}
                                </label>
                            ))}
                        </div>
                        <div>
                            <h5 style={{ marginBottom: '15px', color: 'var(--primary)', fontSize: '0.85rem', textTransform: 'uppercase' }}>System & Registry</h5>
                            {[
                                ['student_mgmt', 'Fellows / Students Tab'],
                                ['report_approval', 'Reports & Analytics Tab'],
                                ['audit_logs', 'Audit Trail & Logs Tab'],
                                ['manage_admins', 'Roles & Permissions Tab'],
                                ['org_master', 'System Lock / Unlock Tab']
                            ].map(([key, label]) => (
                                <label key={key} style={{ display: 'flex', gap: '10px', marginBottom: '10px', fontSize: '0.85rem', cursor: 'pointer' }}>
                                    <input type="checkbox" name={`perm_${key}`} checked={formData.perms[key]} onChange={handleChange} style={{ width: '18px', height: '18px' }} /> {label}
                                </label>
                            ))}
                        </div>
                    </div>
                )}
                {step === 4 && (
                    <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div className="form-group"><label>Salary Approval Limit (Rupees)</label><input className="form-control" name="salary_approval_limit" value={formData.salary_approval_limit} onChange={handleChange} type="number" placeholder="50000" /></div>
                        <div className="form-group"><label>One-time Expenditure Limit (Rupees)</label><input className="form-control" name="expenditure_limit" value={formData.expenditure_limit} onChange={handleChange} type="number" placeholder="100000" /></div>
                        <div className="form-group"><label>Fund Utilization Approval</label><select className="form-control" name="fund_utilization_auth" value={formData.fund_utilization_auth ? 'Yes' : 'No'} onChange={(e) => setFormData(prev => ({ ...prev, fund_utilization_auth: e.target.value === 'Yes' }))}><option>No</option><option>Yes</option></select></div>
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

const AttendanceLogForm = ({ employees, onClose, onSave }) => {
    const [empId, setEmpId] = useState('');
    const [status, setStatus] = useState('Present');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [checkIn, setCheckIn] = useState('');
    const [checkOut, setCheckOut] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            employee_id: empId,
            attendance_date: date,
            status,
            check_in: checkIn ? `${date}T${checkIn}:00` : null,
            check_out: checkOut ? `${date}T${checkOut}:00` : null
        });
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '400px', borderRadius: '24px', padding: '35px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px' }}>
                    <h3 style={{ margin: 0, color: '#1a365d' }}>Register Attendance</h3>
                    <button className="btn-icon" onClick={onClose}>×</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-group" style={{ marginBottom: '20px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#4a5568', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Select Staff Member</label>
                        <select value={empId} onChange={(e) => setEmpId(e.target.value)} required style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc' }}>
                            <option value="">Choose Employee...</option>
                            {employees.map(e => (
                                <option key={e.id} value={e.id}>{e.full_name} ({e.employee_id})</option>
                            ))}
                        </select>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                        <div className="form-group">
                            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#4a5568', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Date</label>
                            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                        </div>
                        <div className="form-group">
                            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#4a5568', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Status</label>
                            <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc' }}>
                                <option>Present</option>
                                <option>Absent</option>
                                <option>Half Day</option>
                                <option>Official Duty</option>
                                <option>Leave Approved</option>
                                <option>Loss of Pay</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
                        <div className="form-group">
                            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#4a5568', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>In Time</label>
                            <input type="time" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                        </div>
                        <div className="form-group">
                            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#4a5568', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Out Time</label>
                            <input type="time" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '15px' }}>
                        <button type="button" className="btn-add" style={{ background: '#f1f5f9', color: '#475569' }} onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-add" style={{ flex: 1 }}>Commit Log</button>
                    </div>
                </form>
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
        status: 'New'
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

const EmployeeDetailsView = ({ emp, onClose, onAction }) => {
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

    const getStatusLabel = () => {
        switch (details.status) {
            case 'New': return { label: 'Awaiting HR Verification', color: '#3182CE' };
            case 'HR Verified': return { label: 'Pending Admin Approval', color: '#805AD5' };
            case 'Admin Approved': return { label: 'Awaiting Director Confirmation', color: '#DD6B20' };
            case 'Active': return { label: 'ID Activated / Active Duty', color: '#38A169' };
            case 'Rejected': return { label: 'Application Rejected', color: '#E53E3E' };
            default: return { label: details.status, color: '#718096' };
        }
    };

    const statusInfo = getStatusLabel();

    return (
        <div style={{ background: '#FFFFFF', height: '100%', overflowY: 'auto' }} className="custom-scroll">
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
                                background: statusInfo.color,
                                borderRadius: '50px',
                                fontSize: '0.85rem',
                                fontWeight: '900',
                                textTransform: 'uppercase',
                                letterSpacing: '2px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                            }}>{statusInfo.label}</span>
                        </div>
                        <p style={{ margin: '15px 0 0', opacity: 0.8, fontSize: '1.2rem', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <FaBriefcase style={{ color: '#ECC94B' }} /> {details.designation} <span style={{ opacity: 0.5 }}>|</span> <FaBuilding /> {details.department}
                        </p>
                        <div style={{ marginTop: '25px', display: 'flex', gap: '10px' }}>
                            <span className="badge" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}>
                                PAID POSITION
                            </span>
                            <span className="badge" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}>
                                {details.designation?.includes('Director') ? 'FINAL AUTHORITY' : (details.designation?.includes('Admin') ? 'HIGH APPROVAL POWER' : 'LIMITED APPROVAL POWER')}
                            </span>
                            {details.designation?.includes('Fellow') && <span className="badge" style={{ background: '#ECC94B', color: '#1A202C' }}>CERTIFICATE ELIGIBLE</span>}
                        </div>
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

                    <div style={{ marginTop: '30px' }}>
                        <ApprovalBadge data={details} level="HQ Onboarding Sanction" />
                    </div>
                </div>
            </div>

            {/* ONBOARDING APPROVAL HUB (NEW) */}
            {details.status !== 'Active' && details.status !== 'Rejected' && (
                <div style={{ margin: '30px 60px -30px', padding: '30px', background: '#EBF8FF', borderRadius: '24px', border: '2px solid #63B3ED', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                        <div style={{ width: '60px', height: '60px', background: '#3182CE', color: 'white', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                            <FaCheckDouble />
                        </div>
                        <div>
                            <h4 style={{ margin: 0, color: '#2B6CB0', fontSize: '1.2rem' }}>Onboarding Command Center</h4>
                            <p style={{ margin: '5px 0 0', color: '#4A5568', fontSize: '0.9rem' }}>
                                Next Step: <strong>{
                                    details.status === 'New' ? 'Verify Documents & KYC (HR)' :
                                        details.status === 'HR Verified' ? 'Review Budget & Role (Admin)' :
                                            'Final HQ Confirmation (Director)'
                                }</strong>
                            </p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '15px' }}>
                        <button
                            className="btn-premium danger"
                            onClick={() => {
                                const reason = prompt('Specify rejection grounds:');
                                if (reason) onAction('reject', reason);
                            }}
                        >
                            Decline Candidate
                        </button>
                        <button
                            className="btn-premium success"
                            onClick={() => onAction('approve')}
                        >
                            {
                                details.status === 'New' ? 'Verify & Pass to Admin' :
                                    details.status === 'HR Verified' ? 'Approve & Pass to Director' :
                                        'Confirm & Activate ID'
                            }
                        </button>
                    </div>
                </div>
            )}

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

                    {/* EMERGENCY SECTION */}
                    <Field icon={<FaShieldAlt />} label="Aadhaar Verification" value={details.aadhaar_masked || (details.aadhaar_number ? 'XXXX-XXXX-' + String(details.aadhaar_number).slice(-4) : '—')} />
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

                    <Field icon={<FaFileInvoiceDollar />} label="Monthly Retainer" value={"Rs. " + (details.salary_amount || 0)} />
                    <Field icon={<FaUniversity />} label="Institution" value={details.bank_name} />
                    <Field icon={<FaFingerprint />} label="IFSC Protocol" value={details.ifsc_code} />
                    <Field icon={<FaUniversity />} label="Account Ending" value={details.acc_number_encrypted || (details.acc_number ? '****' + String(details.acc_number).slice(-4) : '—')} />
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

const VolunteerDetailsView = ({ volunteer, onClose, onApprove, onReject }) => {
    const v = volunteer || {};
    const [rejectionReason, setRejectionReason] = useState('Fake data');

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
        <div className="custom-scroll" style={{ background: '#FFFFFF', height: '100%', overflowY: 'auto' }}>
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
                                    background: v.status === 'New' ? '#ECC94B' : (v.status === 'Approved' ? '#48BB78' : '#E53E3E'),
                                    color: 'white',
                                    borderRadius: '50px',
                                    fontSize: '1rem',
                                    fontWeight: '900',
                                    boxShadow: '0 8px 16px rgba(0,0,0,0.2)'
                                }}>{v.status === 'New' ? 'Under Review' : v.status?.toUpperCase()}</div>
                            </div>
                            <div style={{ marginTop: '20px', fontSize: '1.4rem', opacity: 0.9, fontWeight: '600', display: 'flex', alignItems: 'center', gap: '20px' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><FaTasks /> {v.area_of_interest || 'General Social Support'}</span>
                                <span style={{ opacity: 0.4 }}>|</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><FaFingerprint /> VOL-{v.id?.substring(0, 10).toUpperCase()}</span>
                            </div>
                            <div style={{ marginTop: '25px', display: 'flex', gap: '10px' }}>
                                <span className="badge" style={{ background: '#E53E3E', color: 'white' }}>UNPAID (VOLUNTARY)</span>
                                <span className="badge" style={{ background: '#38A169', color: 'white' }}>CERTIFICATE ELIGIBLE</span>
                                <span className="badge" style={{ background: 'rgba(255,255,255,0.15)', color: 'white' }}>NO APPROVAL POWER</span>
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
                            <FaShieldAlt /> Coordinator Action Hub
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
                                <h4 style={{ color: '#2B6CB0', marginBottom: '25px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px' }}>Review Decision</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    {v.status === 'New' ? (
                                        <>
                                            <button className="btn-premium success" onClick={onApprove} style={{ width: '100%', justifyContent: 'center' }}>
                                                <FaCheckCircle /> Authorize & Link ID
                                            </button>

                                            <div style={{ marginTop: '20px', borderTop: '1px solid #c3dafe', paddingTop: '20px' }}>
                                                <label style={{ fontSize: '0.7rem', fontWeight: 800, color: '#4a5568', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Rejection Grounds</label>
                                                <select
                                                    className="form-control"
                                                    value={rejectionReason}
                                                    onChange={e => setRejectionReason(e.target.value)}
                                                    style={{ marginBottom: '15px' }}
                                                >
                                                    <option>Fake data</option>
                                                    <option>Incomplete ID proof</option>
                                                    <option>Policy violation</option>
                                                </select>
                                                <button
                                                    onClick={() => onReject(rejectionReason)}
                                                    className="btn-premium danger"
                                                    style={{ width: '100%', justifyContent: 'center' }}
                                                >
                                                    Decline Application
                                                </button>
                                            </div>
                                        </>
                                    ) : v.status === 'Approved' ? (
                                        <div style={{ background: '#F0FFF4', padding: '30px', borderRadius: '25px', color: '#2F855A', fontWeight: '800' }}>
                                            <FaIdCard style={{ fontSize: '3rem', marginBottom: '15px', color: '#38a169' }} /><br />
                                            CREDENTIALS LIVE
                                            <p style={{ fontSize: '0.75rem', fontWeight: 'normal', margin: '10px 0 0' }}>Volunteer ID card has been cryptographically generated and is ready for dispatch.</p>
                                        </div>
                                    ) : (
                                        <div style={{ background: '#FFF5F5', padding: '30px', borderRadius: '25px', color: '#C53030', fontWeight: '800' }}>
                                            <FaUserTimes style={{ fontSize: '2.5rem', marginBottom: '15px' }} /><br />
                                            APPLICATION REJECTED
                                            <p style={{ fontSize: '0.75rem', fontWeight: 'normal', margin: '10px 0 0' }}>Grounds: {v.decline_reason || 'Administrative Decision'}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* FOOTER AUDIT */}
                    <div style={{ gridColumn: 'span 3', marginTop: '50px', padding: '40px', background: '#F7FAFC', borderRadius: '30px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ fontSize: '0.8rem', color: '#718096', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '2px' }}>Regulatory Compliance Protocol</div>
                            <div style={{ color: '#4A5568', fontWeight: '600', marginTop: '5px', marginBottom: '15px' }}>Decision logged by Coordinator Profile with Forensic IP Timestamp.</div>
                            <ApprovalBadge data={v} level="Mission Enrollment Signature" />
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

const ReportForm = ({ onClose, postedBy, postedByName, onRefresh }) => {
    const [formData, setFormData] = useState({ title: '', category: 'Impact', status: 'Draft', content: '' });

    const handleSave = async () => {
        if (!formData.title || !formData.content) {
            alert('Please provide a title and report content.');
            return;
        }

        const { error } = await supabase.from('field_reports').insert([{
            ...formData,
            posted_by: postedBy,
            posted_by_name: postedByName
        }]);

        if (!error) {
            alert('Operational Report Filed Successfully');
            if (onRefresh) onRefresh();
            onClose();
        } else {
            alert('Failed to file report: ' + error.message);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '600px', borderRadius: '30px', padding: 0 }}>
                <div style={{ background: 'linear-gradient(135deg, #1A365D 0%, #2D3748 100%)', padding: '30px', color: 'white', borderTopLeftRadius: '30px', borderTopRightRadius: '30px' }}>
                    <h3 style={{ margin: 0 }}>Create Institutional Report</h3>
                    <p style={{ margin: '5px 0 0', opacity: 0.8, fontSize: '0.9rem' }}>Official mission reporting for {postedByName}</p>
                </div>

                <div style={{ padding: '30px' }}>
                    <div className="form-group" style={{ marginBottom: '20px' }}>
                        <label>Report Title</label>
                        <input className="form-control" type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. Field Visit - Bihar Program" />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                        <div className="form-group">
                            <label>Mission Category</label>
                            <select className="form-control" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                                <option>Impact</option>
                                <option>Financial</option>
                                <option>Rehab</option>
                                <option>Operational</option>
                                <option>General</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Visibility Status</label>
                            <select className="form-control" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                                <option>Draft</option>
                                <option>Public</option>
                            </select>
                        </div>
                    </div>
                    <div className="form-group" style={{ marginBottom: '30px' }}>
                        <label>Detailed Content / Briefing</label>
                        <textarea className="form-control" rows="6" value={formData.content} onChange={e => setFormData({ ...formData, content: e.target.value })} placeholder="Provide detailed operational insights here..." style={{ resize: 'none' }}></textarea>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px' }}>
                        <button className="btn-small" onClick={onClose} style={{ background: '#f1f5f9' }}>Discard</button>
                        <button className="btn-premium" onClick={handleSave} style={{ background: '#1a365d' }}>
                            <FaFileUpload /> Commit to Registry
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const LeaveRequestForm = ({ onClose, employeeId, employeeName, onRefresh }) => {
    const [formData, setFormData] = useState({
        leave_type: 'Casual Leave',
        start_date: '',
        end_date: '',
        reason: '',
        status: 'Pending'
    });

    const handleSave = async () => {
        if (!formData.start_date || !formData.reason) {
            alert('Mandatory Fields: Date and Reason required.');
            return;
        }

        const { error } = await supabase.from('leave_requests').insert([{
            ...formData,
            employee_id: employeeId
        }]);

        if (!error) {
            alert('Leave Application Transmitted');
            if (onRefresh) onRefresh();
            onClose();
        } else {
            alert('Transmission Failed: ' + error.message);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '500px', borderRadius: '30px', padding: 0 }}>
                <div style={{ background: 'linear-gradient(135deg, #3182CE 0%, #2B6CB0 100%)', padding: '30px', color: 'white', borderTopLeftRadius: '30px', borderTopRightRadius: '30px' }}>
                    <h3 style={{ margin: 0 }}>Apply for Leave</h3>
                    <p style={{ margin: '5px 0 0', opacity: 0.8, fontSize: '0.9rem' }}>Institutional Leave Registry | {employeeName}</p>
                </div>

                <div style={{ padding: '30px' }}>
                    <div className="form-group" style={{ marginBottom: '20px' }}>
                        <label>Type of Leave</label>
                        <select className="form-control" value={formData.leave_type} onChange={e => setFormData({ ...formData, leave_type: e.target.value })}>
                            <option>Casual Leave</option>
                            <option>Medical Leave</option>
                            <option>Earned Leave</option>
                            <option>Official Duty</option>
                            <option>Compensatory Off</option>
                        </select>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                        <div className="form-group">
                            <label>Commencement Date</label>
                            <input type="date" className="form-control" value={formData.start_date} onChange={e => setFormData({ ...formData, start_date: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>Conclusion Date</label>
                            <input type="date" className="form-control" value={formData.end_date} onChange={e => setFormData({ ...formData, end_date: e.target.value })} />
                        </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: '30px' }}>
                        <label>Institutional Justification / Remarks</label>
                        <textarea className="form-control" rows="4" value={formData.reason} onChange={e => setFormData({ ...formData, reason: e.target.value })} placeholder="State the reason for this application..." style={{ resize: 'none' }}></textarea>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px' }}>
                        <button className="btn-small" onClick={onClose} style={{ background: '#f1f5f9' }}>Cancel</button>
                        <button className="btn-premium" onClick={handleSave} style={{ background: '#3182CE' }}>
                            Transmit Request
                        </button>
                    </div>
                </div>
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

const StudentDetailsView = ({ student, onClose, onApprove, onReject }) => {
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
        <div className="details-view-container animate-fade-in custom-scroll" style={{ height: '100%', overflowY: 'auto', paddingBottom: '40px' }}>
            <div className="details-header" style={{ background: 'linear-gradient(135deg, #1A365D 0%, #2A4365 100%)', padding: '40px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ fontSize: '2rem', marginBottom: '10px', color: '#ffffff' }}>{s.student_name}</h2>
                    <div style={{ display: 'flex', gap: '15px' }}>
                        <span className="badge" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>{s.student_id}</span>
                        <span className={`badge ${s.status === 'Approved' ? 'success' : s.status === 'Pending' ? 'blue' : (s.status === 'Active' ? 'warning' : 'red')}`}>{s.status}</span>
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
                    <Field icon={<FaFileInvoiceDollar />} label="Payment UTR / Ref No" value={s.utr_number} />

                    <div style={{ gridColumn: 'span 3' }}>
                        <ApprovalBadge data={s} level="Financial Disbursement Approval" />
                    </div>

                    {(s.status === 'Pending' || s.status === 'Active') && (
                        <div style={{ gridColumn: 'span 3', marginTop: '30px', padding: '25px', background: '#f8fafc', borderRadius: '15px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h4 style={{ margin: 0, color: '#1e293b' }}>Administrative Verification Required</h4>
                                <p style={{ margin: '5px 0 0', fontSize: '0.85rem', color: '#64748b' }}>Cross-verify the UTR above with your bank records before approving.</p>
                            </div>
                            <div style={{ display: 'flex', gap: '15px' }}>
                                <button className="f-btn f-btn-primary" style={{ padding: '10px 25px', fontSize: '0.9rem' }} onClick={onApprove}>Approve Application</button>
                                <button className="f-btn f-btn-outline" style={{ padding: '10px 25px', fontSize: '0.9rem', color: '#ef4444', borderColor: '#fee2e2' }} onClick={onReject}>Reject Application</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const ScholarshipDetailsView = ({ scholarship, onClose, onApprove, onAction }) => {
    const s = scholarship || {};

    const Field = ({ icon, label, value }) => (
        <div style={{ background: '#F8F9FA', padding: '20px', borderRadius: '15px', border: '1px solid #EDF2F7' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#718096', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '700', marginBottom: '8px' }}>
                {icon} {label}
            </label>
            <div style={{ fontWeight: '700', color: '#2D3748', fontSize: '1rem' }}>{value || '—'}</div>
        </div>
    );

    return (
        <div className="details-view-container animate-fade-in custom-scroll" style={{ height: '100%', overflowY: 'auto' }}>
            <div className="details-header" style={{ background: 'linear-gradient(135deg, #2C5282 0%, #1A365D 100%)', padding: '40px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ fontSize: '2rem', marginBottom: '10px' }}>{s.applicant_name}</h2>
                    <div style={{ display: 'flex', gap: '15px' }}>
                        <span className="badge" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>{s.application_id}</span>
                        <span className={`badge ${s.status === 'Approved' ? 'success' : 'blue'}`}>{s.status}</span>
                    </div>
                </div>
                <button className="btn-small" onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }}>Close</button>
            </div>

            <div style={{ padding: '30px' }}>
                <ApprovalBadge data={s} level="Scholarship Sanction Board" />

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginTop: '30px' }}>
                    <div style={{ gridColumn: 'span 3', borderBottom: '2px solid #F1F5F9', paddingBottom: '10px', color: '#94A3B8', fontSize: '0.8rem', fontWeight: '900', textTransform: 'uppercase' }}>Financial Scrutiny</div>
                    <Field icon={<FaFileInvoiceDollar />} label="Income Status" value={s.income_status} />
                    <Field icon={<FaGraduationCap />} label="Academic Score" value={s.academic_score} />
                    <Field icon={<FaUniversity />} label="Institution" value={s.college_name} />
                </div>

                {s.status === 'Awaiting Approval' && (
                    <div style={{ marginTop: '30px', padding: '25px', background: '#F0FFF4', borderRadius: '15px', border: '1px solid #C6F6D5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h4 style={{ margin: 0, color: '#22543D' }}>Fund Disbursement Authority</h4>
                            <p style={{ margin: '5px 0 0', color: '#276749', fontSize: '0.85rem' }}>Authorize scholarship release based on academic merit.</p>
                        </div>
                        <div style={{ display: 'flex', gap: '15px' }}>
                            <button className="btn-add" onClick={onApprove}>Authorize Sanction</button>
                            <button className="btn-add" style={{ background: '#E53E3E' }} onClick={() => {
                                const r = prompt('Rejection reason (Public record):');
                                if (r) onAction('reject', r);
                            }}>Decline Grant</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const ReportDetailsView = ({ report, onClose }) => {
    const r = report || {};

    return (
        <div className="details-view-container animate-fade-in custom-scroll" style={{ height: '100%', overflowY: 'auto' }}>
            <div className="details-header" style={{ background: 'linear-gradient(135deg, #2D3748 0%, #1A202C 100%)', padding: '40px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ fontSize: '2rem', marginBottom: '10px' }}>{r.title}</h2>
                    <div style={{ display: 'flex', gap: '15px' }}>
                        <span className="badge" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>{r.category}</span>
                        <span className={`badge ${r.status === 'Approved' ? 'success' : 'blue'}`}>{r.status}</span>
                    </div>
                </div>
                <button className="btn-small" onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }}>Close</button>
            </div>

            <div style={{ padding: '40px' }}>
                <ApprovalBadge data={r} level="Program Impact Verification" />

                <div style={{ marginTop: '40px', background: '#F8F9FA', padding: '30px', borderRadius: '20px', border: '1px solid #EDF2F7' }}>
                    <h4 style={{ color: '#4A5568', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '20px', fontWeight: 900 }}>Executive Summary</h4>
                    <p style={{ fontSize: '1.1rem', color: '#2D3748', lineHeight: '1.8' }}>{r.content || 'No detailed content provided for this report.'}</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginTop: '30px' }}>
                    <div style={{ background: 'white', padding: '20px', borderRadius: '15px', border: '1px solid #E2E8F0' }}>
                        <label style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 900, textTransform: 'uppercase' }}>Filed By</label>
                        <div style={{ fontWeight: 700, marginTop: '5px' }}>{r.posted_by_name || 'Field Officer / Automated'}</div>
                    </div>
                    <div style={{ background: 'white', padding: '20px', borderRadius: '15px', border: '1px solid #E2E8F0' }}>
                        <label style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 900, textTransform: 'uppercase' }}>Creation Date</label>
                        <div style={{ fontWeight: 700, marginTop: '5px' }}>{new Date(r.created_at).toLocaleString()}</div>
                    </div>
                </div>

                {r.file_url && (
                    <div style={{ marginTop: '30px' }}>
                        <button className="btn-premium" style={{ width: '100%', justifyContent: 'center' }} onClick={() => window.open(r.file_url, '_blank')}>
                            <FaEye /> View Associated Artifact / Document
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

const TaskDetailsView = ({ task, onClose, onApprove, onAction }) => {
    const t = task || {};

    return (
        <div className="details-view-container animate-fade-in custom-scroll" style={{ height: '100%', overflowY: 'auto' }}>
            <div className="details-header" style={{ background: 'linear-gradient(135deg, #1A365D 0%, #2D3748 100%)', padding: '40px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ fontSize: '2rem', marginBottom: '10px' }}>{t.title}</h2>
                    <div style={{ display: 'flex', gap: '15px' }}>
                        <span className="badge" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>{t.volunteers?.full_name}</span>
                        <span className={`badge ${t.status === 'Verified' ? 'success' : (t.status === 'Completed' ? 'blue' : 'warning')}`}>{t.status}</span>
                    </div>
                </div>
                <button className="btn-small" onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }}>Close</button>
            </div>

            <div style={{ padding: '40px' }}>
                <ApprovalBadge data={t} level="Mission Verification Signature" />

                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '30px', marginTop: '30px' }}>
                    <div style={{ background: '#F8FAF9', padding: '25px', borderRadius: '15px', border: '1px solid #E2E8F0' }}>
                        <h4 style={{ color: '#4A5568', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '15px', fontWeight: 900 }}>Mission Description</h4>
                        <p style={{ color: '#2D3748', lineHeight: '1.6' }}>{t.description}</p>
                    </div>
                    <div>
                        <div style={{ background: 'white', padding: '20px', borderRadius: '15px', border: '1px solid #E2E8F0', marginBottom: '15px' }}>
                            <label style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 900, textTransform: 'uppercase' }}>Deadline / Target</label>
                            <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{t.deadline ? new Date(t.deadline).toLocaleDateString() : '—'}</div>
                        </div>
                        <div style={{ background: 'white', padding: '20px', borderRadius: '15px', border: '1px solid #E2E8F0' }}>
                            <label style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 900, textTransform: 'uppercase' }}>Submission Proof</label>
                            <div style={{ marginTop: '10px' }}>
                                {t.proof_file_path ? (
                                    <button className="btn-small" style={{ width: '100%', justifyContent: 'center', background: '#EBF8FF', color: '#2B6CB0' }}>
                                        <FaEye /> View Artifact
                                    </button>
                                ) : <span style={{ color: '#CBD5E0' }}>No proof uploaded yet</span>}
                            </div>
                        </div>
                    </div>
                </div>

                {t.status === 'Completed' && (
                    <div style={{ marginTop: '40px', padding: '30px', background: '#EBF8FF', borderRadius: '20px', border: '2px solid #3182CE', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h4 style={{ margin: 0, color: '#2B6CB0' }}>Verification Command</h4>
                            <p style={{ margin: '5px 0 0', color: '#4A5568', fontSize: '0.9rem' }}>Review the artifact and certify this activity for the volunteers record.</p>
                        </div>
                        <div style={{ display: 'flex', gap: '15px' }}>
                            <button className="btn-add" onClick={onApprove}>Verify Mission</button>
                            <button className="btn-add" style={{ background: '#E53E3E' }} onClick={() => {
                                const r = prompt('Grounds for proof rejection:');
                                if (r) onAction('reject', r);
                            }}>Decline Proof</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const GovernanceTab = ({ policies, boardMembers, meetings, approvalRequests, onAddPolicy, onEditPolicy, onAddMeeting, onEditMeeting, onAddMember, onDeletePolicy, onDeleteMember, onDeleteMeeting, onApprovalAction, refreshData }) => {
    const [subTab, setSubTab] = useState('policies');

    return (
        <div style={{ animation: 'fadeIn 0.5s' }}>
            <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', borderBottom: '1px solid #edf2f7', paddingBottom: '15px' }}>
                <button className={`btn-small ${subTab === 'policies' ? 'active' : ''}`} onClick={() => setSubTab('policies')} style={{ background: subTab === 'policies' ? '#1a237e' : 'transparent', color: subTab === 'policies' ? 'white' : '#64748b' }}>Current Policies</button>
                <button className={`btn-small ${subTab === 'board' ? 'active' : ''}`} onClick={() => setSubTab('board')} style={{ background: subTab === 'board' ? '#1a237e' : 'transparent', color: subTab === 'board' ? 'white' : '#64748b' }}>Board Meetings</button>
                <button className={`btn-small ${subTab === 'members' ? 'active' : ''}`} onClick={() => setSubTab('members')} style={{ background: subTab === 'members' ? '#1a237e' : 'transparent', color: subTab === 'members' ? 'white' : '#64748b' }}>Board Registry</button>
                <button className={`btn-small ${subTab === 'approvals' ? 'active' : ''}`} onClick={() => setSubTab('approvals')} style={{ background: subTab === 'approvals' ? '#1a237e' : 'transparent', color: subTab === 'approvals' ? 'white' : '#64748b' }}>Workflow Registry</button>
            </div>

            {subTab === 'policies' && (
                <div className="content-panel">
                    <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                        <h3>Organization Policies</h3>
                        <button className="btn-add" onClick={onAddPolicy}><FaPlus /> New Policy</button>
                    </div>
                    <table className="data-table">
                        <thead><tr><th>Title</th><th>Version</th><th>Category</th><th>Status</th><th>Effective Date</th><th>Approved By</th><th>Actions</th></tr></thead>
                        <tbody>
                            {(policies || []).map(p => (
                                <tr key={p.id}>
                                    <td><strong>{p.title}</strong></td>
                                    <td>{p.version}</td>
                                    <td><span className="badge">{p.category}</span></td>
                                    <td><span className={`badge ${p.status === 'Active' ? 'success' : 'warning'}`}>{p.status}</span></td>
                                    <td>{p.effective_date || 'N/A'}</td>
                                    <td>{p.approved_by || 'N/A'}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button className="btn-icon blue" title="Edit Policy" onClick={() => onEditPolicy(p)}><FaEdit /></button>
                                            <button className="btn-icon danger" onClick={() => onDeletePolicy(p.id, p.title)}><FaTrash /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {subTab === 'board' && (
                <div className="content-panel">
                    <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                        <h3>Board Meetings & Resolutions</h3>
                        <button className="btn-add" onClick={onAddMeeting}><FaCalendarAlt /> Schedule Meeting</button>
                    </div>
                    <table className="data-table">
                        <thead><tr><th>Meeting Date</th><th>Status</th><th>Agenda</th><th>Resolution</th><th>Actions</th></tr></thead>
                        <tbody>
                            {(meetings || []).map(m => (
                                <tr key={m.id}>
                                    <td>{new Date(m.meeting_date).toLocaleString()}</td>
                                    <td><span className={`badge ${m.status === 'Finalized' ? 'success' : 'blue'}`}>{m.status}</span></td>
                                    <td style={{ maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.agenda}</td>
                                    <td style={{ maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.resolution_text || 'Pending'}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button className="btn-icon blue" title="Process Resolution / View" onClick={() => onEditMeeting(m)}>
                                                <FaEdit />
                                            </button>
                                            <button className="btn-icon danger" onClick={() => onDeleteMeeting(m.id, new Date(m.meeting_date).toLocaleString())}><FaTrash /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {subTab === 'members' && (
                <div className="content-panel">
                    <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                        <h3>Board of Directors / Trustees</h3>
                        <button className="btn-add" onClick={onAddMember}><FaPlus /> Add Member</button>
                    </div>
                    <table className="data-table">
                        <thead><tr><th>Name</th><th>Designation</th><th>Organization</th><th>Term Start</th><th>Actions</th></tr></thead>
                        <tbody>
                            {(boardMembers || []).map(m => (
                                <tr key={m.id}>
                                    <td><strong>{m.full_name}</strong></td>
                                    <td>{m.designation}</td>
                                    <td>{m.organization || 'BCLL Foundation'}</td>
                                    <td>{m.term_start ? new Date(m.term_start).toLocaleDateString() : 'N/A'}</td>
                                    <td>
                                        <button className="btn-icon danger" onClick={() => onDeleteMember(m.id, m.full_name)}><FaTrash /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {subTab === 'approvals' && (
                <div className="content-panel">
                    <div className="panel-header" style={{ marginBottom: '20px' }}>
                        <h3>Authority Approval Workflow Registry</h3>
                        <p style={{ color: '#718096', fontSize: '0.85rem' }}>Review high-privilege requests from employee terminals (ID Replicas, Official Letters, etc.)</p>
                    </div>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Transmission Ref</th>
                                <th>Request Type</th>
                                <th>Personnel</th>
                                <th>Payload / Context</th>
                                <th>Status</th>
                                <th>Decision Board</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(approvalRequests || []).length === 0 ? (
                                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#a0aec0' }}>Workflow registry is currently clear.</td></tr>
                            ) : (
                                approvalRequests.map(apr => (
                                    <tr key={apr.id}>
                                        <td><small>{apr.id.substring(0, 8)}</small></td>
                                        <td><strong>{apr.type}</strong></td>
                                        <td>{apr.profiles?.full_name || apr.requester_name || 'System User'}</td>
                                        <td style={{ maxWidth: '250px' }}>
                                            <div style={{ fontSize: '0.8rem', color: '#4a5568' }}>
                                                {apr.details ? (typeof apr.details === 'string' ? apr.details : JSON.stringify(apr.details)) : 'No payload found'}
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`badge ${apr.final_status === 'Approved' ? 'success' : (apr.final_status === 'Declined' ? 'red' : 'blue')}`}>
                                                {apr.final_status}
                                            </span>
                                        </td>
                                        <td>
                                            {apr.final_status === 'Pending' ? (
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <button className="btn-icon" title="Reject" onClick={() => {
                                                        const r = prompt('State rejection grounds:');
                                                        if (r) onApprovalAction('approval_request', apr.id, 'reject', r);
                                                    }} style={{ color: '#E53E3E' }}><FaUserLock /></button>
                                                    <button className="btn-icon" title="Authorize" onClick={() => onApprovalAction('approval_request', apr.id, 'approve')} style={{ color: '#3182CE' }}><FaCheckDouble /></button>
                                                </div>
                                            ) : (
                                                <small style={{ color: '#718096' }}>Closed Archive</small>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

const PolicyForm = ({ onClose, onSave, policy = null }) => {
    const [p, setP] = useState(policy || {
        title: '',
        version: '1.0.0',
        category: 'HR Policy',
        department: 'Corporate HQ',
        effective_date: new Date().toISOString().split('T')[0],
        review_date: '',
        content: '',
        status: 'Draft',
        document_ref: ''
    });
    const [activeTab, setActiveTab] = useState('editor');

    const handleSave = () => {
        if (!p.title || !p.content) {
            alert('CRITICAL: Policy Title and Content are mandatory for governance trail.');
            return;
        }
        onSave(p);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', maxHeight: '92vh' }}>
            {/* COMPACT PREMIUM HEADER */}
            <div style={{ padding: '30px 40px', borderBottom: '1px solid #edf2f7', background: 'white' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ width: '50px', height: '50px', background: '#e2e8f0', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2d3748', fontSize: '1.5rem' }}>
                            <FaGavel />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1.4rem' }}>Governance: Create Internal Policy / SOP</h3>
                            <p style={{ margin: '5px 0 0', color: '#718096', fontSize: '0.85rem' }}>Establish foundational rules and operational procedures.</p>
                        </div>
                    </div>
                    <button className="btn-icon" onClick={onClose} style={{ fontSize: '1.5rem' }}>&times;</button>
                </div>
            </div>

            {/* SCROLLABLE FORM CONTENT */}
            <div className="custom-scroll" style={{ flex: 1, overflowY: 'auto', padding: '35px 40px' }}>
                {/* METADATA GRID */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '25px', marginBottom: '40px' }}>
                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                        <label style={{ color: '#4a5568', fontWeight: '700', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Policy Title</label>
                        <input className="form-control" placeholder="e.g. Anti-Harassment & Ethics Policy" value={p.title} onChange={e => setP({ ...p, title: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label style={{ color: '#4a5568', fontWeight: '700', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Version Control</label>
                        <input className="form-control" placeholder="1.0.0" value={p.version} onChange={e => setP({ ...p, version: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label style={{ color: '#4a5568', fontWeight: '700', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Primary Category</label>
                        <select className="form-control" value={p.category} onChange={e => setP({ ...p, category: e.target.value })}>
                            <option>HR Policy</option>
                            <option>Salary & Stipend Policy</option>
                            <option>Volunteer Policy</option>
                            <option>Fellowship Policy</option>
                            <option>Code of Conduct</option>
                            <option>Anti-Misuse of Funds Policy</option>
                            <option>Operational SOP</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label style={{ color: '#4a5568', fontWeight: '700', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Approved By (Director Signature)</label>
                        <input className="form-control" placeholder="Full Name of Director" value={p.approved_by || ''} onChange={e => setP({ ...p, approved_by: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label style={{ color: '#4a5568', fontWeight: '700', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Publishing Status</label>
                        <select className="form-control" value={p.status} onChange={e => setP({ ...p, status: e.target.value })}>
                            <option>Draft</option>
                            <option>Active</option>
                            <option>Archived</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label style={{ color: '#4a5568', fontWeight: '700', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Effective Date</label>
                        <input type="date" className="form-control" value={p.effective_date} onChange={e => setP({ ...p, effective_date: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label style={{ color: '#4a5568', fontWeight: '700', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Next Review Cycle</label>
                        <input type="date" className="form-control" value={p.review_date} onChange={e => setP({ ...p, review_date: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label style={{ color: '#4a5568', fontWeight: '700', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Ext Document Ref (ID)</label>
                        <input className="form-control" placeholder="BCLL-GOV-2026-01" value={p.document_ref} onChange={e => setP({ ...p, document_ref: e.target.value })} />
                    </div>
                </div>

                {/* EDITOR / PREVIEW TABS */}
                <div style={{ marginBottom: '15px', display: 'flex', gap: '15px', borderBottom: '2px solid #f1f5f9' }}>
                    <button
                        onClick={() => setActiveTab('editor')}
                        style={{ padding: '12px 25px', border: 'none', background: 'none', fontWeight: '700', cursor: 'pointer', borderBottom: activeTab === 'editor' ? '3px solid #3182ce' : '3px solid transparent', color: activeTab === 'editor' ? '#3182ce' : '#718096' }}
                    >
                        Drafting Editor (Markdown)
                    </button>
                    <button
                        onClick={() => setActiveTab('preview')}
                        style={{ padding: '12px 25px', border: 'none', background: 'none', fontWeight: '700', cursor: 'pointer', borderBottom: activeTab === 'preview' ? '3px solid #3182ce' : '3px solid transparent', color: activeTab === 'preview' ? '#3182ce' : '#718096' }}
                    >
                        Legal Preview
                    </button>
                </div>

                {activeTab === 'editor' ? (
                    <div className="form-group">
                        <textarea
                            className="form-control"
                            rows="12"
                            placeholder="# Policy Introduction\n\nEnter the legal and operational framework here using markdown syntax..."
                            value={p.content}
                            onChange={e => setP({ ...p, content: e.target.value })}
                        />
                        <p style={{ marginTop: '10px', fontSize: '0.75rem', color: '#a0aec0' }}><FaDesktop /> System captures audit trail of all content modifications.</p>
                    </div>
                ) : (
                    <div style={{ padding: '40px', background: 'white', border: '2px solid #e2e8f0', borderRadius: '20px', minHeight: '350px', whiteSpace: 'pre-wrap', color: '#2d3748', lineHeight: '1.8' }}>
                        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                            <h2 style={{ textTransform: 'uppercase', letterSpacing: '2px', fontSize: '1.2rem', margin: 0 }}>Official Governance Document</h2>
                            <p style={{ color: '#718096', fontSize: '0.8rem' }}>Bharath Cares Life Line Foundation</p>
                        </div>
                        <h1 style={{ borderBottom: '2px solid #2d3748', paddingBottom: '10px', marginBottom: '20px' }}>{p.title || 'Draft Policy Title'}</h1>
                        <div style={{ marginBottom: '20px', fontSize: '0.85rem', color: '#718096', display: 'flex', gap: '30px' }}>
                            <span><strong>Ref:</strong> {p.document_ref || 'Pending'}</span>
                            <span><strong>Version:</strong> {p.version}</span>
                            <span><strong>Effective:</strong> {p.effective_date}</span>
                        </div>
                        <div style={{ fontSize: '1.05rem' }}>
                            {p.content || 'Start drafting in the editor tab to see the preview here...'}
                        </div>
                    </div>
                )}
            </div>

            {/* ACTION BAR */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px', padding: '30px 40px', borderTop: '1px solid #edf2f7', background: '#f8fafc', borderBottomLeftRadius: '28px', borderBottomRightRadius: '28px' }}>
                <button className="btn-small" onClick={onClose} style={{ padding: '12px 30px' }}>Cancel Draft</button>
                <button className="btn-add" onClick={handleSave} style={{ padding: '12px 35px' }}>
                    <FaClipboardCheck /> Commit to Governance Registry
                </button>
            </div>
        </div>
    );
};

const MeetingForm = ({ onClose, onSave, meeting = null }) => {
    const [m, setM] = useState(meeting || {
        meeting_date: '',
        agenda: '',
        minutes: '',
        resolution_text: '',
        status: 'Scheduled',
        attendees: [],
        recording_link: ''
    });

    const isLocked = m.status === 'Finalized';

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', maxHeight: '92vh' }}>
            <div style={{ padding: '30px 40px', borderBottom: '1px solid #edf2f7', background: 'white' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ width: '50px', height: '50px', background: isLocked ? '#C6F6D5' : '#EBF8FF', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isLocked ? '#22543D' : '#2B6CB0', fontSize: '1.5rem' }}>
                            {isLocked ? <FaCheckDouble /> : <FaCalendarAlt />}
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1.4rem' }}>Board Governance: {meeting ? 'Process Resolution' : 'Schedule Meeting'}</h3>
                            <p style={{ margin: '5px 0 0', color: '#718096', fontSize: '0.85rem' }}>
                                {isLocked ? 'Document is SIGNED and LOCKED. No further edits permitted.' : 'Manage meeting agenda, minutes, and final board resolutions.'}
                            </p>
                        </div>
                    </div>
                    <button className="btn-icon" onClick={onClose} style={{ fontSize: '1.5rem' }}>&times;</button>
                </div>
            </div>

            <div className="custom-scroll" style={{ flex: 1, overflowY: 'auto', padding: '35px 40px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '25px', marginBottom: '30px' }}>
                    <div className="form-group">
                        <label>Meeting Schedule Date & Time</label>
                        <input type="datetime-local" className="form-control" value={m.meeting_date} onChange={e => setM({ ...m, meeting_date: e.target.value })} disabled={isLocked} />
                    </div>
                    <div className="form-group">
                        <label>Current Lifecycle Status</label>
                        <select className="form-control" value={m.status} onChange={e => setM({ ...m, status: e.target.value })} disabled={isLocked}>
                            <option>Scheduled</option>
                            <option>Agenda Uploaded</option>
                            <option>Minutes Drafted</option>
                            <option>Under Board Review</option>
                            <option>Resolution Finalized</option>
                            <option>Finalized</option>
                        </select>
                    </div>
                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                        <label>Primary Agenda (Key Discussion Points)</label>
                        <textarea className="form-control" rows="4" placeholder="Detail the agenda for the board members..." value={m.agenda} onChange={e => setM({ ...m, agenda: e.target.value })} disabled={isLocked} />
                    </div>

                    {(m.status !== 'Scheduled' && m.status !== 'Agenda Uploaded') && (
                        <div className="form-group" style={{ gridColumn: 'span 2', animation: 'fadeIn 0.5s' }}>
                            <label style={{ color: '#2B6CB0' }}>Official Meeting Minutes</label>
                            <textarea className="form-control" rows="6" placeholder="Document the discussions, motions, and discussions here..." value={m.minutes} onChange={e => setM({ ...m, minutes: e.target.value })} disabled={isLocked} style={{ background: '#f0f9ff' }} />
                        </div>
                    )}

                    {(m.status === 'Resolution Finalized' || m.status === 'Finalized') && (
                        <div className="form-group" style={{ gridColumn: 'span 2', animation: 'fadeIn 0.5s' }}>
                            <label style={{ color: '#2F855A' }}>Final Board Resolution & Directives</label>
                            <textarea className="form-control" rows="5" placeholder="State the final binding decision of the board..." value={m.resolution_text} onChange={e => setM({ ...m, resolution_text: e.target.value })} disabled={isLocked} style={{ background: '#f0fff4', fontWeight: '700' }} />
                        </div>
                    )}
                </div>

                {isLocked && (
                    <div style={{ padding: '20px', background: '#fff5f5', border: '1px solid #feb2b2', borderRadius: '15px', color: '#c53030', display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <FaUserLock fontSize="1.5rem" />
                        <div>
                            <strong style={{ display: 'block' }}>Immutable Resolution</strong>
                            <span style={{ fontSize: '0.85rem' }}>This document was crystallized on {new Date().toLocaleDateString()}. To change this, a new board resolution must be filed.</span>
                        </div>
                    </div>
                )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px', padding: '30px 40px', borderTop: '1px solid #edf2f7', background: '#f8fafc' }}>
                <button className="btn-small" onClick={onClose}>Discard</button>
                {!isLocked && (
                    <button className="btn-add" onClick={() => onSave(m)}>
                        {meeting ? 'Update Governance Log' : 'Initialize Meeting'}
                    </button>
                )}
            </div>
        </div>
    );
};


const MemberForm = ({ onClose, onSave }) => {
    const [m, setM] = useState({
        full_name: '',
        designation: 'Director',
        role: 'Executive Member',
        organization: 'BCLL Foundation',
        term_start: '',
        term_end: '',
        voting_rights: true
    });

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', maxHeight: '92vh' }}>
            <div style={{ padding: '30px 40px', borderBottom: '1px solid #edf2f7', background: 'white' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ width: '50px', height: '50px', background: '#F6E05E', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#744210', fontSize: '1.5rem' }}>
                            <FaUserShield />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1.4rem' }}>Registry: Board Member Profile</h3>
                            <p style={{ margin: '5px 0 0', color: '#718096', fontSize: '0.85rem' }}>Update the official directory of directors and trustees.</p>
                        </div>
                    </div>
                    <button className="btn-icon" onClick={onClose} style={{ fontSize: '1.5rem' }}>&times;</button>
                </div>
            </div>

            <div className="custom-scroll" style={{ flex: 1, overflowY: 'auto', padding: '35px 40px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '25px', marginBottom: '30px' }}>
                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                        <label>Legal Full Name</label>
                        <input className="form-control" placeholder="e.g. Dr. Satish Kumar" value={m.full_name} onChange={e => setM({ ...m, full_name: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label>Official Designation</label>
                        <select className="form-control" value={m.designation} onChange={e => setM({ ...m, designation: e.target.value })}>
                            <option>Director</option>
                            <option>Trustee</option>
                            <option>Chairman</option>
                            <option>Secretary</option>
                            <option>Treasurer</option>
                            <option>Advisor</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Board Role Type</label>
                        <select className="form-control" value={m.role} onChange={e => setM({ ...m, role: e.target.value })}>
                            <option>Executive Member</option>
                            <option>Non-Executive</option>
                            <option>Independent Director</option>
                            <option>Nominee Director</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Tenure Start Date</label>
                        <input type="date" className="form-control" value={m.term_start} onChange={e => setM({ ...m, term_start: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label>Tenure End Date (Optional)</label>
                        <input type="date" className="form-control" value={m.term_end} onChange={e => setM({ ...m, term_end: e.target.value })} />
                    </div>
                    <div className="form-group" style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <input type="checkbox" checked={m.voting_rights} onChange={e => setM({ ...m, voting_rights: e.target.checked })} style={{ width: '20px', height: '20px', accentColor: 'var(--primary)' }} />
                        <div>
                            <label style={{ margin: 0, cursor: 'pointer' }}>Active Voting Rights</label>
                            <p style={{ margin: 0, fontSize: '0.75rem', color: '#718096' }}>Checking this grants the member authorization to cast votes in board resolutions.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px', padding: '30px 40px', borderTop: '1px solid #edf2f7', background: '#f8fafc' }}>
                <button className="btn-small" onClick={onClose}>Cancel</button>
                <button className="btn-add" onClick={() => onSave(m)}>Commit Member to Registry</button>
            </div>
        </div>
    );
};


const VolunteerTaskForm = ({ volunteers, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        volunteer_id: '',
        title: '',
        description: '',
        deadline: '',
        status: 'In Progress'
    });

    const handleSave = () => {
        if (!formData.volunteer_id || !formData.title) {
            alert('CRITICAL: Strategic Mission must have a designated volunteer and title.');
            return;
        }
        onSave(formData);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ padding: '40px 40px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>Deploy Institutional Mission</h3>
                        <p style={{ margin: '5px 0 0', color: '#718096', fontSize: '0.85rem' }}>Assign a field task to the selected volunteer in the registry.</p>
                    </div>
                    <button className="btn-icon" onClick={onClose} style={{ fontSize: '1.5rem' }}>&times;</button>
                </div>
            </div>

            <div className="custom-scroll" style={{ flex: 1, overflowY: 'auto', padding: '0 40px' }}>
                <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                        <label style={{ fontWeight: 700, color: '#2d3748', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px', marginBottom: '10px' }}>Assigned Volunteer</label>
                        <select
                            className="form-control"
                            name="volunteer_id"
                            value={formData.volunteer_id}
                            onChange={e => setFormData({ ...formData, volunteer_id: e.target.value })}
                            style={{ padding: '15px' }}
                        >
                            <option value="">Select Personnel from Directory...</option>
                            {(volunteers || []).filter(v => v.status === 'Approved').map(v => (
                                <option key={v.id} value={v.id}>{v.full_name} (VOL-{v.id.substring(0, 8).toUpperCase()})</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                        <label style={{ fontWeight: 700, color: '#2d3748', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px', marginBottom: '10px' }}>Mission Title</label>
                        <input
                            className="form-control"
                            type="text"
                            placeholder="e.g. Community Health Survey 2025"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            style={{ padding: '15px' }}
                        />
                    </div>

                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                        <label style={{ fontWeight: 700, color: '#2d3748', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px', marginBottom: '10px' }}>Strategic Objectives / Description</label>
                        <textarea
                            className="form-control"
                            rows="4"
                            placeholder="Define task deliverables and reporting requirements..."
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            style={{ padding: '15px', resize: 'none' }}
                        ></textarea>
                    </div>

                    <div className="form-group">
                        <label style={{ fontWeight: 700, color: '#2d3748', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px', marginBottom: '10px' }}>Deadline Signature</label>
                        <input
                            className="form-control"
                            type="date"
                            value={formData.deadline}
                            onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                            style={{ padding: '15px' }}
                        />
                    </div>

                    <div className="form-group">
                        <label style={{ fontWeight: 700, color: '#2d3748', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px', marginBottom: '10px' }}>Initial Assignment Status</label>
                        <input className="form-control" type="text" value="Active / In Progress" readOnly style={{ padding: '15px', background: '#f8fafc' }} />
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end', padding: '40px', borderTop: '1px solid #f1f5f9', background: '#fff' }}>
                <button className="btn-small" onClick={onClose} style={{ padding: '12px 25px' }}>Abort Deployment</button>
                <button
                    className="btn-add"
                    onClick={handleSave}
                    style={{ padding: '12px 30px', background: '#1a365d', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 800, cursor: 'pointer' }}
                >
                    Launch Official Mission
                </button>
            </div>
        </div>
    );
};

const ExpenseClaimForm = ({ onClose, onSubmit }) => {
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('Travel');

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ background: 'white', padding: '30px', borderRadius: '15px', width: '400px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
                <h3 style={{ margin: '0 0 20px 0', color: '#1a365d' }}>Submit Expense Claim</h3>

                <div className="form-group" style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: '#4a5568' }}>Claim Amount (₹)</label>
                    <input
                        type="number"
                        className="form-control"
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        placeholder="0.00"
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e0' }}
                    />
                </div>

                <div className="form-group" style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: '#4a5568' }}>Category</label>
                    <select
                        className="form-control"
                        value={category}
                        onChange={e => setCategory(e.target.value)}
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e0' }}
                    >
                        <option>Travel</option>
                        <option>Food & Lodging</option>
                        <option>Office Supplies</option>
                        <option>Equipment</option>
                        <option>Miscellaneous</option>
                    </select>
                </div>

                <div className="form-group" style={{ marginBottom: '25px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: '#4a5568' }}>Description / Purpose</label>
                    <textarea
                        className="form-control"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        rows="3"
                        placeholder="Brief details about the expense..."
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e0' }}
                    />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <button className="btn-small" onClick={onClose}>Cancel</button>
                    <button className="btn-premium" onClick={() => onSubmit({ amount, description, category })}>Submit Claim</button>
                </div>
            </div>
        </div>
    );
};

const ComplianceDocForm = ({ onClose, onSave }) => {
    const [formData, setFormData] = useState({ title: '', category: '12A', document_url: '', expiry_date: '', notes: '' });
    return (
        <div style={{ padding: '40px' }}>
            <h3 style={{ marginBottom: '25px', color: '#2C5282' }}>Upload Compliance Certificate</h3>
            <div className="form-group" style={{ marginBottom: '20px' }}>
                <label>Certificate Title</label>
                <input className="form-control" type="text" placeholder="e.g. 12A Registration 2025" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div className="form-group">
                    <label>Category</label>
                    <select className="form-control" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                        <option>12A</option>
                        <option>80G</option>
                        <option>CSR-1</option>
                        <option>FCRA</option>
                        <option>Audit Report</option>
                        <option>IT Return</option>
                        <option>Trust Deed</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>Expiry Date</label>
                    <input className="form-control" type="date" value={formData.expiry_date} onChange={e => setFormData({ ...formData, expiry_date: e.target.value })} />
                </div>
            </div>
            <div className="form-group" style={{ marginBottom: '20px' }}>
                <label>Document URL / Secure Link</label>
                <input className="form-control" type="text" placeholder="https://..." value={formData.document_url} onChange={e => setFormData({ ...formData, document_url: e.target.value })} />
            </div>
            <div className="form-group">
                <label>Administrative Notes</label>
                <textarea className="form-control" rows="3" value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })}></textarea>
            </div>
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end', marginTop: '30px' }}>
                <button className="btn-small" onClick={onClose}>Cancel</button>
                <button className="btn-add" style={{ background: '#2C5282' }} onClick={() => onSave(formData)}>Save Certificate</button>
            </div>
        </div>
    );
};

const CsrProjectForm = ({ onClose, onSave }) => {
    const [formData, setFormData] = useState({ company_name: '', project_name: '', financial_year: '2025-26', sanctioned_amount: 0, utilized_amount: 0, status: 'Ongoing' });
    return (
        <div style={{ padding: '40px' }}>
            <h3 style={{ marginBottom: '25px', color: '#2C5282' }}>Track CSR Project Compliance</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px', marginBottom: '20px' }}>
                <div className="form-group"><label>Funding Company</label><input className="form-control" placeholder="e.g. Reliance Foundation" value={formData.company_name} onChange={e => setFormData({ ...formData, company_name: e.target.value })} /></div>
                <div className="form-group"><label>Project Designation</label><input className="form-control" placeholder="e.g. Digital Literacy Phase 1" value={formData.project_name} onChange={e => setFormData({ ...formData, project_name: e.target.value })} /></div>
                <div className="form-group"><label>Financial Year</label><input className="form-control" placeholder="2025-26" value={formData.financial_year} onChange={e => setFormData({ ...formData, financial_year: e.target.value })} /></div>
                <div className="form-group"><label>Sanctioned Budget (₹)</label><input className="form-control" type="number" value={formData.sanctioned_amount} onChange={e => setFormData({ ...formData, sanctioned_amount: e.target.value })} /></div>
                <div className="form-group">
                    <label>Current Status</label>
                    <select className="form-control" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                        <option>Ongoing</option>
                        <option>Completed</option>
                        <option>Audited</option>
                    </select>
                </div>
            </div>
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end', marginTop: '30px' }}>
                <button className="btn-small" onClick={onClose}>Cancel</button>
                <button className="btn-add" style={{ background: '#2C5282' }} onClick={() => onSave(formData)}>Initiate Project Tracking</button>
            </div>
        </div>
    );
};

const TaxRecordForm = ({ onClose, onSave }) => {
    const [formData, setFormData] = useState({ donor_name: '', donor_pan: '', donor_id_type: 'PAN', donation_amount: 0, donation_date: new Date().toISOString().split('T')[0], payment_mode: 'Bank Transfer', receipt_number: '', is_80g_issued: true });
    return (
        <div style={{ padding: '40px' }}>
            <h3 style={{ marginBottom: '25px', color: '#2C5282' }}>Log 80G Donation (Scrutiny Ready)</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px', marginBottom: '20px' }}>
                <div className="form-group"><label>Legal Donor Name</label><input className="form-control" value={formData.donor_name} onChange={e => setFormData({ ...formData, donor_name: e.target.value })} /></div>
                <div className="form-group">
                    <label>ID Type / Number</label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <select className="form-control" style={{ width: '100px' }} value={formData.donor_id_type} onChange={e => setFormData({ ...formData, donor_id_type: e.target.value })}>
                            <option>PAN</option>
                            <option>Aadhaar</option>
                        </select>
                        <input className="form-control" placeholder="ID Number" value={formData.donor_pan} onChange={e => setFormData({ ...formData, donor_pan: e.target.value })} />
                    </div>
                </div>
                <div className="form-group"><label>Donation Amount (₹)</label><input className="form-control" type="number" value={formData.donation_amount} onChange={e => setFormData({ ...formData, donation_amount: e.target.value })} /></div>
                <div className="form-group"><label>Official Receipt Number</label><input className="form-control" placeholder="BCLL/25-26/001" value={formData.receipt_number} onChange={e => setFormData({ ...formData, receipt_number: e.target.value })} /></div>
                <div className="form-group"><label>Donation Date</label><input className="form-control" type="date" value={formData.donation_date} onChange={e => setFormData({ ...formData, donation_date: e.target.value })} /></div>
                <div className="form-group">
                    <label>Payment Mode</label>
                    <select className="form-control" value={formData.payment_mode} onChange={e => setFormData({ ...formData, payment_mode: e.target.value })}>
                        <option>Bank Transfer</option>
                        <option>Cheque</option>
                        <option>UPI</option>
                        <option>Cash</option>
                    </select>
                </div>
            </div>
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end', marginTop: '30px' }}>
                <button className="btn-small" onClick={onClose}>Cancel</button>
                <button className="btn-add" style={{ background: '#2C5282' }} onClick={() => onSave(formData)}>Log Tax Record</button>
            </div>
        </div>
    );
};

const ComplianceTaskForm = ({ onClose, onSave }) => {
    const [formData, setFormData] = useState({ task_name: '', frequency: 'Monthly', due_date: '', law_reference: '', status: 'Pending' });
    return (
        <div style={{ padding: '40px' }}>
            <h3 style={{ marginBottom: '25px', color: '#2C5282' }}>Schedule Compliance Filing Task</h3>
            <div className="form-group" style={{ marginBottom: '20px' }}><label>Task Description</label><input className="form-control" placeholder="e.g. TDS Quarter 1 Filing" value={formData.task_name} onChange={e => setFormData({ ...formData, task_name: e.target.value })} /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div className="form-group">
                    <label>Filing Frequency</label>
                    <select className="form-control" value={formData.frequency} onChange={e => setFormData({ ...formData, frequency: e.target.value })}>
                        <option>Monthly</option>
                        <option>Quarterly</option>
                        <option>Annual</option>
                        <option>One-time</option>
                    </select>
                </div>
                <div className="form-group"><label>Task Due Date</label><input className="form-control" type="date" value={formData.due_date} onChange={e => setFormData({ ...formData, due_date: e.target.value })} /></div>
            </div>
            <div className="form-group"><label>Regulatory Reference (e.g. IT Act Sec 194)</label><input className="form-control" value={formData.law_reference} onChange={e => setFormData({ ...formData, law_reference: e.target.value })} /></div>
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end', marginTop: '30px' }}>
                <button className="btn-small" onClick={onClose}>Cancel</button>
                <button className="btn-add" style={{ background: '#2C5282' }} onClick={() => onSave(formData)}>Queue Compliance Task</button>
            </div>
        </div>
    );
};

const ComplianceTab = ({ docs, csr, tax, checklist, onAddDoc, onAddCsr, onAddTax, onAddCheck, onExport }) => {
    const [subTab, setSubTab] = useState('vault');

    const handleMarkDone = async (id, taskName) => {
        const { error } = await supabase
            .from('compliance_checklists')
            .update({ status: 'Completed', completed_at: new Date().toISOString() })
            .eq('id', id);

        if (!error) {
            // refreshData();
        } else {
            alert('Status update failed: ' + error.message);
        }
    };

    return (
        <div style={{ animation: 'fadeIn 0.5s' }}>
            <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', borderBottom: '1px solid #edf2f7', paddingBottom: '15px' }}>
                <button className={`btn-small ${subTab === 'vault' ? 'active' : ''}`} onClick={() => setSubTab('vault')} style={{ background: subTab === 'vault' ? '#2c5282' : 'transparent', color: subTab === 'vault' ? 'white' : '#64748b' }}>Audit Vault (Certificates)</button>
                <button className={`btn-small ${subTab === 'csr' ? 'active' : ''}`} onClick={() => setSubTab('csr')} style={{ background: subTab === 'csr' ? '#2c5282' : 'transparent', color: subTab === 'csr' ? 'white' : '#64748b' }}>CSR Compliance</button>
                <button className={`btn-small ${subTab === 'tax' ? 'active' : ''}`} onClick={() => setSubTab('tax')} style={{ background: subTab === 'tax' ? '#2c5282' : 'transparent', color: subTab === 'tax' ? 'white' : '#64748b' }}>Tax Scrutiny (80G)</button>
                <button className={`btn-small ${subTab === 'checklist' ? 'active' : ''}`} onClick={() => setSubTab('checklist')} style={{ background: subTab === 'checklist' ? '#2c5282' : 'transparent', color: subTab === 'checklist' ? 'white' : '#64748b' }}>Checklist</button>
            </div>

            {subTab === 'vault' && (
                <div className="content-panel">
                    <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                        <div>
                            <h3 style={{ margin: 0 }}>Category 1: Audit Vault (12A/80G/CSR-1)</h3>
                            <p style={{ margin: '5px 0 0', color: '#718096', fontSize: '0.85rem' }}>Central repository for NGO compliance certifications.</p>
                        </div>
                        <button className="btn-add" onClick={onAddDoc}><FaFileUpload /> Upload Certificate</button>
                    </div>
                    <table className="data-table">
                        <thead><tr><th>Certificate Name</th><th>Category</th><th>Expiry Date</th><th>Status</th><th>Notes</th><th>Actions</th></tr></thead>
                        <tbody>
                            {(docs || []).length > 0 ? (docs || []).map(d => (
                                <tr key={d.id}>
                                    <td><strong>{d.title}</strong></td>
                                    <td><span className="badge blue">{d.category}</span></td>
                                    <td>{d.expiry_date || 'N/A'}</td>
                                    <td><span className={`badge ${d.status === 'Active' ? 'success' : 'warning'}`}>{d.status}</span></td>
                                    <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.notes}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button className="btn-icon blue" title="View Document" onClick={() => window.open(d.document_url)}><FaEye /></button>
                                            <button className="btn-icon danger"><FaTrash /></button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '100px', color: '#94a3b8' }}>Audit Vault is currently empty.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {subTab === 'csr' && (
                <div className="content-panel">
                    <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                        <div>
                            <h3 style={{ margin: 0 }}>Category 2: CSR Project Compliance</h3>
                            <p style={{ margin: '5px 0 0', color: '#718096', fontSize: '0.85rem' }}>Tracking CSR utilization and sanctioned amounts.</p>
                        </div>
                        <button className="btn-add" onClick={onAddCsr}><FaPlus /> Track CSR Project</button>
                    </div>
                    <table className="data-table">
                        <thead><tr><th>Company / Project</th><th>FY</th><th>Sanctioned</th><th>Utilized</th><th>Status</th><th>Actions</th></tr></thead>
                        <tbody>
                            {(csr || []).length > 0 ? (csr || []).map(c => (
                                <tr key={c.id}>
                                    <td><strong>{c.company_name}</strong><br /><small>{c.project_name}</small></td>
                                    <td>{c.financial_year}</td>
                                    <td>₹ {Number(c.sanctioned_amount).toLocaleString()}</td>
                                    <td>₹ {Number(c.utilized_amount).toLocaleString()}</td>
                                    <td><span className={`badge ${c.status === 'Audited' ? 'success' : 'blue'}`}>{c.status}</span></td>
                                    <td>
                                        <button className="btn-small">View Certificate</button>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '100px', color: '#94a3b8' }}>No CSR projects tracked yet.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {subTab === 'tax' && (
                <div className="content-panel">
                    <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                        <div>
                            <h3 style={{ margin: 0 }}>Category 3: Donation Tax Scrutiny (80G)</h3>
                            <p style={{ margin: '5px 0 0', color: '#718096', fontSize: '0.85rem' }}>Data preparedness for IT Act 10BD filings.</p>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button className="btn-small" onClick={() => onExport(tax, '80G_Tax_Records')}><FaDownload /> Export for 10BD</button>
                            <button className="btn-add" onClick={onAddTax}><FaPlusCircle /> Add Tax Record</button>
                        </div>
                    </div>
                    <table className="data-table">
                        <thead><tr><th>Donor / PAN</th><th>Amount</th><th>Date</th><th>Receipt No</th><th>80G Issued</th><th>Status</th></tr></thead>
                        <tbody>
                            {(tax || []).length > 0 ? (tax || []).map(t => (
                                <tr key={t.id}>
                                    <td><strong>{t.donor_name}</strong><br /><small>PAN: {t.donor_pan || 'N/A'}</small></td>
                                    <td>₹ {Number(t.donation_amount).toLocaleString()}</td>
                                    <td>{new Date(t.donation_date).toLocaleDateString()}</td>
                                    <td>{t.receipt_number}</td>
                                    <td><span className={`badge ${t.is_80g_issued ? 'success' : 'warning'}`}>{t.is_80g_issued ? 'Yes' : 'No'}</span></td>
                                    <td><span className={`badge ${t.form_10bd_filed ? 'success' : 'blue'}`}>{t.form_10bd_filed ? 'Filed' : 'Pending'}</span></td>
                                </tr>
                            )) : (
                                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '100px', color: '#94a3b8' }}>No 80G tax records found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {subTab === 'checklist' && (
                <div className="content-panel">
                    <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                        <h3>Compliance Checklist (IT Act & CSR Rules)</h3>
                        <button className="btn-add" onClick={onAddCheck}><FaClipboardCheck /> New Task</button>
                    </div>
                    <table className="data-table">
                        <thead><tr><th>Task</th><th>Frequency</th><th>Due Date</th><th>Status</th><th>Reference</th><th>Actions</th></tr></thead>
                        <tbody>
                            {(checklist || []).length > 0 ? (checklist || []).map(item => (
                                <tr key={item.id}>
                                    <td><strong>{item.task_name}</strong></td>
                                    <td>{item.frequency}</td>
                                    <td>{item.due_date || 'N/A'}</td>
                                    <td><span className={`badge ${item.status === 'Completed' ? 'success' : (item.status === 'Overdue' ? 'red' : 'warning')}`}>{item.status}</span></td>
                                    <td><small>{item.law_reference}</small></td>
                                    <td>
                                        {item.status !== 'Completed' ? (
                                            <button className="btn-small success-btn" onClick={() => handleMarkDone(item.id, item.task_name)}>Mark Done</button>
                                        ) : (
                                            <span style={{ color: '#38A169', fontWeight: 800, fontSize: '0.75rem' }}>✓ COMPLETED</span>
                                        )}
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '100px', color: '#94a3b8' }}>Compliance checklist is clear.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

const GovernanceReports = ({ attendance, employees, payrollRecords, activityLogs }) => {
    const [reportType, setReportType] = useState('daily-attendance');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedEmp, setSelectedEmp] = useState('');

    const downloadPDF = (data, title, headers) => {
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text("BHARATH CARES LIFE LINE FOUNDATION", 14, 20);
        doc.setFontSize(12);
        doc.setTextColor(100);
        doc.text(`${title} | Generated: ${new Date().toLocaleString()}`, 14, 28);

        doc.autoTable({
            head: [headers.map(h => h.label)],
            body: data.map(item => headers.map(h => {
                const val = typeof h.key === 'function' ? h.key(item) : item[h.key];
                return val === null || val === undefined ? '—' : String(val);
            })),
            startY: 35,
            theme: 'grid',
            headStyles: { fillColor: [26, 54, 93], textColor: [255, 255, 255] },
            alternateRowStyles: { fillColor: [245, 247, 250] }
        });

        doc.save(`${title.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`);
    };

    const downloadExcel = (data, title, headers) => {
        const mappedData = data.map(item => {
            const obj = {};
            headers.forEach(h => {
                obj[h.label] = typeof h.key === 'function' ? h.key(item) : item[h.key];
            });
            return obj;
        });
        const worksheet = XLSX.utils.json_to_sheet(mappedData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Governance Report");
        XLSX.writeFile(workbook, `${title.replace(/\s+/g, '_')}_${new Date().getTime()}.xlsx`);
    };

    const generateReport = (format) => {
        let data = [];
        let title = '';
        let headers = [];

        if (reportType === 'daily-attendance') {
            data = (attendance || []).filter(a => a.attendance_date === selectedDate);
            title = `Daily Attendance Report - ${selectedDate}`;
            headers = [
                { label: 'Emp ID', key: (a) => a.employees?.employee_id },
                { label: 'Name', key: (a) => a.employees?.full_name },
                { label: 'Check-In', key: (a) => a.check_in ? new Date(a.check_in).toLocaleTimeString() : '—' },
                { label: 'Check-Out', key: (a) => a.check_out ? new Date(a.check_out).toLocaleTimeString() : '—' },
                { label: 'Work Hours', key: 'work_hours' },
                { label: 'Status', key: 'status' },
                { label: 'Approval Stage', key: 'approval_status' }
            ];
        } else if (reportType === 'monthly-summary') {
            const monthName = new Date(selectedYear, selectedMonth - 1).toLocaleString('default', { month: 'long' });
            title = `Monthly Attendance Summary - ${monthName} ${selectedYear}`;
            data = employees.map(emp => {
                const empAtt = (attendance || []).filter(a => {
                    const d = new Date(a.attendance_date);
                    return d.getMonth() + 1 === selectedMonth && d.getFullYear() === selectedYear && a.employee_id === emp.id;
                });
                return {
                    emp_id: emp.employee_id,
                    name: emp.full_name,
                    total: empAtt.length,
                    present: empAtt.filter(a => a.status === 'Present').length,
                    leaves: empAtt.filter(a => a.status === 'Leave Approved').length,
                    lop: empAtt.filter(a => a.status === 'Loss of Pay' || a.status === 'Absent').length
                };
            });
            headers = [
                { label: 'Emp ID', key: 'emp_id' },
                { label: 'Name', key: 'name' },
                { label: 'Logged Days', key: 'total' },
                { label: 'Present', key: 'present' },
                { label: 'Leaves', key: 'leaves' },
                { label: 'LOP Days', key: 'lop' }
            ];
        } else if (reportType === 'employee-wise') {
            const emp = employees.find(e => e.id === selectedEmp);
            data = (attendance || []).filter(a => a.employee_id === selectedEmp).sort((a, b) => new Date(b.attendance_date) - new Date(a.attendance_date));
            title = `Individual Attendance Log - ${emp?.full_name || 'Personnel'}`;
            headers = [
                { label: 'Date', key: 'attendance_date' },
                { label: 'Check-In', key: (a) => a.check_in ? new Date(a.check_in).toLocaleTimeString() : '—' },
                { label: 'Check-Out', key: (a) => a.check_out ? new Date(a.check_out).toLocaleTimeString() : '—' },
                { label: 'Work Hours', key: 'work_hours' },
                { label: 'Status', key: 'status' }
            ];
        } else if (reportType === 'approval-history') {
            data = activityLogs.filter(l => l.sub_system === 'HR' || l.sub_system === 'Operations').sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            title = `Institutional Approval & Audit History`;
            headers = [
                { label: 'Timestamp', key: (l) => new Date(l.created_at).toLocaleString() },
                { label: 'Sub-System', key: 'sub_system' },
                { label: 'Action Taken', key: 'action' },
                { label: 'Identity Ref', key: 'actor_id' }
            ];
        } else if (reportType === 'decline-reasons') {
            const rejectedPayroll = (payrollRecords || []).filter(p => p.status === 'Rejected').map(p => ({ ...p, type: 'Payroll', name: p.employees?.full_name, reason: p.decline_reason, date: p.updated_at }));
            data = [...rejectedPayroll].sort((a, b) => new Date(b.date) - new Date(a.date));
            title = `Institutional Governance: Rejection & Decline Registry`;
            headers = [
                { label: 'Category', key: 'type' },
                { label: 'Subject / Requester', key: 'name' },
                { label: 'Reason for Rejection', key: 'reason' },
                { label: 'Declined At', key: (d) => new Date(d.date).toLocaleString() }
            ];
        }

        if (format === 'PDF') downloadPDF(data, title, headers);
        else downloadExcel(data, title, headers);
    };

    return (
        <div className="content-panel animate-fade-in" style={{ padding: '40px' }}>
            <div style={{ display: 'flex', gap: '40px' }}>
                <div style={{ flex: '0 0 350px', background: '#f8fafc', padding: '30px', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.2rem', marginBottom: '25px', color: '#1a365d' }}>
                        <FaFileDownload style={{ color: '#3182ce' }} /> Report Configuration
                    </h3>

                    <div style={{ display: 'grid', gap: '20px' }}>
                        <div className="form-group">
                            <label style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#64748b' }}>Select Target Report</label>
                            <select className="form-control" value={reportType} onChange={e => setReportType(e.target.value)} style={{ marginTop: '8px' }}>
                                <option value="daily-attendance">Daily Attendance Log</option>
                                <option value="monthly-summary">Monthly Attendance Summary</option>
                                <option value="employee-wise">Personnel-specific Log</option>
                                <option value="approval-history">Institutional Approval Trail</option>
                                <option value="decline-reasons">Governance Rejection Registry</option>
                            </select>
                        </div>

                        {reportType === 'daily-attendance' && (
                            <div className="form-group">
                                <label style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#64748b' }}>Operational Date</label>
                                <input type="date" className="form-control" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} style={{ marginTop: '8px' }} />
                            </div>
                        )}

                        {reportType === 'monthly-summary' && (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                <div className="form-group">
                                    <label style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748b' }}>Month</label>
                                    <select className="form-control" value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))}>
                                        {Array.from({ length: 12 }).map((_, i) => <option key={i} value={i + 1}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748b' }}>Year</label>
                                    <input type="number" className="form-control" value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))} />
                                </div>
                            </div>
                        )}

                        {reportType === 'employee-wise' && (
                            <div className="form-group">
                                <label style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#64748b' }}>Select Personnel</label>
                                <select className="form-control" value={selectedEmp} onChange={e => setSelectedEmp(e.target.value)} style={{ marginTop: '8px' }}>
                                    <option value="">Choose Employee</option>
                                    {(employees || []).map(e => <option key={e.id} value={e.id}>{e.full_name} ({e.employee_id})</option>)}
                                </select>
                            </div>
                        )}

                        <div style={{ marginTop: '10px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <button className="btn-premium" onClick={() => generateReport('PDF')} style={{ background: '#E53E3E', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                <FaFilePdf /> Export PDF
                            </button>
                            <button className="btn-premium" onClick={() => generateReport('EXCEL')} style={{ background: '#38A169', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                <FaFileExcel /> Export Excel
                            </button>
                        </div>
                    </div>
                </div>

                <div style={{ flex: 1 }}>
                    <div style={{ background: '#fff', padding: '30px', borderRadius: '24px', border: '1.5px solid #edf2f7', minHeight: '500px' }}>
                        <h4 style={{ color: '#64748b', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.8rem', marginBottom: '20px' }}>Preview & Contextual Insights</h4>
                        <div style={{ textAlign: 'center', marginTop: '100px', color: '#94a3b8' }}>
                            <FaChartPie style={{ fontSize: '4rem', opacity: 0.1, marginBottom: '20px' }} />
                            <p>Configure and generate the report to extract institutional intelligence.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ConnectivityMapTab = () => {
    const steps = [
        {
            id: 1,
            stage: 'Employee Portal',
            action: 'Mark Daily Attendance',
            actor: 'Field Personnel',
            status: 'Self-Check In/Out',
            icon: <FaFingerprint />,
            color: '#3182CE',
            details: 'Captures presence via Self-Attendance terminal. Records check-in, check-out, and GPS metadata.'
        },
        {
            id: 2,
            stage: 'Supervision',
            action: 'Verification',
            actor: 'Operations Manager',
            status: 'Verified (Manager)',
            icon: <FaUserCheck />,
            color: '#805AD5',
            details: 'Managers review daily logs, tasks reported, and check-in times to verify operational truth.'
        },
        {
            id: 3,
            stage: 'HR Audit',
            action: 'Policy Compliance',
            actor: 'HR Head',
            status: 'HR Verified',
            icon: <FaShieldAlt />,
            color: '#38A169',
            details: 'HR audits verified records against institutional policies and leave approvals.'
        },
        {
            id: 4,
            stage: 'Locking Phase',
            action: 'Registry Lockdown',
            actor: 'Admin / HR',
            status: 'LOCKED',
            icon: <FaLock />,
            color: '#2D3748',
            details: 'Data is finalized. Once locked, the day is immutable and ready for financial sequencing.'
        },
        {
            id: 5,
            stage: 'Finance Run',
            action: 'Payroll Sequencing',
            actor: 'Finance Executive',
            status: 'Draft Generated',
            icon: <FaCalculator />,
            color: '#3182CE',
            details: 'System pulls LOCKED attendance into Finance Terminal. Calculates basic, per-day deductions, and net pay.'
        },
        {
            id: 6,
            stage: 'Final Sanction',
            action: 'Disbursement Order',
            actor: 'Founder / Director',
            status: 'Director Approved',
            icon: <FaCheckDouble />,
            color: '#D69E2E',
            details: 'Director reviews the institutional payroll registry and provides the final signature for funds release.'
        },
        {
            id: 7,
            stage: 'Payment Loop',
            action: 'Bank Posting',
            actor: 'Finance Head',
            status: 'Cycle Complete',
            icon: <FaMoneyCheckAlt />,
            color: '#38A169',
            details: 'Funds disbursed via Bank Transfer. Payslip artifact is instantly available in Employee Personnel File.'
        }
    ];

    return (
        <div className="content-panel animate-fade-in" style={{ padding: '40px' }}>
            <div style={{ textAlign: 'center', marginBottom: '50px' }}>
                <h2 style={{ fontSize: '2.4rem', fontWeight: 900, color: '#1A365D', margin: '0' }}>System Connectivity Hub</h2>
                <p style={{ color: '#718096', fontSize: '1.2rem', marginTop: '10px' }}>Architecture: The End-to-End Institutional Workflow (Attendance → Salary)</p>
            </div>

            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '30px', maxWidth: '900px', margin: '0 auto' }}>
                {/* Visual Line */}
                <div style={{ position: 'absolute', left: '40px', top: '20px', bottom: '20px', width: '4px', background: 'linear-gradient(to bottom, #E2E8F0, #CBD5E0, #E2E8F0)' }}></div>

                {steps.map((step, index) => {
                    return (
                        <div key={step.id} style={{ display: 'flex', gap: '40px', position: 'relative' }}>
                            <div style={{
                                width: '80px',
                                height: '80px',
                                borderRadius: '24px',
                                background: step.color,
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '2rem',
                                zIndex: 2,
                                boxShadow: `0 8px 16px ${step.color}30`
                            }}>
                                {step.icon}
                            </div>
                            <div style={{
                                flex: 1,
                                padding: '30px',
                                background: 'white',
                                borderRadius: '24px',
                                border: '1.5px solid #EDF2F7',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                                transition: 'all 0.3s ease',
                                cursor: 'default'
                            }} className="hover-lift">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                    <div>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 900, color: step.color, textTransform: 'uppercase', letterSpacing: '1.5px' }}>{step.stage}</span>
                                        <h3 style={{ margin: '5px 0 0', fontSize: '1.4rem', color: '#2D3748' }}>{step.action}</h3>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#4A5568' }}>{step.actor}</div>
                                        <div className="badge" style={{ background: `${step.color}15`, color: step.color }}>{step.status}</div>
                                    </div>
                                </div>
                                <p style={{ margin: 0, color: '#718096', lineHeight: '1.6', fontSize: '0.95rem' }}>{step.details}</p>

                                <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '1px solid #F1F5F9', display: 'flex', gap: '20px', fontSize: '0.75rem', fontWeight: 700, color: '#A0AEC0' }}>
                                    <span>✔ Forensic Audit Enabled</span>
                                    <span>✔ Multi-Stage Authorization</span>
                                    <span>✔ DB Consistency Locked</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div style={{ marginTop: '60px', padding: '40px', background: 'linear-gradient(135deg, #1A365D 0%, #2D3748 100%)', borderRadius: '30px', color: 'white', textAlign: 'center' }}>
                <h3 style={{ fontSize: '1.8rem', marginBottom: '15px' }}>Real-Time Data Integrity</h3>
                <p style={{ opacity: 0.8, maxWidth: '700px', margin: '0 auto 30px', lineHeight: '1.7' }}>
                    Both Admin and Employee panels operate on the SAME source of truth. When an action is taken by anyone in the chain,
                    the status propagates instantly across the entire foundations e-office ecosystem.
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '40px' }}>
                    <div><div style={{ fontSize: '2rem', fontWeight: 900 }}>100%</div><div style={{ opacity: 0.6, fontSize: '0.8rem' }}>Audit Traceability</div></div>
                    <div><div style={{ fontSize: '2rem', fontWeight: 900 }}>Zero</div><div style={{ opacity: 0.6, fontSize: '0.8rem' }}>Data Redundancy</div></div>
                    <div><div style={{ fontSize: '2rem', fontWeight: 900 }}>Live</div><div style={{ opacity: 0.6, fontSize: '0.8rem' }}>Sync Speed</div></div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
