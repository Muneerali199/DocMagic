'use client';

import { Typewriter } from 'react-simple-typewriter';

export function TypedEffect() {
  return (
    <span className="inline-flex items-center gap-2 leading-none">
      {/* Enhanced gradient container */}
      <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent font-bold">
        <Typewriter
          words={['resumes', 'presentations', 'cover letters', 'CVs', 'diagrams', 'documents']}
          loop
          typeSpeed={100}
          deleteSpeed={50}
          delaySpeed={1500}
        />
      </span>
    </span>
  );
}