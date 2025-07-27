'use client';

import { Typewriter } from 'react-simple-typewriter';


export function TypedEffect() {
  return (
    <span className="inline-flex items-center gap-2 leading-none">
      {/* Gradient container */}
      <span className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 bg-clip-text text-transparent font-bold">
        <Typewriter
          words={['  Resume ', 'Presentation ', ' Letter ']}
          loop
          typeSpeed={80}
          deleteSpeed={40}
          delaySpeed={1200}
        />
      </span>

     
    
    </span>
  );
}