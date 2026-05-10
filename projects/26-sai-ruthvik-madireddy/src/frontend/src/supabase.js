import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://bbnqxamdoupqyidldkwf.supabase.co";
const SUPABASE_KEY = "sb_publishable_j6pbEMERmaIw2Yy_0z5ZvQ_DQ9uXni4";
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);