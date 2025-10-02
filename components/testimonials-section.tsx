"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Star, Quote, Heart, Users, Trophy } from "lucide-react";
import { useState, useEffect } from "react";
  import {FaCircleChevronRight } from "react-icons/fa6";

export function TestimonialsSection() {

  const [currentIndex, setCurrentIndex] = useState(0);
    
    const nextSlide = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prevIndex) => (prevIndex - 1 + testimonials.length) % testimonials.length);
    };
    const autoSlide = true; // Set to true to enable auto sliding
    const autoSlideInterval = 5000; // Interval in milliseconds for auto sliding

    useEffect(() => {
        if (autoSlide) {
            const slideInterval = setInterval(nextSlide, autoSlideInterval);
            return () => clearInterval(slideInterval);
        }
    }, [currentIndex, autoSlide, autoSlideInterval]);

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-purple-50/50 via-background to-blue-50/50 py-20 sm:py-28 lg:py-36">
      {/* Enhanced background elements */}
      <div className="absolute inset-0 mesh-gradient opacity-30"></div>
      <div className="floating-orb w-64 h-64 sm:w-96 sm:h-96 sunset-gradient opacity-15 top-20 -right-32"></div>
      <div className="floating-orb w-48 h-48 sm:w-72 sm:h-72 ocean-gradient opacity-20 bottom-20 -left-24"></div>
      <div className="floating-orb w-56 h-56 sm:w-80 sm:h-80 cosmic-gradient opacity-15 top-1/2 left-1/4"></div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mx-auto max-w-4xl text-center mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full glass-effect mb-8 border border-pink-200/30">
            <Heart className="h-5 w-5 text-pink-600" />
            <span className="text-base font-semibold bolt-gradient-text">Customer Love</span>
            <Star className="h-5 w-5 text-amber-500 fill-current" />
          </div>

          <h2 className="modern-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl mb-8 leading-tight">
            <span className="block mb-2">Trusted by</span>
            <span className="bolt-gradient-text">10,000+ Professionals</span>
          </h2>

          <p className="modern-body text-lg sm:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Join thousands of satisfied users who have transformed their document creation process with DocMagic&apos;s AI-powered platform.
          </p>

          {/* Social proof stats */}
          <div className="flex flex-wrap justify-center gap-6 mt-8">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full glass-effect border border-amber-200/30">
              <Star className="h-4 w-4 text-amber-500 fill-current" />
              <span className="text-sm font-semibold text-amber-700">4.9/5 Rating</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full glass-effect border border-blue-200/30">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-semibold text-blue-700">10K+ Users</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full glass-effect border border-green-200/30">
              <Trophy className="h-4 w-4 text-green-600" />
              <span className="text-sm font-semibold text-green-700">Industry Leader</span>
            </div>
          </div>
        </div>

        {/* Enhanced testimonials carousel */}
        <div className="relative">
          {/* Testimonial Cards Container */}
          <div className="overflow-hidden relative min-h-[400px] sm:min-h-[450px] flex items-center justify-center px-4 sm:px-0">
            {testimonials.slice(0, 6).map((testimonial, i) => (
              <div key={i} className={`group w-full absolute flex items-center justify-center animate-fade-in-up transition-all ease-out duration-790 transform ${i === currentIndex ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`} style={{animationDelay: `${i * 100}ms`}}>
                {/* Enhanced background glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 via-purple-400/10 to-pink-400/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>

                <Card className="relative professional-card glass-effect group w-full max-w-3xl flex flex-col rounded-3xl border border-blue-200/30 hover:scale-105 transition-all duration-300">
                  <CardHeader className="pb-3 sm:pb-4 p-4 sm:p-6">
                    <div className="flex items-center space-x-3 sm:space-x-4">
                      <div className="relative flex-shrink-0">
                        <Avatar className="ring-2 ring-blue-400/30 h-12 w-12 sm:h-14 sm:w-14 group-hover:ring-blue-400/50 transition-all duration-300">
                          <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                          <AvatarFallback className="bolt-gradient text-white font-bold text-base sm:text-lg">
                            {testimonial.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        {/* Verified badge */}
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-green-500 rounded-full flex items-center justify-center">
                          <svg className="w-2 h-2 sm:w-3 sm:h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-base sm:text-lg group-hover:bolt-gradient-text transition-colors truncate">{testimonial.name}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground font-medium truncate">{testimonial.title}</p>
                        <p className="text-xs text-muted-foreground/70 mt-0.5 sm:mt-1 truncate">{testimonial.company}</p>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="relative flex-1 p-4 sm:p-6 pt-0">
                    <Quote className="absolute -top-2 -left-2 h-8 w-8 sm:h-10 sm:w-10 text-blue-400/20" />
                    <p className="relative z-10 text-sm sm:text-base leading-relaxed text-muted-foreground group-hover:text-foreground/80 transition-colors">
                      &quot;{testimonial.content}&quot;
                    </p>
                  </CardContent>

                  <CardFooter className="pt-3 sm:pt-4 p-4 sm:p-6">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex space-x-0.5 sm:space-x-1">
                        {Array(5).fill(0).map((_, starIndex) => (
                          <Star key={starIndex} className="w-3 h-3 sm:w-4 sm:h-4 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <div className="text-xs text-muted-foreground font-medium">
                        Verified User
                      </div>
                    </div>
                  </CardFooter>
                </Card>
              </div>
            ))}
          </div>

          {/* Navigation Buttons - Improved positioning */}
          <div className="flex items-center justify-center gap-4 mt-6 sm:mt-8">
            <button
              className="p-3 sm:p-4 rounded-full glass-effect border border-blue-200/30 hover:bg-blue-100/50 transition-all duration-300 hover:scale-110 touch-manipulation"
              onClick={prevSlide}
              aria-label="Previous testimonial"
            >
              <FaCircleChevronRight className="h-6 w-6 sm:h-8 sm:w-8 rotate-180 text-blue-600" />
            </button>
            
            {/* Pagination Dots */}
            <div className="flex items-center gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  className={`rounded-full transition-all duration-300 ${i === currentIndex ? 'bg-blue-600 w-8 h-2 sm:w-10 sm:h-2' : 'bg-gray-300 w-2 h-2 hover:bg-gray-400'}`}
                  onClick={() => setCurrentIndex(i)}
                  aria-label={`Go to testimonial ${i + 1}`}
                />
              ))}
            </div>
            
            <button
              className="p-3 sm:p-4 rounded-full glass-effect border border-blue-200/30 hover:bg-blue-100/50 transition-all duration-300 hover:scale-110 touch-manipulation"
              onClick={nextSlide}
              aria-label="Next testimonial"
            >
              <FaCircleChevronRight className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
            </button>
          </div>
        </div>

        {/* Enhanced bottom CTA */}
        <div className="text-center mt-16 sm:mt-20">
          <div className="inline-flex items-center gap-4 px-8 py-4 rounded-full glass-effect border border-purple-200/30 hover:scale-105 transition-transform duration-300">
            <Heart className="h-5 w-5 text-pink-600" />
            <span className="text-base font-semibold text-purple-700">Join our happy community</span>
            <Star className="h-5 w-5 text-amber-500 fill-current" />
          </div>
        </div>
      </div>
    </section>
  );
}

