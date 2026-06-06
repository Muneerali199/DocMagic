/*
  Team collaboration workspaces (#848)

  - workspaces: team containers
  - workspace_members: role-based membership (admin, editor, viewer)
  - workspace_templates: shared template library per workspace
  - workspace_activity: activity feed
  - workspace_id on documents and templates (optional association)
*/

-- Role hierarchy helper: admin(3) > editor(2) > viewer(1)
CREATE OR REPLACE FUNCTION public.workspace_role_level(role text)
RETURNS int
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE role
    WHEN 'admin' THEN 3
    WHEN 'editor' THEN 2
    WHEN 'viewer' THEN 1
    ELSE 0
  END;
$$;

CREATE TABLE IF NOT EXISTS workspaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS workspace_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'editor', 'viewer')) DEFAULT 'viewer',
  invited_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  joined_at timestamptz DEFAULT now(),
  UNIQUE(workspace_id, user_id)
);

CREATE TABLE IF NOT EXISTS workspace_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
  template_id uuid REFERENCES templates(id) ON DELETE CASCADE NOT NULL,
  added_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(workspace_id, template_id)
);

CREATE TABLE IF NOT EXISTS workspace_activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  resource_type text NOT NULL CHECK (resource_type IN ('workspace', 'member', 'template', 'document', 'session')),
  resource_id uuid,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Optional workspace association on existing resources
ALTER TABLE documents ADD COLUMN IF NOT EXISTS workspace_id uuid REFERENCES workspaces(id) ON DELETE SET NULL;
ALTER TABLE templates ADD COLUMN IF NOT EXISTS workspace_id uuid REFERENCES workspaces(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_workspaces_owner_id ON workspaces(owner_id);
CREATE INDEX IF NOT EXISTS idx_workspaces_slug ON workspaces(slug);
CREATE INDEX IF NOT EXISTS idx_workspace_members_workspace_id ON workspace_members(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_members_user_id ON workspace_members(user_id);
CREATE INDEX IF NOT EXISTS idx_workspace_templates_workspace_id ON workspace_templates(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_activity_workspace_id ON workspace_activity(workspace_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_documents_workspace_id ON documents(workspace_id);
CREATE INDEX IF NOT EXISTS idx_templates_workspace_id ON templates(workspace_id);

-- Returns true if the current user is a member with at least min_role
CREATE OR REPLACE FUNCTION public.is_workspace_member(ws_id uuid, min_role text DEFAULT 'viewer')
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM workspace_members wm
    WHERE wm.workspace_id = ws_id
      AND wm.user_id = auth.uid()
      AND workspace_role_level(wm.role) >= workspace_role_level(min_role)
  )
  OR EXISTS (
    SELECT 1 FROM workspaces w
    WHERE w.id = ws_id AND w.owner_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.log_workspace_activity(
  ws_id uuid,
  act text,
  res_type text,
  res_id uuid DEFAULT NULL,
  meta jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO workspace_activity (workspace_id, actor_id, action, resource_type, resource_id, metadata)
  VALUES (ws_id, auth.uid(), act, res_type, res_id, meta);
END;
$$;

-- Auto-add owner as admin member on workspace create
CREATE OR REPLACE FUNCTION public.handle_new_workspace()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO workspace_members (workspace_id, user_id, role, invited_by)
  VALUES (NEW.id, NEW.owner_id, 'admin', NEW.owner_id)
  ON CONFLICT (workspace_id, user_id) DO NOTHING;

  PERFORM log_workspace_activity(NEW.id, 'workspace.created', 'workspace', NEW.id, jsonb_build_object('name', NEW.name));
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_workspace_created ON workspaces;
CREATE TRIGGER on_workspace_created
  AFTER INSERT ON workspaces
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_workspace();

-- RLS
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_activity ENABLE ROW LEVEL SECURITY;

-- Workspaces: members can read; admins can update; owner can delete
CREATE POLICY "workspace_select_member"
  ON workspaces FOR SELECT TO authenticated
  USING (is_workspace_member(id, 'viewer'));

CREATE POLICY "workspace_insert_owner"
  ON workspaces FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "workspace_update_admin"
  ON workspaces FOR UPDATE TO authenticated
  USING (is_workspace_member(id, 'admin'));

CREATE POLICY "workspace_delete_owner"
  ON workspaces FOR DELETE TO authenticated
  USING (owner_id = auth.uid());

-- Members
CREATE POLICY "workspace_members_select"
  ON workspace_members FOR SELECT TO authenticated
  USING (is_workspace_member(workspace_id, 'viewer'));

CREATE POLICY "workspace_members_insert_admin"
  ON workspace_members FOR INSERT TO authenticated
  WITH CHECK (is_workspace_member(workspace_id, 'admin'));

CREATE POLICY "workspace_members_update_admin"
  ON workspace_members FOR UPDATE TO authenticated
  USING (is_workspace_member(workspace_id, 'admin'));

CREATE POLICY "workspace_members_delete_admin_or_self"
  ON workspace_members FOR DELETE TO authenticated
  USING (
    is_workspace_member(workspace_id, 'admin')
    OR user_id = auth.uid()
  );

-- Shared templates
CREATE POLICY "workspace_templates_select"
  ON workspace_templates FOR SELECT TO authenticated
  USING (is_workspace_member(workspace_id, 'viewer'));

CREATE POLICY "workspace_templates_insert_editor"
  ON workspace_templates FOR INSERT TO authenticated
  WITH CHECK (is_workspace_member(workspace_id, 'editor'));

CREATE POLICY "workspace_templates_delete_editor"
  ON workspace_templates FOR DELETE TO authenticated
  USING (is_workspace_member(workspace_id, 'editor'));

-- Activity feed
CREATE POLICY "workspace_activity_select"
  ON workspace_activity FOR SELECT TO authenticated
  USING (is_workspace_member(workspace_id, 'viewer'));

CREATE POLICY "workspace_activity_insert_member"
  ON workspace_activity FOR INSERT TO authenticated
  WITH CHECK (is_workspace_member(workspace_id, 'viewer') AND actor_id = auth.uid());

-- Extend template read for workspace members
CREATE POLICY "workspace_members_read_workspace_templates"
  ON templates FOR SELECT TO authenticated
  USING (
    workspace_id IS NOT NULL
    AND is_workspace_member(workspace_id, 'viewer')
  );

-- Extend document read for workspace members (editors can update via API)
CREATE POLICY "workspace_members_read_workspace_documents"
  ON documents FOR SELECT TO authenticated
  USING (
    workspace_id IS NOT NULL
    AND is_workspace_member(workspace_id, 'viewer')
  );

CREATE POLICY "workspace_editors_update_workspace_documents"
  ON documents FOR UPDATE TO authenticated
  USING (
    workspace_id IS NOT NULL
    AND is_workspace_member(workspace_id, 'editor')
  );

-- Allow workspace co-members to see basic profile fields for member lists
CREATE POLICY "workspace_members_can_read_co_member_profiles"
  ON users FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM workspace_members wm_self
      JOIN workspace_members wm_other ON wm_self.workspace_id = wm_other.workspace_id
      WHERE wm_self.user_id = auth.uid()
        AND wm_other.user_id = users.id
    )
  );
