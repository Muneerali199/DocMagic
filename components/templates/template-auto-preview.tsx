'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';

interface TemplateAutoPreviewProps {
  templateId: string;
  templateStyle: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  className?: string;
  autoPlay?: boolean;
  interval?: number;
}

export function TemplateAutoPreview({
  templateId,
  templateStyle,
  fonts,
  className,
  autoPlay = true,
  interval = 3000,
}: TemplateAutoPreviewProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isHovered, setIsHovered] = useState(false);

  const slides = getTemplateSlides(templateId, templateStyle, fonts);
  const totalSlides = slides.length;

  useEffect(() => {
    if (!isPlaying || isHovered) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, interval);

    return () => clearInterval(timer);
  }, [isPlaying, isHovered, totalSlides, interval]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <div
      className={cn('relative group', className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Slides Container */}
      <div className="relative w-full aspect-[16/9] bg-gray-100 rounded-lg overflow-hidden shadow-xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="absolute inset-0"
          >
            {slides[currentSlide]}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Controls - Show on Hover */}
        <AnimatePresence>
          {isHovered && totalSlides > 1 && (
            <>
              {/* Previous Button */}
              <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onClick={prevSlide}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white shadow-lg flex items-center justify-center transition-colors z-10"
              >
                <ChevronLeft className="w-5 h-5 text-gray-700" />
              </motion.button>

              {/* Next Button */}
              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onClick={nextSlide}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white shadow-lg flex items-center justify-center transition-colors z-10"
              >
                <ChevronRight className="w-5 h-5 text-gray-700" />
              </motion.button>

              {/* Play/Pause Button */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                onClick={() => setIsPlaying(!isPlaying)}
                className="absolute bottom-4 right-4 w-8 h-8 rounded-full bg-white/90 hover:bg-white shadow-lg flex items-center justify-center transition-colors z-10"
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 text-gray-700" />
                ) : (
                  <Play className="w-4 h-4 text-gray-700 ml-0.5" />
                )}
              </motion.button>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Slide Indicators */}
      {totalSlides > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                'h-1.5 rounded-full transition-all duration-300',
                index === currentSlide
                  ? 'w-6 opacity-100'
                  : 'w-1.5 opacity-40 hover:opacity-70'
              )}
              style={{
                backgroundColor: index === currentSlide ? templateStyle.primary : '#9ca3af',
              }}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Slide Counter */}
      {totalSlides > 1 && (
        <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
          {currentSlide + 1} / {totalSlides}
        </div>
      )}
    </div>
  );
}

// Get slides for specific template
function getTemplateSlides(
  templateId: string,
  style: any,
  fonts: any
): React.ReactNode[] {
  // Ultra Premium Modern template
  if (templateId === 'ultra-premium-modern') {
    return [
      <UltraPremiumSlide1 key="slide1" style={style} fonts={fonts} />,
      <UltraPremiumSlide2 key="slide2" style={style} fonts={fonts} />,
      <UltraPremiumSlide3 key="slide3" style={style} fonts={fonts} />,
      <UltraPremiumSlide4 key="slide4" style={style} fonts={fonts} />,
    ];
  }

  // Creative Gradient template
  if (templateId === 'creative-gradient') {
    return [
      <CreativeSlide1 key="slide1" style={style} fonts={fonts} />,
      <CreativeSlide2 key="slide2" style={style} fonts={fonts} />,
      <CreativeSlide3 key="slide3" style={style} fonts={fonts} />,
      <CreativeSlide4 key="slide4" style={style} fonts={fonts} />,
    ];
  }

  // Startup Unicorn template
  if (templateId === 'startup-unicorn') {
    return [
      <StartupSlide1 key="slide1" style={style} fonts={fonts} />,
      <StartupSlide2 key="slide2" style={style} fonts={fonts} />,
      <StartupSlide3 key="slide3" style={style} fonts={fonts} />,
      <StartupSlide4 key="slide4" style={style} fonts={fonts} />,
    ];
  }

  // Default presentation slides
  return [
    <DefaultSlide1 key="slide1" style={style} fonts={fonts} />,
    <DefaultSlide2 key="slide2" style={style} fonts={fonts} />,
    <DefaultSlide3 key="slide3" style={style} fonts={fonts} />,
  ];
}

