
import { createClient } from '@supabase/supabase-js';

// Project ID: xbfpjrdiwzxnohbnpneg
const supabaseUrl = 'https://xbfpjrdiwzxnohbnpneg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhiZnBqcmRpd3p4bm9oYm5wbmVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1NzAyODIsImV4cCI6MjA4NDE0NjI4Mn0.rpUzG3dLR7nby8iY4HX6Nyr6Xt8mFTFSIDUTPiLWN68';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
