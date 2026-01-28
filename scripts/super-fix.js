
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://omrpvcupdeslmrhqgcxt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9tcnB2Y3VwZGVzbG1yaHFnY3h0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzg2MzIzMywiZXhwIjoyMDgzNDM5MjMzfQ.0nLPfin8KlTi6Bd663PN711klCEhaCHgCTAgYv367Ys';

const supabase = createClient(supabaseUrl, supabaseKey);

async function superFix() {
    console.log('--- Initiating Super Fix via Service Role ---');

    // 1. Clear existing broken controls
    console.log('Step 1: Clearing broken permissions...');
    const { error: dError } = await supabase.from('admin_controls').delete().neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
    if (dError) {
        console.error('Delete Error:', dError);
        return;
    }

    // 2. Fetch all current profiles
    console.log('Step 2: Linking identities...');
    const { data: profiles, error: pError } = await supabase.from('profiles').select('id, full_name, email, role_type');
    if (pError) {
        console.error('Profile Fetch Error:', pError);
        return;
    }

    // 3. Rebuild permissions with CORRECT references
    const newControls = profiles.map(p => {
        // Base permissions
        const base = {
            admin_profile_id: p.id, // Correct ID (Internal UUID)
            authority_level: 'L1',
            perm_view_employees: true,
            perm_edit_employees: true,
            perm_approve_leaves: true,
            perm_process_salary: true,
            perm_bank_access: true,
            perm_volunteer_approval: true,
            perm_scholarship_verify: true,
            perm_manage_admins: true,
            perm_student_mgmt: true,
            perm_report_approval: true,
            perm_vault_access: true,
            perm_audit_logs: true,
            perm_org_master: true
        };

        // CUSTOM FOR SAI: Hide specific tabs for the Director (test case)
        if (p.email === 'sai@gmail.com') {
            console.log(`Setting restricted permissions for ${p.full_name}...`);
            base.perm_view_employees = false; // Hide Employees tab
            base.perm_process_salary = false; // Hide Finance tab
        }

        return base;
    });

    console.log('Step 3: Deploying new permission matrix...');
    const { error: iError } = await supabase.from('admin_controls').insert(newControls);

    if (iError) {
        console.error('Final Deployment Error:', iError);
        console.error('Detail:', iError.details);
    } else {
        console.log('--- SUCCESS: All admin accounts are now synchronized! ---');
        console.log('Vamsi: Full Access Restore');
        console.log('Sai: Customized Access Active');
    }
}

superFix();
