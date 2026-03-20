/*
  # Design System and Enhanced Features

  1. New Tables
    - `design_styles`
      - Stores UI/UX design styles with thumbnails and prompts
      - Categories: taste, soft, minimalist, brutalist, custom
    
    - `starter_templates`
      - Pre-built templates for different project categories
      - Categories: Technology, E-commerce, Portfolio, Marketing, Film/TV, Music, Booking
    
    - `hosting_providers`
      - Custom hosting provider configurations
      - Supports: GoDaddy, Digital Ocean, Supabase, Netlify, Vercel
    
    - `api_configurations`
      - User API key configurations for various services
      - Encrypted storage for sensitive keys
    
    - `user_preferences`
      - Design variance, motion intensity, visual density settings
      - Selected styles and templates

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

CREATE TABLE IF NOT EXISTS design_styles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  description text,
  thumbnail_url text,
  animation_preview_url text,
  prompt_template text NOT NULL,
  parameters jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS starter_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  description text,
  thumbnail_url text,
  preview_url text,
  template_code text,
  dependencies jsonb DEFAULT '[]',
  features jsonb DEFAULT '[]',
  difficulty text DEFAULT 'beginner',
  tags text[] DEFAULT '{}',
  is_featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS hosting_providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  provider_name text NOT NULL,
  provider_type text NOT NULL,
  api_endpoint text,
  configuration jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  last_used timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS api_configurations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  service_name text NOT NULL,
  service_type text NOT NULL,
  api_key_encrypted text,
  configuration jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  last_validated timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, service_name)
);

CREATE TABLE IF NOT EXISTS user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  design_variance integer DEFAULT 5 CHECK (design_variance >= 1 AND design_variance <= 10),
  motion_intensity integer DEFAULT 5 CHECK (motion_intensity >= 1 AND motion_intensity <= 10),
  visual_density integer DEFAULT 5 CHECK (visual_density >= 1 AND visual_density <= 10),
  selected_design_style uuid REFERENCES design_styles(id),
  favorite_templates uuid[] DEFAULT '{}',
  custom_prompts jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE design_styles ENABLE ROW LEVEL SECURITY;
ALTER TABLE starter_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE hosting_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view design styles"
  ON design_styles FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Anyone can view starter templates"
  ON starter_templates FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can view own hosting providers"
  ON hosting_providers FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own hosting providers"
  ON hosting_providers FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own hosting providers"
  ON hosting_providers FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own hosting providers"
  ON hosting_providers FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own api configurations"
  ON api_configurations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own api configurations"
  ON api_configurations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own api configurations"
  ON api_configurations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own api configurations"
  ON api_configurations FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own preferences"
  ON user_preferences FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
  ON user_preferences FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON user_preferences FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_design_styles_category ON design_styles(category);
CREATE INDEX idx_starter_templates_category ON starter_templates(category);
CREATE INDEX idx_hosting_providers_user ON hosting_providers(user_id);
CREATE INDEX idx_api_configurations_user ON api_configurations(user_id);
CREATE INDEX idx_user_preferences_user ON user_preferences(user_id);