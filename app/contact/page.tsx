"use client"
import React, { useState } from 'react';
import { 
  Mail,
  Phone,
  User,
  MessageSquare,
  Send,
  Sparkles,
  Wand2,
  Star,
  ArrowDown,
  Zap,
  Shield,
  Clock,
  CheckCircle2,
  FileText,
  Users,
  GraduationCap,
  Briefcase,
  HelpCircle,
  Bug,
  Lightbulb,
  Settings
} from "lucide-react";

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    userType: '',
    helpType: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  const userTypes = [
    { value: 'student', label: 'Student', icon: <GraduationCap className="h-4 w-4" /> },
    { value: 'professional', label: 'Professional', icon: <Briefcase className="h-4 w-4" /> }
  ];

  const helpTypes = [
    { value: 'general', label: 'General Inquiry', icon: <HelpCircle className="h-4 w-4" /> },
    { value: 'technical', label: 'Technical Support', icon: <Settings className="h-4 w-4" /> },
    { value: 'bug', label: 'Report a Bug', icon: <Bug className="h-4 w-4" /> },
    { value: 'feedback', label: 'Feature Request', icon: <Lightbulb className="h-4 w-4" /> },
    { value: 'billing', label: 'Billing Question', icon: <FileText className="h-4 w-4" /> },
    { value: 'partnership', label: 'Partnership', icon: <Users className="h-4 w-4" /> }
  ];

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/20">
        {/* Success State */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center max-w-md mx-auto">
            <div className="professional-card p-8 rounded-2xl relative overflow-hidden">
              <div className="absolute inset-0 shimmer opacity-30"></div>
              <div className="relative z-10">
                <div className="mb-6">
                  <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto animate-bounce" />
                </div>
                <h2 className="modern-display text-2xl sm:text-3xl bolt-gradient-text mb-4">
                  Message Sent Successfully!
                </h2>
                <p className="text-muted-foreground mb-6">
                  Thank you for reaching out. We'll get back to you within 24 hours.
                </p>
                <button 
                  onClick={() => {
                    setIsSubmitted(false);
                    setFormData({
                      name: '',
                      email: '',
                      phone: '',
                      userType: '',
                      helpType: '',
                      message: ''
                    });
                  }}
                  className="professional-button w-full"
                >
                  Send Another Message
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/20">
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 mesh-gradient opacity-20"></div>
        <div className="floating-orb w-40 h-40 sm:w-64 sm:h-64 bolt-gradient opacity-15 top-20 -left-20 sm:-left-32"></div>
        <div className="floating-orb w-32 h-32 sm:w-48 sm:h-48 bolt-gradient opacity-20 -top-10 right-10 sm:right-20"></div>
        <div className="floating-orb w-48 h-48 sm:w-72 sm:h-72 bolt-gradient opacity-10 bottom-10 left-1/3"></div>
        
        {/* Grid pattern overlay */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3e%3cg fill='none' fill-rule='evenodd'%3e%3cg fill='%23000000' fill-opacity='1'%3e%3ccircle cx='30' cy='30' r='1'/%3e%3c/g%3e%3c/g%3e%3c/svg%3e")`,
          }}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 relative z-10 py-16 sm:py-24 lg:py-32">
        <div className="container px-4 sm:px-6 lg:px-8 mx-auto">
          {/* Section transition indicator */}
          <div className="flex justify-center mb-8 sm:mb-12">
            <div className="glass-effect p-3 rounded-full animate-bounce">
              <ArrowDown className="h-5 w-5 sm:h-6 sm:w-6 bolt-gradient-text" />
            </div>
          </div>

          {/* Header Section */}
          <div className="text-center mb-12 sm:mb-16 lg:mb-20">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-full glass-effect mb-6 sm:mb-8 shimmer">
              <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 animate-pulse" />
              <span className="text-sm sm:text-base font-medium">Get In Touch</span>
              <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500 animate-pulse" />
            </div>
            
            {/* Main Heading */}
            <h1 className="modern-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-center mb-6 sm:mb-8">
              How can we{" "}
              <span className="bolt-gradient-text relative inline-block">
                help you?
                <div className="absolute -top-1 sm:-top-2 -right-1 sm:-right-2">
                  <Star className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-yellow-500 animate-spin" style={{animationDuration: '3s'}} />
                </div>
              </span>
            </h1>
            
            {/* Subtitle */}
            <p className="modern-body text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl lg:max-w-3xl mx-auto px-4 sm:px-0">
              Have a question about our{" "}
              <span className="font-semibold text-blue-600">AI-powered platform</span>?{" "}
              Need help creating{" "}
              <span className="font-semibold text-yellow-600">professional documents</span>?{" "}
              We're here to help with{" "}
              <span className="font-semibold bolt-gradient-text">magical support</span>
            </p>

            {/* Response Time Stats */}
            <div className="mt-8 sm:mt-12 flex flex-wrap justify-center gap-4 sm:gap-8">
              <div className="glass-effect px-4 sm:px-6 py-2 sm:py-3 rounded-full hover:scale-105 transition-transform duration-300">
                <Clock className="inline h-4 w-4 text-green-500 mr-2" />
                <span className="bolt-gradient-text font-bold text-sm sm:text-base">&lt;24h</span>
                <span className="text-muted-foreground text-xs sm:text-sm ml-1">Response Time</span>
              </div>
              <div className="glass-effect px-4 sm:px-6 py-2 sm:py-3 rounded-full hover:scale-105 transition-transform duration-300">
                <Shield className="inline h-4 w-4 text-blue-500 mr-2" />
                <span className="bolt-gradient-text font-bold text-sm sm:text-base">100%</span>
                <span className="text-muted-foreground text-xs sm:text-sm ml-1">Secure</span>
              </div>
              <div className="glass-effect px-4 sm:px-6 py-2 sm:py-3 rounded-full hover:scale-105 transition-transform duration-300">
                <Zap className="inline h-4 w-4 text-yellow-500 mr-2" />
                <span className="bolt-gradient-text font-bold text-sm sm:text-base">24/7</span>
                <span className="text-muted-foreground text-xs sm:text-sm ml-1">Available</span>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="max-w-2xl mx-auto">
            <div className="professional-card p-6 sm:p-8 lg:p-10 rounded-2xl relative overflow-hidden">
              {/* Background shimmer effect */}
              <div className="absolute inset-0 shimmer opacity-20"></div>
              
              <div className="relative z-10">
                <div className="space-y-6 sm:space-y-8">
                  {/* Name Field */}
                  <div className="space-y-2">
                    <label htmlFor="name" className="flex items-center gap-2 text-sm sm:text-base font-medium text-foreground">
                      <User className="h-4 w-4 text-blue-500" />
                      Your Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 sm:py-4 rounded-xl glass-effect border border-border/50 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 text-sm sm:text-base placeholder:text-muted-foreground/60"
                      placeholder="Enter your full name"
                    />
                  </div>

                  {/* Email Field */}
                  <div className="space-y-2">
                    <label htmlFor="email" className="flex items-center gap-2 text-sm sm:text-base font-medium text-foreground">
                      <Mail className="h-4 w-4 text-green-500" />
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 sm:py-4 rounded-xl glass-effect border border-border/50 focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20 transition-all duration-300 text-sm sm:text-base placeholder:text-muted-foreground/60"
                      placeholder="your.email@example.com"
                    />
                  </div>

                  {/* Phone Field */}
                  <div className="space-y-2">
                    <label htmlFor="phone" className="flex items-center gap-2 text-sm sm:text-base font-medium text-foreground">
                      <Phone className="h-4 w-4 text-purple-500" />
                      Phone Number (Optional)
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 sm:py-4 rounded-xl glass-effect border border-border/50 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 text-sm sm:text-base placeholder:text-muted-foreground/60"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>

                  {/* User Type Selection */}
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-sm sm:text-base font-medium text-foreground">
                      <Users className="h-4 w-4 text-yellow-500" />
                      I am a
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {userTypes.map((type) => (
                        <label key={type.value} className="relative cursor-pointer">
                          <input
                            type="radio"
                            name="userType"
                            value={type.value}
                            checked={formData.userType === type.value}
                            onChange={handleInputChange}
                            required
                            className="sr-only"
                          />
                          <div className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                            formData.userType === type.value
                              ? 'border-blue-500/50 bg-blue-500/10 professional-card'
                              : 'border-border/30 glass-effect hover:border-border/50'
                          }`}>
                            <div className="flex items-center gap-3">
                              <div className={`${formData.userType === type.value ? 'text-blue-500' : 'text-muted-foreground'}`}>
                                {type.icon}
                              </div>
                              <span className={`text-sm sm:text-base font-medium ${
                                formData.userType === type.value ? 'bolt-gradient-text' : 'text-foreground'
                              }`}>
                                {type.label}
                              </span>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Help Type Selection */}
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-sm sm:text-base font-medium text-foreground">
                      <HelpCircle className="h-4 w-4 text-orange-500" />
                      How can we help you?
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {helpTypes.map((type) => (
                        <label key={type.value} className="relative cursor-pointer">
                          <input
                            type="radio"
                            name="helpType"
                            value={type.value}
                            checked={formData.helpType === type.value}
                            onChange={handleInputChange}
                            required
                            className="sr-only"
                          />
                          <div className={`p-3 sm:p-4 rounded-xl border-2 transition-all duration-300 ${
                            formData.helpType === type.value
                              ? 'border-orange-500/50 bg-orange-500/10 professional-card'
                              : 'border-border/30 glass-effect hover:border-border/50'
                          }`}>
                            <div className="flex items-center gap-2 sm:gap-3">
                              <div className={`${formData.helpType === type.value ? 'text-orange-500' : 'text-muted-foreground'}`}>
                                {type.icon}
                              </div>
                              <span className={`text-xs sm:text-sm font-medium ${
                                formData.helpType === type.value ? 'bolt-gradient-text' : 'text-foreground'
                              }`}>
                                {type.label}
                              </span>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Message Field */}
                  <div className="space-y-2">
                    <label htmlFor="message" className="flex items-center gap-2 text-sm sm:text-base font-medium text-foreground">
                      <MessageSquare className="h-4 w-4 text-pink-500" />
                      Your Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={5}
                      className="w-full px-4 py-3 sm:py-4 rounded-xl glass-effect border border-border/50 focus:border-pink-500/50 focus:ring-2 focus:ring-pink-500/20 transition-all duration-300 text-sm sm:text-base placeholder:text-muted-foreground/60 resize-none"
                      placeholder="Tell us more about how we can help you. The more details you provide, the better we can assist you!"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-full professional-button py-4 sm:py-5 text-base sm:text-lg font-semibold relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="absolute inset-0 shimmer opacity-20"></div>
                    <div className="relative z-10 flex items-center justify-center gap-2">
                      {isSubmitting ? (
                        <>
                          <Wand2 className="h-5 w-5 animate-spin" />
                          <span>Sending your message...</span>
                        </>
                      ) : (
                        <>
                          <Send className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                          <span>Send Message</span>
                          <Sparkles className="h-5 w-5 animate-pulse" />
                        </>
                      )}
                    </div>
                  </button>
                </div>

                {/* Additional Info */}
                <div className="mt-8 pt-6 border-t border-border/30">
                  <div className="text-center">
                    <p className="text-xs sm:text-sm text-muted-foreground mb-4">
                      Your information is secure and will never be shared with third parties.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4 text-xs sm:text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Shield className="h-3 w-3 text-green-500" />
                        <span>Encrypted</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Zap className="h-3 w-3 text-yellow-500" />
                        <span>Fast Response</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-blue-500" />
                        <span>Expert Support</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .modern-display {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
          font-weight: 800;
          line-height: 1.1;
          letter-spacing: -0.02em;
        }
        
        .modern-body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
          font-weight: 400;
          line-height: 1.6;
        }
        
        .bolt-gradient-text {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .glass-effect {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .professional-card {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }
        
        .professional-button {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 12px;
          transition: all 0.3s ease;
          box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
        }
        
        .professional-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(102, 126, 234, 0.4);
        }
        
        .mesh-gradient {
          background: radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
                      radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
                      radial-gradient(circle at 40% 40%, rgba(120, 219, 226, 0.3) 0%, transparent 50%);
        }
        
        .floating-orb {
          border-radius: 50%;
          filter: blur(40px);
          animation: float 6s ease-in-out infinite;
        }
        
        .shimmer {
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
          background-size: 200% 100%;
          animation: shimmer 2s infinite;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
}