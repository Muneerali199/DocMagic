'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  History, 
  RotateCcw, 
  Clock, 
  User, 
  Tag,
  ChevronRight,
  Eye
} from 'lucide-react';
import { DocumentVersion, versionHistoryService } from '@/lib/version-history-service';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface VersionHistoryPanelProps {
  documentId: string;
  userId: string;
  userName: string;
  onRestoreVersion: (content: any) => void;
}

export function VersionHistoryPanel({
  documentId,
  userId,
  userName,
  onRestoreVersion,
}: VersionHistoryPanelProps) {
  const [versions, setVersions] = useState<DocumentVersion[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<DocumentVersion | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    loadVersions();
  }, [documentId]);

  const loadVersions = async () => {
    setIsLoading(true);
    const data = await versionHistoryService.getVersions(documentId);
    setVersions(data);
    setIsLoading(false);
  };

  const handleRestore = async (versionId: string) => {
    const restored = await versionHistoryService.restoreVersion(
      versionId,
      userId,
      userName
    );

    if (restored) {
      onRestoreVersion(restored.content);
      toast.success('Version restored successfully!');
      loadVersions();
    } else {
      toast.error('Failed to restore version');
    }
  };

  const handlePreview = (version: DocumentVersion) => {
    setSelectedVersion(version);
    setShowPreview(true);
  };

  return (
    <>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Version History
          </CardTitle>
          <CardDescription>
            View and restore previous versions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] pr-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : versions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <History className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No version history yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {versions.map((version, index) => (
                  <Card
                    key={version.id}
                    className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handlePreview(version)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={index === 0 ? 'default' : 'secondary'}>
                            v{version.version_number}
                          </Badge>
                          {version.is_auto_save && (
                            <Badge variant="outline" className="text-xs">
                              Auto-save
                            </Badge>
                          )}
                          {version.tags?.map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              <Tag className="h-3 w-3 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        
                        <p className="text-sm font-medium mb-1">
                          {version.changes_summary}
                        </p>
                        
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {version.created_by_name}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(new Date(version.created_at), {
                              addSuffix: true,
                            })}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex gap-1 ml-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePreview(version);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {index !== 0 && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRestore(version.id);
                            }}
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Version {selectedVersion?.version_number} Preview
            </DialogTitle>
            <DialogDescription>
              {selectedVersion?.changes_summary} •{' '}
              {selectedVersion &&
                formatDistanceToNow(new Date(selectedVersion.created_at), {
                  addSuffix: true,
                })}
            </DialogDescription>
          </DialogHeader>
          
          {selectedVersion && (
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <pre className="text-sm overflow-x-auto">
                  {JSON.stringify(selectedVersion.content, null, 2)}
                </pre>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowPreview(false)}>
                  Close
                </Button>
                <Button onClick={() => {
                  handleRestore(selectedVersion.id);
                  setShowPreview(false);
                }}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Restore This Version
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
