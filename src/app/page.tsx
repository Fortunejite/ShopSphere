'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight, 
  Check, 
  Star, 
  Store,
  TrendingUp,
  Globe,
  Shield,
  Zap,
  CreditCard,
  BarChart3,
  Smartphone,
  Headphones,
  Menu,
  X,
  Play
} from "lucide-react";

const HomePage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const features = [
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Custom Domain Shops",
      description: "Create your unique online presence with custom domain routing and personalized branding."
    },
    {
      icon: <CreditCard className="w-6 h-6" />,
      title: "Stripe Integration",
      description: "Secure payment processing with Stripe Connect. Accept payments worldwide with confidence."
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Advanced Analytics",
      description: "Track your performance with detailed insights, sales reports, and customer analytics."
    },
    {
      icon: <Smartphone className="w-6 h-6" />,
      title: "Mobile Optimized",
      description: "Fully responsive design ensures your shop looks perfect on any device, anywhere."
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Enterprise Security",
      description: "Bank-level security with encrypted data, secure authentication, and PCI compliance."
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Lightning Fast",
      description: "Built with Next.js 15 for optimal performance and SEO. Your customers will love the speed."
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Fashion Entrepreneur",
      company: "StyleHub Boutique",
      content: "ShopSphere transformed my small fashion business into a thriving online store. The setup was incredibly easy, and my sales have increased by 300% in just 6 months!",
      rating: 5,
      avatar: "/placeholder.png"
    },
    {
      name: "Marcus Rodriguez",
      role: "Electronics Retailer",
      company: "TechGear Pro",
      content: "The analytics dashboard gives me insights I never had before. I can track everything from inventory to customer behavior. It's like having a business consultant built-in.",
      rating: 5,
      avatar: "/placeholder.png"
    },
    {
      name: "Emily Johnson",
      role: "Artisan Craftmaker",
      company: "Handmade Haven",
      content: "As someone who's not tech-savvy, I was amazed how simple it was to set up my shop. The mobile optimization means my customers can shop anywhere, anytime.",
      rating: 5,
      avatar: "/placeholder.png"
    }
  ];

  const stats = [
    { number: "10,000+", label: "Active Shops" },
    { number: "$50M+", label: "Processed Revenue" },
    { number: "99.9%", label: "Uptime" },
    { number: "24/7", label: "Support" }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-neutral-900 rounded-lg flex items-center justify-center">
                <Store className="w-5 h-5 text-neutral-50" />
              </div>
              <span className="text-xl font-semibold text-neutral-900">ShopSphere</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-neutral-600 hover:text-neutral-900 transition-colors">Features</a>
              <a href="#testimonials" className="text-neutral-600 hover:text-neutral-900 transition-colors">Reviews</a>
              <Link href="/login" className="text-neutral-600 hover:text-neutral-900 transition-colors">Login</Link>
              <Button asChild>
                <Link href="/signup">Get Started</Link>
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t">
              <div className="flex flex-col space-y-4">
                <a href="#features" className="text-neutral-600 hover:text-neutral-900">Features</a>
                <a href="#testimonials" className="text-neutral-600 hover:text-neutral-900">Reviews</a>
                <Link href="/login" className="text-neutral-600 hover:text-neutral-900">Login</Link>
                <Button asChild className="w-full">
                  <Link href="/signup">Get Started</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-neutral-50 via-white to-neutral-100">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-grid-neutral-100/50 bg-[size:20px_20px] opacity-40" />
        <div className="absolute top-10 right-10 w-72 h-72 bg-neutral-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-64 h-64 bg-neutral-300/20 rounded-full blur-3xl" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4 bg-neutral-100 text-neutral-800 hover:bg-neutral-200 border-neutral-200">
                Join 10,000+ successful merchants
              </Badge>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-neutral-900 leading-tight mb-6">
                Build Your
                <span className="text-neutral-700"> Dream Store </span>
                in Minutes
              </h1>
              <p className="text-xl text-neutral-600 mb-8 leading-relaxed">
                Create a professional online store with zero coding required. From custom domains to advanced analytics, 
                everything you need to succeed in e-commerce is here.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button size="lg" asChild className="shadow-lg hover:shadow-xl transition-all duration-300">
                  <Link href="/signup" className="flex items-center">
                    Start Free Trial
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="group">
                  <Play className="mr-2 w-4 h-4 group-hover:scale-110 transition-transform" />
                  Watch Demo
                </Button>
              </div>

              <div className="flex items-center space-x-8 text-sm text-neutral-600">
                <div className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-neutral-600" />
                  <span>14-day free trial</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-neutral-600" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-neutral-600" />
                  <span>Cancel anytime</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative bg-white rounded-2xl shadow-2xl p-8 transform rotate-1 hover:rotate-0 transition-transform duration-500 border border-neutral-200">
                <div className="bg-neutral-50 rounded-lg p-4 mb-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-3 h-3 bg-neutral-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-neutral-300 rounded-full"></div>
                    <div className="w-3 h-3 bg-neutral-200 rounded-full"></div>
                  </div>
                  <div className="bg-white rounded p-4 border border-neutral-100">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-neutral-900">MyAwesomeStore.com</h3>
                      <Badge className="bg-neutral-100 text-neutral-800 border-neutral-200">Live</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="bg-neutral-100 rounded h-16"></div>
                      <div className="bg-neutral-100 rounded h-16"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="bg-neutral-200 rounded h-2 w-3/4"></div>
                      <div className="bg-neutral-200 rounded h-2 w-1/2"></div>
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-sm text-neutral-600">Your store, live in minutes</p>
                </div>
              </div>
              
              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 bg-neutral-800 text-neutral-100 p-2 rounded-lg shadow-lg">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div className="absolute -bottom-4 -left-4 bg-neutral-700 text-neutral-100 p-2 rounded-lg shadow-lg">
                <BarChart3 className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-neutral-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index}>
                <div className="text-3xl lg:text-4xl font-bold mb-2 text-neutral-50">
                  {stat.number}
                </div>
                <div className="text-neutral-400 text-sm lg:text-base">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
              From powerful analytics to seamless payments, ShopSphere provides all the tools 
              you need to build, grow, and scale your online business.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-neutral-200">
                <CardContent className="p-8">
                  <div className="w-12 h-12 bg-neutral-900 rounded-lg flex items-center justify-center text-neutral-50 mb-6 group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-neutral-900 mb-3">{feature.title}</h3>
                  <p className="text-neutral-600 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-4">
              Loved by Entrepreneurs Worldwide
            </h2>
            <p className="text-xl text-neutral-600">
              Join thousands of successful business owners who trust ShopSphere
            </p>
          </div>

          <div className="relative">
            <Card className="max-w-4xl mx-auto shadow-2xl border-neutral-200">
              <CardContent className="p-8 lg:p-12">
                <div className="text-center">
                  <div className="flex justify-center mb-6">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-6 h-6 text-neutral-400 fill-current" />
                    ))}
                  </div>
                  <blockquote className="text-xl lg:text-2xl text-neutral-700 mb-8 leading-relaxed">
                    &ldquo;{testimonials[currentTestimonial].content}&rdquo;
                  </blockquote>
                  <div className="flex items-center justify-center space-x-4">
                    <div className="w-12 h-12 bg-neutral-800 rounded-full flex items-center justify-center text-neutral-100 font-semibold">
                      {testimonials[currentTestimonial].name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-neutral-900">{testimonials[currentTestimonial].name}</div>
                      <div className="text-neutral-600">{testimonials[currentTestimonial].role}, {testimonials[currentTestimonial].company}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Testimonial indicators */}
            <div className="flex justify-center mt-8 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentTestimonial ? 'bg-neutral-800' : 'bg-neutral-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-neutral-900 text-neutral-50">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            Ready to Start Your E-commerce Journey?
          </h2>
          <p className="text-xl mb-8 text-neutral-300">
            Join thousands of successful entrepreneurs who chose ShopSphere to build their online empire.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild className="bg-neutral-50 text-neutral-900 hover:bg-neutral-100">
              <Link href="/signup" className="flex items-center">
                Start Your Free Trial
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-neutral-600 text-neutral-50 hover:bg-neutral-800">
              <Headphones className="mr-2 w-4 h-4" />
              Talk to Sales
            </Button>
          </div>
          <p className="text-sm mt-6 text-neutral-400">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-800 text-neutral-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-1">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-neutral-900 rounded-lg flex items-center justify-center border border-neutral-700">
                  <Store className="w-5 h-5 text-neutral-100" />
                </div>
                <span className="text-xl font-semibold">ShopSphere</span>
              </div>
              <p className="text-neutral-400 mb-4">
                The complete e-commerce platform for modern entrepreneurs.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-neutral-400">
                <li><a href="#features" className="hover:text-neutral-200 transition-colors">Features</a></li>
                <li><Link href="/shops" className="hover:text-neutral-200 transition-colors">Browse Shops</Link></li>
                <li><a href="#" className="hover:text-neutral-200 transition-colors">Templates</a></li>
                <li><a href="#" className="hover:text-neutral-200 transition-colors">Integrations</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-neutral-400">
                <li><a href="#" className="hover:text-neutral-200 transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-neutral-200 transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-neutral-200 transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-neutral-200 transition-colors">Status</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-neutral-400">
                <li><a href="#" className="hover:text-neutral-200 transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-neutral-200 transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-neutral-200 transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-neutral-200 transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-neutral-700 pt-8 mt-12 text-center text-neutral-400">
            <p>&copy; 2025 ShopSphere. All rights reserved. Built with precision for entrepreneurs.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;