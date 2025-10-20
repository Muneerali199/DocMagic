export interface WebsiteTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  htmlCode: string;
  thumbnail: string;
  gradient: string;
  icon: string;
}

export const websiteTemplates: WebsiteTemplate[] = [
  {
    id: 'frostyglow-ecommerce',
    name: 'FrostyGlow E-commerce',
    description: 'Modern glassmorphism e-commerce template with premium design',
    category: 'E-commerce',
    gradient: 'from-purple-600 via-indigo-600 to-blue-600',
    icon: '🛍️',
    thumbnail: '/api/placeholder/400/300',
    htmlCode: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FrostyGlow Emporium | Modern Glassmorphism Ecommerce</title>
    <link rel="icon" type="image/x-icon" href="/static/favicon.ico">
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/feather-icons/dist/feather.min.js"></script>
    <script src="https://unpkg.com/feather-icons"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        primary: 'rgba(103, 114, 229, 0.8)',
                        secondary: 'rgba(236, 72, 153, 0.8)',
                        glass: {
                            light: 'rgba(255, 255, 255, 0.25)',
                            dark: 'rgba(0, 0, 0, 0.25)'
                        }
                    },
                    backdropBlur: {
                        xs: '2px',
                        sm: '4px',
                        md: '8px',
                        lg: '12px',
                        xl: '16px'
                    }
                }
            }
        }
    </script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
        
        body {
            font-family: 'Poppins', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            color: white;
        }
        
        .glass-card {
            background: rgba(255, 255, 255, 0.15);
            border: 1px solid rgba(255, 255, 255, 0.2);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15);
            transition: all 0.3s ease;
        }
        
        .glass-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 12px 40px 0 rgba(31, 38, 135, 0.25);
        }
        
        .nav-glass {
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.18);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
        }
        
        .btn-glow {
            background: linear-gradient(45deg, rgba(103, 114, 229, 0.8), rgba(236, 72, 153, 0.8));
            box-shadow: 0 4px 15px rgba(236, 72, 153, 0.4);
            transition: all 0.3s ease;
        }
        
        .btn-glow:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(236, 72, 153, 0.6);
        }
        
        .product-image {
            background: linear-gradient(45deg, rgba(255,255,255,0.1), rgba(255,255,255,0.3));
            border-radius: 12px;
            overflow: hidden;
            position: relative;
        }
        
        .product-image::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: linear-gradient(
                to bottom right,
                rgba(255,255,255,0) 0%,
                rgba(255,255,255,0.1) 50%,
                rgba(255,255,255,0) 100%
            );
            transform: rotate(30deg);
            animation: shine 3s infinite;
        }
        
        @keyframes shine {
            0% { transform: rotate(30deg) translate(-30%, -30%); }
            100% { transform: rotate(30deg) translate(30%, 30%); }
        }
    </style>
