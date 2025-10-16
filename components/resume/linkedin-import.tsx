"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/client";
import {
  Linkedin,
  Loader2,
  Upload,
  FileText,
  Sparkles,
  Check,
  AlertCircle,
  User,
  Briefcase,
  GraduationCap,
  Award,
  Code,
  Mail,
  MapPin,
  Globe,
  Phone,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

interface LinkedInProfile {
  name: string;
  headline: string;
  summary: string;
  email: string;
  phone?: string;
  location?: string;
  website?: string;
  experience: Array<{
    title: string;
    company: string;
    location?: string;
    startDate: string;
    endDate?: string;
    description: string;
    current?: boolean;
  }>;
  education: Array<{
    school: string;
    degree: string;
    field: string;
    startDate: string;
    endDate?: string;
    description?: string;
  }>;
  skills: string[];
  certifications?: Array<{
    name: string;
    issuer: string;
    date?: string;
  }>;
  languages?: Array<{
    name: string;
    proficiency?: string;
  }>;
}

interface LinkedInImportProps {
  onImport: (data: LinkedInProfile) => void;
}

export function LinkedInImport({ onImport }: LinkedInImportProps) {
  const [isImporting, setIsImporting] = useState(false);
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [linkedinPdfFile, setLinkedinPdfFile] = useState<File | null>(null);
  const [manualData, setManualData] = useState("");
  const { toast } = useToast();
  const supabase = createClient();

  // Helper to get auth token
  const getAuthToken = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token;
  };

  // Parse LinkedIn URL and fetch profile data
  const handleUrlImport = async () => {
    if (!linkedinUrl.trim()) {
      toast({
        title: "Please enter a LinkedIn URL",
        description: "Enter your LinkedIn profile URL to import data",
        variant: "destructive",
      });
      return;
    }

    // Validate LinkedIn URL
    const linkedinUrlPattern = /^(https?:\/\/)?(www\.)?linkedin\.com\/(in|pub)\/[\w-]+\/?$/;
    if (!linkedinUrlPattern.test(linkedinUrl)) {
      toast({
        title: "Invalid LinkedIn URL",
        description: "Please enter a valid LinkedIn profile URL (e.g., https://linkedin.com/in/username)",
        variant: "destructive",
      });
      return;
    }

    setIsImporting(true);

    try {
      const token = await getAuthToken();
      
      if (!token) {
        throw new Error("Please sign in to import LinkedIn profiles");
      }

      const response = await fetch("/api/linkedin/import-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ profileUrl: linkedinUrl }),
      });

      const data = await response.json();
      
      // Handle 503 status (scraping temporarily unavailable)
      if (response.status === 503) {
        toast({
          title: "⚠️ URL Import Temporarily Unavailable",
          description: data.message || "All scraping methods are currently unavailable. Please use PDF Export (100% reliable) or Manual Entry.",
          variant: "default",
        });
        
        // Log recommendations for debugging
        if (data.recommendations && data.recommendations.length > 0) {
          console.log('💡 Setup recommendations:', data.recommendations);
        }
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || "Failed to import LinkedIn profile");
      }

      // Success! Handle the imported data
      if (data.success && data.data) {
        console.log('✅ LinkedIn data received from API:', data.data);
        
        // Transform the scraped data to match our profile format
        const profileData = {
          fullName: data.data.fullName || '',
          email: data.data.email || '',
          phone: data.data.phone || '',
          location: data.data.location || '',
          summary: data.data.summary || data.data.headline || '',
          headline: data.data.headline || '',
          experience: data.data.experience || [],
          education: data.data.education || [],
          skills: data.data.skills || [],
          languages: data.data.languages || [],
          certifications: data.data.certifications || [],
          profileUrl: data.data.profileUrl || '',
        };

        console.log('✅ Transformed profile data:', profileData);
        console.log('✅ Calling onImport with profile data...');
        
        onImport(profileData);

        toast({
          title: `✅ Profile imported successfully!`,
          description: `Used ${data.method} to extract your LinkedIn data`,
        });
        
        // Show note if there's limited data
        if (data.data.note) {
          setTimeout(() => {
            toast({
              title: "ℹ️ Note",
              description: data.data.note,
              variant: "default",
            });
          }, 2000);
        }
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error: any) {
      toast({
        title: "Import failed",
        description: error.message || "Could not import LinkedIn profile. Please try manual entry or PDF upload.",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  // Parse LinkedIn PDF export
  const handlePdfImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF file exported from LinkedIn",
        variant: "destructive",
      });
      return;
    }

    setLinkedinPdfFile(file);
    setIsImporting(true);

    try {
      const token = await getAuthToken();
      
      if (!token) {
        throw new Error("Please sign in to import LinkedIn profiles");
      }

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/linkedin/import-pdf", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to parse LinkedIn PDF");
      }

      const data = await response.json();
      onImport(data.profile);

      toast({
        title: "LinkedIn PDF imported! ✨",
        description: "Your profile data has been extracted successfully",
      });
    } catch (error: any) {
      toast({
        title: "PDF parsing failed",
        description: error.message || "Could not parse LinkedIn PDF. Please try manual entry.",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  // Parse manual JSON/text data
  const handleManualImport = async () => {
    if (!manualData.trim()) {
      toast({
        title: "Please enter profile data",
        description: "Paste your LinkedIn profile data in JSON format or plain text",
        variant: "destructive",
      });
      return;
    }

    setIsImporting(true);

    try {
      const token = await getAuthToken();
      
      if (!token) {
        throw new Error("Please sign in to import LinkedIn profiles");
      }

      // Try to parse as JSON first
      let profileData: LinkedInProfile;
      try {
        profileData = JSON.parse(manualData);
      } catch {
        // If not JSON, send to AI to extract structured data
        const response = await fetch("/api/linkedin/parse-text", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({ text: manualData }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to parse profile data");
        }

        const data = await response.json();
        profileData = data.profile;
      }

      onImport(profileData);

      toast({
        title: "Profile data imported! ✨",
        description: "Your profile has been successfully parsed",
      });
    } catch (error: any) {
      toast({
        title: "Parsing failed",
        description: error.message || "Could not parse profile data. Please check the format.",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Card className="glass-effect border-yellow-400/20">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <Linkedin className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <CardTitle className="text-2xl bolt-gradient-text">
              LinkedIn Smart Import
            </CardTitle>
            <CardDescription>
              Automatically fetch your LinkedIn profile data to create your resume
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="url" className="w-full">
          <TabsList className="grid w-full grid-cols-3 glass-effect border border-yellow-400/20">
            <TabsTrigger value="url" className="data-[state=active]:bolt-gradient data-[state=active]:text-white">
              <Globe className="h-4 w-4 mr-2" />
              Profile URL
            </TabsTrigger>
            <TabsTrigger value="pdf" className="data-[state=active]:bolt-gradient data-[state=active]:text-white">
              <Upload className="h-4 w-4 mr-2" />
              PDF Export
            </TabsTrigger>
            <TabsTrigger value="manual" className="data-[state=active]:bolt-gradient data-[state=active]:text-white">
              <FileText className="h-4 w-4 mr-2" />
              Manual Entry
            </TabsTrigger>
          </TabsList>

          {/* URL Import Tab */}
          <TabsContent value="url" className="space-y-4 mt-4">
            <div className="glass-effect p-6 rounded-xl border border-blue-500/20 relative overflow-hidden">
              <div className="absolute inset-0 shimmer opacity-10"></div>
              <div className="relative z-10 space-y-4">
                {/* Info Alert - Direct Import Not Available Yet */}
                <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-500/20">
                  <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                      Direct URL Import Coming Soon
                    </p>
                    <p className="text-xs text-amber-700 dark:text-amber-300">
                      We're working on LinkedIn API integration. For now, please use <strong>PDF Export</strong> (recommended) or <strong>Manual Entry</strong> to import your profile.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-500/5 border border-blue-500/10">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      How to find your LinkedIn profile URL:
                    </p>
                    <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                      <li>Go to your LinkedIn profile page</li>
                      <li>Click "Contact info" near your profile picture</li>
                      <li>Copy the URL under "Your Profile"</li>
                      <li>Paste it below</li>
                    </ol>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="linkedin-url" className="flex items-center gap-2">
                    <Linkedin className="h-4 w-4 text-blue-600" />
                    LinkedIn Profile URL
                  </Label>
                  <Input
                    id="linkedin-url"
                    type="url"
                    placeholder="https://linkedin.com/in/your-profile"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    className="glass-effect border-yellow-400/30 focus:border-yellow-400/60"
                    disabled={isImporting}
                  />
                </div>

                <Button
                  onClick={handleUrlImport}
                  disabled={isImporting || !linkedinUrl.trim()}
                  className="w-full bolt-gradient text-white font-semibold hover:scale-105 transition-all duration-300"
                >
                  {isImporting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Importing Profile...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Import from LinkedIn
                    </>
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* PDF Import Tab */}
          <TabsContent value="pdf" className="space-y-4 mt-4">
            <div className="glass-effect p-6 rounded-xl border border-blue-500/20 relative overflow-hidden">
              <div className="absolute inset-0 shimmer opacity-10"></div>
              <div className="relative z-10 space-y-4">
                <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-500/5 border border-blue-500/10">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      How to export your LinkedIn profile as PDF:
                    </p>
                    <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                      <li>Go to your LinkedIn profile page</li>
                      <li>Click "More" button below your profile picture</li>
                      <li>Select "Save to PDF"</li>
                      <li>Upload the downloaded PDF file below</li>
                    </ol>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="linkedin-pdf" className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-600" />
                    LinkedIn PDF Export
                  </Label>
                  <div className="relative">
                    <Input
                      id="linkedin-pdf"
                      type="file"
                      accept=".pdf"
                      onChange={handlePdfImport}
                      className="glass-effect border-yellow-400/30 focus:border-yellow-400/60 cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-yellow-500/10 file:text-yellow-700 hover:file:bg-yellow-500/20"
                      disabled={isImporting}
                    />
                  </div>
                  {linkedinPdfFile && (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <Check className="h-4 w-4" />
                      <span>{linkedinPdfFile.name}</span>
                    </div>
                  )}
                </div>

                {isImporting && (
                  <div className="flex items-center justify-center gap-2 p-4 rounded-lg bg-yellow-500/5 border border-yellow-500/10">
                    <Loader2 className="h-5 w-5 animate-spin text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                      Parsing PDF... This may take a moment
                    </span>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Manual Entry Tab */}
          <TabsContent value="manual" className="space-y-4 mt-4">
            <div className="glass-effect p-6 rounded-xl border border-blue-500/20 relative overflow-hidden">
              <div className="absolute inset-0 shimmer opacity-10"></div>
              <div className="relative z-10 space-y-4">
                <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-500/5 border border-blue-500/10">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      Paste your profile data:
                    </p>
                    <p className="text-xs text-muted-foreground">
                      You can paste LinkedIn profile text, JSON data, or any formatted text containing your work history, education, and skills. Our AI will extract the information automatically.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="manual-data" className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-600" />
                    Profile Data
                  </Label>
                  <Textarea
                    id="manual-data"
                    placeholder={`Example:
John Doe
Senior Software Engineer at Google
San Francisco, CA
john@example.com

Experience:
- Senior Software Engineer at Google (2020-Present)
  Led development of cloud infrastructure...
  
- Software Engineer at Microsoft (2018-2020)
  Built scalable microservices...

Education:
- BS Computer Science, MIT (2014-2018)

Skills: React, Node.js, Python, AWS, Docker`}
                    value={manualData}
                    onChange={(e) => setManualData(e.target.value)}
                    className="min-h-[300px] glass-effect border-yellow-400/30 focus:border-yellow-400/60 font-mono text-sm"
                    disabled={isImporting}
                  />
                </div>

                <Button
                  onClick={handleManualImport}
                  disabled={isImporting || !manualData.trim()}
                  className="w-full bolt-gradient text-white font-semibold hover:scale-105 transition-all duration-300"
                >
                  {isImporting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Parsing Data...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Parse & Import Data
                    </>
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Features Info */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="glass-effect p-3 rounded-lg text-center hover:scale-105 transition-transform duration-300">
            <User className="h-5 w-5 mx-auto mb-2 text-blue-600" />
            <p className="text-xs font-medium">Personal Info</p>
          </div>
          <div className="glass-effect p-3 rounded-lg text-center hover:scale-105 transition-transform duration-300">
            <Briefcase className="h-5 w-5 mx-auto mb-2 text-yellow-600" />
            <p className="text-xs font-medium">Work History</p>
          </div>
          <div className="glass-effect p-3 rounded-lg text-center hover:scale-105 transition-transform duration-300">
            <GraduationCap className="h-5 w-5 mx-auto mb-2 text-green-600" />
            <p className="text-xs font-medium">Education</p>
          </div>
          <div className="glass-effect p-3 rounded-lg text-center hover:scale-105 transition-transform duration-300">
            <Award className="h-5 w-5 mx-auto mb-2 text-purple-600" />
            <p className="text-xs font-medium">Skills & Certs</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
