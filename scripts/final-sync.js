
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://omrpvcupdeslmrhqgcxt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9tcnB2Y3VwZGVzbG1yaHFnY3h0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzg2MzIzMywiZXhwIjoyMDgzNDM5MjMzfQ.0nLPfin8KlTi6Bd663PN711klCEhaCHgCTAgYv367Ys';

const supabase = createClient(supabaseUrl, supabaseKey);

async function finalSync() {
    console.log('--- REBUILDING PERMISSION MATRIX ---');

    // 1. Clear everything
    await supabase.from('admin_controls').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // 2. Fetch all profiles
    const { data: profiles } = await supabase.from('profiles').select('*');

    const newControls = profiles.map(p => {
        const config = {
            admin_profile_id: p.user_id, // THE MAGIC FIX: Use UserID
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

        // CUSTOM FOR SAI: Hide specific tabs
        if (p.email === 'sai@gmail.com') {
            console.log('Configuring Restricted Access for Sai...');
            config.perm_view_employees = false;
            config.perm_process_salary = false;
            config.perm_bank_access = false;
            config.perm_audit_logs = false;
        }

        return config;
    });

    const { error } = await supabase.from('admin_controls').insert(newControls);

    if (error) {
        console.error('CRITICAL ERROR:', error.message);
    } else {
        console.log('✅ ALL PROFILES SYNCHRONIZED SUCCESSFULLY!');
        console.log('✅ DATABASE ALIGNMENT COMPLETE.');
    }
}

finalSync();