</head>
<body class="relative overflow-x-hidden">
    <!-- Background elements -->
    <div class="absolute inset-0 overflow-hidden">
        <div class="absolute top-0 left-0 w-64 h-64 rounded-full bg-primary blur-xl opacity-20"></div>
        <div class="absolute bottom-0 right-0 w-64 h-64 rounded-full bg-secondary blur-xl opacity-20"></div>
        <div class="absolute top-1/3 right-1/4 w-32 h-32 rounded-full bg-white blur-lg opacity-10"></div>
    </div>
    
    <!-- Navigation -->
    <nav class="nav-glass fixed top-0 left-0 right-0 z-50 py-4 px-6 md:px-12">
        <div class="flex justify-between items-center">
            <div class="flex items-center space-x-2">
                <i data-feather="shopping-bag" class="text-white"></i>
                <span class="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-200">FrostyGlow</span>
            </div>
            
            <div class="hidden md:flex space-x-8">
                <a href="#" class="text-white hover:text-gray-200 transition">Home</a>
                <a href="#" class="text-white hover:text-gray-200 transition">Shop</a>
                <a href="#" class="text-white hover:text-gray-200 transition">Collections</a>
                <a href="#" class="text-white hover:text-gray-200 transition">About</a>
                <a href="#" class="text-white hover:text-gray-200 transition">Contact</a>
            </div>
            
            <div class="flex items-center space-x-4">
                <button class="p-2 rounded-full glass-card">
                    <i data-feather="search" class="w-5 h-5"></i>
                </button>
                <button class="p-2 rounded-full glass-card">
                    <i data-feather="user" class="w-5 h-5"></i>
                </button>
                <button class="p-2 rounded-full glass-card relative">
                    <i data-feather="shopping-cart" class="w-5 h-5"></i>
                    <span class="absolute -top-1 -right-1 bg-secondary rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">3</span>
                </button>
                <button class="md:hidden p-2 rounded-full glass-card">
                    <i data-feather="menu" class="w-5 h-5"></i>
                </button>
            </div>
        </div>
    </nav>
    
    <!-- Hero Section -->
    <section class="pt-32 pb-20 px-6 md:px-12 relative">
        <div class="max-w-7xl mx-auto">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div class="glass-card p-8 rounded-2xl max-w-lg">
                    <h1 class="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-200">
                        Discover Our <span class="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">Premium</span> Collection
                    </h1>
                    <p class="text-gray-100 mb-8 text-lg">
                        Experience luxury redefined with our handcrafted products designed for those who appreciate the finer things in life.
                    </p>
                    <div class="flex space-x-4">
                        <button class="btn-glow px-6 py-3 rounded-full font-medium text-white">
                            Shop Now
                        </button>
                        <button class="glass-card border border-white border-opacity-30 px-6 py-3 rounded-full font-medium text-white hover:bg-white hover:bg-opacity-10 transition">
                            Explore
                        </button>
                    </div>
                </div>
                
                <div class="relative">
                    <div class="glass-card p-4 rounded-2xl backdrop-blur-xl">
                        <div class="product-image aspect-square w-full">
                            <img src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&h=1200&fit=crop" alt="Premium Product" class="w-full h-full object-cover">
                        </div>
                    </div>
                    <div class="absolute -bottom-6 -left-6 z-[-1]">
                        <div class="w-32 h-32 rounded-2xl bg-secondary blur-lg opacity-30"></div>
                    </div>
                    <div class="absolute -top-6 -right-6 z-[-1]">
                        <div class="w-32 h-32 rounded-2xl bg-primary blur-lg opacity-30"></div>
                    </div>
                </div>
            </div>
        </div>
    </section>
    
    <!-- Featured Products -->
    <section class="py-16 px-6 md:px-12 relative">
        <div class="max-w-7xl mx-auto">
            <div class="glass-card p-6 rounded-2xl mb-12">
                <h2 class="text-3xl font-bold text-center mb-2">Featured Products</h2>
                <p class="text-center text-gray-200 max-w-2xl mx-auto">
                    Our carefully curated selection of premium products designed to elevate your everyday life.
                </p>
            </div>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <!-- Product 1 -->
                <div class="glass-card p-6 rounded-2xl hover:bg-opacity-40 transition">
                    <div class="product-image aspect-square mb-4">
                        <img src="https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=640&h=640&fit=crop" alt="Product 1" class="w-full h-full object-cover">
                    </div>
                    <div class="flex justify-between items-start mb-2">
                        <h3 class="font-bold text-lg">Luxury Watch</h3>
                        <span class="bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text font-bold">$299</span>
                    </div>
                    <p class="text-gray-200 text-sm mb-4">Elegant timepiece with sapphire crystal</p>
                    <button class="btn-glow w-full py-2 rounded-lg text-sm font-medium">
                        Add to Cart
                    </button>
                </div>
                
                <!-- Product 2 -->
                <div class="glass-card p-6 rounded-2xl hover:bg-opacity-40 transition">
                    <div class="product-image aspect-square mb-4">
                        <img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=640&h=640&fit=crop" alt="Product 2" class="w-full h-full object-cover">
                    </div>
                    <div class="flex justify-between items-start mb-2">
                        <h3 class="font-bold text-lg">Premium Headphones</h3>
                        <span class="bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text font-bold">$199</span>
                    </div>
                    <p class="text-gray-200 text-sm mb-4">Noise-cancelling with crystal clear sound</p>
                    <button class="btn-glow w-full py-2 rounded-lg text-sm font-medium">
                        Add to Cart
                    </button>
                </div>
                
                <!-- Product 3 -->
                <div class="glass-card p-6 rounded-2xl hover:bg-opacity-40 transition">
                    <div class="product-image aspect-square mb-4">
                        <img src="https://images.unsplash.com/photo-1627123424574-724758594e93?w=640&h=640&fit=crop" alt="Product 3" class="w-full h-full object-cover">
                    </div>
                    <div class="flex justify-between items-start mb-2">
                        <h3 class="font-bold text-lg">Leather Wallet</h3>
                        <span class="bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text font-bold">$89</span>
                    </div>
                    <p class="text-gray-200 text-sm mb-4">Handcrafted genuine leather</p>
                    <button class="btn-glow w-full py-2 rounded-lg text-sm font-medium">
                        Add to Cart
                    </button>
                </div>
                
                <!-- Product 4 -->
                <div class="glass-card p-6 rounded-2xl hover:bg-opacity-40 transition">
                    <div class="product-image aspect-square mb-4">
                        <img src="https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=640&h=640&fit=crop" alt="Product 4" class="w-full h-full object-cover">
                    </div>
                    <div class="flex justify-between items-start mb-2">
                        <h3 class="font-bold text-lg">Sunglasses</h3>
                        <span class="bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text font-bold">$159</span>
                    </div>
                    <p class="text-gray-200 text-sm mb-4">UV protected polarized lenses</p>
                    <button class="btn-glow w-full py-2 rounded-lg text-sm font-medium">
                        Add to Cart
                    </button>
                </div>
            </div>
            
            <div class="text-center mt-12">
                <button class="glass-card border border-white border-opacity-30 px-8 py-3 rounded-full font-medium text-white hover:bg-white hover:bg-opacity-10 transition">
                    View All Products
                </button>
            </div>
        </div>
    </section>
    
    <!-- Testimonials -->
    <section class="py-16 px-6 md:px-12 relative">
        <div class="max-w-7xl mx-auto">
            <div class="glass-card p-8 rounded-2xl">
                <h2 class="text-3xl font-bold text-center mb-8">What Our Customers Say</h2>
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <!-- Testimonial 1 -->
                    <div class="glass-card p-6 rounded-xl backdrop-blur-sm">
                        <div class="flex items-center mb-4">
                            <div class="w-12 h-12 rounded-full overflow-hidden mr-4">
                                <img src="https://i.pravatar.cc/200?img=1" alt="Customer" class="w-full h-full object-cover">
                            </div>
                            <div>
                                <h4 class="font-bold">Sarah Johnson</h4>
                                <div class="flex text-yellow-300">
                                    <i data-feather="star" class="w-4 h-4 fill-current"></i>
                                    <i data-feather="star" class="w-4 h-4 fill-current"></i>
                                    <i data-feather="star" class="w-4 h-4 fill-current"></i>
                                    <i data-feather="star" class="w-4 h-4 fill-current"></i>
                                    <i data-feather="star" class="w-4 h-4 fill-current"></i>
                                </div>
                            </div>
                        </div>
                        <p class="text-gray-200">
                            "Absolutely love my new watch! The quality is exceptional and the packaging was luxurious. Will definitely shop here again."
                        </p>
                    </div>
                    
                    <!-- Testimonial 2 -->
                    <div class="glass-card p-6 rounded-xl backdrop-blur-sm">
                        <div class="flex items-center mb-4">
                            <div class="w-12 h-12 rounded-full overflow-hidden mr-4">
                                <img src="https://i.pravatar.cc/200?img=13" alt="Customer" class="w-full h-full object-cover">
                            </div>
                            <div>
                                <h4 class="font-bold">Michael Chen</h4>
                                <div class="flex text-yellow-300">
                                    <i data-feather="star" class="w-4 h-4 fill-current"></i>
                                    <i data-feather="star" class="w-4 h-4 fill-current"></i>
                                    <i data-feather="star" class="w-4 h-4 fill-current"></i>
                                    <i data-feather="star" class="w-4 h-4 fill-current"></i>
                                    <i data-feather="star" class="w-4 h-4 fill-current"></i>
                                </div>
                            </div>
                        </div>
                        <p class="text-gray-200">
                            "The headphones are worth every penny. The sound quality is unmatched and they're so comfortable. 10/10 would recommend!"
                        </p>
                    </div>
                    
                    <!-- Testimonial 3 -->
                    <div class="glass-card p-6 rounded-xl backdrop-blur-sm">
                        <div class="flex items-center mb-4">
                            <div class="w-12 h-12 rounded-full overflow-hidden mr-4">
                                <img src="https://i.pravatar.cc/200?img=5" alt="Customer" class="w-full h-full object-cover">
                            </div>
                            <div>
                                <h4 class="font-bold">Emma Williams</h4>
                                <div class="flex text-yellow-300">
                                    <i data-feather="star" class="w-4 h-4 fill-current"></i>
                                    <i data-feather="star" class="w-4 h-4 fill-current"></i>
                                    <i data-feather="star" class="w-4 h-4 fill-current"></i>
                                    <i data-feather="star" class="w-4 h-4 fill-current"></i>
                                    <i data-feather="star" class="w-4 h-4 fill-current"></i>
                                </div>
                            </div>
                        </div>
                        <p class="text-gray-200">
                            "Customer service was amazing when I had questions about sizing. The wallet is beautiful and smells like genuine leather. Love it!"
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </section>
    
    <!-- Newsletter -->
    <section class="py-16 px-6 md:px-12 relative">
        <div class="max-w-4xl mx-auto glass-card p-8 rounded-2xl text-center">
            <h2 class="text-3xl font-bold mb-4">Join Our Newsletter</h2>
            <p class="text-gray-200 mb-6 max-w-2xl mx-auto">
                Subscribe to get exclusive offers, early access to new products, and style inspiration delivered straight to your inbox.
            </p>
            <div class="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input type="email" placeholder="Your email address" class="flex-grow glass-card bg-white bg-opacity-10 border border-white border-opacity-20 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 text-white placeholder-gray-300">
                <button class="btn-glow px-6 py-3 rounded-lg font-medium text-white whitespace-nowrap">
                    Subscribe
                </button>
            </div>
        </div>
    </section>
    
    <!-- Footer -->
    <footer class="py-12 px-6 md:px-12 relative">
        <div class="max-w-7xl mx-auto">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div>
                    <div class="flex items-center space-x-2 mb-4">
                        <i data-feather="shopping-bag" class="text-white"></i>
                        <span class="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-200">FrostyGlow</span>
                    </div>
                    <p class="text-gray-200 text-sm mb-4">
                        Premium products for those who appreciate quality and craftsmanship.
                    </p>
                    <div class="flex space-x-4">
                        <a href="#" class="glass-card p-2 rounded-full w-8 h-8 flex items-center justify-center">
                            <i data-feather="instagram" class="w-4 h-4"></i>
                        </a>
                        <a href="#" class="glass-card p-2 rounded-full w-8 h-8 flex items-center justify-center">
                            <i data-feather="twitter" class="w-4 h-4"></i>
                        </a>
                        <a href="#" class="glass-card p-2 rounded-full w-8 h-8 flex items-center justify-center">
                            <i data-feather="facebook" class="w-4 h-4"></i>
                        </a>
                    </div>
                </div>
                
                <div>
                    <h4 class="font-bold text-lg mb-4">Shop</h4>
                    <ul class="space-y-2">
                        <li><a href="#" class="text-gray-200 hover:text-white transition">All Products</a></li>
                        <li><a href="#" class="text-gray-200 hover:text-white transition">Featured</a></li>
                        <li><a href="#" class="text-gray-200 hover:text-white transition">New Arrivals</a></li>
                        <li><a href="#" class="text-gray-200 hover:text-white transition">Sale Items</a></li>
                        <li><a href="#" class="text-gray-200 hover:text-white transition">Gift Cards</a></li>
                    </ul>
                </div>
                
                <div>
                    <h4 class="font-bold text-lg mb-4">Information</h4>
                    <ul class="space-y-2">
                        <li><a href="#" class="text-gray-200 hover:text-white transition">About Us</a></li>
                        <li><a href="#" class="text-gray-200 hover:text-white transition">Blog</a></li>
                        <li><a href="#" class="text-gray-200 hover:text-white transition">Privacy Policy</a></li>
                        <li><a href="#" class="text-gray-200 hover:text-white transition">Terms of Service</a></li>
                        <li><a href="#" class="text-gray-200 hover:text-white transition">Shipping Policy</a></li>
                    </ul>
                </div>
                
                <div>
                    <h4 class="font-bold text-lg mb-4">Contact</h4>
                    <ul class="space-y-2">
                        <li class="flex items-center text-gray-200">
                            <i data-feather="mail" class="w-4 h-4 mr-2"></i>
                            hello@frostyglow.com
                        </li>
                        <li class="flex items-center text-gray-200">
                            <i data-feather="phone" class="w-4 h-4 mr-2"></i>
                            +1 (555) 123-4567
                        </li>
                        <li class="flex items-center text-gray-200">
                            <i data-feather="map-pin" class="w-4 h-4 mr-2"></i>
                            123 Luxury Ave, Suite 100
                        </li>
                    </ul>
                </div>
            </div>
            
            <div class="border-t border-white border-opacity-20 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
                <p class="text-gray-200 text-sm">
                    © 2025 FrostyGlow Emporium. All rights reserved.
                </p>
                <div class="flex space-x-6 mt-4 md:mt-0">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/MasterCard_Logo.svg/2560px-MasterCard_Logo.svg.png" alt="Mastercard" class="h-6 opacity-70">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png" alt="Visa" class="h-6 opacity-70">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/American_Express_logo_%282018%29.svg/1200px-American_Express_logo_%282018%29.svg.png" alt="Amex" class="h-6 opacity-70">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/PayPal.svg/2560px-PayPal.svg.png" alt="PayPal" class="h-6 opacity-70">
                </div>
            </div>
        </div>
    </footer>
    
    <script>
        feather.replace();
        
        // Animate elements on scroll
        document.addEventListener('DOMContentLoaded', function() {
            const animateOnScroll = function() {
                const elements = document.querySelectorAll('.glass-card');
                
                elements.forEach(element => {
                    const elementPosition = element.getBoundingClientRect().top;
                    const screenPosition = window.innerHeight / 1.3;
                    
                    if (elementPosition < screenPosition) {
                        element.style.opacity = '1';
                        element.style.transform = 'translateY(0)';
                    }
                });
            };
            
            // Set initial state
            const cards = document.querySelectorAll('.glass-card');
            cards.forEach(card => {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            });
            
            // Run on load
            animateOnScroll();
            
            // Run on scroll
            window.addEventListener('scroll', animateOnScroll);
        });
    </script>
