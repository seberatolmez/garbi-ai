-- ============================================
-- Garbi Database Schema for Supabase
-- ============================================

-- Plan Type Enum
CREATE TYPE user_plan AS ENUM ('free', 'premium');

-- Users Table (synced with Google OAuth)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  profile_image TEXT,
  plan user_plan DEFAULT 'free',
  daily_request_count INT DEFAULT 0,
  last_request_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Preferences Table
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  preferences JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE UNIQUE INDEX idx_users_email ON users(email);
CREATE UNIQUE INDEX idx_user_preferences_user_id ON user_preferences(user_id);

-- Updated_at Trigger Function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to users table
CREATE TRIGGER users_updated_at 
  BEFORE UPDATE ON users
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at();

-- Apply trigger to user_preferences table
CREATE TRIGGER user_preferences_updated_at 
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at();

-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own data
-- Note: For Next.js API routes, you may need to use service_role key
-- or adjust these policies based on your auth setup

CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (true);  -- Adjust based on your auth strategy

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (true);  -- Adjust based on your auth strategy

CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  WITH CHECK (true);  -- Adjust based on your auth strategy

CREATE POLICY "Users can view own preferences"
  ON user_preferences FOR SELECT
  USING (true);

CREATE POLICY "Users can update own preferences"
  ON user_preferences FOR UPDATE
  USING (true);

CREATE POLICY "Users can insert own preferences"
  ON user_preferences FOR INSERT
  WITH CHECK (true);

-- ============================================
-- Sample Data (Optional - for testing)
-- ============================================
-- INSERT INTO users (email, name, plan) VALUES ('test@example.com', 'Test User', 'free');
