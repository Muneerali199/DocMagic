-- User Profiles Table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  location TEXT,
  linkedin TEXT,
  portfolio TEXT,
  github TEXT,
  summary TEXT,
  experience JSONB DEFAULT '[]'::jsonb,
  education JSONB DEFAULT '[]'::jsonb,
  skills TEXT[] DEFAULT ARRAY[]::TEXT[],
  projects JSONB DEFAULT '[]'::jsonb,
  certifications JSONB DEFAULT '[]'::jsonb,
  languages TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Document Versions Table
CREATE TABLE IF NOT EXISTS document_versions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL,
  version_number INTEGER NOT NULL,
  content JSONB NOT NULL,
  changes_summary TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_auto_save BOOLEAN DEFAULT FALSE,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  UNIQUE(document_id, version_number)
);

-- Collaboration Sessions Table
CREATE TABLE IF NOT EXISTS collaboration_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL,
  document_type TEXT NOT NULL CHECK (document_type IN ('resume', 'presentation', 'cv', 'letter')),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  participants JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Document Changes Table (for collaboration history)
CREATE TABLE IF NOT EXISTS document_changes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES collaboration_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_name TEXT NOT NULL,
  change_type TEXT NOT NULL CHECK (change_type IN ('insert', 'delete', 'update', 'format')),
  path TEXT NOT NULL,
  old_value JSONB,
  new_value JSONB,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Share Permissions Table
CREATE TABLE IF NOT EXISTS share_permissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL,
  shared_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  shared_with TEXT NOT NULL, -- Email or user ID
  permission_level TEXT NOT NULL CHECK (permission_level IN ('view', 'edit', 'admin')),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(document_id, shared_with)
);

-- Template Customizations Table
CREATE TABLE IF NOT EXISTS template_customizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  template_id TEXT NOT NULL,
  customization_name TEXT NOT NULL,
  color_scheme JSONB NOT NULL,
  font_settings JSONB NOT NULL,
  layout_settings JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, template_id, customization_name)
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_document_versions_document_id ON document_versions(document_id);
CREATE INDEX IF NOT EXISTS idx_document_versions_created_by ON document_versions(created_by);
CREATE INDEX IF NOT EXISTS idx_collaboration_sessions_document_id ON collaboration_sessions(document_id);
CREATE INDEX IF NOT EXISTS idx_collaboration_sessions_owner_id ON collaboration_sessions(owner_id);
CREATE INDEX IF NOT EXISTS idx_document_changes_session_id ON document_changes(session_id);
CREATE INDEX IF NOT EXISTS idx_share_permissions_document_id ON share_permissions(document_id);
CREATE INDEX IF NOT EXISTS idx_share_permissions_shared_with ON share_permissions(shared_with);
CREATE INDEX IF NOT EXISTS idx_template_customizations_user_id ON template_customizations(user_id);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaboration_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_changes ENABLE ROW LEVEL SECURITY;
ALTER TABLE share_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_customizations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for document_versions
CREATE POLICY "Users can view versions of their documents" ON document_versions
  FOR SELECT USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM share_permissions
      WHERE document_id = document_versions.document_id
      AND shared_with = auth.uid()::text
    )
  );

CREATE POLICY "Users can create versions" ON document_versions
  FOR INSERT WITH CHECK (created_by = auth.uid());

-- RLS Policies for collaboration_sessions
CREATE POLICY "Users can view sessions they own or participate in" ON collaboration_sessions
  FOR SELECT USING (
    owner_id = auth.uid() OR
    participants::jsonb @> jsonb_build_array(jsonb_build_object('user_id', auth.uid()::text))
  );

CREATE POLICY "Users can create their own sessions" ON collaboration_sessions
  FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owners can update their sessions" ON collaboration_sessions
  FOR UPDATE USING (owner_id = auth.uid());

-- RLS Policies for share_permissions
CREATE POLICY "Users can view permissions they created or received" ON share_permissions
  FOR SELECT USING (
    shared_by = auth.uid() OR
    shared_with = auth.uid()::text
  );

CREATE POLICY "Users can create share permissions for their documents" ON share_permissions
  FOR INSERT WITH CHECK (shared_by = auth.uid());

CREATE POLICY "Users can delete permissions they created" ON share_permissions
  FOR DELETE USING (shared_by = auth.uid());

-- RLS Policies for template_customizations
CREATE POLICY "Users can view their own customizations" ON template_customizations
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own customizations" ON template_customizations
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own customizations" ON template_customizations
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own customizations" ON template_customizations
  FOR DELETE USING (user_id = auth.uid());

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_collaboration_sessions_updated_at
  BEFORE UPDATE ON collaboration_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_template_customizations_updated_at
  BEFORE UPDATE ON template_customizations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