</body>
</html>`
  },
  {
    id: 'claymorphai-playground',
    name: 'ClaymorphAI Playground',
    description: 'Soft, squeezable claymorphism design for AI platforms',
    category: 'AI Platform',
    gradient: 'from-indigo-200 via-purple-200 to-pink-200',
    icon: '🧠',
    thumbnail: '/api/placeholder/400/300',
    htmlCode: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ClaymorphAI Playground</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/feather-icons"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500;600&display=swap" rel="stylesheet">
    <style>
        .clay-card {
            border-radius: 20px;
            background: rgba(255, 255, 255, 0.7);
            box-shadow: 
                8px 8px 16px rgba(209, 205, 235, 0.5),
                -8px -8px 16px rgba(255, 255, 255, 0.8),
                inset 2px 2px 5px rgba(209, 205, 235, 0.3),
                inset -2px -2px 5px rgba(255, 255, 255, 0.5);
            backdrop-filter: blur(10px);
            transition: all 0.3s ease;
        }
        .clay-card:hover {
            transform: translateY(-5px);
            box-shadow: 
                12px 12px 24px rgba(209, 205, 235, 0.6),
                -12px -12px 24px rgba(255, 255, 255, 0.9);
        }
        .clay-button {
            border-radius: 16px;
            background: linear-gradient(145deg, #f0f4ff, #d9e0f0);
            box-shadow: 
                6px 6px 12px rgba(209, 205, 235, 0.5),
                -6px -6px 12px rgba(255, 255, 255, 0.8);
            transition: all 0.2s ease;
        }
        .clay-button:active {
            box-shadow: 
                inset 3px 3px 6px rgba(209, 205, 235, 0.5),
                inset -3px -3px 6px rgba(255, 255, 255, 0.8);
        }
        .clay-input {
            border-radius: 16px;
            background: rgba(255, 255, 255, 0.7);
            box-shadow: 
                inset 4px 4px 8px rgba(209, 205, 235, 0.4),
                inset -4px -4px 8px rgba(255, 255, 255, 0.7);
        }
        .clay-chip {
            border-radius: 16px;
            background: linear-gradient(145deg, #f0f4ff, #d9e0f0);
            box-shadow: 
                4px 4px 8px rgba(209, 205, 235, 0.4),
                -4px -4px 8px rgba(255, 255, 255, 0.7);
        }
        body {
            font-family: 'Rubik', sans-serif;
            background: linear-gradient(135deg, #f5f7ff 0%, #e8ecff 100%);
        }
    </style>
</head>
<body class="min-h-screen p-4 md:p-8">
    <div class="max-w-6xl mx-auto">
        <!-- Header -->
        <header class="flex flex-col md:flex-row justify-between items-center mb-12">
            <div class="clay-card p-6 mb-6 md:mb-0 w-full md:w-auto">
                <h1 class="text-3xl md:text-4xl font-semibold text-indigo-700">ClaymorphAI 🧠</h1>
                <p class="text-indigo-500 mt-2">Squeezable AI playground for creative minds</p>
            </div>
            
            <div class="flex space-x-4 w-full md:w-auto">
                <div class="clay-card p-4 flex-1 text-center">
                    <div class="flex items-center justify-center space-x-2">
                        <i data-feather="zap" class="text-indigo-500"></i>
                        <span class="font-medium text-indigo-700">Premium</span>
                    </div>
                </div>
                <div class="clay-card p-4 flex-1 text-center">
                    <div class="flex items-center justify-center space-x-2">
                        <i data-feather="user" class="text-indigo-500"></i>
                        <span class="font-medium text-indigo-700">Account</span>
                    </div>
                </div>
            </div>
        </header>

        <!-- Main Content -->
        <main class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- Left Column -->
            <div class="lg:col-span-2 space-y-8">
                <!-- AI Playground -->
                <div class="clay-card p-8">
                    <div class="flex justify-between items-center mb-6">
                        <h2 class="text-2xl font-semibold text-indigo-700">AI Playground</h2>
                        <div class="clay-chip px-4 py-2 text-sm text-indigo-600">
                            <i data-feather="cpu" class="inline mr-2"></i>
                            GPT-4 Turbo
                        </div>
                    </div>
                    
                    <div class="clay-input p-4 mb-6">
                        <textarea class="w-full bg-transparent focus:outline-none resize-none text-indigo-800 placeholder-indigo-300" rows="6" placeholder="Type your prompt here..."></textarea>
                    </div>
                    
                    <div class="flex justify-between items-center">
                        <div class="flex space-x-2">
                            <button class="clay-button px-4 py-2 text-indigo-600">
                                <i data-feather="image" class="inline mr-2"></i>
                                Image
                            </button>
                            <button class="clay-button px-4 py-2 text-indigo-600">
                                <i data-feather="code" class="inline mr-2"></i>
                                Code
                            </button>
                        </div>
                        <button class="clay-button px-6 py-3 bg-indigo-500 text-white">
                            <i data-feather="send" class="inline mr-2"></i>
                            Generate
                        </button>
                    </div>
                </div>

                <!-- Results Section -->
                <div class="clay-card p-8">
                    <h2 class="text-2xl font-semibold text-indigo-700 mb-6">Results</h2>
                    <div class="space-y-6">
                        <div class="clay-card p-6">
                            <div class="flex items-center mb-4">
                                <div class="w-10 h-10 rounded-full clay-card flex items-center justify-center mr-4">
                                    <i data-feather="user" class="text-indigo-500"></i>
                                </div>
                                <div>
                                    <h3 class="font-medium text-indigo-800">Your Prompt</h3>
                                    <p class="text-sm text-indigo-500">Just now</p>
                                </div>
                            </div>
                            <p class="text-indigo-700">Create a claymorphism UI for an AI platform</p>
                        </div>
                        
                        <div class="clay-card p-6">
                            <div class="flex items-center mb-4">
                                <div class="w-10 h-10 rounded-full clay-card flex items-center justify-center mr-4 bg-indigo-100">
                                    <i data-feather="cpu" class="text-indigo-500"></i>
                                </div>
                                <div>
                                    <h3 class="font-medium text-indigo-800">AI Response</h3>
                                    <p class="text-sm text-indigo-500">Just now</p>
                                </div>
                            </div>
                            <p class="text-indigo-700">Here's a beautiful claymorphism design for your AI platform! I've used soft pastel colors, generous border radius (20px), and double shadows to create that signature squishy look. The interface includes...</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Right Column -->
            <div class="space-y-8">
                <!-- AI Tools -->
                <div class="clay-card p-8">
                    <h2 class="text-2xl font-semibold text-indigo-700 mb-6">AI Tools</h2>
                    <div class="grid grid-cols-2 gap-4">
                        <button class="clay-button p-4 aspect-square flex flex-col items-center justify-center">
                            <i data-feather="feather" class="text-indigo-500 mb-2"></i>
                            <span class="text-indigo-700 text-sm">Content</span>
                        </button>
                        <button class="clay-button p-4 aspect-square flex flex-col items-center justify-center">
                            <i data-feather="code" class="text-indigo-500 mb-2"></i>
                            <span class="text-indigo-700 text-sm">Code</span>
                        </button>
                        <button class="clay-button p-4 aspect-square flex flex-col items-center justify-center">
                            <i data-feather="image" class="text-indigo-500 mb-2"></i>
                            <span class="text-indigo-700 text-sm">Images</span>
                        </button>
                        <button class="clay-button p-4 aspect-square flex flex-col items-center justify-center">
                            <i data-feather="music" class="text-indigo-500 mb-2"></i>
                            <span class="text-indigo-700 text-sm">Audio</span>
                        </button>
                    </div>
                </div>

                <!-- Recent Prompts -->
                <div class="clay-card p-8">
                    <h2 class="text-2xl font-semibold text-indigo-700 mb-6">Recent Prompts</h2>
                    <div class="space-y-4">
                        <div class="clay-chip px-4 py-3 text-indigo-700">
                            Design a login page with claymorphism
                        </div>
                        <div class="clay-chip px-4 py-3 text-indigo-700">
                            Write a poem about autumn
                        </div>
                        <div class="clay-chip px-4 py-3 text-indigo-700">
                            Explain quantum computing simply
                        </div>
                        <div class="clay-chip px-4 py-3 text-indigo-700">
                            Generate python code for a todo app
                        </div>
                    </div>
                </div>

                <!-- Premium Features -->
                <div class="clay-card p-8 bg-gradient-to-br from-indigo-100 to-purple-100">
                    <div class="flex items-center mb-4">
                        <div class="w-12 h-12 rounded-full clay-card flex items-center justify-center mr-4 bg-indigo-100">
                            <i data-feather="star" class="text-indigo-500"></i>
                        </div>
                        <div>
                            <h3 class="font-semibold text-indigo-800">Unlock Premium</h3>
                            <p class="text-sm text-indigo-500">Get access to all features</p>
                        </div>
                    </div>
                    <p class="text-indigo-700 mb-6">Upgrade to unlock GPT-4 Turbo, priority access, and advanced image generation capabilities.</p>
                    <button class="clay-button w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
                        Upgrade Now
                    </button>
                </div>
            </div>
        </main>
    </div>

    <script>
        feather.replace();
        
        // Add subtle animation to clay elements
        document.querySelectorAll('.clay-card, .clay-button, .clay-chip').forEach(el => {
            el.addEventListener('mousedown', () => {
                el.style.transform = 'scale(0.98)';
            });
            el.addEventListener('mouseup', () => {
                el.style.transform = '';
            });
            el.addEventListener('mouseleave', () => {
                el.style.transform = '';
            });
        });
    </script>
</body>
</html>`
  }
];
