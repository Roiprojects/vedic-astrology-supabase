-- ============================================================
-- Vedic Astrology — PostgreSQL Schema
-- ============================================================

-- ── Admin sessions (simple JWT-based, no Supabase auth) ─────
CREATE TABLE IF NOT EXISTS admin_users (
  id          SERIAL PRIMARY KEY,
  username    TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ── Service categories ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS service_categories (
  id            SERIAL PRIMARY KEY,
  slug          TEXT NOT NULL UNIQUE,
  name          TEXT NOT NULL,
  description   TEXT DEFAULT '',
  icon          TEXT DEFAULT '🔮',
  href          TEXT DEFAULT '',
  display_order INTEGER DEFAULT 0,
  active        BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- ── Astrology services ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS services (
  id                SERIAL PRIMARY KEY,
  slug              TEXT NOT NULL UNIQUE,
  title             TEXT NOT NULL,
  category_slug     TEXT DEFAULT 'astrology-consultations',
  icon              TEXT DEFAULT '🔮',
  short_description TEXT DEFAULT '',
  full_description  TEXT DEFAULT '',
  problem           TEXT DEFAULT '',
  price             INTEGER DEFAULT 0,
  discount_price    INTEGER,
  duration          TEXT DEFAULT '',
  gradient          TEXT DEFAULT '',
  analysis          JSONB DEFAULT '[]',
  receive           JSONB DEFAULT '[]',
  benefits          JSONB DEFAULT '[]',
  remedies          JSONB DEFAULT '[]',
  faqs              JSONB DEFAULT '[]',
  featured          BOOLEAN DEFAULT false,
  display_order     INTEGER DEFAULT 0,
  active            BOOLEAN DEFAULT true,
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);

-- ── Homams ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS homams (
  id                   SERIAL PRIMARY KEY,
  slug                 TEXT NOT NULL UNIQUE,
  name                 TEXT NOT NULL,
  icon                 TEXT DEFAULT '🔥',
  short_benefit        TEXT DEFAULT '',
  full_description     TEXT DEFAULT '',
  price                INTEGER DEFAULT 0,
  discount_price       INTEGER,
  duration             TEXT DEFAULT '',
  gradient             TEXT DEFAULT '',
  benefits             JSONB DEFAULT '[]',
  suitable_for         JSONB DEFAULT '[]',
  pooja_items          JSONB DEFAULT '[]',
  booking_instructions TEXT DEFAULT '',
  faqs                 JSONB DEFAULT '[]',
  featured             BOOLEAN DEFAULT false,
  display_order        INTEGER DEFAULT 0,
  active               BOOLEAN DEFAULT true,
  created_at           TIMESTAMPTZ DEFAULT now(),
  updated_at           TIMESTAMPTZ DEFAULT now()
);

-- ── Informational pages (birth-chart-pdf, chat, palm) ───────
CREATE TABLE IF NOT EXISTS pages (
  id         SERIAL PRIMARY KEY,
  slug       TEXT NOT NULL UNIQUE,
  title      TEXT NOT NULL DEFAULT '',
  content    JSONB DEFAULT '{}',
  active     BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ── Testimonials ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS testimonials (
  id             SERIAL PRIMARY KEY,
  name           TEXT NOT NULL,
  location       TEXT DEFAULT '',
  rating         INTEGER DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  service_type   TEXT DEFAULT 'all',
  text           TEXT NOT NULL,
  date           DATE DEFAULT CURRENT_DATE,
  avatar_initial TEXT DEFAULT '',
  featured       BOOLEAN DEFAULT false,
  display_order  INTEGER DEFAULT 0,
  active         BOOLEAN DEFAULT true,
  created_at     TIMESTAMPTZ DEFAULT now(),
  updated_at     TIMESTAMPTZ DEFAULT now()
);

-- ── Enquiries / Bookings ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS enquiries (
  id               SERIAL PRIMARY KEY,
  reference        TEXT NOT NULL UNIQUE,
  variant          TEXT NOT NULL,
  subject          TEXT DEFAULT '',
  name             TEXT NOT NULL,
  phone            TEXT NOT NULL,
  email            TEXT,
  dob              DATE,
  tob              TEXT,
  pob              TEXT,
  gender           TEXT,
  preferred_mode   TEXT,
  preferred_date   DATE,
  message          TEXT,
  service_interested TEXT,
  preferred_contact  TEXT,
  status           TEXT DEFAULT 'new',
  payment_id       TEXT,
  payment_amount   INTEGER,
  created_at       TIMESTAMPTZ DEFAULT now(),
  updated_at       TIMESTAMPTZ DEFAULT now()
);

-- ── Media library ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS media_library (
  id          SERIAL PRIMARY KEY,
  filename    TEXT NOT NULL,
  original_name TEXT NOT NULL,
  mime_type   TEXT NOT NULL,
  size_bytes  INTEGER NOT NULL,
  url         TEXT NOT NULL,
  alt_text    TEXT DEFAULT '',
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ── Site settings ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS settings (
  key        TEXT PRIMARY KEY,
  value      JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ── Audit log ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_logs (
  id         SERIAL PRIMARY KEY,
  action     TEXT NOT NULL,
  entity     TEXT,
  entity_id  TEXT,
  details    JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── Indexes ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_services_active   ON services(active, display_order);
CREATE INDEX IF NOT EXISTS idx_services_featured ON services(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_homams_active     ON homams(active, display_order);
CREATE INDEX IF NOT EXISTS idx_homams_featured   ON homams(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_testimonials_active ON testimonials(active, date DESC);
CREATE INDEX IF NOT EXISTS idx_enquiries_created ON enquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_enquiries_status  ON enquiries(status);
