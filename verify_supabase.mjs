import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  host: 'aws-1-ap-south-1.pooler.supabase.com',
  port: 5432,
  database: 'postgres',
  user: 'postgres.bosnejioiwiqfcpwwnbi',
  password: 'Pramod@0605',
  ssl: { rejectUnauthorized: false }
});

console.log('\n=== SUPABASE VERIFICATION ===\n');

// 1. All table row counts
const tables = ['enquiries','settings','homams','services','testimonials',
  'app_users','astrologers','audit_logs','media_library','pages',
  'service_categories','user_subscriptions','admin_users'];

console.log('--- TABLE ROW COUNTS ---');
for (const t of tables) {
  try {
    const r = await pool.query(`SELECT COUNT(*) as c FROM ${t}`);
    console.log(`  ${t.padEnd(22)} ${r.rows[0].c} rows`);
  } catch(e) {
    console.log(`  ${t.padEnd(22)} ERROR: ${e.message}`);
  }
}

// 2. All secrets in settings table
console.log('\n--- SECRETS IN SETTINGS TABLE ---');
const secrets = await pool.query(
  "SELECT key, value::text FROM settings ORDER BY key"
);
secrets.rows.forEach(r => {
  const val = r.value?.replace(/^"|"$/g,'');
  const masked = val?.length > 20 ? val.slice(0,12) + '...' : val;
  console.log(`  ${r.key.padEnd(28)} ${masked}`);
});

// 3. Verify env vars are set
console.log('\n--- .ENV CRITICAL VARS ---');
const envChecks = [
  'PG_HOST','PG_USER','PG_PASSWORD','PG_SSL',
  'SUPABASE_URL','SUPABASE_ANON_KEY','SUPABASE_SERVICE_ROLE_KEY',
  'JWT_SECRET','ADMIN_EMAIL','ADMIN_PASSWORD',
  'RAZORPAY_KEY_ID','RAZORPAY_KEY_SECRET',
  'SMTP_HOST','SMTP_PORT','SMTP_USER','SMTP_PASS',
  'GEMINI_API_KEY','GEMINI_MODEL'
];
envChecks.forEach(k => {
  const v = process.env[k];
  const status = v ? '✅' : '❌ MISSING';
  const preview = v ? (v.length > 20 ? v.slice(0,14)+'...' : v) : '';
  console.log(`  ${k.padEnd(28)} ${status} ${preview}`);
});

await pool.end();
console.log('\n=== ALL CHECKS DONE ===\n');
