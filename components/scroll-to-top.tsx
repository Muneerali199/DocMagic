"use client";
import { useEffect, useState } from "react";
import { FaAnglesUp } from "react-icons/fa6";

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
    { isVisible && <button 
    title='Back to top' aria-label="Scroll to top"
    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
     className='fixed bottom-6 right-6 z-50 p-3 rounded-full bg-white/30 dark:bg-white/20 backdrop-blur-md text-gray-700 dark:text-gray-200 shadow-md cursor-pointer hover:scale-105 hover:bg-white/50 hover:text-gray-900 dark:hover:text-gray-100 dark:hover:bg-white/30 transition-transform duration-300 focus:outline-none focus:ring-4 focus:ring-white/40 dark:focus:ring-white/30 focus:ring-offset-0 focus:bg-white/40 dark:focus:bg-white/30 '>
      <FaAnglesUp />
    </button>}
    </>
  )
}
