"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { workspaceApi } from "@/lib/workspace-api";
import type { WorkspaceMember, WorkspaceRole } from "@/types/workspace";
import { ROLE_LABELS } from "@/types/workspace";
import { canManageMembers } from "@/lib/workspace-permissions";
import { Users, UserPlus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface WorkspaceMembersPanelProps {
  workspaceId: string;
  currentUserRole: WorkspaceRole;
}

export function WorkspaceMembersPanel({
  workspaceId,
  currentUserRole,
}: WorkspaceMembersPanelProps) {
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [email, setEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<WorkspaceRole>("viewer");
  const [loading, setLoading] = useState(false);

  const canManage = canManageMembers(currentUserRole);

  const loadMembers = useCallback(() => {
    workspaceApi
      .listMembers(workspaceId)
      .then(setMembers)
      .catch(() => setMembers([]));
  }, [workspaceId]);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  const handleInvite = async () => {
    if (!email.trim()) return;
    setLoading(true);
    try {
      await workspaceApi.inviteMember(workspaceId, email.trim(), inviteRole);
      toast.success("Member invited");
      setEmail("");
      loadMembers();
    } catch {
      toast.error(
        "Could not invite member. Ensure they have a DraftDeckAI account.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (memberId: string, role: WorkspaceRole) => {
    try {
      await workspaceApi.updateMemberRole(workspaceId, memberId, role);
      loadMembers();
      toast.success("Role updated");
    } catch {
      toast.error("Failed to update role");
    }
  };

  const handleRemove = async (memberId: string) => {
    try {
      await workspaceApi.removeMember(workspaceId, memberId);
      loadMembers();
      toast.success("Member removed");
    } catch {
      toast.error("Failed to remove member");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Users className="h-5 w-5" />
          Members ({members.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {canManage && (
          <div className="space-y-2 p-3 rounded-lg bg-muted/50">
            <Label>Invite by email</Label>
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                type="email"
                placeholder="teammate@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1"
              />
              <Select
                value={inviteRole}
                onValueChange={(v) => setInviteRole(v as WorkspaceRole)}
              >
                <SelectTrigger className="w-full sm:w-[130px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleInvite} disabled={loading}>
                <UserPlus className="h-4 w-4 mr-1" />
                Invite
              </Button>
            </div>
          </div>
        )}

        <ul className="space-y-2">
          {members.map((member) => {
            const user = member.user as
              | { email?: string; name?: string }
              | undefined;
            return (
              <li
                key={member.id}
                className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-lg border"
              >
                <div>
                  <p className="font-medium text-sm">
                    {user?.name || user?.email || member.user_id}
                  </p>
                  {user?.name && (
                    <p className="text-xs text-muted-foreground">
                      {user.email}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {canManage ? (
                    <Select
                      value={member.role}
                      onValueChange={(v) =>
                        handleRoleChange(member.id, v as WorkspaceRole)
                      }
                    >
                      <SelectTrigger className="w-[110px] h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="editor">Editor</SelectItem>
                        <SelectItem value="viewer">Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge variant="secondary">
                      {ROLE_LABELS[member.role]}
                    </Badge>
                  )}
                  {canManage && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={() => handleRemove(member.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
