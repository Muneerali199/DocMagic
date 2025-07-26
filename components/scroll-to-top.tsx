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
    title='Back to top'
    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
    className='fixed z-1000 bottom-6 right-6 text-white p-2 rounded-full cursor-pointer border transition-colors'>
      <FaAnglesUp />
    </button>}
    </>
  )
}
