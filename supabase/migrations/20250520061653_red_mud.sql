/*
  # Create user settings table

  1. New Tables
    - `user_settings`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `theme_preference` (text, default 'dark')
      - `notification_preferences` (jsonb)
      - `account_settings` (jsonb)
      - `last_updated_at` (timestamp)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on user_settings table
    - Add policies for authenticated users to manage their own settings
    - Add trigger for updating last_updated_at
*/

-- Create user settings table
CREATE TABLE IF NOT EXISTS user_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  theme_preference text NOT NULL DEFAULT 'dark'
    CHECK (theme_preference = ANY (ARRAY['light'::text, 'dark'::text])),
  notification_preferences jsonb NOT NULL DEFAULT '{"push": true, "email": true}'::jsonb,
  account_settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  last_updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS user_settings_user_id_idx ON user_settings(user_id);
CREATE INDEX IF NOT EXISTS user_settings_updated_at_idx ON user_settings(last_updated_at);

-- Enable Row Level Security
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
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

CREATE POLICY "Users can view own settings"
  ON user_settings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create function to update last_updated_at
CREATE OR REPLACE FUNCTION update_last_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER update_user_settings_timestamp
  BEFORE UPDATE ON user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_last_updated_at();