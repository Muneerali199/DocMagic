import { createClient } from "@/lib/supabase/client";
import { RealtimeChannel } from "@supabase/supabase-js";

export interface CollaborationSession {
  id: string;
  document_id: string;
  document_type: "resume" | "presentation" | "cv" | "letter";
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
  role: "owner" | "editor" | "viewer";
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
  change_type: "insert" | "delete" | "update" | "format";
  path: string; // JSON path to the changed field
  old_value?: unknown;
  new_value?: unknown;
  version?: number;
  timestamp: string;
}

export interface DiagramChange {
  id: string;
  session_id: string;
  mermaid_code: string;
  diagram_type: string;
  timestamp: string;
}

export interface SharePermission {
  id?: string;
  document_id: string;
  shared_by: string;
  shared_with: string;
  permission_level: "view" | "edit" | "admin";
  expires_at?: string;
  created_at?: string;
}

export class CollaborationService {
  private supabase = createClient();
  private channel: RealtimeChannel | null = null;
  private sessionId: string | null = null;
  private diagramChangeCallbacks: Array<(change: DiagramChange) => void> = [];
  private diagramChangeListenerAttached = false;
  private pendingChanges: Omit<DocumentChange, "id" | "timestamp">[] = [];
  private isConnected = true;
  private reconnectCallbacks: Array<() => void> = [];

  getSessionId(): string | null {
    return this.sessionId;
  }

