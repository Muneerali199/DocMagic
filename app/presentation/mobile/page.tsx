"use client";

import { MobilePresentationGenerator } from "@/components/presentation/mobile-presentation-generator";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function MobilePresentationPage() {
  return (
    <div className="min-h-screen">
      {/* Simple Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <Link 
            href="/presentation"
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm font-medium">Back</span>
          </Link>
          <div className="text-sm font-semibold text-gray-900">
            AI Presentation
          </div>
          <div className="w-16"></div> {/* Spacer for centering */}
        </div>
      </div>

      {/* Main Content */}
      <MobilePresentationGenerator />
    </div>
  );
}
