'use client';

import { useEffect } from 'react';

export function ResumeNavFix() {
  useEffect(() => {
    // Create a style element
    const style = document.createElement('style');
    
    // Add the CSS rules
    style.textContent = `
      /* Resume Builder Navigation Styles */
      .flex.items-center.justify-center.gap-2.mb-8.overflow-x-auto.pb-2 {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0.75rem;
        background: rgba(255, 255, 255, 0.9);
        backdrop-filter: blur(12px);
        border-radius: 0.75rem;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        margin-bottom: 1.5rem;
        overflow-x: auto;
        border: 1px solid rgba(0, 0, 0, 0.1);
      }

      .dark .flex.items-center.justify-center.gap-2.mb-8.overflow-x-auto.pb-2 {
        background: rgba(30, 30, 30, 0.9);
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
        border: 1px solid rgba(255, 255, 255, 0.1);
      }

      .flex.items-center.gap-2.px-3.py-2.rounded-full.transition-all.whitespace-nowrap.cursor-pointer {
        display: flex;
        align-items: center;
        padding: 0.5rem 1rem;
        border-radius: 0.5rem;
        font-weight: 500;
        white-space: nowrap;
        transition: all 0.2s ease;
        color: #333;
        margin: 0 0.25rem;
        text-shadow: 0 1px 0 rgba(255, 255, 255, 0.5);
      }

      .dark .flex.items-center.gap-2.px-3.py-2.rounded-full.transition-all.whitespace-nowrap.cursor-pointer {
        color: #eee;
        text-shadow: 0 1px 0 rgba(0, 0, 0, 0.5);
      }

      .bolt-gradient.text-white.shadow-lg {
        background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%) !important;
        color: white !important;
        font-weight: 600 !important;
        box-shadow: 0 2px 8px rgba(37, 99, 235, 0.4) !important;
        text-shadow: 0 1px 0 rgba(0, 0, 0, 0.3) !important;
      }

      .dark .bolt-gradient.text-white.shadow-lg {
        background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%) !important;
        box-shadow: 0 2px 8px rgba(59, 130, 246, 0.5) !important;
        text-shadow: 0 1px 0 rgba(0, 0, 0, 0.5) !important;
      }

      .glass-effect.hover\\:scale-105:hover {
        background: rgba(37, 99, 235, 0.1) !important;
        color: #2563eb !important;
      }

      .dark .glass-effect.hover\\:scale-105:hover {
        background: rgba(59, 130, 246, 0.2) !important;
        color: #60a5fa !important;
      }

      .h-4.w-4 {
        margin-right: 0.5rem;
        filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.1));
      }

      .dark .h-4.w-4 {
        filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.5));
      }

      /* Responsive adjustments */
      @media (max-width: 768px) {
        .flex.items-center.gap-2.px-3.py-2.rounded-full.transition-all.whitespace-nowrap.cursor-pointer {
          padding: 0.5rem;
        }
        
        .text-sm.font-medium.hidden.sm\\:inline {
          display: none;
        }
        
        .h-4.w-4 {
          margin-right: 0;
        }
      }
    `;
    
    // Append the style element to the head
    document.head.appendChild(style);
    
    // Clean up function
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  // This component doesn't render anything
  return null;
}

export default ResumeNavFix;