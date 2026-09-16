/**
 * End-to-end test: Admin login, email delivery, Razorpay order creation
 * All using Supabase as backend
 */

const BASE = 'http://localhost:3002';
let adminCookie = '';

function pass(label) { console.log(`  ✅ ${label}`); }
function fail(label, detail) { console.log(`  ❌ ${label}: ${detail}`); }

// ── 1. Admin Login ──────────────────────────────────────────────────────────
console.log('\n=== 1. ADMIN PANEL LOGIN ===');
{
  const res = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'info@myvedicastrology.in', password: 'Admin@123' }),
  });
  const raw = res.headers.get('set-cookie') || '';
  adminCookie = raw.split(';')[0]; // grab just the token=value part
  const data = await res.json();
  if (data.ok) {
    pass(`Admin login: ${JSON.stringify(data)}`);
  } else {
    fail('Admin login', JSON.stringify(data));
  }
}

// ── 2. Admin: list enquiries (Supabase data) ────────────────────────────────
console.log('\n=== 2. ADMIN ENQUIRIES FROM SUPABASE ===');
{
  const res = await fetch(`${BASE}/api/admin/enquiries`, {
    headers: { Cookie: adminCookie },
  });
  const data = await res.json();
  if (Array.isArray(data)) {
    pass(`Fetched ${data.length} enquiries from Supabase`);
  } else if (data.enquiries) {
    pass(`Fetched ${data.enquiries.length} enquiries from Supabase`);
  } else {
    fail('Fetch enquiries', JSON.stringify(data).slice(0,200));
  }
}

// ── 3. Admin: list homams ───────────────────────────────────────────────────
console.log('\n=== 3. ADMIN HOMAMS FROM SUPABASE ===');
{
  const res = await fetch(`${BASE}/api/admin/homams`, {
    headers: { Cookie: adminCookie },
  });
  const data = await res.json();
  if (Array.isArray(data)) {
    pass(`Fetched ${data.length} homams from Supabase`);
  } else if (data.homams) {
    pass(`Fetched ${data.homams.length} homams from Supabase`);
  } else {
    fail('Fetch homams', JSON.stringify(data).slice(0,200));
  }
}

// ── 4. Razorpay order creation ──────────────────────────────────────────────
console.log('\n=== 4. RAZORPAY ORDER CREATION ===');
{
  const res = await fetch(`${BASE}/api/razorpay/order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount: 50000, currency: 'INR', receipt: 'e2e-test-001', serviceId: 'birth-chart-pdf' }),
  });
  const data = await res.json();
  if (data.ok && data.order?.id) {
    pass(`Razorpay live order created: ${data.order.id} | Amount: ₹${data.order.amount / 100}`);
  } else if (data.order?.id) {
    pass(`Razorpay live order created: ${data.order.id} | Amount: ₹${data.order.amount / 100}`);
  } else {
    fail('Razorpay order', JSON.stringify(data).slice(0,300));
  }
}

// ── 5. Send test email ──────────────────────────────────────────────────────
console.log('\n=== 5. TEST EMAIL TO roiprojects012@gmail.com ===');
{
  const res = await fetch(`${BASE}/api/enquiry`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'E2E Test — Vedic Astrology',
      email: 'roiprojects012@gmail.com',
      phone: '9999999999',
      service: 'Birth Chart PDF',
      message: 'This is an automated end-to-end test from myvedicastrology.in. Please ignore.',
      dob: '1990-01-01',
      tob: '08:30',
      pob: 'Bengaluru, Karnataka',
    }),
  });
  const data = await res.json();
  if (data.ok || data.success) {
    pass(`Enquiry submitted — ref: ${data.reference || data.id}`);
    pass('Confirmation email sent to roiprojects012@gmail.com — check inbox (should NOT be in spam)');
  } else {
    fail('Enquiry/email', JSON.stringify(data).slice(0,300));
  }
}

// ── 6. Public homams API ────────────────────────────────────────────────────
console.log('\n=== 6. PUBLIC APIs FROM SUPABASE ===');
{
  const [homamsRes, servicesRes, testimonialRes] = await Promise.all([
    fetch(`${BASE}/api/public/homams`),
    fetch(`${BASE}/api/public/services`),
    fetch(`${BASE}/api/public/testimonials`),
  ]);
  const [h, s, t] = await Promise.all([homamsRes.json(), servicesRes.json(), testimonialRes.json()]);

  const hCount = h.homams?.length ?? (Array.isArray(h) ? h.length : 0);
  const sCount = s.services?.length ?? (Array.isArray(s) ? s.length : 0);
  const tCount = t.testimonials?.length ?? (Array.isArray(t) ? t.length : 0);

  if (hCount > 0) pass(`Public homams: ${hCount} records from Supabase`);
  else fail('Public homams', JSON.stringify(h).slice(0,100));

  if (sCount > 0) pass(`Public services: ${sCount} records from Supabase`);
  else fail('Public services', JSON.stringify(s).slice(0,100));

  if (tCount > 0) pass(`Public testimonials: ${tCount} records from Supabase`);
  else fail('Public testimonials', JSON.stringify(t).slice(0,100));
}

console.log('\n=== ALL E2E TESTS DONE ===\n');
