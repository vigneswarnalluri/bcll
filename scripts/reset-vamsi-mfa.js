
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://omrpvcupdeslmrhqgcxt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9tcnB2Y3VwZGVzbG1yaHFnY3h0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzg2MzIzMywiZXhwIjoyMDgzNDM5MjMzfQ.0nLPfin8KlTi6Bd663PN711klCEhaCHgCTAgYv367Ys';

// Use service role key
const supabase = createClient(supabaseUrl, supabaseKey);

const VAMSI_USER_ID = '6b756731-d662-4a89-b5f9-cd3c022e500d';

async function resetMFA() {
    console.log(`Checking MFA factors for Vamsi (ID: ${VAMSI_USER_ID})...`);

    // In Supabase Auth, MFA factors are in a separate table/API
    // We can list them for the user
    const { data: factors, error: listError } = await supabase.auth.admin.mfa.listFactors({
        userId: VAMSI_USER_ID
    });

    if (listError) {
        console.error('Error listing factors:', listError);
        return;
    }

    console.log('Factors found:', factors);

    if (factors && factors.factors && factors.factors.length > 0) {
        for (const factor of factors.factors) {
            console.log(`Deleting factor: ${factor.id} (${factor.status})...`);
            const { error: deleteError } = await supabase.auth.admin.mfa.deleteFactor({
                userId: VAMSI_USER_ID,
                factorId: factor.id
            });

            if (deleteError) {
                console.error(`Error deleting factor ${factor.id}:`, deleteError);
            } else {
                console.log(`Successfully deleted factor ${factor.id}`);
            }
        }
    } else {
        console.log('No MFA factors found for this user.');
    }

    console.log('MFA Reset Complete. Vamsi can now log in and will be prompted to enroll again.');
}

resetMFA();
