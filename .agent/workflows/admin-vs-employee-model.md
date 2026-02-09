---
description: How to Set Up Separate Admin and Employee Panels
---

# Architecture: Control Room (Admin) vs Working Area (Employee)

This project follows a **Strict Separation of Concerns** model. Both panels interact with a single source of truth (the database) but operate with different authoritative contexts.

## 🧱 1. The Core Login Flow
The system uses **Role-Based Redirection**. There is one login gate, but the "Destination" depends on the user's verified role in the database.

### Implementation Logic (Practical):
1.  **Auth Call**: User submits Email/Password via `supabase.auth.signInWithPassword`.
2.  **Role Lookup**: Immediately after auth success, the system queries the `profiles` table to see the `role_type`.
3.  **Dynamic Routing**:
    *   If `role_type` is `Admin`, `Super Admin`, or `CO-Admin` → Redirect to `/admin-dashboard`.
    *   If `role_type` is `Personnel` or `Field Staff` → Redirect to `/employee-dashboard`.

---

## 🏗️ 2. Admin Panel (The Control Room)
The Admin Panel is designed for **Review, Governance, and Modification**.

### Practical Model:
*   **Data Scope**: Can see **All** records (all employees, all payrolls, all logs).
*   **Primary Actions**: Approve/Reject requests, modify salaries, hire/fire staff, and manage organizational master data.
*   **Security Lock**: Includes the "Institutional Reports" (PDF/Excel exports) and "Immutable Audit Trail" tabs which are restricted.

---

## 🛠️ 3. Employee Panel (The Working Area)
The Employee Panel is designed for **Reporting, Attendance, and Personal Records**.

### Practical Model:
*   **Data Scope**: Restricted via RLS (Row Level Security) to show **Only** the logged-in user's data. An employee cannot see another employee's salary or attendance.
*   **Primary Actions**: 
    1.  **Mark Attendance**: Self-check-in/out protocols.
    2.  **Field Reports**: Uploading daily work logs for supervisor review.
    3.  **Benefits Requests**: Applying for leaves or reimbursement.
    4.  **KYC View**: Viewing their own digital personnel file.

---

## 🧩 4. Data Integrity (Single Database)
Both panels share a single database, which ensures data consistency. 

*   **Example**: When an employee "Marks Attendance" in their panel, it instantly appears in the Admin's "Daily Attendance Registry" for verification.
*   **Example**: When a Director "Approves Salary" in the Admin Panel, the payslip is immediately available for download in the Employee's "Attendance & Pay" tab.

---

## 🚨 5. Practical Checklist for Implementation
1.  **Routing**: Define separate routes in `App.jsx` (`/admin-dashboard` vs `/employee-dashboard`).
2.  **Access Guard**: Each dashboard must check the user's role on load. If an employee tries to access `/admin-dashboard`, they must be kicked back to their panel.
3.  **UI/UX**: Admin Panel: Dense, data-heavy, table-centric. Employee Panel: Simple, action-oriented, personal-centric.
