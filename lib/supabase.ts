import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://uogsjypcvdisujzeremr.supabase.co"
const supabaseKey = "sb_publishable_SO1xjwssmA27_EXeDpuGCA_UdlGyFSQ"

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
)