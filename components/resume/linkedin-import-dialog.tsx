'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Loader2, Upload, Link2, FileJson, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface LinkedInImportDialogProps {
  onImport: (data: any) => void;
  trigger?: React.ReactNode;
}

export function LinkedInImportDialog({ onImport, trigger }: LinkedInImportDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [jsonData, setJsonData] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const handleUrlImport = async () => {
    if (!linkedinUrl.trim()) {
      setError('Please enter a LinkedIn profile URL');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/linkedin/parse-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileUrl: linkedinUrl })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to import profile');
      }

      onImport(result.data);
      setOpen(false);
      setLinkedinUrl('');
    } catch (err: any) {
      setError(err.message || 'Failed to import from LinkedIn URL');
    } finally {
      setLoading(false);
    }
  };

  const handleJsonImport = async () => {
    if (!jsonData.trim()) {
      setError('Please paste your LinkedIn JSON data');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const parsedData = JSON.parse(jsonData);
      
      const response = await fetch('/api/linkedin/parse-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileData: parsedData })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to parse profile data');
      }

      onImport(result.data);
      setOpen(false);
      setJsonData('');
    } catch (err: any) {
      if (err instanceof SyntaxError) {
        setError('Invalid JSON format. Please check your data and try again.');
      } else {
        setError(err.message || 'Failed to import LinkedIn data');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFileImport = async () => {
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const text = await file.text();
      const parsedData = JSON.parse(text);

      const response = await fetch('/api/linkedin/parse-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileData: parsedData })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to parse profile data');
      }

      onImport(result.data);
      setOpen(false);
      setFile(null);
    } catch (err: any) {
      if (err instanceof SyntaxError) {
        setError('Invalid JSON file. Please upload a valid LinkedIn data export.');
      } else {
        setError(err.message || 'Failed to import from file');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="touch-target">
            <Link2 className="h-4 w-4 mr-2" />
            Import from LinkedIn
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import LinkedIn Profile</DialogTitle>
          <DialogDescription>
            Choose how you want to import your LinkedIn profile data
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="json" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="json">JSON Data ⭐</TabsTrigger>
            <TabsTrigger value="file">Upload File</TabsTrigger>
            <TabsTrigger value="url">Profile URL</TabsTrigger>
          </TabsList>

          <TabsContent value="url" className="space-y-4">
            <Alert variant="default" className="bg-yellow-50 border-yellow-200">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-xs text-yellow-800">
                <strong>Note:</strong> LinkedIn actively blocks automated profile access (error 999). 
                We recommend using the <strong>"JSON Data"</strong> or <strong>"Upload File"</strong> methods for reliable results.
              </AlertDescription>
            </Alert>
            <div className="space-y-2">
              <Label htmlFor="linkedin-url">LinkedIn Public Profile URL</Label>
              <Input
                id="linkedin-url"
                type="url"
                placeholder="https://www.linkedin.com/in/your-profile"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                className="mobile-input"
              />
              <p className="text-xs text-muted-foreground">
                Your profile must be public for this to work. Go to Settings → Visibility → Public Profile
              </p>
            </div>
            <Button 
              onClick={handleUrlImport} 
              disabled={loading}
              className="w-full touch-target"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Link2 className="h-4 w-4 mr-2" />
                  Try Import from URL
                </>
              )}
            </Button>
          </TabsContent>

          <TabsContent value="json" className="space-y-4">
            <Alert variant="default" className="bg-green-50 border-green-200">
              <AlertCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-xs text-green-800">
                <strong>✅ Recommended Method:</strong> This is the most reliable way to import your complete LinkedIn profile.
              </AlertDescription>
            </Alert>
            <div className="space-y-2">
              <Label htmlFor="json-data">LinkedIn Profile JSON</Label>
              <Textarea
                id="json-data"
                placeholder='Paste your LinkedIn JSON data here...'
                value={jsonData}
                onChange={(e) => setJsonData(e.target.value)}
                className="mobile-input min-h-[200px] font-mono text-xs"
              />
              <div className="text-xs text-muted-foreground space-y-2">
                <p className="font-semibold">How to get your LinkedIn JSON data:</p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Go to LinkedIn → Settings & Privacy</li>
                  <li>Click "Get a copy of your data"</li>
                  <li>Select "Request archive" or specific sections</li>
                  <li>Download the ZIP file (you'll get an email)</li>
                  <li>Extract and open the JSON file</li>
                  <li>Copy and paste the content here</li>
                </ol>
              </div>
            </div>
            <Button 
              onClick={handleJsonImport} 
              disabled={loading}
              className="w-full touch-target"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Parsing...
                </>
              ) : (
                <>
                  <FileJson className="h-4 w-4 mr-2" />
                  Parse JSON Data
                </>
              )}
            </Button>
          </TabsContent>

          <TabsContent value="file" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="file-upload">Upload LinkedIn Data File</Label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                <Input
                  id="file-upload"
                  type="file"
                  accept=".json"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
                <label 
                  htmlFor="file-upload" 
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <div className="text-sm">
                    {file ? (
                      <span className="text-primary font-medium">{file.name}</span>
                    ) : (
                      <>
                        <span className="text-primary font-medium">Click to upload</span>
                        <span className="text-muted-foreground"> or drag and drop</span>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    JSON file from LinkedIn data export
                  </p>
                </label>
              </div>
            </div>
            <Button 
              onClick={handleFileImport} 
              disabled={loading || !file}
              className="w-full touch-target"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Import from File
                </>
              )}
            </Button>
          </TabsContent>
        </Tabs>

        <div className="pt-4 border-t">
          <h4 className="text-sm font-medium mb-2">How to get your LinkedIn data:</h4>
          <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
            <li>Go to LinkedIn Settings & Privacy</li>
            <li>Click "Get a copy of your data"</li>
            <li>Select "Request archive" and download the JSON file</li>
            <li>Upload the file or paste the JSON content above</li>
          </ol>
        </div>
      </DialogContent>
    </Dialog>
  );
}
