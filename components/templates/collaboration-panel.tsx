'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Share2, 
  Copy, 
  Mail,
  UserPlus,
  Crown,
  Eye,
  Edit,
  X
} from 'lucide-react';
import { 
  collaborationService, 
  Participant, 
  SharePermission 
} from '@/lib/collaboration-service';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface CollaborationPanelProps {
  documentId: string;
  documentType: 'resume' | 'presentation' | 'cv' | 'letter';
  userId: string;
  userName: string;
  userEmail: string;
  isOwner: boolean;
}

export function CollaborationPanel({
  documentId,
  documentType,
  userId,
  userName,
  userEmail,
  isOwner,
}: CollaborationPanelProps) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [shareEmail, setShareEmail] = useState('');
  const [sharePermission, setSharePermission] = useState<'view' | 'edit'>('view');
  const [shareLink, setShareLink] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);

  useEffect(() => {
    initializeCollaboration();
    return () => {
      collaborationService.cleanup();
    };
  }, [documentId]);

  const initializeCollaboration = async () => {
    if (isOwner) {
      await collaborationService.createSession(documentId, documentType, userId);
    }

    await collaborationService.joinSession(
      documentId,
      userId,
      userName,
      userEmail,
      isOwner ? 'editor' : 'viewer'
    );

    // Subscribe to real-time updates
    collaborationService.subscribeToChanges(
      documentId,
      (change) => {
        // Handle document changes
        console.log('Document changed:', change);
      },
      (userId, position) => {
        // Handle cursor movements
        console.log('Cursor moved:', userId, position);
      },
      (participant) => {
        setParticipants(prev => [...prev, participant]);
        toast.success(`${participant.user_name} joined`);
      },
      (userId) => {
        setParticipants(prev => prev.filter(p => p.user_id !== userId));
      }
    );

    // Generate share link
    const link = `${window.location.origin}/shared/${documentId}`;
    setShareLink(link);
  };

  const handleShareByEmail = async () => {
    if (!shareEmail.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    setIsSharing(true);
    const result = await collaborationService.shareDocument(
      documentId,
      userId,
      shareEmail,
      sharePermission
    );

    if (result) {
      toast.success(`Document shared with ${shareEmail}`);
      setShareEmail('');
      setShowShareDialog(false);
    } else {
      toast.error('Failed to share document');
    }
    setIsSharing(false);
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareLink);
    toast.success('Link copied to clipboard!');
  };

  const removeParticipant = async (participantId: string) => {
    // Remove participant logic
    setParticipants(prev => prev.filter(p => p.user_id !== participantId));
    toast.success('Participant removed');
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Collaboration
        </CardTitle>
        <CardDescription>
          Share and work together in real-time
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Active Participants */}
        <div>
          <Label className="mb-2 block">Active Now ({participants.length})</Label>
          <div className="space-y-2">
            {participants.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No one else is viewing this document
              </p>
            ) : (
              participants.map((participant) => (
                <div
                  key={participant.user_id}
                  className="flex items-center justify-between p-2 rounded-lg bg-muted"
                >
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8" style={{ borderColor: participant.color, borderWidth: 2 }}>
                      <AvatarFallback style={{ backgroundColor: participant.color + '20' }}>
                        {participant.user_name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{participant.user_name}</p>
                      <p className="text-xs text-muted-foreground">{participant.user_email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={participant.role === 'owner' ? 'default' : 'secondary'}>
                      {participant.role === 'owner' && <Crown className="h-3 w-3 mr-1" />}
                      {participant.role === 'editor' && <Edit className="h-3 w-3 mr-1" />}
                      {participant.role === 'viewer' && <Eye className="h-3 w-3 mr-1" />}
                      {participant.role}
                    </Badge>
                    {isOwner && participant.user_id !== userId && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeParticipant(participant.user_id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Share Options */}
        {isOwner && (
          <>
            <div className="border-t pt-4">
              <Label className="mb-2 block">Share Link</Label>
              <div className="flex gap-2">
                <Input value={shareLink} readOnly className="flex-1" />
                <Button onClick={copyShareLink} size="icon">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
              <DialogTrigger asChild>
                <Button className="w-full">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Invite by Email
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Invite Collaborator</DialogTitle>
                  <DialogDescription>
                    Share this document with someone via email
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Email Address</Label>
                    <Input
                      type="email"
                      placeholder="colleague@example.com"
                      value={shareEmail}
                      onChange={(e) => setShareEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Permission Level</Label>
                    <Select value={sharePermission} onValueChange={(value: 'view' | 'edit') => setSharePermission(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="view">
                          <div className="flex items-center gap-2">
                            <Eye className="h-4 w-4" />
                            Can View
                          </div>
                        </SelectItem>
                        <SelectItem value="edit">
                          <div className="flex items-center gap-2">
                            <Edit className="h-4 w-4" />
                            Can Edit
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    onClick={handleShareByEmail}
                    disabled={isSharing}
                    className="w-full"
                  >
                    {isSharing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Mail className="h-4 w-4 mr-2" />
                        Send Invitation
                      </>
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </>
        )}

        {/* Info */}
        <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg text-sm">
          <p className="text-blue-900 dark:text-blue-100">
            💡 Changes are synced in real-time. You can see others' cursors and edits as they happen!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
