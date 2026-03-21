/*
  # Admin System - Complete Platform Management

  1. New Tables
    - `admin_roles`
      - Define admin permission levels and capabilities
      - Hierarchical role system (super_admin, admin, moderator, support)
    
    - `admin_users`
      - Links users to admin roles
      - Tracks admin activity and status
    
    - `user_websites`
      - Tracks all websites created by users
      - Stores URLs, metadata, and creation info
    
    - `support_tickets`
      - User-reported issues and requests
      - Status tracking and admin responses
    
    - `ticket_responses`
      - Admin and user responses to tickets
      - Conversation threading
    
    - `showcase_submissions`
      - User-submitted websites for public showcase
      - Admin approval and moderation
    
    - `ai_model_configs`
      - AI model versions and configurations
      - Provider settings and defaults
    
    - `platform_activity_logs`
      - Audit trail for admin actions
      - System activity monitoring

  2. Security
    - RLS enabled on all tables
    - Admin-only policies for sensitive data
    - User policies for tickets and showcase
*/

-- Admin Roles
CREATE TABLE IF NOT EXISTS admin_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  display_name text NOT NULL,
  description text,
  permissions jsonb DEFAULT '{}',
  hierarchy_level integer NOT NULL DEFAULT 1,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Admin Users
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  role_id uuid REFERENCES admin_roles(id),
  is_active boolean DEFAULT true,
  last_active_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- User Websites
CREATE TABLE IF NOT EXISTS user_websites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  chat_id text,
  website_url text NOT NULL,
  preview_url text,
  title text,
  description text,
  thumbnail_url text,
  technology_stack jsonb DEFAULT '[]',
  is_active boolean DEFAULT true,
  view_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Support Tickets
CREATE TABLE IF NOT EXISTS support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  ticket_number text UNIQUE NOT NULL,
  subject text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  priority text DEFAULT 'medium',
  status text DEFAULT 'open',
  assigned_to uuid REFERENCES admin_users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  resolved_at timestamptz
);

-- Ticket Responses
CREATE TABLE IF NOT EXISTS ticket_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid REFERENCES support_tickets(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  is_admin_response boolean DEFAULT false,
  message text NOT NULL,
  attachments jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now()
);

-- Showcase Submissions
CREATE TABLE IF NOT EXISTS showcase_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  website_id uuid REFERENCES user_websites(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  screenshot_url text,
  live_url text NOT NULL,
  github_url text,
  tags text[] DEFAULT '{}',
  status text DEFAULT 'pending',
  featured boolean DEFAULT false,
  view_count integer DEFAULT 0,
  like_count integer DEFAULT 0,
  approved_by uuid REFERENCES admin_users(id),
  approved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- AI Model Configurations
CREATE TABLE IF NOT EXISTS ai_model_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL,
  model_name text NOT NULL,
  model_id text NOT NULL,
  version text,
  is_default boolean DEFAULT false,
  is_active boolean DEFAULT true,
  capabilities jsonb DEFAULT '{}',
  pricing jsonb DEFAULT '{}',
  rate_limits jsonb DEFAULT '{}',
  configuration jsonb DEFAULT '{}',
  release_date date,
  deprecated_date date,
  created_by uuid REFERENCES admin_users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(provider, model_id)
);

-- Platform Activity Logs
CREATE TABLE IF NOT EXISTS platform_activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid REFERENCES admin_users(id),
  action_type text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  changes jsonb DEFAULT '{}',
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX idx_admin_users_user_id ON admin_users(user_id);
CREATE INDEX idx_admin_users_role_id ON admin_users(role_id);
CREATE INDEX idx_user_websites_user_id ON user_websites(user_id);
CREATE INDEX idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX idx_support_tickets_status ON support_tickets(status);
CREATE INDEX idx_support_tickets_assigned ON support_tickets(assigned_to);
CREATE INDEX idx_ticket_responses_ticket_id ON ticket_responses(ticket_id);
CREATE INDEX idx_showcase_submissions_status ON showcase_submissions(status);
CREATE INDEX idx_showcase_submissions_user_id ON showcase_submissions(user_id);
CREATE INDEX idx_ai_model_configs_provider ON ai_model_configs(provider);
CREATE INDEX idx_platform_activity_logs_admin ON platform_activity_logs(admin_user_id);

