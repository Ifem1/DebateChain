-- DebateChain Supabase Schema
-- These tables are cache/index only. GenLayer is the source of truth.
-- Verdicts are NEVER generated here. Only cached after reading from contract.

CREATE TABLE IF NOT EXISTS debates_cache (
  debate_id TEXT PRIMARY KEY,
  topic TEXT,
  creator TEXT,
  opponent TEXT,
  status TEXT,
  side_a_label TEXT,
  side_b_label TEXT,
  debate_type TEXT,
  created_at BIGINT,
  debate_json TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS submissions_cache (
  submission_id TEXT PRIMARY KEY,
  debate_id TEXT,
  side TEXT,
  round TEXT,
  submitted_by TEXT,
  submission_json TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Verdicts cached ONLY after reading from GenLayer contract.
-- This table must NEVER be used to decide debate outcomes.
CREATE TABLE IF NOT EXISTS verdicts_cache (
  debate_id TEXT PRIMARY KEY,
  winner TEXT,           -- copied from on-chain verdict for indexing only
  side_a_score INT,      -- copied from on-chain verdict for indexing only
  side_b_score INT,      -- copied from on-chain verdict for indexing only
  verdict_json TEXT,     -- full verdict JSON from contract
  cached_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS profiles_cache (
  address TEXT PRIMARY KEY,
  debates_total INT DEFAULT 0,
  wins INT DEFAULT 0,
  losses INT DEFAULT 0,
  draws INT DEFAULT 0,
  win_rate FLOAT DEFAULT 0,
  fallacy_count INT DEFAULT 0,
  profile_json TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  address TEXT,
  debate_id TEXT,
  type TEXT,  -- 'join_request' | 'debate_judged' | 'dispute_update' | 'finalized'
  message TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_debates_creator ON debates_cache(creator);
CREATE INDEX IF NOT EXISTS idx_debates_opponent ON debates_cache(opponent);
CREATE INDEX IF NOT EXISTS idx_debates_status ON debates_cache(status);
CREATE INDEX IF NOT EXISTS idx_debates_created ON debates_cache(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_submissions_debate ON submissions_cache(debate_id);
CREATE INDEX IF NOT EXISTS idx_profiles_wins ON profiles_cache(wins DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_address ON notifications(address);
