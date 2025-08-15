import { Metadata } from 'next';
import ChatInterface from '@/components/resume-chat/ChatInterface';

export const metadata: Metadata = {
  title: 'AI Resume Interview Coach - DocMagic',
  description: 'Get personalized interview questions and coaching based on your resume using AI-powered analysis.',
  keywords: 'resume analysis, interview questions, AI coach, job preparation, ATS optimization',
};

export default function ResumeChatPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            AI Resume Interview Coach
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Upload your resume and get personalized interview questions, ATS analysis, 
            and expert coaching to ace your next interview.
          </p>
        </div>
        
        <ChatInterface />
      </div>
    </div>
  );
}
