import { supabase } from './src/lib/supabase';

async function checkSchema() {
    const { data, error } = await supabase.from('volunteers').select('*').limit(1);
    if (error) {
        console.error('Error fetching volunteer:', error);
    } else if (data && data.length > 0) {
        console.log('Columns in volunteers table:', Object.keys(data[0]));
    } else {
        console.log('No volunteers found to check schema.');
    }
}

checkSchema();
