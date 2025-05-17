/*
  # User Settings and Profile Schema

  1. New Tables
    - `user_settings`
      - `id` (uuid, primary key)
      - `user_id` (references auth.users)
      - `theme_preference` (text)
      - `notification_preferences` (jsonb)
      - `account_settings` (jsonb)
      - `last_updated_at` (timestamp)
      
  2. Security
    - Enable RLS on user_settings table
    - Add policies for authenticated users to manage their own settings
*/

CREATE TABLE IF NOT EXISTS user_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  theme_preference text DEFAULT 'dark' NOT NULL,
  notification_preferences jsonb DEFAULT '{"email": true, "push": true}'::jsonb NOT NULL,
  account_settings jsonb DEFAULT '{}'::jsonb NOT NULL,
  last_updated_at timestamptz DEFAULT now() NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  
  CONSTRAINT valid_theme CHECK (theme_preference IN ('light', 'dark'))
);

-- Create indexes
CREATE INDEX IF NOT EXISTS user_settings_user_id_idx ON user_settings(user_id);
CREATE INDEX IF NOT EXISTS user_settings_updated_at_idx ON user_settings(last_updated_at);

-- Enable RLS
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own settings"
  ON user_settings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings"
  ON user_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
  ON user_settings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Function to update last_updated_at
CREATE OR REPLACE FUNCTION update_last_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update last_updated_at
CREATE TRIGGER update_user_settings_timestamp
  BEFORE UPDATE ON user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_last_updated_at();