  /**
   * Find an active session for a document or create one.
   */
  async getOrCreateSessionForDocument(
    documentId: string,
    documentType: string,
    ownerId: string,
  ): Promise<CollaborationSession | null> {
    try {
      const { data: existing } = await this.supabase
        .from("collaboration_sessions")
        .select("*")
        .eq("document_id", documentId)
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existing) {
        this.sessionId = existing.id;
        return existing;
      }

      return this.createSession(documentId, documentType, ownerId);
    } catch (error) {
      console.error("Error in getOrCreateSessionForDocument:", error);
      return null;
    }
  }

  /**
   * Create a new collaboration session
   */
  async createSession(
    documentId: string,
    documentType: string,
    ownerId: string,
  ): Promise<CollaborationSession | null> {
    try {
      const { data, error } = await this.supabase
        .from("collaboration_sessions")
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
        console.error("Error creating collaboration session:", error);
        return null;
      }

      this.sessionId = data.id;
      return data;
    } catch (error) {
      console.error("Error in createSession:", error);
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
    role: "editor" | "viewer" = "viewer",
  ): Promise<boolean> {
    try {
      // Get current session
      const { data: session, error: fetchError } = await this.supabase
        .from("collaboration_sessions")
        .select("*")
        .eq("id", sessionId)
        .single();

      if (fetchError || !session) {
        console.error("Session not found:", fetchError);
        return false;
      }

      // Add participant
      const participants = session.participants || [];
      const existingParticipant = participants.find(
        (p: Participant) => p.user_id === userId,
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
          .from("collaboration_sessions")
          .update({ participants })
          .eq("id", sessionId);

        if (updateError) {
          console.error("Error joining session:", updateError);
          return false;
        }
      }

      this.sessionId = sessionId;
      return true;
    } catch (error) {
      console.error("Error in joinSession:", error);
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
    onParticipantLeave: (userId: string) => void,
  ): void {
    if (this.channel) {
      this.channel.unsubscribe();
    }

    const channel = this.supabase.channel(`collaboration:${sessionId}`);
    this.channel = channel;
    this.diagramChangeListenerAttached = false;

    // Listen for document changes
    channel.on("broadcast", { event: "document_change" }, (payload) => {
      onDocumentChange(payload.payload as DocumentChange);
    });

    this.listenForDiagramChanges();

    // Listen for cursor movements
    channel.on("broadcast", { event: "cursor_move" }, (payload) => {
      onCursorMove(payload.payload.userId, payload.payload.position);
    });

    // Listen for participant joins
    channel.on("broadcast", { event: "participant_join" }, (payload) => {
      onParticipantJoin(payload.payload as Participant);
    });

    // Listen for participant leaves
    channel.on("broadcast", { event: "participant_leave" }, (payload) => {
      onParticipantLeave(payload.payload.userId);
    });

    channel.subscribe();
  }

  /**
   * Broadcast document change
   */
  async broadcastChange(
    change: Omit<DocumentChange, "id" | "timestamp">,
  ): Promise<void> {
    if (!this.channel) return;
    if (!this.isConnected) {
      this.pendingChanges.push(change);
      return;
    }

    const fullChange: DocumentChange = {
      ...change,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    };

    await this.channel.send({
      type: "broadcast",
      event: "document_change",
      payload: fullChange,
    });

    // Save to database for history (session_id required by schema)
    if (this.sessionId) {
      await this.supabase.from("document_changes").insert({
        session_id: this.sessionId,
        user_id: fullChange.user_id,
        user_name: fullChange.user_name,
        change_type: fullChange.change_type,
        path: fullChange.path,
        old_value: fullChange.old_value,
        new_value: fullChange.new_value,
      });
    }
  }

  /**
   * Broadcast diagram change
   */
  async broadcastDiagramChange(
    sessionId: string,
    mermaidCode: string,
    diagramType: string,
  ): Promise<void> {
    if (!this.channel) return;

    const fullChange: DiagramChange = {
      id: crypto.randomUUID(),
      session_id: sessionId,
      mermaid_code: mermaidCode,
      diagram_type: diagramType,
      timestamp: new Date().toISOString(),
    };

    await this.channel.send({
      type: "broadcast",
      event: "diagram_change",
      payload: fullChange,
    });
  }

  /**
   * Subscribe to diagram changes
   */
  subscribeToDiagramChanges(
    sessionId: string,
    callback: (change: DiagramChange) => void,
  ): () => void {
    this.diagramChangeCallbacks.push(callback);

    if (!this.channel) {
      const channel = this.supabase.channel(`collaboration:${sessionId}`);
      this.channel = channel;
      this.listenForDiagramChanges();
      channel.subscribe();
    } else {
      this.listenForDiagramChanges();
    }

    return () => {
      this.diagramChangeCallbacks = this.diagramChangeCallbacks.filter(
        (existingCallback) => existingCallback !== callback,
      );
    };
  }

  private listenForDiagramChanges(): void {
    if (!this.channel || this.diagramChangeListenerAttached) return;

    this.channel.on("broadcast", { event: "diagram_change" }, (payload) => {
      this.diagramChangeCallbacks.forEach((callback) => {
        callback(payload.payload as DiagramChange);
      });
    });

    this.diagramChangeListenerAttached = true;
  }

  /**
   * Broadcast cursor position
   */
  async broadcastCursor(
    userId: string,
    position: CursorPosition,
  ): Promise<void> {
    if (!this.channel) return;

    await this.channel.send({
      type: "broadcast",
      event: "cursor_move",
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
    permissionLevel: "view" | "edit" | "admin",
    expiresAt?: string,
  ): Promise<SharePermission | null> {
    try {
      const { data, error } = await this.supabase
        .from("share_permissions")
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
        console.error("Error sharing document:", error);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Error in shareDocument:", error);
      return null;
    }
  }

  /**
   * Get document permissions for user
   */
  async getDocumentPermissions(
    documentId: string,
    userId: string,
  ): Promise<SharePermission | null> {
    try {
      const { data, error } = await this.supabase
        .from("share_permissions")
        .select("*")
        .eq("document_id", documentId)
        .eq("shared_with", userId)
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
        type: "broadcast",
        event: "participant_leave",
        payload: { userId },
      });

      this.channel.unsubscribe();
      this.channel = null;
    }

    // Update participants list
    try {
      const { data: session } = await this.supabase
        .from("collaboration_sessions")
        .select("participants")
        .eq("id", sessionId)
        .single();

      if (session) {
        const participants = (session.participants || []).filter(
          (p: Participant) => p.user_id !== userId,
        );

        await this.supabase
          .from("collaboration_sessions")
          .update({ participants })
          .eq("id", sessionId);
      }
    } catch (error) {
      console.error("Error leaving session:", error);
    }
  }

  /**
   * Generate unique color for user cursor
   */
  private generateUserColor(userId: string): string {
    const colors = [
      "#EF4444",
      "#F59E0B",
      "#10B981",
      "#3B82F6",
      "#8B5CF6",
      "#EC4899",
      "#14B8A6",
      "#F97316",
    ];

    const hash = userId.split("").reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);

    return colors[Math.abs(hash) % colors.length];
  }

  /**
   * Handle disconnect - preserve pending changes
   */
  onDisconnect(): void {
    this.isConnected = false;
    // Do NOT clear pendingChanges here
  }

  /**
   * Handle reconnect - replay pending changes
   */
  async onReconnect(): Promise<void> {
    this.isConnected = true;
    const queued = [...this.pendingChanges];
    this.pendingChanges = [];
    for (const change of queued) {
      await this.broadcastChange(change);
    }
    this.reconnectCallbacks.forEach(cb => cb());
  }

  /**
   * Register a callback to run after reconnect
   */
  onReconnected(cb: () => void): void {
    this.reconnectCallbacks.push(cb);
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
    this.diagramChangeCallbacks = [];
    this.diagramChangeListenerAttached = false;
    this.pendingChanges = [];
    this.isConnected = true;
    this.reconnectCallbacks = [];
  }
}

export const collaborationService = new CollaborationService();

export const broadcastDiagramChange = (
  sessionId: string,
  mermaidCode: string,
  diagramType: string,
) =>
  collaborationService.broadcastDiagramChange(
    sessionId,
    mermaidCode,
    diagramType,
  );

export const subscribeToDiagramChanges = (
  sessionId: string,
  callback: (change: DiagramChange) => void,
) => collaborationService.subscribeToDiagramChanges(sessionId, callback);
