import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wcuopjnpvozstrisnmqr.supabase.co';
const supabaseKey = 'sb_publishable_IDF3KSfWfNroqpBpCWN9CA_HiZRfsF_';

export const supabase = createClient(supabaseUrl, supabaseKey);
