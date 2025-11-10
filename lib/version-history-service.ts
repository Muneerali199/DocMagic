import { createClient } from '@/lib/supabase/client';

export interface DocumentVersion {
  id: string;
  document_id: string;
  version_number: number;
  content: any;
  changes_summary: string;
  created_by: string;
  created_by_name: string;
  created_at: string;
  is_auto_save: boolean;
  tags?: string[];
}

export interface VersionComparison {
  added: any[];
  removed: any[];
  modified: any[];
}

export class VersionHistoryService {
  private supabase = createClient();

  /**
   * Save a new version of the document
   */
  async saveVersion(
    documentId: string,
    content: any,
    userId: string,
    userName: string,
    changesSummary: string = 'Auto-save',
    isAutoSave: boolean = false,
    tags?: string[]
  ): Promise<DocumentVersion | null> {
    try {
      // Get latest version number
      const { data: latestVersion } = await this.supabase
        .from('document_versions')
        .select('version_number')
        .eq('document_id', documentId)
        .order('version_number', { ascending: false })
        .limit(1)
        .single();

      const versionNumber = latestVersion ? latestVersion.version_number + 1 : 1;

      const { data, error } = await this.supabase
        .from('document_versions')
        .insert({
          document_id: documentId,
          version_number: versionNumber,
          content: JSON.stringify(content),
          changes_summary: changesSummary,
          created_by: userId,
          created_by_name: userName,
          is_auto_save: isAutoSave,
          tags: tags || [],
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving version:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in saveVersion:', error);
      return null;
    }
  }

  /**
   * Get all versions for a document
   */
  async getVersions(documentId: string, limit: number = 50): Promise<DocumentVersion[]> {
    try {
      const { data, error } = await this.supabase
        .from('document_versions')
        .select('*')
        .eq('document_id', documentId)
        .order('version_number', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching versions:', error);
        return [];
      }

      return data.map(v => ({
        ...v,
        content: typeof v.content === 'string' ? JSON.parse(v.content) : v.content,
      }));
    } catch (error) {
      console.error('Error in getVersions:', error);
      return [];
    }
  }

  /**
   * Get a specific version
   */
  async getVersion(versionId: string): Promise<DocumentVersion | null> {
    try {
      const { data, error } = await this.supabase
        .from('document_versions')
        .select('*')
        .eq('id', versionId)
        .single();

      if (error) {
        console.error('Error fetching version:', error);
        return null;
      }

      return {
        ...data,
        content: typeof data.content === 'string' ? JSON.parse(data.content) : data.content,
      };
    } catch (error) {
      console.error('Error in getVersion:', error);
      return null;
    }
  }

  /**
   * Restore a specific version
   */
  async restoreVersion(
    versionId: string,
    userId: string,
    userName: string
  ): Promise<DocumentVersion | null> {
    try {
      // Get the version to restore
      const version = await this.getVersion(versionId);
      if (!version) return null;

      // Save as new version with restored content
      return await this.saveVersion(
        version.document_id,
        version.content,
        userId,
        userName,
        `Restored from version ${version.version_number}`,
        false,
        ['restored']
      );
    } catch (error) {
      console.error('Error in restoreVersion:', error);
      return null;
    }
  }

  /**
   * Compare two versions
   */
  compareVersions(version1: DocumentVersion, version2: DocumentVersion): VersionComparison {
    const comparison: VersionComparison = {
      added: [],
      removed: [],
      modified: [],
    };

    // Deep comparison of content
    this.deepCompare(version1.content, version2.content, '', comparison);

    return comparison;
  }

  /**
   * Deep compare two objects
   */
  private deepCompare(
    obj1: any,
    obj2: any,
    path: string,
    comparison: VersionComparison
  ): void {
    if (typeof obj1 !== 'object' || typeof obj2 !== 'object') {
      if (obj1 !== obj2) {
        comparison.modified.push({
          path,
          oldValue: obj1,
          newValue: obj2,
        });
      }
      return;
    }

    // Check for added/removed keys
    const keys1 = Object.keys(obj1 || {});
    const keys2 = Object.keys(obj2 || {});

    keys2.forEach(key => {
      const newPath = path ? `${path}.${key}` : key;
      if (!keys1.includes(key)) {
        comparison.added.push({ path: newPath, value: obj2[key] });
      } else {
        this.deepCompare(obj1[key], obj2[key], newPath, comparison);
      }
    });

    keys1.forEach(key => {
      if (!keys2.includes(key)) {
        const newPath = path ? `${path}.${key}` : key;
        comparison.removed.push({ path: newPath, value: obj1[key] });
      }
    });
  }

  /**
   * Delete old versions (keep last N versions)
   */
  async cleanupOldVersions(documentId: string, keepCount: number = 20): Promise<boolean> {
    try {
      // Get all versions
      const { data: versions } = await this.supabase
        .from('document_versions')
        .select('id, version_number')
        .eq('document_id', documentId)
        .order('version_number', { ascending: false });

      if (!versions || versions.length <= keepCount) {
        return true; // Nothing to cleanup
      }

      // Delete old versions
      const versionsToDelete = versions.slice(keepCount);
      const idsToDelete = versionsToDelete.map(v => v.id);

      const { error } = await this.supabase
        .from('document_versions')
        .delete()
        .in('id', idsToDelete);

      if (error) {
        console.error('Error cleaning up versions:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in cleanupOldVersions:', error);
      return false;
    }
  }

  /**
   * Tag a version
   */
  async tagVersion(versionId: string, tags: string[]): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('document_versions')
        .update({ tags })
        .eq('id', versionId);

      if (error) {
        console.error('Error tagging version:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in tagVersion:', error);
      return false;
    }
  }

  /**
   * Get versions by tag
   */
  async getVersionsByTag(documentId: string, tag: string): Promise<DocumentVersion[]> {
    try {
      const { data, error } = await this.supabase
        .from('document_versions')
        .select('*')
        .eq('document_id', documentId)
        .contains('tags', [tag])
        .order('version_number', { ascending: false });

      if (error) {
        console.error('Error fetching versions by tag:', error);
        return [];
      }

      return data.map(v => ({
        ...v,
        content: typeof v.content === 'string' ? JSON.parse(v.content) : v.content,
      }));
    } catch (error) {
      console.error('Error in getVersionsByTag:', error);
      return [];
    }
  }

  /**
   * Auto-save with debouncing
   */
  private autoSaveTimeout: NodeJS.Timeout | null = null;

  setupAutoSave(
    documentId: string,
    getContent: () => any,
    userId: string,
    userName: string,
    intervalMs: number = 30000 // 30 seconds
  ): () => void {
    const autoSave = async () => {
      const content = getContent();
      await this.saveVersion(
        documentId,
        content,
        userId,
        userName,
        'Auto-save',
        true
      );
    };

    this.autoSaveTimeout = setInterval(autoSave, intervalMs);

    // Return cleanup function
    return () => {
      if (this.autoSaveTimeout) {
        clearInterval(this.autoSaveTimeout);
        this.autoSaveTimeout = null;
      }
    };
  }
}

export const versionHistoryService = new VersionHistoryService();
