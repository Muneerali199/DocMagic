"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles } from "lucide-react";

export function WebsiteBuilderMinimal() {
  const [prompt, setPrompt] = useState("");

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">
          AI Website Builder
        </h1>
        
        <div className="bg-white rounded-xl p-6 shadow-xl">
          <Textarea
            placeholder="Describe your website..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[120px] mb-4"
          />
          
          <Button className="w-full">
            <Sparkles className="h-5 w-5 mr-2" />
            Generate Website
          </Button>
        </div>
      </div>
    </div>
  );
}
