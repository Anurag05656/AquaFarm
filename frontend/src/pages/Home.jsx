import { Link } from 'react-router-dom';
import {
  Droplets,
  Cloud,
  User,
  Map,
  BarChart3,
  Leaf,
  ArrowRight,
  Check,
  Zap,
  Shield,
  Smartphone,
  ChevronRight,
  Menu,
  X,
  MapPin
} from 'lucide-react';
import { useState, useEffect } from 'react';

const Home = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const loadReviews = () => {
      const feedback = JSON.parse(localStorage.getItem('farmFeedback') || '[]');
      setReviews(feedback.slice(-3).reverse());
    };
    
    loadReviews();
    
    const interval = setInterval(loadReviews, 3000);
    window.addEventListener('storage', loadReviews);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', loadReviews);
    };
  }, []);

  const features = [
    {
      icon: Droplets,
      title: 'Water Tracking',
      description: 'Monitor water consumption across all your fields with detailed analytics and historical data.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Cloud,
      title: 'Weather Integration',
      description: 'Get real-time weather data and forecasts to make informed irrigation decisions.',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: BarChart3,
      title: 'Smart Analytics',
      description: 'Visualize your water usage patterns with interactive charts and comprehensive reports.',
      color: 'from-orange-500 to-red-500'
    },
    {
      icon: Leaf,
      title: 'Crop-Specific Advice',
      description: 'Receive tailored irrigation recommendations based on your specific crops and soil types.',
      color: 'from-green-500 to-emerald-500'
    }
  ];

  const benefits = [
    'Reduce water waste by up to 40%',
    'Increase crop yield with optimal irrigation',
    'Save money on water bills',
    'Make data-driven farming decisions',
    'Track multiple fields easily',
    'Get weather-based recommendations'
  ];

  const stats = [
    { value: '40%', label: 'Water Saved' },
    { value: '25%', label: 'Yield Increase' },
    { value: '10k+', label: 'Farmers Trust Us' },
    { value: '24/7', label: 'Weather Updates' }
  ];

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-white/60 via-white/70 to-white/60 backdrop-blur-2xl border-b border-white/30 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-b from-primary-50/20 to-transparent pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center justify-between h-20">
            {/* Logo - Left Corner */}
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 via-primary-600 to-success-500 flex items-center justify-center shadow-2xl shadow-primary-500/40 group-hover:scale-110 transition-all duration-300">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent"></div>
                <Droplets className="w-7 h-7 text-white relative z-10 drop-shadow-lg" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 via-primary-500 to-success-600 bg-clip-text text-transparent group-hover:scale-105 transition-transform drop-shadow-sm">AquaFarm</span>
            </Link>

            {/* Desktop Navigation - Center */}
            <div className="hidden md:flex items-center space-x-10">
              <a href="#features" className="text-gray-800 hover:text-primary-600 font-bold transition-all duration-300 hover:scale-110 relative group px-3 py-2">
                Features
                <span className="absolute -bottom-1 left-0 w-0 h-1 bg-gradient-to-r from-primary-500 via-primary-400 to-success-500 group-hover:w-full transition-all duration-300 rounded-full shadow-lg shadow-primary-500/50"></span>
              </a>
              <a href="#benefits" className="text-gray-800 hover:text-primary-600 font-bold transition-all duration-300 hover:scale-110 relative group px-3 py-2">
                Benefits
                <span className="absolute -bottom-1 left-0 w-0 h-1 bg-gradient-to-r from-primary-500 via-primary-400 to-success-500 group-hover:w-full transition-all duration-300 rounded-full shadow-lg shadow-primary-500/50"></span>
              </a>
              <a href="#how-it-works" className="text-gray-800 hover:text-primary-600 font-bold transition-all duration-300 hover:scale-110 relative group px-3 py-2">
                How It Works
                <span className="absolute -bottom-1 left-0 w-0 h-1 bg-gradient-to-r from-primary-500 via-primary-400 to-success-500 group-hover:w-full transition-all duration-300 rounded-full shadow-lg shadow-primary-500/50"></span>
              </a>
            </div>

            {/* Auth Buttons - Right Corner */}
            <div className="hidden md:flex items-center space-x-4">
              <Link to="/login" className="text-gray-800 hover:text-primary-600 font-bold transition-all duration-300 hover:scale-110 px-5 py-2.5">
                Sign In
              </Link>
              <Link to="/register" className="relative bg-gradient-to-r from-primary-600 to-success-600 text-white px-6 py-2.5 rounded-xl font-medium shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 hover:-translate-y-0.5 overflow-hidden group">
                <span className="absolute inset-0 bg-gradient-to-r from-success-600 to-primary-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                <span className="relative z-10 flex items-center">
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 py-4 px-4">
            <div className="space-y-3">
              <a href="#features" className="block text-gray-600 hover:text-gray-900 font-medium py-2">
                Features
              </a>
              <a href="#benefits" className="block text-gray-600 hover:text-gray-900 font-medium py-2">
                Benefits
              </a>
              <a href="#how-it-works" className="block text-gray-600 hover:text-gray-900 font-medium py-2">
                How It Works
              </a>
              <div className="pt-4 space-y-3 border-t border-gray-100">
                <Link to="/login" className="block text-center btn-secondary w-full">
                  Sign In
                </Link>
                <Link to="/register" className="block text-center btn-primary w-full">
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-20 sm:pt-24 lg:pt-32 pb-12 sm:pb-16 lg:pb-20 px-4 sm:px-6 lg:px-8 bg-grid">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div className="text-center lg:text-left order-2 lg:order-1">
              <div className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-primary-50 text-primary-700 text-xs sm:text-sm font-medium mb-4 sm:mb-6">
                <Zap className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                Smart Irrigation Management
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-4 sm:mb-6">
                Optimize Your
                <span className="text-gradient"> Water Usage</span>
                <br className="hidden sm:block" />
                <span className="sm:hidden"> & </span>Maximize Your Harvest
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8 max-w-xl sm:max-w-2xl mx-auto lg:mx-0">
                The intelligent dashboard that helps farmers track water consumption, 
                get weather-based recommendations, and improve irrigation efficiency.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start space-y-3 sm:space-y-0 sm:space-x-4">
                <Link to="/login" className="bg-gradient-to-r from-primary-600 to-success-600 text-white text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-medium shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 w-full sm:w-auto inline-flex items-center justify-center">
                  Go To Dashboard
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                </Link>
              </div>
            </div>

            {/* Hero Image/Illustration */}
            <div className="relative order-1 lg:order-2 mb-8 lg:mb-0">
              <div className="relative z-10 flex items-center justify-center">
                {/* Ultra Attractive Geometric Illustration */}
                <div className="w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 relative">
                  {/* Multiple Rotating Rings */}
                  <div className="absolute inset-2 border-2 border-gradient-to-r from-primary-300 to-success-300 rounded-full opacity-40 animate-spin" style={{animationDuration: '15s'}}></div>
                  <div className="absolute inset-6 border border-blue-300 rounded-full opacity-30 animate-spin" style={{animationDuration: '25s', animationDirection: 'reverse'}}></div>
                  
                  {/* Glowing Background Circle */}
                  <div className="absolute inset-10 bg-gradient-to-br from-cyan-100 via-blue-50 via-primary-50 to-emerald-100 rounded-full opacity-60 shadow-2xl animate-pulse" style={{animationDuration: '3s'}}></div>
                  
                  {/* Central Water Drop with Enhanced Effects */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 bg-gradient-to-br from-cyan-400 via-blue-500 via-primary-500 to-emerald-500 rounded-full flex items-center justify-center shadow-2xl relative overflow-hidden animate-pulse" style={{animationDuration: '2s'}}>
                      {/* Multiple glow layers */}
                      <div className="absolute inset-1 bg-gradient-to-br from-cyan-300 to-emerald-400 rounded-full opacity-60"></div>
                      <div className="absolute inset-2 sm:inset-3 bg-gradient-to-br from-blue-400 to-primary-400 rounded-full opacity-40"></div>
                      <Droplets className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 text-white relative z-10 drop-shadow-lg" />
                      {/* Enhanced shine effects */}
                      <div className="absolute top-3 left-3 w-12 h-12 bg-white rounded-full opacity-30"></div>
                      <div className="absolute top-6 left-6 w-6 h-6 bg-white rounded-full opacity-50"></div>
                      {/* Sparkle effects */}
                      <div className="absolute top-8 right-8 w-2 h-2 bg-white rounded-full opacity-80 animate-ping"></div>
                      <div className="absolute bottom-10 left-10 w-1 h-1 bg-white rounded-full opacity-90 animate-ping" style={{animationDelay: '0.5s'}}></div>
                    </div>
                  </div>
                  
                  {/* Premium Floating Elements with Shadows */}
                  <div className="absolute top-4 left-4 sm:top-8 sm:left-8 w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-sky-300 to-blue-400 rounded-full opacity-80 animate-bounce flex items-center justify-center shadow-xl" style={{animationDuration: '2.5s'}}>
                    <Cloud className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-white drop-shadow-md" />
                  </div>
                  <div className="absolute top-6 right-6 sm:top-12 sm:right-12 w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-emerald-300 to-green-400 rounded-full opacity-85 animate-bounce flex items-center justify-center shadow-lg" style={{animationDelay: '0.8s', animationDuration: '2.2s'}}>
                    <Leaf className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-white drop-shadow-md" />
                  </div>
                  <div className="absolute bottom-6 left-6 sm:bottom-12 sm:left-12 w-12 h-12 sm:w-14 sm:h-14 lg:w-18 lg:h-18 bg-gradient-to-br from-amber-300 to-orange-400 rounded-full opacity-80 animate-bounce flex items-center justify-center shadow-xl" style={{animationDelay: '1.5s', animationDuration: '3s'}}>
                    <span className="text-2xl sm:text-3xl lg:text-4xl drop-shadow-md">☀️</span>
                  </div>
                  <div className="absolute bottom-4 right-4 sm:bottom-8 sm:right-8 w-8 h-8 sm:w-10 sm:h-10 lg:w-14 lg:h-14 bg-gradient-to-br from-violet-300 to-purple-400 rounded-full opacity-80 animate-bounce flex items-center justify-center shadow-lg" style={{animationDelay: '0.3s', animationDuration: '2.7s'}}>
                    <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 lg:w-7 lg:h-7 text-white drop-shadow-md" />
                  </div>
                  
                  {/* Enhanced Orbiting System */}
                  <div className="absolute top-1/2 left-1/2 w-56 h-56 sm:w-72 sm:h-72 lg:w-80 lg:h-80 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="absolute top-0 left-1/2 w-3 h-3 sm:w-4 sm:h-4 lg:w-6 lg:h-6 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full transform -translate-x-1/2 animate-spin shadow-lg" style={{animationDuration: '6s', transformOrigin: '50% 112px sm:50% 144px lg:50% 160px'}}></div>
                    <div className="absolute top-0 left-1/2 w-2 h-2 sm:w-3 sm:h-3 lg:w-4 lg:h-4 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full transform -translate-x-1/2 animate-spin shadow-md" style={{animationDuration: '9s', transformOrigin: '50% 112px sm:50% 144px lg:50% 160px', animationDirection: 'reverse'}}></div>
                    <div className="absolute top-0 left-1/2 w-2 h-2 sm:w-2 sm:h-2 lg:w-3 lg:h-3 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full transform -translate-x-1/2 animate-spin shadow-sm" style={{animationDuration: '12s', transformOrigin: '50% 112px sm:50% 144px lg:50% 160px'}}></div>
                  </div>
                  
                  {/* Floating Particles */}
                  <div className="absolute top-20 left-1/3 w-2 h-2 bg-primary-400 rounded-full opacity-60 animate-ping" style={{animationDelay: '1s'}}></div>
                  <div className="absolute top-1/3 right-20 w-1 h-1 bg-success-400 rounded-full opacity-70 animate-ping" style={{animationDelay: '2s'}}></div>
                  <div className="absolute bottom-1/3 left-20 w-1.5 h-1.5 bg-blue-400 rounded-full opacity-50 animate-ping" style={{animationDelay: '0.5s'}}></div>
                </div>
              </div>
              {/* Premium background effects */}
              <div className="absolute -top-12 -right-12 w-60 h-60 bg-gradient-to-br from-cyan-200 via-blue-200 to-primary-200 rounded-full blur-3xl opacity-30 animate-pulse" style={{animationDuration: '3s'}}></div>
              <div className="absolute -bottom-12 -left-12 w-72 h-72 bg-gradient-to-br from-emerald-200 via-green-200 to-success-200 rounded-full blur-3xl opacity-25 animate-pulse" style={{animationDuration: '4s', animationDelay: '1s'}}></div>
              <div className="absolute top-1/4 -right-8 w-40 h-40 bg-gradient-to-br from-amber-200 to-orange-200 rounded-full blur-2xl opacity-20 animate-pulse" style={{animationDuration: '5s', animationDelay: '2s'}}></div>
              <div className="absolute bottom-1/4 -left-8 w-36 h-36 bg-gradient-to-br from-violet-200 to-purple-200 rounded-full blur-2xl opacity-15 animate-pulse" style={{animationDuration: '6s', animationDelay: '1.5s'}}></div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-gradient-to-r from-primary-600 to-success-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-3xl sm:text-4xl font-bold text-white mb-1">{stat.value}</p>
                <p className="text-primary-100 text-sm sm:text-base">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Everything You Need to
              <span className="text-gradient"> Save Water</span>
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-xl sm:max-w-2xl mx-auto px-4 sm:px-0">
              Powerful features designed specifically for modern farmers who want to 
              optimize their irrigation and reduce water waste.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="card-hover p-4 sm:p-6 group"
              >
                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 sm:mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">{feature.title}</h3>
                <p className="text-sm sm:text-base text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div className="order-2 lg:order-1">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-6 text-center lg:text-left">
                Why Farmers
                <span className="text-gradient"> Choose AquaFarm</span>
              </h2>
              <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8 text-center lg:text-left">
                Join thousands of farmers who have transformed their irrigation practices 
                and seen real results in water savings and crop yields.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-success-100 flex items-center justify-center">
                      <Check className="w-3 h-3 sm:w-4 sm:h-4 text-success-600" />
                    </div>
                    <span className="text-sm sm:text-base text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative order-1 lg:order-2 mb-8 lg:mb-0">
              <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 border border-gray-100">
                <div className="flex items-center space-x-3 mb-6">
                  <Cloud className="w-8 h-8 text-primary-500" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Weather-Based Recommendations</h4>
                    <p className="text-sm text-gray-500">Updated every hour</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <span className="text-3xl">🌧️</span>
                      <div>
                        <p className="font-medium text-gray-900">Rain Expected</p>
                        <p className="text-sm text-gray-500">15mm in next 24 hours</p>
                      </div>
                    </div>
                    <span className="text-primary-600 font-medium">Skip Irrigation</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-orange-50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <span className="text-3xl">☀️</span>
                      <div>
                        <p className="font-medium text-gray-900">High Temperature</p>
                        <p className="text-sm text-gray-500">35°C expected tomorrow</p>
                      </div>
                    </div>
                    <span className="text-orange-600 font-medium">Irrigate Early</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <span className="text-3xl">💧</span>
                      <div>
                        <p className="font-medium text-gray-900">Optimal Conditions</p>
                        <p className="text-sm text-gray-500">Perfect for wheat irrigation</p>
                      </div>
                    </div>
                    <span className="text-success-600 font-medium">2,500L needed</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Farmer Reviews */}
      {reviews.length > 0 && (
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
          <div className="absolute inset-0 bg-grid opacity-5"></div>
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-16">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary-100 text-primary-700 text-sm font-medium mb-6">
                <span className="text-xl mr-2">🌾</span>
                Trusted by Farmers
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                What Our <span className="text-gradient">Farmers Say</span>
              </h2>
              <p className="text-lg text-gray-600">Real reviews from farmers using AquaFarm</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {reviews.map((review, index) => (
                <div 
                  key={review.id} 
                  className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:-translate-y-2 group"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center mb-6">
                    <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-success-500 rounded-full flex items-center justify-center mr-4 shadow-md group-hover:scale-110 transition-transform">
                      <span className="text-white font-bold text-xl">{review.name[0].toUpperCase()}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg">{review.name}</h4>
                      <p className="text-sm text-gray-500 flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        {review.location}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => {
                      const starValue = i + 1;
                      if (review.rating >= starValue) {
                        return <span key={i} className="text-yellow-400 text-xl drop-shadow-sm">★</span>;
                      } else if (review.rating >= starValue - 0.5) {
                        return (
                          <span key={i} className="relative inline-block text-xl">
                            <span className="text-gray-300">★</span>
                            <span className="absolute inset-0 w-1/2 overflow-hidden text-yellow-400 drop-shadow-sm">★</span>
                          </span>
                        );
                      } else {
                        return <span key={i} className="text-gray-300 text-xl">★</span>;
                      }
                    })}
                    <span className="ml-2 text-sm font-semibold text-gray-600">{review.rating}</span>
                  </div>
                  <div className="relative">
                    <span className="absolute -top-2 -left-2 text-3xl text-primary-200 opacity-40">“</span>
                    <p className="text-gray-700 text-base leading-relaxed relative z-10 pl-4">{review.comment}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* How It Works Section */}
      <section id="how-it-works" className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Get Started in
              <span className="text-gradient"> 3 Easy Steps</span>
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-xl sm:max-w-2xl mx-auto px-4 sm:px-0">
              Setting up your water optimization dashboard takes just a few minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
            {[
              {
                step: '01',
                title: 'Create Your Account',
                description: 'Sign up for free and set up your farm profile with location details.',
                icon: User
              },
              {
                step: '02',
                title: 'Add Your Fields',
                description: 'Register your fields with crop types, area, and irrigation methods.',
                icon: Map
              },
              {
                step: '03',
                title: 'Start Optimizing',
                description: 'Track water usage, get recommendations, and watch your efficiency improve.',
                icon: BarChart3
              }
            ].map((item, index) => (
              <div key={index} className="relative">
                <div className="card p-6 sm:p-8 text-center relative z-10">
                  <div className="text-4xl sm:text-5xl font-bold text-gray-100 mb-3 sm:mb-4">{item.step}</div>
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-success-500 flex items-center justify-center mx-auto mb-4 sm:mb-6">
                    <item.icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">{item.title}</h3>
                  <p className="text-sm sm:text-base text-gray-600">{item.description}</p>
                </div>
                {index > 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-20">
                    <ChevronRight className="w-8 h-8 text-gray-300" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary-600 via-primary-700 to-success-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 sm:mb-6">
            Ready to Optimize Your Water Usage?
          </h2>
          <p className="text-lg sm:text-xl text-primary-100 mb-6 sm:mb-8 px-4 sm:px-0">
            Join thousands of farmers who are saving water and increasing yields with AquaFarm.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
            <Link
              to="/register"
              className="bg-white text-primary-600 hover:bg-gray-50 text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-medium shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 w-full sm:w-auto inline-flex items-center justify-center"
            >
              Start Now
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
            </Link>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-6 mt-6 sm:mt-8 text-primary-100">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base">Secure & Private</span>
            </div>
            <div className="flex items-center space-x-2">
              <Smartphone className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base">Works on All Devices</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 sm:py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12">
            <div className="sm:col-span-2 md:col-span-2">
              <div className="flex items-center space-x-2 mb-3 sm:mb-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-primary-500 to-success-500 flex items-center justify-center">
                  <Droplets className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <span className="text-xl sm:text-2xl font-bold text-white">AquaFarm</span>
              </div>
              <p className="text-sm sm:text-base text-gray-400 mb-4 max-w-md">
                Empowering farmers with smart irrigation solutions. Save water, increase yields, 
                and make data-driven decisions for your farm.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Product</h4>
              <ul className="space-y-2">
                <li><a href="#features" className="text-sm sm:text-base hover:text-white transition-colors">Features</a></li>
                <li><a href="#benefits" className="text-sm sm:text-base hover:text-white transition-colors">Benefits</a></li>
                <li><a href="#how-it-works" className="text-sm sm:text-base hover:text-white transition-colors">How It Works</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Account</h4>
              <ul className="space-y-2">
                <li><Link to="/login" className="text-sm sm:text-base hover:text-white transition-colors">Sign In</Link></li>
                <li><Link to="/register" className="text-sm sm:text-base hover:text-white transition-colors">Create Account</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center">
            <p className="text-xs sm:text-sm">&copy; {new Date().getFullYear()} AquaFarm. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;