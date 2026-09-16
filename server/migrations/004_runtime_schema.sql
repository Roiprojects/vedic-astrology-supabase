-- Runtime tables used by user auth, subscriptions, and astrologer pages.
-- This migration is idempotent and must be applied before starting the app.

CREATE TABLE IF NOT EXISTS app_users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  phone TEXT,
  dob TEXT,
  tob TEXT,
  pob TEXT,
  gender TEXT,
  language TEXT,
  plan TEXT DEFAULT 'free',
  plan_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES app_users(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL,
  razorpay_sub_id TEXT,
  razorpay_plan_id TEXT,
  status TEXT DEFAULT 'created',
  current_start TIMESTAMPTZ,
  current_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS astrologers (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  image TEXT,
  verified BOOLEAN NOT NULL DEFAULT false,
  online BOOLEAN NOT NULL DEFAULT false,
  rating NUMERIC(3,1) NOT NULL DEFAULT 4.5,
  reviews INTEGER NOT NULL DEFAULT 0,
  experience_years INTEGER NOT NULL DEFAULT 0,
  languages JSONB NOT NULL DEFAULT '[]',
  specialties JSONB NOT NULL DEFAULT '[]',
  price_chat INTEGER NOT NULL DEFAULT 0,
  price_call INTEGER NOT NULL DEFAULT 0,
  about TEXT NOT NULL DEFAULT '',
  service_slug TEXT,
  featured BOOLEAN NOT NULL DEFAULT false,
  display_order INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE services ADD COLUMN IF NOT EXISTS image TEXT;
ALTER TABLE homams ADD COLUMN IF NOT EXISTS image TEXT;
