'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  TrendingUp, 
  FileText,
  Target,
  Sparkles
} from 'lucide-react';

interface ATSScoreProps {
  resumeData: any;
  onClose?: () => void;
}

interface ATSAnalysis {
  overallScore: number;
  scores: {
    formatting: number;
    keywords: number;
    experience: number;
    education: number;
    skills: number;
  };
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  keywordMatches: {
    found: string[];
    missing: string[];
  };
  readabilityScore: number;
  estimatedPassRate: number;
}

export default function ATSScoreDisplay({ resumeData, onClose }: ATSScoreProps) {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<ATSAnalysis | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [showJobInput, setShowJobInput] = useState(false);

  const calculateScore = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('supabase_token');
      const response = await fetch('/api/resume/ats-score', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          resumeData,
          jobDescription: jobDescription || undefined
        })
      });

      if (!response.ok) {
        throw new Error('Failed to calculate ATS score');
      }

      const data = await response.json();
      setAnalysis(data.atsAnalysis);
    } catch (error) {
      console.error('Error calculating ATS score:', error);
      alert('Failed to calculate ATS score. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return <Badge className="bg-green-500">Excellent</Badge>;
    if (score >= 60) return <Badge className="bg-yellow-500">Good</Badge>;
    return <Badge className="bg-red-500">Needs Improvement</Badge>;
  };

  if (!analysis) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            ATS Score Analysis
          </CardTitle>
          <CardDescription>
            Get your resume analyzed by AI to see how it performs with Applicant Tracking Systems
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!showJobInput ? (
            <div className="space-y-4">
              <Button 
                onClick={calculateScore} 
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing Resume...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Calculate ATS Score
                  </>
                )}
              </Button>
              <Button 
                onClick={() => setShowJobInput(true)} 
                variant="outline"
                className="w-full"
              >
                <FileText className="w-4 h-4 mr-2" />
                Match Against Job Description
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Textarea
                placeholder="Paste the job description here to get a tailored ATS analysis..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows={8}
                className="w-full"
              />
              <div className="flex gap-2">
                <Button 
                  onClick={calculateScore} 
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? 'Analyzing...' : 'Analyze with Job Description'}
                </Button>
                <Button 
                  onClick={() => setShowJobInput(false)} 
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Overall ATS Score
            </span>
            {getScoreBadge(analysis.overallScore)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center">
              <div className={`text-6xl font-bold ${getScoreColor(analysis.overallScore)}`}>
                {analysis.overallScore}
              </div>
              <div className="text-sm text-gray-500 mt-2">out of 100</div>
            </div>
            <Progress value={analysis.overallScore} className="h-3" />
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {analysis.readabilityScore}%
                </div>
                <div className="text-xs text-gray-600">Readability</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {analysis.estimatedPassRate}%
                </div>
                <div className="text-xs text-gray-600">Pass Rate</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Scores */}
      <Card>
        <CardHeader>
          <CardTitle>Category Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(analysis.scores).map(([category, score]) => (
            <div key={category} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium capitalize">{category}</span>
                <span className={`text-sm font-bold ${getScoreColor(score)}`}>
                  {score}%
                </span>
              </div>
              <Progress value={score} className="h-2" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Strengths */}
      {analysis.strengths.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="w-5 h-5" />
              Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analysis.strengths.map((strength, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-sm">{strength}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Weaknesses */}
      {analysis.weaknesses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <XCircle className="w-5 h-5" />
              Areas for Improvement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analysis.weaknesses.map((weakness, index) => (
                <li key={index} className="flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-red-500 mt-1 flex-shrink-0" />
                  <span className="text-sm">{weakness}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {analysis.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-600">
              <TrendingUp className="w-5 h-5" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {analysis.recommendations.map((recommendation, index) => (
                <li key={index} className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-blue-500 mt-1 flex-shrink-0" />
                  <span className="text-sm">{recommendation}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Keyword Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Keyword Analysis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {analysis.keywordMatches.found.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-green-600 mb-2">
                Found Keywords ({analysis.keywordMatches.found.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {analysis.keywordMatches.found.map((keyword, index) => (
                  <Badge key={index} variant="outline" className="bg-green-50">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {analysis.keywordMatches.missing.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-red-600 mb-2">
                Missing Keywords ({analysis.keywordMatches.missing.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {analysis.keywordMatches.missing.map((keyword, index) => (
                  <Badge key={index} variant="outline" className="bg-red-50">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-2">
        <Button onClick={() => setAnalysis(null)} variant="outline" className="flex-1">
          Analyze Again
        </Button>
        {onClose && (
          <Button onClick={onClose} variant="default" className="flex-1">
            Close
          </Button>
        )}
      </div>
    </div>
  );
}
