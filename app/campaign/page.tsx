'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Sparkles, 
  Download, 
  Loader2, 
  CheckCircle2, 
  Globe, 
  Palette, 
  Type, 
  Tag,
  Instagram,
  Linkedin,
  Twitter,
  Facebook
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function CampaignGeneratorPage() {
  const { toast } = useToast();
  const [url, setUrl] = useState('');
  const [goal, setGoal] = useState('');
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [brandDNA, setBrandDNA] = useState<any>(null);
  const [campaigns, setCampaigns] = useState<any[]>([]);

  const handleExtractBrand = async () => {
    if (!url) {
      toast({
        title: 'URL Required',
        description: 'Please enter a website URL',
        variant: 'destructive',
      });
      return;
    }

    setExtracting(true);
    try {
      const response = await fetch('/api/campaign/extract-brand', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to extract brand');
      }

      setBrandDNA(data.brandDNA);
      toast({
        title: 'Brand DNA Extracted! 🎨',
        description: `Successfully analyzed ${data.brandDNA.brandName}`,
      });
    } catch (error: any) {
      toast({
        title: 'Extraction Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setExtracting(false);
    }
  };

  const handleGenerateCampaign = async () => {
    if (!brandDNA) {
      toast({
        title: 'Brand DNA Required',
        description: 'Please extract brand DNA first',
        variant: 'destructive',
      });
      return;
    }

    if (!goal) {
      toast({
        title: 'Goal Required',
        description: 'Please enter a campaign goal',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/campaign/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          brandDNA, 
          goal,
          platforms: ['instagram', 'linkedin', 'twitter', 'facebook']
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle quota exceeded error with detailed message
        if (response.status === 429) {
          throw new Error(
            '🚨 API QUOTA EXHAUSTED!\n\n' +
            '⏰ Free tier quota: 2 requests/minute (currently at 0)\n' +
            '⌛ Quota resets in: ~60 seconds\n\n' +
            '💡 SOLUTIONS:\n' +
            '1️⃣ Wait 2 minutes and try again\n' +
            '2️⃣ Enable billing: https://console.cloud.google.com/billing\n' +
            '3️⃣ New API key: https://aistudio.google.com/apikey\n\n' +
            '💳 With billing: 15 requests/min (750% increase!)'
          );
        }
        throw new Error(data.error || 'Failed to generate campaign');
      }

      setCampaigns(data.campaigns);
      toast({
        title: 'Campaigns Generated! ✨',
        description: `Created ${data.campaigns.length} campaign ideas`,
      });
    } catch (error: any) {
      toast({
        title: 'Generation Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'instagram': return <Instagram className="h-4 w-4" />;
      case 'linkedin': return <Linkedin className="h-4 w-4" />;
      case 'twitter': return <Twitter className="h-4 w-4" />;
      case 'facebook': return <Facebook className="h-4 w-4" />;
      default: return null;
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Sparkles className="h-8 w-8 text-primary" />
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            AI Campaign Generator
          </h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Enter any website URL → Extract brand DNA → Generate complete marketing campaigns with AI
        </p>
      </div>

      {/* Step 1: Brand DNA Extraction */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Step 1: Extract Brand DNA
          </CardTitle>
          <CardDescription>
            Enter your website URL to automatically detect brand style, colors, fonts, and tone
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                type="url"
                placeholder="https://yourbrand.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="mobile-input"
              />
            </div>
            <Button 
              onClick={handleExtractBrand} 
              disabled={extracting || !url}
              className="touch-target"
            >
              {extracting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Extract DNA
                </>
              )}
            </Button>
          </div>

          {brandDNA && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <div>
                    <p className="font-semibold flex items-center gap-2">
                      <Palette className="h-4 w-4" />
                      Brand: {brandDNA.brandName}
                    </p>
                    <p className="text-sm">Tone: {brandDNA.tone}</p>
                  </div>
                  <div>
                    <p className="font-semibold flex items-center gap-2">
                      <Type className="h-4 w-4" />
                      Colors: {brandDNA.colors?.length || 0}
                    </p>
                    <p className="text-sm">Keywords: {brandDNA.keywords?.length || 0}</p>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Step 2: Campaign Goal */}
      {brandDNA && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Step 2: Define Campaign Goal
            </CardTitle>
            <CardDescription>
              What do you want to achieve with this campaign?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="goal">Campaign Goal</Label>
              <Textarea
                id="goal"
                placeholder="e.g., Launch new product line, Increase brand awareness, Holiday promotion..."
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="mobile-input min-h-[100px]"
              />
            </div>

            <Button 
              onClick={handleGenerateCampaign} 
              disabled={loading || !goal}
              className="w-full touch-target"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Generating AI Campaigns...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 mr-2" />
                  Generate 5 Campaign Ideas
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Generated Campaigns */}
      {campaigns.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
            Your AI-Generated Campaigns
          </h2>

          {campaigns.map((campaign, index) => (
            <Card key={index} className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-primary/10 to-purple-500/10">
                <CardTitle>{campaign.title}</CardTitle>
                <CardDescription>{campaign.summary}</CardDescription>
                {campaign.hook && (
                  <Badge variant="secondary" className="w-fit mt-2">
                    💡 {campaign.hook}
                  </Badge>
                )}
              </CardHeader>
              <CardContent className="pt-6">
                <Tabs defaultValue="instagram" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="instagram" className="flex items-center gap-1">
                      {getPlatformIcon('instagram')}
                      <span className="hidden sm:inline">Instagram</span>
                    </TabsTrigger>
                    <TabsTrigger value="linkedin" className="flex items-center gap-1">
                      {getPlatformIcon('linkedin')}
                      <span className="hidden sm:inline">LinkedIn</span>
                    </TabsTrigger>
                    <TabsTrigger value="twitter" className="flex items-center gap-1">
                      {getPlatformIcon('twitter')}
                      <span className="hidden sm:inline">Twitter</span>
                    </TabsTrigger>
                    <TabsTrigger value="facebook" className="flex items-center gap-1">
                      {getPlatformIcon('facebook')}
                      <span className="hidden sm:inline">Facebook</span>
                    </TabsTrigger>
                  </TabsList>

                  {['instagram', 'linkedin', 'twitter', 'facebook'].map(platform => (
                    <TabsContent key={platform} value={platform} className="space-y-4">
                      {campaign.posts[platform] && (
                        <div className="space-y-4">
                          <div className="bg-muted p-4 rounded-lg">
                            <Label className="text-sm font-semibold mb-2 block">Caption</Label>
                            <p className="whitespace-pre-wrap">{campaign.posts[platform].caption}</p>
                          </div>

                          {campaign.posts[platform].hashtags?.length > 0 && (
                            <div>
                              <Label className="text-sm font-semibold mb-2 block">Hashtags</Label>
                              <div className="flex flex-wrap gap-2">
                                {campaign.posts[platform].hashtags.map((tag: string, i: number) => (
                                  <Badge key={i} variant="outline">{tag}</Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {campaign.posts[platform].cta && (
                            <div>
                              <Label className="text-sm font-semibold mb-2 block">Call-to-Action</Label>
                              <Badge className="bg-primary">{campaign.posts[platform].cta}</Badge>
                            </div>
                          )}

                          <Button variant="outline" className="w-full">
                            <Download className="h-4 w-4 mr-2" />
                            Download {platform.charAt(0).toUpperCase() + platform.slice(1)} Post
                          </Button>
                        </div>
                      )}
                    </TabsContent>
                  ))}
                </Tabs>

                {campaign.imagePrompt && (
                  <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <Label className="text-sm font-semibold mb-2 block text-purple-900">
                      AI Image Prompt
                    </Label>
                    <p className="text-sm text-purple-800">{campaign.imagePrompt}</p>
                    <Button variant="outline" className="mt-3" size="sm">
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Image (Coming Soon)
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
