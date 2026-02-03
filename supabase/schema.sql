-- SignalStack Database Schema for Supabase

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Accounts table (target companies to monitor)
CREATE TABLE IF NOT EXISTS accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  domain TEXT,
  industry TEXT,
  employee_count TEXT,
  linkedin_url TEXT,
  website TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, domain)
);

-- Enable RLS on accounts
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;

-- RLS policy for accounts
CREATE POLICY "Users can view their own accounts" ON accounts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own accounts" ON accounts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own accounts" ON accounts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own accounts" ON accounts
  FOR DELETE USING (auth.uid() = user_id);

-- Signals table (intent signals detected)
CREATE TABLE IF NOT EXISTS signals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  signal_type TEXT NOT NULL CHECK (signal_type IN ('job_posting', 'tech_change', 'funding', 'hiring_velocity')),
  details TEXT,
  strength INTEGER DEFAULT 50 CHECK (strength >= 0 AND strength <= 100),
  metadata JSONB DEFAULT '{}',
  source TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on signals
ALTER TABLE signals ENABLE ROW LEVEL SECURITY;

-- RLS policy for signals
CREATE POLICY "Users can view their own signals" ON signals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own signals" ON signals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own signals" ON signals
  FOR UPDATE USING (auth.uid() = user_id);

-- Alerts table (notification preferences)
CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  signal_type TEXT NOT NULL,
  min_strength INTEGER DEFAULT 50,
  email_enabled BOOLEAN DEFAULT TRUE,
  slack_webhook TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on alerts
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- RLS policy for alerts
CREATE POLICY "Users can manage their own alerts" ON alerts
  FOR ALL USING (auth.uid() = user_id);

-- Waitlist table (for early access signups)
CREATE TABLE IF NOT EXISTS waitlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  source TEXT DEFAULT 'landing_page',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on waitlist
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Anyone can insert into waitlist
CREATE POLICY "Anyone can join waitlist" ON waitlist
  FOR INSERT WITH CHECK (TRUE);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_signals_user_id ON signals(user_id);
CREATE INDEX IF NOT EXISTS idx_signals_created_at ON signals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_signals_signal_type ON signals(signal_type);
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_accounts_domain ON accounts(domain);