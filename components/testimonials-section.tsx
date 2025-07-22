import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Star, Quote } from "lucide-react";

export function TestimonialsSection() {
  return (
    <section className="section-header py-16 sm:py-24 relative overflow-hidden">
      {/* Professional Background elements */}
      <div className="absolute top-10 right-20 w-16 h-16 sm:w-24 sm:h-24 sunset-gradient rounded-full opacity-15 animate-float"></div>
      <div className="absolute bottom-20 left-20 w-20 h-20 sm:w-32 sm:h-32 ocean-gradient rounded-full opacity-15 animate-float" style={{animationDelay: '12s'}}></div>
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mx-auto max-w-2xl lg:text-center">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full gradient-border mb-4 sm:mb-6 relative">
            <div className="relative z-10 flex items-center gap-2">
              <Star className="h-3 w-3 sm:h-4 sm:w-4 text-amber-500" style={{animation: 'sparkle 2s ease-in-out infinite'}} />
              <span className="text-xs sm:text-sm font-medium bolt-gradient-text">Testimonials</span>
            </div>
          </div>
          <h2 className="modern-title text-2xl sm:text-3xl lg:text-5xl mb-4 sm:mb-6">
            Loved by <span className="bolt-gradient-text">professionals everywhere</span>
          </h2>
          <p className="modern-body text-base sm:text-lg text-muted-foreground px-4 sm:px-0">
            See what our users are saying about how DocMagic has transformed their document creation process with AI magic.
          </p>
        </div>
        
        <div className="mx-auto mt-12 sm:mt-16 grid max-w-2xl grid-cols-1 gap-6 sm:gap-8 lg:max-w-none lg:grid-cols-3 px-4 sm:px-0">
          {testimonials.map((testimonial, i) => {
            const cardThemes = ['card-coral hover-coral', 'card-sky hover-sky', 'card-mint hover-mint'];
            const theme = cardThemes[i % cardThemes.length];
            
            return (
            <Card key={i} className={`professional-card border-0 hover:shadow-xl transition-all duration-300 group h-full ${theme}`}>
              <CardHeader className="pb-3 sm:pb-4">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <Avatar className="ring-2 ring-blue-400/30 h-10 w-10 sm:h-12 sm:w-12">
                    <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                    <AvatarFallback className="bolt-gradient text-white font-semibold text-sm">
                      {testimonial.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold group-hover:bolt-gradient-text transition-colors text-sm sm:text-base professional-heading">{testimonial.name}</p>
                    <p className="text-xs sm:text-sm professional-text">{testimonial.title}</p>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="relative flex-1">
                <Quote className="absolute -top-2 -left-2 h-6 w-6 sm:h-8 sm:w-8 text-blue-400/30" />
                <p className="professional-text relative z-10 italic text-sm sm:text-base leading-relaxed">"{testimonial.content}"</p>
              </CardContent>
              
              <CardFooter className="pt-3 sm:pt-4">
                <div className="flex space-x-1">
                  {Array(5).fill(0).map((_, i) => (
                    <Star key={i} className="w-3 h-3 sm:w-4 sm:h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </CardFooter>
            </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

const testimonials = [
  {
    name: "Alex Johnson",
    title: "UX Designer",
    content: "DocMagic helped me create a stunning portfolio presentation in minutes. The AI understood exactly what I needed and generated slides that wowed my clients. Absolutely magical! ⚡",
    avatar: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=600"
  },
  {
    name: "Sarah Chen",
    title: "Software Engineer",
    content: "I was struggling with my resume for weeks. With DocMagic, I typed in my target role, and it created a tailored CV that highlighted my most relevant skills. I got the job! 🚀",
    avatar: "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=600"
  },
  {
    name: "Michael Rodriguez",
    title: "Marketing Director",
    content: "The presentation templates are simply stunning. I used the platform to create our quarterly business review and received compliments from the entire executive team. Game changer! ✨",
    avatar: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=600"
  }
];