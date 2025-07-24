"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, Send, Star, Loader2, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

interface FeedbackFormProps {
  documentType: 'resume' | 'letter' | 'presentation';
  documentId?: string;
}

export function FeedbackForm({ documentType, documentId }: FeedbackFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({
    feedbackType: 'bug',
    documentType: 'resume',
    message: '',
    email: '',
    rating: '2'
  });

  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!feedback.message.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide a feedback message",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rating: feedback.rating,
          category: feedback.feedbackType,
          message: feedback.message,
          email: feedback.email,
          name: '',
          documentType: feedback.documentType,
          documentId,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit feedback');
      }

      toast({
        title: "Thank you for your feedback! ✨",
        description: "Your input helps us improve DocMagic for everyone.",
      });

      // Reset form
      setFeedback({
        feedbackType: 'bug',
        documentType: 'resume',
        message: '',
        email: '',
        rating: '2'
      });
      setIsOpen(false);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };



  return (
    <>
      <Button
        variant="outline"
        onClick={() => setIsOpen(true)}
        className="glass-effect border-yellow-400/30 hover:border-yellow-400/60 w-full mt-4"
      >
        <MessageSquare className="mr-2 h-4 w-4" />
        Give Feedback
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md" hideCloseButton>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 justify-center text-center text-2xl sm:text-3xl font-bold">
              <Star className="h-5 w-5 text-yellow-500" />
              Send{" "}
              <span className="bolt-gradient-text">Feedback</span>
            </DialogTitle>
            <DialogDescription className="text-center">
              We value your feedback! Please let us know your thoughts or report any issues.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Feedback Type */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Feedback Type</Label>
              <RadioGroup 
                value={feedback.feedbackType} 
                onValueChange={(value) => setFeedback(prev => ({ ...prev, feedbackType: value }))}
                className="flex justify-between"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="bug" id="bug" />
                  <Label htmlFor="bug" className="text-sm cursor-pointer">Bug Report</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="suggestion" id="suggestion" />
                  <Label htmlFor="suggestion" className="text-sm cursor-pointer">Suggestion</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="compliment" id="compliment" />
                  <Label htmlFor="compliment" className="text-sm cursor-pointer">Compliment</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="other" id="other" />
                  <Label htmlFor="other" className="text-sm cursor-pointer">Other</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Document Type and Email */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <Label className="text-sm font-medium">Document Type</Label>
                <Select 
                  value={feedback.documentType} 
                  onValueChange={(value) => setFeedback(prev => ({ ...prev, documentType: value }))}
                >
                  <SelectTrigger className="glass-effect border-yellow-400/30 focus:border-yellow-400/60">
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="resume">Resume</SelectItem>
                    <SelectItem value="presentation">Presentation</SelectItem>
                    <SelectItem value="cv">CV</SelectItem>
                    <SelectItem value="letter">Letter</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label htmlFor="email" className="text-sm font-medium">Email (optional)</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={feedback.email}
                  onChange={(e) => setFeedback(prev => ({ ...prev, email: e.target.value }))}
                  className="glass-effect border-yellow-400/30 focus:border-yellow-400/60"
                />
              </div>
            </div>

            {/* Message */}
            <div className="space-y-3">
              <Label htmlFor="message" className="text-sm font-medium">Message</Label>
              <Textarea
                id="message"
                placeholder="Describe your feedback..."
                value={feedback.message}
                onChange={(e) => setFeedback(prev => ({ ...prev, message: e.target.value }))}
                className="glass-effect border-yellow-400/30 focus:border-yellow-400/60 min-h-[60px] max-h-[60px] resize-none"
                rows={2}
                required
              />
            </div>

            {/* Overall Rating */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Overall Rating</Label>
              <RadioGroup 
                value={feedback.rating} 
                onValueChange={(value) => setFeedback(prev => ({ ...prev, rating: value }))}
                className="flex justify-between"
              >
                <div className="flex flex-col items-center space-y-2">
                  <RadioGroupItem value="1" id="rating-1" className="sr-only" />
                  <Label htmlFor="rating-1" className="text-2xl cursor-pointer hover:scale-110 transition-transform">😐</Label>
                  <span className="text-xs text-muted-foreground">Poor</span>
                </div>
                <div className="flex flex-col items-center space-y-2">
                  <RadioGroupItem value="2" id="rating-2" className="sr-only" />
                  <Label htmlFor="rating-2" className="text-2xl cursor-pointer hover:scale-110 transition-transform">😞</Label>
                  <span className="text-xs text-muted-foreground">Bad</span>
                </div>
                <div className="flex flex-col items-center space-y-2">
                  <RadioGroupItem value="3" id="rating-3" className="sr-only" />
                  <Label htmlFor="rating-3" className="text-2xl cursor-pointer hover:scale-110 transition-transform">😐</Label>
                  <span className="text-xs text-muted-foreground">Okay</span>
                </div>
                <div className="flex flex-col items-center space-y-2">
                  <RadioGroupItem value="4" id="rating-4" className="sr-only" />
                  <Label htmlFor="rating-4" className="text-2xl cursor-pointer hover:scale-110 transition-transform">🙂</Label>
                  <span className="text-xs text-muted-foreground">Good</span>
                </div>
                <div className="flex flex-col items-center space-y-2">
                  <RadioGroupItem value="5" id="rating-5" className="sr-only" />
                  <Label htmlFor="rating-5" className="text-2xl cursor-pointer hover:scale-110 transition-transform">😄</Label>
                  <span className="text-xs text-muted-foreground">Amazing</span>
                </div>
              </RadioGroup>
            </div>

            <DialogFooter>
              <Button
                type="submit"
                disabled={isSubmitting || !feedback.message.trim()}
                className="w-full bolt-gradient text-white font-semibold py-3 rounded-xl hover:scale-105 transition-all duration-300 bolt-glow relative overflow-hidden"
              >
                <div className="flex items-center justify-center gap-2 relative z-10">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Submit Feedback
                    </>
                  )}
                </div>
                
                {/* Button shimmer effect */}
                {!isSubmitting && (
                  <div className="absolute inset-0 shimmer opacity-30"></div>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
} 