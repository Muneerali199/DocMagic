'use client';

import { useState } from 'react';
import { Download, Share2, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AnalysisResultsProps {
  data: {
    analysis?: {
      atsScore?: number;
      keywords?: string[];
      missingKeywords?: string[];
      skills?: string[];
      improvements?: string[];
    };
    questions?: any;
  };
}

export default function AnalysisResults({ data }: AnalysisResultsProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadReport = async () => {
    setIsDownloading(true);
    
    // Create a simple text report
    const report = `
Resume Analysis Report
Generated: ${new Date().toLocaleDateString()}

ATS Score: ${data.analysis?.atsScore || 0}/100

Keywords Found:
${data.analysis?.keywords?.join(', ') || 'None'}

Missing Keywords:
${data.analysis?.missingKeywords?.join(', ') || 'None'}

Skills Identified:
${data.analysis?.skills?.join(', ') || 'None'}

Improvement Suggestions:
${data.analysis?.improvements?.join('\n- ') || 'None'}

Interview Questions Generated: ${data.questions?.questions?.length || 0}
    `.trim();

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'resume-analysis-report.txt';
    a.click();
    URL.revokeObjectURL(url);
    
    setIsDownloading(false);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Resume Analysis Report',
          text: `Check out my resume analysis with ATS score of ${data.analysis?.atsScore || 0}/100`,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    }
  };

  const score = data.analysis?.atsScore || 0;
  const scoreColor = score >= 80 ? 'text-green-600' : score >= 60 ? 'text-yellow-600' : 'text-red-600';

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Resume Analysis Results
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadReport}
                disabled={isDownloading}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* ATS Score */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">ATS Compatibility Score</span>
              <span className={`text-lg font-bold ${scoreColor}`}>{score}/100</span>
            </div>
            <Progress value={score} className="h-2" />
            <p className="text-sm text-muted-foreground mt-2">
              {score >= 80 
                ? 'Excellent! Your resume is well-optimized for ATS systems.'
                : score >= 60
                ? 'Good, but there\'s room for improvement.'
                : 'Your resume needs significant optimization for ATS compatibility.'
              }
            </p>
          </div>

          {/* Keywords */}
          <div>
            <h4 className="font-medium mb-3">Keywords Found</h4>
            <div className="flex flex-wrap gap-2">
              {data.analysis?.keywords?.map((keyword, index) => (
                <Badge key={index} variant="secondary">
                  {keyword}
                </Badge>
              ))}
            </div>
          </div>

          {/* Missing Keywords */}
          {data.analysis?.missingKeywords && data.analysis.missingKeywords.length > 0 && (
            <div>
              <h4 className="font-medium mb-3">Missing Keywords</h4>
              <Alert>
                <AlertDescription>
                  Consider adding these keywords to improve your ATS score:
                </AlertDescription>
              </Alert>
              <div className="flex flex-wrap gap-2 mt-2">
                {data.analysis.missingKeywords.map((keyword, index) => (
                  <Badge key={index} variant="outline" className="bg-yellow-50">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          <div>
            <h4 className="font-medium mb-3">Skills Identified</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {data.analysis?.skills?.map((skill, index) => (
                <Badge key={index} variant="default">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>

          {/* Improvements */}
          {data.analysis?.improvements && data.analysis.improvements.length > 0 && (
            <div>
              <h4 className="font-medium mb-3">Improvement Suggestions</h4>
              <ul className="space-y-2">
                {data.analysis.improvements.map((improvement, index) => (
                  <li key={index} className="text-sm flex items-start">
                    <span className="text-primary mr-2">•</span>
                    {improvement}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
