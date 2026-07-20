-- Talent Marketplace Database Schema
-- Run this in the Supabase SQL editor

-- Users table (extends Supabase auth.users concept, but we store our own)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  department TEXT,
  role TEXT NOT NULL DEFAULT 'applicant' CHECK (role IN ('administrator', 'recruiter', 'applicant')),
  current_skills TEXT[] DEFAULT '{}',
  skills_to_develop TEXT[] DEFAULT '{}',
  career_direction TEXT,
  bio TEXT,
  open_to_opportunities BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Opportunities table
CREATE TABLE IF NOT EXISTS opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('gig', 'vacancy', 'developmental_job_immersion')),
  department TEXT NOT NULL,
  duration TEXT,
  description TEXT NOT NULL,
  key_skills TEXT[] DEFAULT '{}',
  bandwidth TEXT CHECK (bandwidth IN ('full_time', '50_percent', '30_percent', 'ad_hoc')),
  available_slots INTEGER DEFAULT 1,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'closed')),
  posted_by UUID REFERENCES users(id) ON DELETE SET NULL,
  attachment_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Matches table (applications)
CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  essay TEXT,
  status TEXT DEFAULT 'applied' CHECK (status IN ('applied', 'accepted', 'rejected')),
  match_score INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(opportunity_id, user_id)
);

-- Feedbacks table
CREATE TABLE IF NOT EXISTS feedbacks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user UUID REFERENCES users(id) ON DELETE SET NULL,
  opportunity_id UUID REFERENCES opportunities(id) ON DELETE CASCADE,
  comment TEXT,
  star INTEGER CHECK (star BETWEEN 1 AND 5),
  show_on_home BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  to_user UUID REFERENCES users(id) ON DELETE CASCADE,
  related_id UUID,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_opportunities_status ON opportunities(status);
CREATE INDEX IF NOT EXISTS idx_opportunities_type ON opportunities(type);
CREATE INDEX IF NOT EXISTS idx_opportunities_department ON opportunities(department);
CREATE INDEX IF NOT EXISTS idx_opportunities_posted_by ON opportunities(posted_by);
CREATE INDEX IF NOT EXISTS idx_matches_opportunity_id ON matches(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_matches_user_id ON matches(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_to_user ON notifications(to_user);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);

-- Seed admin user (password: Admin@123)
-- bcrypt hash for "Admin@123"
INSERT INTO users (email, password_hash, first_name, last_name, role, department)
VALUES (
  'admin@abc.com',
  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uFutLmKW6',
  'Admin',
  'User',
  'administrator',
  'IT'
) ON CONFLICT (email) DO NOTHING;
