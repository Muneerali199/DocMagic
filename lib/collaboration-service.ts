import { createClient } from '@/lib/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface CollaborationSession {
  id: string;
  document_id: string;
  document_type: 'resume' | 'presentation' | 'cv' | 'letter';
  owner_id: string;
  participants: Participant[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Participant {
  user_id: string;
  user_name: string;
  user_email: string;
  role: 'owner' | 'editor' | 'viewer';
  cursor_position?: CursorPosition;
  last_active: string;
  color: string; // For cursor color
}

export interface CursorPosition {
  x: number;
  y: number;
  section?: string;
}

export interface DocumentChange {
  id: string;
  session_id: string;
  user_id: string;
  user_name: string;
  change_type: 'insert' | 'delete' | 'update' | 'format';
  path: string; // JSON path to the changed field
  old_value?: any;
  new_value?: any;
  timestamp: string;
}

export interface SharePermission {
  id?: string;
  document_id: string;
  shared_by: string;
  shared_with: string;
  permission_level: 'view' | 'edit' | 'admin';
  expires_at?: string;
  created_at?: string;
}

export class CollaborationService {
  private supabase = createClient();
  private channel: RealtimeChannel | null = null;
  private sessionId: string | null = null;

  /**
   * Create a new collaboration session
   */
  async createSession(
    documentId: string,
    documentType: string,
    ownerId: string
  ): Promise<CollaborationSession | null> {
    try {
      const { data, error } = await this.supabase
        .from('collaboration_sessions')
        .insert({
          document_id: documentId,
          document_type: documentType,
          owner_id: ownerId,
          is_active: true,
          participants: [],
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating collaboration session:', error);
        return null;
      }

      this.sessionId = data.id;
      return data;
    } catch (error) {
      console.error('Error in createSession:', error);
      return null;
    }
  }

  /**
   * Join an existing collaboration session
   */
  async joinSession(
    sessionId: string,
    userId: string,
    userName: string,
    userEmail: string,
    role: 'editor' | 'viewer' = 'viewer'
  ): Promise<boolean> {
    try {
      // Get current session
      const { data: session, error: fetchError } = await this.supabase
        .from('collaboration_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (fetchError || !session) {
        console.error('Session not found:', fetchError);
        return false;
      }

      // Add participant
      const participants = session.participants || [];
      const existingParticipant = participants.find(
        (p: Participant) => p.user_id === userId
      );

      if (!existingParticipant) {
        const newParticipant: Participant = {
          user_id: userId,
          user_name: userName,
          user_email: userEmail,
          role,
          last_active: new Date().toISOString(),
          color: this.generateUserColor(userId),
        };

        participants.push(newParticipant);

        const { error: updateError } = await this.supabase
          .from('collaboration_sessions')
          .update({ participants })
          .eq('id', sessionId);

        if (updateError) {
          console.error('Error joining session:', updateError);
          return false;
        }
      }

      this.sessionId = sessionId;
      return true;
    } catch (error) {
      console.error('Error in joinSession:', error);
      return false;
    }
  }

  /**
   * Subscribe to real-time changes
   */
  subscribeToChanges(
    sessionId: string,
    onDocumentChange: (change: DocumentChange) => void,
    onCursorMove: (userId: string, position: CursorPosition) => void,
    onParticipantJoin: (participant: Participant) => void,
    onParticipantLeave: (userId: string) => void
  ): void {
    this.channel = this.supabase.channel(`collaboration:${sessionId}`);

    // Listen for document changes
    this.channel.on('broadcast', { event: 'document_change' }, (payload) => {
      onDocumentChange(payload.payload as DocumentChange);
    });

    // Listen for cursor movements
    this.channel.on('broadcast', { event: 'cursor_move' }, (payload) => {
      onCursorMove(payload.payload.userId, payload.payload.position);
    });

    // Listen for participant joins
    this.channel.on('broadcast', { event: 'participant_join' }, (payload) => {
      onParticipantJoin(payload.payload as Participant);
    });

    // Listen for participant leaves
    this.channel.on('broadcast', { event: 'participant_leave' }, (payload) => {
      onParticipantLeave(payload.payload.userId);
    });

    this.channel.subscribe();
  }

  /**
   * Broadcast document change
   */
  async broadcastChange(change: Omit<DocumentChange, 'id' | 'timestamp'>): Promise<void> {
    if (!this.channel) return;

    const fullChange: DocumentChange = {
      ...change,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    };

    await this.channel.send({
      type: 'broadcast',
      event: 'document_change',
      payload: fullChange,
    });

    // Save to database for history
    await this.supabase.from('document_changes').insert(fullChange);
  }

  /**
   * Broadcast cursor position
   */
  async broadcastCursor(userId: string, position: CursorPosition): Promise<void> {
    if (!this.channel) return;

    await this.channel.send({
      type: 'broadcast',
      event: 'cursor_move',
      payload: { userId, position },
    });
  }

  /**
   * Share document with user
   */
  async shareDocument(
    documentId: string,
    sharedBy: string,
    sharedWith: string,
    permissionLevel: 'view' | 'edit' | 'admin',
    expiresAt?: string
  ): Promise<SharePermission | null> {
    try {
      const { data, error } = await this.supabase
        .from('share_permissions')
        .insert({
          document_id: documentId,
          shared_by: sharedBy,
          shared_with: sharedWith,
          permission_level: permissionLevel,
          expires_at: expiresAt,
        })
        .select()
        .single();

      if (error) {
        console.error('Error sharing document:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in shareDocument:', error);
      return null;
    }
  }

  /**
   * Get document permissions for user
   */
  async getDocumentPermissions(
    documentId: string,
    userId: string
  ): Promise<SharePermission | null> {
    try {
      const { data, error } = await this.supabase
        .from('share_permissions')
        .select('*')
        .eq('document_id', documentId)
        .eq('shared_with', userId)
        .single();

      if (error) {
        return null;
      }

      return data;
    } catch (error) {
      return null;
    }
  }

  /**
   * Leave collaboration session
   */
  async leaveSession(sessionId: string, userId: string): Promise<void> {
    if (this.channel) {
      await this.channel.send({
        type: 'broadcast',
        event: 'participant_leave',
        payload: { userId },
      });

      this.channel.unsubscribe();
      this.channel = null;
    }

    // Update participants list
    try {
      const { data: session } = await this.supabase
        .from('collaboration_sessions')
        .select('participants')
        .eq('id', sessionId)
        .single();

      if (session) {
        const participants = (session.participants || []).filter(
          (p: Participant) => p.user_id !== userId
        );

        await this.supabase
          .from('collaboration_sessions')
          .update({ participants })
          .eq('id', sessionId);
      }
    } catch (error) {
      console.error('Error leaving session:', error);
    }
  }

  /**
   * Generate unique color for user cursor
   */
  private generateUserColor(userId: string): string {
    const colors = [
      '#EF4444', '#F59E0B', '#10B981', '#3B82F6', 
      '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'
    ];
    
    const hash = userId.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    
    return colors[Math.abs(hash) % colors.length];
  }

  /**
   * Cleanup
   */
  cleanup(): void {
    if (this.channel) {
      this.channel.unsubscribe();
      this.channel = null;
    }
    this.sessionId = null;
  }
}

export const collaborationService = new CollaborationService();