// Ultra Premium Modern Template Slides
function UltraPremiumSlide1({ style, fonts }: any) {
  return (
    <div
      className="w-full h-full relative overflow-hidden flex items-center justify-center"
      style={{
        background: `linear-gradient(135deg, ${style.primary} 0%, ${style.secondary} 50%, ${style.accent} 100%)`,
      }}
    >
      {/* Animated Background Shapes */}
      <motion.div
        className="absolute inset-0 opacity-10"
        initial={{ rotate: 0 }}
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
      >
        <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-white" />
        <div className="absolute bottom-20 right-20 w-48 h-48 rounded-full bg-white" />
        <div className="absolute top-1/2 right-10 w-24 h-24 rounded-full bg-white" />
      </motion.div>

      <div className="relative z-10 text-center px-12 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h1
            className="text-7xl font-bold text-white mb-6 tracking-tight"
            style={{ fontFamily: fonts.heading }}
          >
            Ultra Premium
          </h1>
          <div className="w-24 h-1 bg-white mx-auto mb-6" />
          <p className="text-2xl text-white/90 mb-8" style={{ fontFamily: fonts.body }}>
            Next-Generation Presentation Design
          </p>
          <div className="flex items-center justify-center gap-8 text-white/80 text-sm">
            <span>Your Name</span>
            <span>•</span>
            <span>October 2025</span>
            <span>•</span>
            <span>Premium Collection</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function UltraPremiumSlide2({ style, fonts }: any) {
  return (
    <div className="w-full h-full bg-white p-16 relative overflow-hidden">
      {/* Background Decoration */}
      <div
        className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-10"
        style={{ backgroundColor: style.accent }}
      />

      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2
          className="text-5xl font-bold mb-12"
          style={{ fontFamily: fonts.heading, color: style.primary }}
        >
          Key Features
        </h2>

        <div className="grid grid-cols-2 gap-8">
          {[
            {
              icon: '🎨',
              title: 'Beautiful Design',
              desc: 'Stunning visuals that capture attention',
            },
            {
              icon: '⚡',
              title: 'Lightning Fast',
              desc: 'Optimized for peak performance',
            },
            {
              icon: '🚀',
              title: 'Easy to Use',
              desc: 'Intuitive interface for everyone',
            },
            {
              icon: '💎',
              title: 'Premium Quality',
              desc: 'Professional-grade templates',
            },
          ].map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="flex gap-4"
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
                style={{ backgroundColor: `${style.primary}10` }}
              >
                {feature.icon}
              </div>
              <div>
                <h3
                  className="text-xl font-semibold mb-2"
                  style={{ fontFamily: fonts.heading, color: style.text }}
                >
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm" style={{ fontFamily: fonts.body }}>
                  {feature.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function UltraPremiumSlide3({ style, fonts }: any) {
  return (
    <div className="w-full h-full bg-gradient-to-br from-gray-50 to-white p-16">
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2
          className="text-5xl font-bold mb-12"
          style={{ fontFamily: fonts.heading, color: style.primary }}
        >
          Growth Analytics
        </h2>

        <div className="grid grid-cols-2 gap-12">
          {/* Chart */}
          <div className="space-y-6">
            <div className="flex items-end justify-between h-64 px-4">
              {[
                { height: 45, label: 'Jan', value: '45%' },
                { height: 60, label: 'Feb', value: '60%' },
                { height: 55, label: 'Mar', value: '55%' },
                { height: 75, label: 'Apr', value: '75%' },
                { height: 85, label: 'May', value: '85%' },
                { height: 95, label: 'Jun', value: '95%' },
              ].map((bar, idx) => (
                <motion.div
                  key={idx}
                  className="flex flex-col items-center gap-3 flex-1"
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  transition={{ duration: 0.8, delay: idx * 0.1 }}
                >
                  <div className="text-xs font-semibold" style={{ color: style.primary }}>
                    {bar.value}
                  </div>
                  <motion.div
                    className="w-full rounded-t-lg relative"
                    style={{
                      height: `${bar.height}%`,
                      background: `linear-gradient(to top, ${style.primary}, ${style.accent})`,
                    }}
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ duration: 0.6, delay: idx * 0.1 }}
                  />
                  <span className="text-xs text-gray-600" style={{ fontFamily: fonts.body }}>
                    {bar.label}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="space-y-6">
            {[
              { label: 'Total Revenue', value: '$2.4M', change: '+23%' },
              { label: 'Active Users', value: '125K', change: '+18%' },
              { label: 'Conversion Rate', value: '4.8%', change: '+12%' },
              { label: 'Customer Satisfaction', value: '98%', change: '+5%' },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="p-6 rounded-2xl"
                style={{ backgroundColor: `${style.primary}05` }}
              >
                <div className="text-sm text-gray-600 mb-1" style={{ fontFamily: fonts.body }}>
                  {stat.label}
                </div>
                <div className="flex items-end justify-between">
                  <div
                    className="text-3xl font-bold"
                    style={{ fontFamily: fonts.heading, color: style.primary }}
                  >
                    {stat.value}
                  </div>
                  <div className="text-green-600 font-semibold">{stat.change}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function UltraPremiumSlide4({ style, fonts }: any) {
  return (
    <div
      className="w-full h-full relative overflow-hidden flex items-center justify-center"
      style={{
        background: `linear-gradient(135deg, ${style.secondary} 0%, ${style.primary} 100%)`,
      }}
    >
      {/* Animated Particles */}
      {[...Array(20)].map((_, idx) => (
        <motion.div
          key={idx}
          className="absolute w-2 h-2 bg-white rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}

      <div className="relative z-10 text-center px-12 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          <h2
            className="text-6xl font-bold text-white mb-8"
            style={{ fontFamily: fonts.heading }}
          >
            Ready to Get Started?
          </h2>
          <p className="text-xl text-white/90 mb-12" style={{ fontFamily: fonts.body }}>
            Transform your presentations with our premium templates
          </p>
          <motion.button
            className="px-12 py-4 bg-white rounded-full text-lg font-semibold shadow-2xl hover:shadow-3xl transition-all"
            style={{ color: style.primary, fontFamily: fonts.heading }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Start Creating Now
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}

// Default Slides (for other templates)
function DefaultSlide1({ style, fonts }: any) {
  return (
    <div
      className="w-full h-full flex items-center justify-center"
      style={{
        background: `linear-gradient(135deg, ${style.primary} 0%, ${style.secondary} 100%)`,
      }}
    >
      <div className="text-center px-12">
        <h1 className="text-6xl font-bold text-white mb-4" style={{ fontFamily: fonts.heading }}>
          Your Project Title
        </h1>
        <p className="text-2xl text-white/90" style={{ fontFamily: fonts.body }}>
          A Professional Presentation
        </p>
        <div className="mt-8 text-sm text-white/80">Your Name • October 2025</div>
      </div>
    </div>
  );
}

function DefaultSlide2({ style, fonts }: any) {
  return (
    <div className="w-full h-full bg-white p-16" style={{ color: style.text }}>
      <h2
        className="text-4xl font-bold mb-8"
        style={{ fontFamily: fonts.heading, color: style.primary }}
      >
        Key Features
      </h2>
      <div className="space-y-6">
        {['Professional Design', 'Easy to Customize', 'Multiple Layouts'].map((feature, idx) => (
          <div key={idx} className="flex items-start gap-4">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0"
              style={{ backgroundColor: style.accent }}
            >
              {idx + 1}
            </div>
            <div>
              <h3 className="text-2xl font-semibold mb-2" style={{ fontFamily: fonts.heading }}>
                {feature}
              </h3>
              <p className="text-gray-600" style={{ fontFamily: fonts.body }}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DefaultSlide3({ style, fonts }: any) {
  return (
    <div className="w-full h-full bg-white p-16" style={{ color: style.text }}>
      <h2
        className="text-4xl font-bold mb-8"
        style={{ fontFamily: fonts.heading, color: style.primary }}
      >
        Growth Overview
      </h2>
      <div className="flex items-end justify-around h-64 px-8">
        {[45, 65, 55, 85, 75].map((height, idx) => (
          <div key={idx} className="flex flex-col items-center gap-3 flex-1">
            <div
              className="w-full rounded-t-lg"
              style={{
                height: `${height}%`,
                backgroundColor: idx % 2 === 0 ? style.primary : style.accent,
              }}
            />
            <span className="text-sm text-gray-600" style={{ fontFamily: fonts.body }}>
              Q{idx + 1}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Creative Gradient Template Slides
function CreativeSlide1({ style, fonts }: any) {
  return (
    <div
      className="w-full h-full relative overflow-hidden flex items-center justify-center"
      style={{
        background: `radial-gradient(circle at 20% 50%, ${style.primary} 0%, ${style.secondary} 50%, ${style.accent} 100%)`,
      }}
    >
      {/* Floating shapes */}
      {[...Array(10)].map((_, idx) => (
        <motion.div
          key={idx}
          className="absolute rounded-full bg-white/10"
          style={{
            width: `${Math.random() * 100 + 50}px`,
            height: `${Math.random() * 100 + 50}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            x: [0, Math.random() * 100 - 50],
            y: [0, Math.random() * 100 - 50],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 5 + Math.random() * 5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      <div className="relative z-10 text-center px-12">
        <motion.h1
          className="text-7xl font-bold text-white mb-6"
          style={{ fontFamily: fonts.heading }}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Creative Vision
        </motion.h1>
        <motion.p
          className="text-2xl text-white/90 mb-4"
          style={{ fontFamily: fonts.body }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          Where Ideas Come to Life
        </motion.p>
        <motion.div
          className="flex items-center justify-center gap-6 text-white/80 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <span>Creative Studio</span>
          <span>•</span>
          <span>2025</span>
        </motion.div>
      </div>
    </div>
  );
}

function CreativeSlide2({ style, fonts }: any) {
  return (
    <div
      className="w-full h-full p-16 relative overflow-hidden"
      style={{
        background: style.background,
        color: style.text,
      }}
    >
      <div
        className="absolute -right-32 -top-32 w-96 h-96 rounded-full blur-3xl opacity-20"
        style={{ backgroundColor: style.primary }}
      />
      
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2
          className="text-5xl font-bold mb-12"
          style={{ fontFamily: fonts.heading, color: style.primary }}
        >
          Our Services
        </h2>

        <div className="grid grid-cols-2 gap-8">
          {[
            { emoji: '🎨', title: 'Brand Design', desc: 'Memorable visual identities' },
            { emoji: '📱', title: 'Digital Products', desc: 'User-friendly interfaces' },
            { emoji: '🎬', title: 'Motion Graphics', desc: 'Engaging animations' },
            { emoji: '✨', title: 'Creative Strategy', desc: 'Innovative solutions' },
          ].map((service, idx) => (
            <motion.div
              key={idx}
              className="p-6 rounded-2xl"
              style={{ backgroundColor: `${style.primary}10` }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-5xl mb-4">{service.emoji}</div>
              <h3
                className="text-2xl font-bold mb-2"
                style={{ fontFamily: fonts.heading, color: style.text }}
              >
                {service.title}
              </h3>
              <p className="text-gray-600" style={{ fontFamily: fonts.body }}>
                {service.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function CreativeSlide3({ style, fonts }: any) {
  return (
    <div
      className="w-full h-full p-16"
      style={{
        background: `linear-gradient(45deg, ${style.secondary} 0%, ${style.primary} 100%)`,
      }}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <h2
          className="text-5xl font-bold text-white mb-12"
          style={{ fontFamily: fonts.heading }}
        >
          Our Portfolio
        </h2>

        <div className="grid grid-cols-3 gap-6">
          {[...Array(6)].map((_, idx) => (
            <motion.div
              key={idx}
              className="aspect-square rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white/80 text-6xl"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.3)' }}
            >
              {['🎨', '📱', '🎬', '✨', '🚀', '💎'][idx]}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function CreativeSlide4({ style, fonts }: any) {
  return (
    <div
      className="w-full h-full relative overflow-hidden flex items-center justify-center"
      style={{
        background: `linear-gradient(135deg, ${style.accent} 0%, ${style.primary} 50%, ${style.secondary} 100%)`,
      }}
    >
      <div className="relative z-10 text-center px-12">
        <motion.h2
          className="text-6xl font-bold text-white mb-8"
          style={{ fontFamily: fonts.heading }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          Let&apos;s Create Together
        </motion.h2>
        <motion.p
          className="text-xl text-white/90 mb-12"
          style={{ fontFamily: fonts.body }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          Transform your ideas into stunning visual experiences
        </motion.p>
        <motion.button
          className="px-10 py-4 bg-white rounded-full text-lg font-bold shadow-2xl"
          style={{ color: style.primary, fontFamily: fonts.heading }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          Start Your Project
        </motion.button>
      </div>
    </div>
  );
}

// Startup Unicorn Template Slides
function StartupSlide1({ style, fonts }: any) {
  return (
    <div className="w-full h-full bg-white relative overflow-hidden flex items-center">
      <div
        className="absolute top-0 right-0 w-1/2 h-full opacity-10"
        style={{
          background: `linear-gradient(135deg, ${style.primary} 0%, ${style.accent} 100%)`,
        }}
      />

      <div className="relative z-10 px-20">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div
            className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold mb-6"
            style={{ backgroundColor: `${style.primary}20`, color: style.primary }}
          >
            🚀 Seed Round - Series A
          </div>
          <h1
            className="text-7xl font-bold mb-6"
            style={{ fontFamily: fonts.heading, color: style.text }}
          >
            The Next<br />Unicorn
          </h1>
          <p
            className="text-2xl text-gray-600 mb-8"
            style={{ fontFamily: fonts.body }}
          >
            Disrupting the market with innovative solutions
          </p>
          <div className="flex items-center gap-8 text-gray-500">
            <div>
              <div className="text-3xl font-bold" style={{ color: style.primary }}>
                $10M
              </div>
              <div className="text-sm">Seeking</div>
            </div>
            <div className="w-px h-12 bg-gray-300" />
            <div>
              <div className="text-3xl font-bold" style={{ color: style.accent }}>
                10x
              </div>
              <div className="text-sm">Growth</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function StartupSlide2({ style, fonts }: any) {
  return (
    <div className="w-full h-full bg-gradient-to-br from-gray-50 to-white p-16">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2
          className="text-5xl font-bold mb-4"
          style={{ fontFamily: fonts.heading, color: style.primary }}
        >
          The Problem
        </h2>
        <p className="text-xl text-gray-600 mb-12" style={{ fontFamily: fonts.body }}>
          Traditional solutions are slow, expensive, and outdated
        </p>

        <div className="grid grid-cols-3 gap-6">
          {[
            { icon: '⏰', stat: '73%', label: 'Waste Time' },
            { icon: '💸', stat: '$50K', label: 'Average Cost' },
            { icon: '😤', stat: '91%', label: 'Frustrated' },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              className="p-8 rounded-3xl text-center"
              style={{ backgroundColor: `${style.primary}10` }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: idx * 0.15 }}
            >
              <div className="text-6xl mb-4">{item.icon}</div>
              <div
                className="text-4xl font-bold mb-2"
                style={{ fontFamily: fonts.heading, color: style.primary }}
              >
                {item.stat}
              </div>
              <div className="text-gray-600" style={{ fontFamily: fonts.body }}>
                {item.label}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function StartupSlide3({ style, fonts }: any) {
  return (
    <div className="w-full h-full bg-white p-16">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <h2
          className="text-5xl font-bold mb-12"
          style={{ fontFamily: fonts.heading, color: style.primary }}
        >
          Traction & Growth
        </h2>

        <div className="grid grid-cols-2 gap-12">
          {/* Chart */}
          <div>
            <div className="flex items-end justify-between h-80 px-4">
              {[
                { height: 20, label: 'Q1', value: '5K' },
                { height: 35, label: 'Q2', value: '15K' },
                { height: 55, label: 'Q3', value: '45K' },
                { height: 75, label: 'Q4', value: '120K' },
                { height: 95, label: 'Q1\'25', value: '350K' },
              ].map((bar, idx) => (
                <motion.div
                  key={idx}
                  className="flex flex-col items-center gap-3 flex-1"
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  transition={{ duration: 0.8, delay: idx * 0.1 }}
                >
                  <div className="text-sm font-bold" style={{ color: style.primary }}>
                    {bar.value}
                  </div>
                  <motion.div
                    className="w-full rounded-t-xl"
                    style={{
                      height: `${bar.height}%`,
                      background: `linear-gradient(to top, ${style.primary}, ${style.accent})`,
                    }}
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ duration: 0.6, delay: idx * 0.1 }}
                  />
                  <span className="text-xs text-gray-600">{bar.label}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Key Metrics */}
          <div className="space-y-6">
            {[
              { label: 'Monthly Revenue', value: '$450K', trend: '+127%' },
              { label: 'Active Customers', value: '12,500', trend: '+94%' },
              { label: 'Churn Rate', value: '2.1%', trend: '-45%' },
              { label: 'NPS Score', value: '78', trend: '+18pts' },
            ].map((metric, idx) => (
              <motion.div
                key={idx}
                className="p-6 rounded-2xl"
                style={{ backgroundColor: `${style.primary}10` }}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
              >
                <div className="text-sm text-gray-600 mb-2">{metric.label}</div>
                <div className="flex items-end justify-between">
                  <div
                    className="text-3xl font-bold"
                    style={{ fontFamily: fonts.heading, color: style.primary }}
                  >
                    {metric.value}
                  </div>
                  <div className="text-green-600 font-semibold text-sm">
                    {metric.trend}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function StartupSlide4({ style, fonts }: any) {
  return (
    <div
      className="w-full h-full relative overflow-hidden flex items-center justify-center"
      style={{
        background: `linear-gradient(135deg, ${style.primary} 0%, ${style.secondary} 100%)`,
      }}
    >
      {/* Animated rocket */}
      <motion.div
        className="absolute text-9xl"
        initial={{ x: -200, y: 200, rotate: -45 }}
        animate={{ x: 200, y: -200, rotate: 45 }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      >
        🚀
      </motion.div>

      <div className="relative z-10 text-center px-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          <h2
            className="text-6xl font-bold text-white mb-8"
            style={{ fontFamily: fonts.heading }}
          >
            Join the Journey
          </h2>
          <p className="text-2xl text-white/90 mb-12" style={{ fontFamily: fonts.body }}>
            Let&apos;s build the next unicorn together
          </p>
          <div className="flex items-center justify-center gap-6">
            <motion.button
              className="px-10 py-4 bg-white rounded-full text-lg font-bold shadow-2xl"
              style={{ color: style.primary, fontFamily: fonts.heading }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Invest Now
            </motion.button>
            <motion.button
              className="px-10 py-4 bg-white/20 backdrop-blur-sm border-2 border-white rounded-full text-lg font-bold text-white"
              style={{ fontFamily: fonts.heading }}
              whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.3)' }}
              whileTap={{ scale: 0.95 }}
            >
              Learn More
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