-- Enable RLS
ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_websites ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE showcase_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_model_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_activity_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_uuid uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users
    WHERE user_id = user_uuid AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check admin role level
CREATE OR REPLACE FUNCTION get_admin_level(user_uuid uuid)
RETURNS integer AS $$
DECLARE
  admin_level integer;
BEGIN
  SELECT ar.hierarchy_level INTO admin_level
  FROM admin_users au
  JOIN admin_roles ar ON au.role_id = ar.id
  WHERE au.user_id = user_uuid AND au.is_active = true;
  
  RETURN COALESCE(admin_level, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies

-- Admin Roles (only admins can view)
CREATE POLICY "Admins can view all roles"
  ON admin_roles FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

CREATE POLICY "Super admins can manage roles"
  ON admin_roles FOR ALL
  TO authenticated
  USING (get_admin_level(auth.uid()) >= 4)
  WITH CHECK (get_admin_level(auth.uid()) >= 4);

-- Admin Users (only admins can view)
CREATE POLICY "Admins can view admin users"
  ON admin_users FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

CREATE POLICY "Super admins can manage admin users"
  ON admin_users FOR ALL
  TO authenticated
  USING (get_admin_level(auth.uid()) >= 4)
  WITH CHECK (get_admin_level(auth.uid()) >= 4);

-- User Websites (users can view their own, admins can view all)
CREATE POLICY "Users can view own websites"
  ON user_websites FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR is_admin(auth.uid()));

CREATE POLICY "Users can insert own websites"
  ON user_websites FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own websites"
  ON user_websites FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id OR is_admin(auth.uid()))
  WITH CHECK (auth.uid() = user_id OR is_admin(auth.uid()));

CREATE POLICY "Admins can delete websites"
  ON user_websites FOR DELETE
  TO authenticated
  USING (is_admin(auth.uid()));

-- Support Tickets (users can view their own, admins can view all)
CREATE POLICY "Users can view own tickets"
  ON support_tickets FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR is_admin(auth.uid()));

CREATE POLICY "Users can create tickets"
  ON support_tickets FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tickets"
  ON support_tickets FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all tickets"
  ON support_tickets FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- Ticket Responses
CREATE POLICY "Users can view responses to their tickets"
  ON ticket_responses FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM support_tickets
      WHERE id = ticket_responses.ticket_id
      AND (user_id = auth.uid() OR is_admin(auth.uid()))
    )
  );

CREATE POLICY "Users and admins can create responses"
  ON ticket_responses FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Showcase Submissions
CREATE POLICY "Anyone can view approved showcase"
  ON showcase_submissions FOR SELECT
  TO authenticated
  USING (status = 'approved' OR user_id = auth.uid() OR is_admin(auth.uid()));

CREATE POLICY "Users can submit to showcase"
  ON showcase_submissions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own submissions"
  ON showcase_submissions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all showcase submissions"
  ON showcase_submissions FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- AI Model Configs (admins only)
CREATE POLICY "Anyone can view active models"
  ON ai_model_configs FOR SELECT
  TO authenticated
  USING (is_active = true OR is_admin(auth.uid()));

CREATE POLICY "Admins can manage AI models"
  ON ai_model_configs FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- Activity Logs (admins only)
CREATE POLICY "Admins can view activity logs"
  ON platform_activity_logs FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

CREATE POLICY "System can insert activity logs"
  ON platform_activity_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Seed default admin roles
INSERT INTO admin_roles (name, display_name, description, hierarchy_level, permissions) VALUES
('super_admin', 'Super Administrator', 'Full system access with all permissions', 4, 
  '{"manage_users": true, "manage_admins": true, "manage_roles": true, "manage_models": true, "view_logs": true, "manage_showcase": true, "manage_tickets": true}'::jsonb),
('admin', 'Administrator', 'General administrative access', 3,
  '{"manage_users": true, "manage_models": true, "view_logs": true, "manage_showcase": true, "manage_tickets": true}'::jsonb),
('moderator', 'Moderator', 'Content moderation and showcase management', 2,
  '{"manage_showcase": true, "manage_tickets": true, "view_logs": true}'::jsonb),
('support', 'Support Agent', 'Customer support and ticket management', 1,
  '{"manage_tickets": true}'::jsonb)
ON CONFLICT (name) DO NOTHING;