const testimonials = [
  {
    name: "Priya Sharma",
    title: "Product Manager",
    company: "TechCorp Inc.",
    content: "DocMagic has revolutionized how I create product proposals. The AI understands context perfectly and generates professional documents that impress stakeholders every time.",
    avatar: "https://images.pexels.com/photos/1758531/pexels-photo-1758531.jpeg?auto=compress&cs=tinysrgb&w=600"
  },
  {
    name: "Johnathan Lee",
    title: "Senior Writer",
    company: "Creative Agency",
    content: "As a professional writer, I'm amazed by DocMagic's ability to generate compelling content. It's like having a writing partner that never runs out of ideas.",
    avatar: "https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=600"
  },
  {
    name: "Aarav Patel",
    title: "Data Scientist",
    company: "Analytics Pro",
    content: "The presentation generator is incredible. It transforms complex data into clear, visually appealing slides that make my findings accessible to any audience.",
    avatar: "https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=600"
  },
  {
    name: "Emily White",
    title: "HR Director",
    company: "Global Solutions",
    content: "DocMagic streamlines our HR processes. From offer letters to policy documents, everything is professional, consistent, and created in minutes instead of hours.",
    avatar: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=600"
  },
  {
    name: "Rohan Gupta",
    title: "Marketing Lead",
    company: "StartupXYZ",
    content: "The resume builder helped me land my dream job. The AI created a targeted resume that perfectly highlighted my skills and got me noticed by top companies.",
    avatar: "https://images.pexels.com/photos/1680172/pexels-photo-1680172.jpeg?auto=compress&cs=tinysrgb&w=600"
  },
  {
    name: "Olivia Martinez",
    title: "Graduate Student",
    company: "Stanford University",
    content: "DocMagic has been essential for my academic work. It helps me create professional presentations and research documents that meet university standards.",
    avatar: "https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg?auto=compress&cs=tinysrgb&w=600"
  }
];