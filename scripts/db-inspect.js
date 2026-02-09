
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = 'https://omrpvcupdeslmrhqgcxt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9tcnB2Y3VwZGVzbG1yaHFnY3h0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzg2MzIzMywiZXhwIjoyMDgzNDM5MjMzfQ.0nLPfin8KlTi6Bd663PN711klCEhaCHgCTAgYv367Ys';

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectProfiles() {
    console.log('--- Inspecting Profiles ---');

    const { data: allProfiles, error: pError } = await supabase.from('profiles').select('*');
    const { data: allControls, error: cError } = await supabase.from('admin_controls').select('*');

    let output = '--- DATABASE INSPECTION REPORT ---\n\n';

    output += 'PROFILES:\n';
    if (pError) output += `Error: ${pError.message}\n`;
    else allProfiles.forEach(p => {
        output += `- ID: ${p.id} | UserID: ${p.user_id} | Name: ${p.full_name} | Email: ${p.email} | Role: ${p.role_type}\n`;
    });

    output += '\nADMIN CONTROLS:\n';
    if (cError) output += `Error: ${cError.message}\n`;
    else allControls.forEach(c => {
        output += `- ID: ${c.id} | ProfileRef: ${c.admin_profile_id} | Level: ${c.authority_level}\n`;
    });

    fs.writeFileSync('scripts/inspection_results.json', JSON.stringify({ profiles: allProfiles, controls: allControls }, null, 2));
    fs.writeFileSync('scripts/inspection_report.txt', output);

    console.log('Report saved to scripts/inspection_report.txt');
}

inspectProfiles();
