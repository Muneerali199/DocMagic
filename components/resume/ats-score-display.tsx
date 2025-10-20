"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, AlertCircle, XCircle, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ATSScoreProps {
  score: number;
  grade: string;
  color: string;
  message?: string;
  feedback: string[];
  improvements: string[];
  detailedAnalysis?: any;
  breakdown: {
    contactInfo: number;
    summary: number;
    experience: number;
    education: number;
    skills: number;
    certifications: number;
  };
}

export function ATSScoreDisplay({ atsScore }: { atsScore: ATSScoreProps }) {
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showImprovements, setShowImprovements] = useState(true);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 85) return 'text-green-500';
    if (score >= 80) return 'text-blue-600';
    if (score >= 75) return 'text-blue-500';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 90) return 'bg-green-100 border-green-300';
    if (score >= 85) return 'bg-green-50 border-green-200';
    if (score >= 80) return 'bg-blue-100 border-blue-300';
    if (score >= 75) return 'bg-blue-50 border-blue-200';
    if (score >= 70) return 'bg-yellow-100 border-yellow-300';
    if (score >= 60) return 'bg-orange-100 border-orange-300';
    return 'bg-red-100 border-red-300';
  };

  const getProgressColor = (score: number) => {
    if (score >= 90) return 'bg-green-600';
    if (score >= 85) return 'bg-green-500';
    if (score >= 80) return 'bg-blue-600';
    if (score >= 75) return 'bg-blue-500';
    if (score >= 70) return 'bg-yellow-600';
    if (score >= 60) return 'bg-orange-600';
    return 'bg-red-600';
  };

  const getSectionIcon = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return <CheckCircle2 className="h-4 w-4 text-green-600" />;
    if (percentage >= 50) return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    return <XCircle className="h-4 w-4 text-red-600" />;
  };

  const getMessage = () => {
    if (atsScore.message) return atsScore.message;
    if (atsScore.score >= 90) return "🎉 Outstanding! Your resume is fully ATS-optimized";
    if (atsScore.score >= 85) return "🎯 Excellent! Your resume is highly ATS-optimized";
    if (atsScore.score >= 80) return "👍 Very good! Just a few tweaks needed";
    if (atsScore.score >= 75) return "👍 Good! Some improvements will boost your score";
    if (atsScore.score >= 70) return "⚠️ Decent, but needs improvement";
    if (atsScore.score >= 60) return "⚠️ Needs significant improvement";
    return "❗ Critical improvements needed";
  };

  return (
    <Card className="glass-effect border-2 border-green-200/50 shadow-xl overflow-hidden">
      <CardHeader className={cn(
        "bg-gradient-to-r border-b transition-colors",
        atsScore.score >= 85 ? "from-green-50 to-blue-50" : "from-orange-50 to-yellow-50"
      )}>
        <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <span className="flex items-center gap-2 text-base sm:text-lg">
            <TrendingUp className="h-5 w-5 text-green-600 flex-shrink-0" />
            <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              ATS Compatibility Score
            </span>
          </span>
          <div className={cn(
            "text-3xl sm:text-4xl font-bold",
            getScoreColor(atsScore.score)
          )}>
            {atsScore.grade}
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Overall Score - Enhanced Visibility */}
        <div className="text-center space-y-3">
          <div className={cn(
            "text-5xl sm:text-6xl md:text-7xl font-bold",
            getScoreColor(atsScore.score)
          )}>
            {atsScore.score}%
          </div>
          <div className="px-4">
            <Progress 
              value={atsScore.score} 
              className="h-3 sm:h-4"
            />
          </div>
          <p className={cn(
            "text-sm sm:text-base font-medium px-4 py-2 rounded-lg border-2",
            getScoreBgColor(atsScore.score)
          )}>
            {getMessage()}
          </p>
        </div>

        {/* Collapsible Section Breakdown */}
        <div className="space-y-3">
          <Button
            variant="ghost"
            onClick={() => setShowBreakdown(!showBreakdown)}
            className="w-full flex items-center justify-between hover:bg-gray-100 p-3 rounded-lg"
          >
            <span className="font-semibold text-gray-700 text-sm sm:text-base flex items-center gap-2">
              <span>📊 Section Breakdown</span>
              <span className="text-xs text-gray-500">({Object.values(atsScore.breakdown).reduce((a, b) => a + b, 0)}/100 pts)</span>
            </span>
            {showBreakdown ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </Button>
          
          {showBreakdown && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in slide-in-from-top duration-300">
              {/* Contact Info */}
              <div className="p-3 bg-white rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs sm:text-sm font-medium text-gray-700">Contact Info</span>
                  {getSectionIcon(atsScore.breakdown.contactInfo, 20)}
                </div>
                <Progress 
                  value={(atsScore.breakdown.contactInfo / 20) * 100} 
                  className="h-2 mb-1"
                />
                <span className="text-xs text-gray-500 block">
                  {atsScore.breakdown.contactInfo}/20 pts
                </span>
              </div>

              {/* Summary */}
              <div className="p-3 bg-white rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs sm:text-sm font-medium text-gray-700">Summary</span>
                  {getSectionIcon(atsScore.breakdown.summary, 15)}
                </div>
                <Progress 
                  value={(atsScore.breakdown.summary / 15) * 100} 
                  className="h-2 mb-1"
                />
                <span className="text-xs text-gray-500 block">
                  {atsScore.breakdown.summary}/15 pts
                </span>
              </div>

              {/* Experience */}
              <div className="p-3 bg-white rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs sm:text-sm font-medium text-gray-700">Experience</span>
                  {getSectionIcon(atsScore.breakdown.experience, 30)}
                </div>
                <Progress 
                  value={(atsScore.breakdown.experience / 30) * 100} 
                  className="h-2 mb-1"
                />
                <span className="text-xs text-gray-500 block">
                  {atsScore.breakdown.experience}/30 pts
                </span>
              </div>

              {/* Education */}
              <div className="p-3 bg-white rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs sm:text-sm font-medium text-gray-700">Education</span>
                  {getSectionIcon(atsScore.breakdown.education, 15)}
                </div>
                <Progress 
                  value={(atsScore.breakdown.education / 15) * 100} 
                  className="h-2 mb-1"
                />
                <span className="text-xs text-gray-500 block">
                  {atsScore.breakdown.education}/15 pts
                </span>
              </div>

              {/* Skills */}
              <div className="p-3 bg-white rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs sm:text-sm font-medium text-gray-700">Skills</span>
                  {getSectionIcon(atsScore.breakdown.skills, 10)}
                </div>
                <Progress 
                  value={(atsScore.breakdown.skills / 10) * 100} 
                  className="h-2 mb-1"
                />
                <span className="text-xs text-gray-500 block">
                  {atsScore.breakdown.skills}/10 pts
                </span>
              </div>

              {/* Certifications & Projects */}
              <div className="p-3 bg-white rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs sm:text-sm font-medium text-gray-700">Extras</span>
                  {getSectionIcon(atsScore.breakdown.certifications, 10)}
                </div>
                <Progress 
                  value={(atsScore.breakdown.certifications / 10) * 100} 
                  className="h-2 mb-1"
                />
                <span className="text-xs text-gray-500 block">
                  {atsScore.breakdown.certifications}/10 pts
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Collapsible Positive Feedback */}
        {atsScore.feedback.length > 0 && (
          <div className="space-y-2">
            <Button
              variant="ghost"
              onClick={() => setShowFeedback(!showFeedback)}
              className="w-full flex items-center justify-between hover:bg-green-50 p-3 rounded-lg"
            >
              <span className="font-semibold text-gray-700 text-sm sm:text-base flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 flex-shrink-0" />
                <span>What&apos;s Working</span>
                <span className="text-xs text-gray-500">({atsScore.feedback.length})</span>
              </span>
              {showFeedback ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </Button>
            {showFeedback && (
              <div className="space-y-2 animate-in slide-in-from-top duration-300">
                {atsScore.feedback.slice(0, 5).map((item, index) => (
                  <div 
                    key={index}
                    className="flex items-start gap-2 p-2 sm:p-3 bg-green-50 rounded-lg border border-green-200"
                  >
                    <span className="text-xs sm:text-sm text-green-800 leading-relaxed">{item}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Collapsible Improvements - Open by Default */}
        {atsScore.improvements.length > 0 && (
          <div className="space-y-2">
            <Button
              variant="ghost"
              onClick={() => setShowImprovements(!showImprovements)}
              className="w-full flex items-center justify-between hover:bg-orange-50 p-3 rounded-lg"
            >
              <span className="font-semibold text-gray-700 text-sm sm:text-base flex items-center gap-2">
                <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600 flex-shrink-0" />
                <span>Suggested Improvements</span>
                <span className="text-xs text-gray-500">({atsScore.improvements.length})</span>
              </span>
              {showImprovements ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </Button>
            {showImprovements && (
              <div className="space-y-2 animate-in slide-in-from-top duration-300">
                {atsScore.improvements.slice(0, 6).map((item, index) => (
                  <div 
                    key={index}
                    className="flex items-start gap-2 p-2 sm:p-3 bg-orange-50 rounded-lg border border-orange-200"
                  >
                    <span className="text-orange-600 font-bold flex-shrink-0">•</span>
                    <span className="text-xs sm:text-sm text-orange-800 leading-relaxed">{item}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ATS Tips - Compact */}
        <div className="p-3 sm:p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-2 text-sm sm:text-base flex items-center gap-2">
            <span>💡</span>
            <span>ATS Pro Tips</span>
          </h3>
          <ul className="text-xs sm:text-sm text-blue-800 space-y-1">
            <li>• Use standard section headings</li>
            <li>• Include job description keywords</li>
            <li>• Quantify achievements with numbers</li>
            <li>• Avoid complex formatting</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
