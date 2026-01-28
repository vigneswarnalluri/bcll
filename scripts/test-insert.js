
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://omrpvcupdeslmrhqgcxt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9tcnB2Y3VwZGVzbG1yaHFnY3h0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzg2MzIzMywiZXhwIjoyMDgzNDM5MjMzfQ.0nLPfin8KlTi6Bd663PN711klCEhaCHgCTAgYv367Ys';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsert() {
    const { data: profiles } = await supabase.from('profiles').select('*');

    for (const p of profiles) {
        console.log(`Testing insert for ${p.full_name} (ID: ${p.id})...`);
        const { error } = await supabase.from('admin_controls').insert([{
            admin_profile_id: p.id,
            authority_level: 'L1'
        }]);

        if (error) {
            console.error(`FAILED: ${error.message} | Detail: ${error.details}`);
        } else {
            console.log(`SUCCESS: Created permissions for ${p.full_name}`);
        }
    }
}

testInsert();
