CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id INTEGER NOT NULL REFERENCES roles(id),
  name VARCHAR(150) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  phone VARCHAR(50),
  agency VARCHAR(150),
  notify_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  home_province VARCHAR(100),
  home_district VARCHAR(150),
  home_location GEOGRAPHY(POINT, 4326),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS agency VARCHAR(150);
ALTER TABLE users ADD COLUMN IF NOT EXISTS notify_enabled BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS home_province VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS home_district VARCHAR(150);
ALTER TABLE users ADD COLUMN IF NOT EXISTS home_location GEOGRAPHY(POINT, 4326);

CREATE TABLE IF NOT EXISTS risk_zones (
  id VARCHAR(20) PRIMARY KEY,
  province VARCHAR(100) UNIQUE NOT NULL,
  district VARCHAR(150),
  region VARCHAR(100) NOT NULL DEFAULT 'ไม่ระบุภูมิภาค',
  risk_level VARCHAR(20) NOT NULL CHECK (risk_level IN ('high', 'medium', 'low')),
  risk_score INTEGER NOT NULL CHECK (risk_score BETWEEN 0 AND 100),
  rainfall_mm NUMERIC(8, 2) NOT NULL DEFAULT 0,
  river_distance_km NUMERIC(8, 2) NOT NULL DEFAULT 0,
  elevation_m NUMERIC(8, 2) NOT NULL DEFAULT 0,
  center GEOGRAPHY(POINT, 4326) NOT NULL,
  affected_reports INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE risk_zones ADD COLUMN IF NOT EXISTS region VARCHAR(100) NOT NULL DEFAULT 'ไม่ระบุภูมิภาค';
CREATE INDEX IF NOT EXISTS risk_zones_region_idx ON risk_zones (region);
CREATE INDEX IF NOT EXISTS risk_zones_risk_score_idx ON risk_zones (risk_score DESC);

CREATE TABLE IF NOT EXISTS flood_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  public_id VARCHAR(30) UNIQUE NOT NULL,
  reporter_id UUID REFERENCES users(id) ON DELETE SET NULL,
  reporter_name VARCHAR(150) NOT NULL DEFAULT 'ผู้ใช้งานทั่วไป',
  province VARCHAR(100) NOT NULL,
  district VARCHAR(150),
  water_level VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  photo_url TEXT,
  urgent_help BOOLEAN NOT NULL DEFAULT FALSE,
  status VARCHAR(30) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'resolved', 'rejected')),
  location GEOGRAPHY(POINT, 4326) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS flood_reports_location_gix ON flood_reports USING GIST (location);
CREATE INDEX IF NOT EXISTS flood_reports_status_idx ON flood_reports (status);
CREATE INDEX IF NOT EXISTS flood_reports_created_at_idx ON flood_reports (created_at DESC);

CREATE TABLE IF NOT EXISTS broadcasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  public_id VARCHAR(30) UNIQUE NOT NULL,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  risk_level VARCHAR(30) NOT NULL CHECK (risk_level IN ('warning', 'red', 'evacuation')),
  target_province VARCHAR(100) NOT NULL,
  headline VARCHAR(255) NOT NULL,
  advisory TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS broadcasts_created_at_idx ON broadcasts (created_at DESC);
