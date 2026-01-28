
const { createClient } = require('@supabase/supabase-client');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectTable() {
    console.log('--- Inspecting approval_requests ---');
    const { data, error } = await supabase.from('approval_requests').select('*').limit(1);
    if (error) {
        console.error('Fetch Error:', error);
        return;
    }
    if (data && data.length > 0) {
        console.log('Sample Record:', data[0]);
        console.log('ID type:', typeof data[0].id);
    } else {
        console.log('No records found in approval_requests.');
    }
}

inspectTable();
