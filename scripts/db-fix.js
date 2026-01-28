
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://omrpvcupdeslmrhqgcxt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9tcnB2Y3VwZGVzbG1yaHFnY3h0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzg2MzIzMywiZXhwIjoyMDgzNDM5MjMzfQ.0nLPfin8KlTi6Bd663PN711klCEhaCHgCTAgYv367Ys';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixDatabase() {
    console.log('--- Starting Database Repair ---');

    // 1. Fetch Profile for Sai
    const { data: profiles, error: pError } = await supabase
        .from('profiles')
        .select('*')
        .or('email.eq.sai@gmail.com,username.eq.sai');

    if (pError) {
        console.error('Error fetching profile:', pError);
        return;
    }

    if (!profiles || profiles.length === 0) {
        console.error('Sai Profile not found. Please create it first in profiles table.');
        return;
    }

    const sai = profiles[0];
    console.log('Found Sai Profile:', sai.id);

    // 2. Ensure admin_controls exists for Sai
    const { data: controls, error: cError } = await supabase
        .from('admin_controls')
        .select('*')
        .eq('admin_profile_id', sai.id);

    if (cError) {
        console.error('Error checking admin_controls:', cError);
        // If table doesn't exist, we can't fix it via JS client easily if DDL is needed
        return;
    }

    const controlData = {
        admin_profile_id: sai.id,
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

    if (controls.length === 0) {
        console.log('Creating admin_controls for Sai...');
        const { error: iError } = await supabase
            .from('admin_controls')
            .insert([controlData]);
        if (iError) console.error('Insert Error:', iError);
        else console.log('Successfully created Sai permissions.');
    } else {
        console.log('Updating admin_controls for Sai...');
        const { error: uError } = await supabase
            .from('admin_controls')
            .update(controlData)
            .eq('admin_profile_id', sai.id);
        if (uError) console.error('Update Error:', uError);
        else console.log('Successfully updated Sai permissions.');
    }

    console.log('--- Repair Complete ---');
}

fixDatabase();
