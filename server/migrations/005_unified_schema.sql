-- ============================================================
-- Migration 005: Unified single-DB schema
-- Adds all tables previously held in Supabase to the main
-- PostgreSQL database (vedic543).
-- ============================================================

-- ── User profiles (replaces Supabase app_profiles) ───────────
CREATE TABLE IF NOT EXISTS app_profiles (
  id TEXT PRIMARY KEY,
  display_name TEXT DEFAULT '',
  email TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  birth_name TEXT DEFAULT '',
  dob TEXT,
  tob TEXT DEFAULT '',
  pob TEXT DEFAULT '',
  gender TEXT DEFAULT '',
  language TEXT DEFAULT 'English',
  intention TEXT,
  sun_sign TEXT,
  moon_sign TEXT,
  ascendant TEXT,
  nakshatra TEXT,
  onboarding_complete BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Saved insights (replaces Supabase saved_insights) ────────
CREATE TABLE IF NOT EXISTS saved_insights (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES app_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_saved_insights_user ON saved_insights(user_id, created_at DESC);

-- ── AI conversations (replaces Supabase ai_conversations) ───
CREATE TABLE IF NOT EXISTS ai_conversations (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES app_profiles(id) ON DELETE CASCADE,
  messages JSONB NOT NULL DEFAULT '[]',
  service_title TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user ON ai_conversations(user_id);

-- ── Device push tokens (replaces Supabase device_push_tokens) ─
CREATE TABLE IF NOT EXISTS device_push_tokens (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES app_profiles(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  platform TEXT DEFAULT 'android',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, token)
);

-- ── Birth chart requests (replaces Supabase birth_chart_requests) ──
CREATE TABLE IF NOT EXISTS birth_chart_requests (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  dob TEXT,
  tob TEXT,
  pob TEXT,
  gender TEXT,
  notes TEXT,
  status TEXT DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_birth_chart_requests_created ON birth_chart_requests(created_at DESC);

-- ── Bookings (replaces Supabase bookings) ────────────────────
CREATE TABLE IF NOT EXISTS bookings (
  id SERIAL PRIMARY KEY,
  reference TEXT NOT NULL UNIQUE,
  variant TEXT NOT NULL DEFAULT 'consultation',
  subject TEXT DEFAULT '',
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  dob TEXT,
  tob TEXT,
  pob TEXT,
  gender TEXT,
  preferred_date DATE,
  preferred_mode TEXT,
  message TEXT,
  status TEXT DEFAULT 'new',
  payment_id TEXT,
  payment_amount INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_bookings_created ON bookings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);

-- ── Payments (replaces Supabase payments) ────────────────────
CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  razorpay_payment_id TEXT UNIQUE,
  razorpay_order_id TEXT,
  razorpay_sub_id TEXT,
  amount INTEGER DEFAULT 0,
  currency TEXT DEFAULT 'INR',
  status TEXT DEFAULT 'created',
  customer_email TEXT,
  customer_name TEXT,
  customer_phone TEXT,
  reference TEXT,
  service_name TEXT,
  raw_payload JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_payments_rzp_id ON payments(razorpay_payment_id);

-- ── Contact enquiries (replaces Supabase contact_enquiries) ──
CREATE TABLE IF NOT EXISTS contact_enquiries (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  subject TEXT,
  message TEXT,
  service_interested TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_contact_enquiries_created ON contact_enquiries(created_at DESC);

-- ── FAQs (replaces Supabase faqs) ────────────────────────────
CREATE TABLE IF NOT EXISTS faqs (
  id SERIAL PRIMARY KEY,
  question TEXT NOT NULL DEFAULT '',
  answer TEXT NOT NULL DEFAULT '',
  category TEXT DEFAULT 'general',
  display_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Home sections (replaces Supabase home_sections) ──────────
CREATE TABLE IF NOT EXISTS home_sections (
  id SERIAL PRIMARY KEY,
  section_key TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL DEFAULT '',
  subtitle TEXT DEFAULT '',
  content JSONB DEFAULT '{}',
  display_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── SEO settings (replaces Supabase seo_settings) ─────────────
CREATE TABLE IF NOT EXISTS seo_settings (
  id SERIAL PRIMARY KEY,
  page_slug TEXT NOT NULL UNIQUE,
  meta_title TEXT DEFAULT '',
  meta_description TEXT DEFAULT '',
  meta_keywords TEXT DEFAULT '',
  og_image TEXT,
  noindex BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Seed FAQs if empty ────────────────────────────────────────
INSERT INTO faqs (question, answer, category, display_order, active) VALUES
  ('What is Vedic Astrology?', 'Vedic Astrology (Jyotish) is an ancient Indian system of astrology based on the positions of celestial bodies at the time of your birth.', 'general', 1, true),
  ('How accurate is online astrology?', 'Online astrology provides general guidance based on your birth details. For personalized insights, we recommend a consultation with Guruji.', 'general', 2, true),
  ('What is a Nakshatra?', 'A Nakshatra is the lunar mansion or star constellation in Vedic astrology. There are 27 Nakshatras that form the basis for astrological calculations.', 'general', 3, true),
  ('How do I book a consultation?', 'You can book a consultation by filling out the enquiry form on our website or contacting us directly via WhatsApp.', 'general', 4, true),
  ('What information do I need for a birth chart?', 'You will need your full name, date of birth, time of birth, and place of birth to generate an accurate Vedic birth chart.', 'general', 5, true)
ON CONFLICT DO NOTHING;
