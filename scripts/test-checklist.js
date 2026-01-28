
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://omrpvcupdeslmrhqgcxt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9tcnB2Y3VwZGVzbG1yaHFnY3h0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzg2MzIzMywiZXhwIjoyMDgzNDM5MjMzfQ.0nLPfin8KlTi6Bd663PN711klCEhaCHgCTAgYv367Ys';

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectChecklists() {
    console.log('--- Inspecting Compliance Checklists ---');

    const { data: checklists, error: cError } = await supabase.from('compliance_checklists').select('*');

    if (cError) {
        console.error('Error fetching checklists:', cError);
        return;
    }

    console.log('Checklists found:', checklists.length);
    checklists.forEach(c => {
        console.log(`- ID: ${c.id} | Task: ${c.task_name} | Status: ${c.status}`);
    });

    // Attempt to insert a dummy checklist item to see error
    console.log('\n--- Testing Insert ---');
    const { error: iError } = await supabase.from('compliance_checklists').insert([{
        task_name: 'Test Task ' + new Date().getTime(),
        frequency: 'Monthly',
        due_date: new Date().toISOString().split('T')[0],
        status: 'Pending'
    }]);

    if (iError) {
        console.error('Insert Error:', iError);
    } else {
        console.log('Insert Success!');
    }
}

inspectChecklists();
