const { createClient } = require('@supabase/supabase-js')
const supabase = createClient(
  'https://fuoppkfjaltecymqghct.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1b3Bwa2ZqYWx0ZWN5bXFnaGN0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjMwODYwNCwiZXhwIjoyMDk3ODg0NjA0fQ.6og-th1LAuw6WfY5ly4xtXC0hRzga3HiOse-D5t895k',
  { auth: { autoRefreshToken: false, persistSession: false } }
)

async function run() {
  const { error: e1 } = await supabase
    .from('orders')
    .select('id')
    .limit(1)
  if (e1) console.log('Connection error:', e1.message)
  else console.log('Connected OK')
}
run()
