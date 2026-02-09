
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://omrpvcupdeslmrhqgcxt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9tcnB2Y3VwZGVzbG1yaHFnY3h0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzg2MzIzMywiZXhwIjoyMDgzNDM5MjMzfQ.0nLPfin8KlTi6Bd663PN711klCEhaCHgCTAgYv367Ys';

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrateControls() {
    console.log('--- Starting Database Alignment Migration ---');

    // 1. Fetch all profiles and all controls
    const { data: profiles } = await supabase.from('profiles').select('id, user_id');
    const { data: controls } = await supabase.from('admin_controls').select('*');

    console.log(`Found ${profiles.length} profiles and ${controls.length} control records.`);

    for (const control of controls) {
        // Find if this control is currently linked via a UserID instead of a Profile ID
        const matchingProfileByUserId = profiles.find(p => p.user_id === control.admin_profile_id);
        const matchingProfileById = profiles.find(p => p.id === control.admin_profile_id);

        if (matchingProfileByUserId && !matchingProfileById) {
            console.log(`Mismatch detected! Control ${control.id} uses UserID ${control.admin_profile_id}. Updating to Profile ID ${matchingProfileByUserId.id}`);

            const { error } = await supabase
                .from('admin_controls')
                .update({ admin_profile_id: matchingProfileByUserId.id })
                .eq('id', control.id);

            if (error) {
                console.error(`Failed to update control ${control.id}:`, error.message);
                if (error.message.includes('foreign key')) {
                    console.log('Postgres rejected the Profile ID. This implies the constraint is extremely confused.');
                }
            } else {
                console.log(`Successfully aligned control ${control.id}`);
            }
        } else if (matchingProfileById) {
            console.log(`Control ${control.id} is already correctly aligned with Profile ID.`);
        } else {
            console.log(`Control ${control.id} uses ID ${control.admin_profile_id} which doesn't match any profile!`);
        }
    }

    console.log('--- Migration Complete ---');
}

migrateControls();
