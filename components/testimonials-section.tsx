import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Star, Quote } from "lucide-react";

export function TestimonialsSection() {
  return (
    <section className="relative overflow-hidden bg-background py-16 sm:py-24">
      {/* Professional Background elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-05"></div>
      <div className="absolute top-10 right-20 w-24 h-24 sunset-gradient rounded-full opacity-15 animate-float"></div>
      <div className="absolute bottom-20 left-20 w-32 h-32 ocean-gradient rounded-full opacity-15 animate-float" style={{animationDelay: '12s'}}></div>
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mx-auto max-w-2xl lg:text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full gradient-border mb-6 relative subtle-shimmer">
            <div className="relative z-10 flex items-center gap-2">
              <Star className="h-4 w-4 text-amber-500 animate-sparkle" />
              <span className="text-sm font-medium bolt-gradient-text">Testimonials</span>
            </div>
          </div>
          <h2 className="modern-title text-3xl sm:text-4xl lg:text-5xl mb-6 text-shadow-professional">
            Loved by <span className="bolt-gradient-text">Professionals Everywhere</span>
          </h2>
          <p className="modern-body text-lg text-muted-foreground max-w-3xl mx-auto">
            Discover how DocMagic is revolutionizing document creation for professionals across various industries with our advanced AI capabilities.
          </p>
        </div>
        
        <div className="relative mt-16 overflow-hidden">
          <div className="flex gap-8 animate-infinite-scroll">
            {[...testimonials, ...testimonials].map((testimonial, i) => (
              <Card key={i} className="professional-card glass-effect glowing-border group h-full flex flex-col w-80 flex-shrink-0">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-4">
                    <Avatar className="ring-2 ring-blue-400/30 h-12 w-12">
                      <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                      <AvatarFallback className="bolt-gradient text-white font-semibold">
                        {testimonial.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-bold text-lg group-hover:bolt-gradient-text transition-colors professional-heading">{testimonial.name}</p>
                      <p className="text-sm professional-text text-muted-foreground">{testimonial.title}</p>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="relative flex-1">
                  <Quote className="absolute -top-2 -left-2 h-8 w-8 text-blue-400/20" />
                  <p className="professional-text relative z-10 italic text-base leading-relaxed">"{testimonial.content}"</p>
                </CardContent>
                
                <CardFooter className="pt-4">
                  <div className="flex space-x-1">
                    {Array(5).fill(0).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </CardFooter>
              </Card>
            ))}
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
    content: "DocMagic has been a lifesaver for creating quick and professional product proposals. The AI-powered suggestions are spot-on and have saved me hours of work. Highly recommended! 🌟",
    avatar: "https://images.pexels.com/photos/1758531/pexels-photo-1758531.jpeg?auto=compress&cs=tinysrgb&w=600"
  },
  {
    name: "Johnathan Lee",
    title: "Freelance Writer",
    content: "As a writer, I appreciate how DocMagic helps me overcome writer's block. The letter generation feature is fantastic for crafting compelling cover letters and outreach emails. ✍️",
    avatar: "https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=600"
  },
  {
    name: "Aarav Patel",
    title: "Data Scientist",
    content: "The ability to generate presentations from my data analysis is incredible. DocMagic transforms my findings into clear, concise, and visually appealing slides in no time. 📊",
    avatar: "https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=600"
  },
  {
    name: "Emily White",
    title: "HR Manager",
    content: "I use DocMagic to create professional-looking offer letters and internal announcements. The templates are easy to customize, and the results are always polished and impressive. 📄",
    avatar: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=600"
  },
  {
    name: "Rohan Gupta",
    title: "Marketing Specialist",
    content: "DocMagic's AI-powered resume builder is a game-changer. It helped me create a targeted resume that got me noticed by top companies. I couldn't be happier with the results! 🚀",
    avatar: "https://images.pexels.com/photos/1680172/pexels-photo-1680172.jpeg?auto=compress&cs=tinysrgb&w=600"
  },
  {
    name: "Olivia Martinez",
    title: "Student",
    content: "As a student, DocMagic has been invaluable for creating presentations and reports. The AI helps me structure my thoughts and present them in a professional manner. It's like having a personal tutor! 🎓",
    avatar: "https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg?auto=compress&cs=tinysrgb&w=600"
  },
  {
    name: "David Chen",
    title: "Small Business Owner",
    content: "DocMagic has streamlined my business operations. From generating contracts to marketing materials, it's an all-in-one solution that saves me time and money. A must-have for any entrepreneur! 💼",
    avatar: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=600"
  },
  {
    name: "Sophia Rodriguez",
    title: "Legal Assistant",
    content: "Drafting legal documents used to be a tedious process. With DocMagic, I can quickly generate accurate and professional legal correspondence, allowing me to focus on more critical tasks. ⚖️",
    avatar: "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=600"
  }
];