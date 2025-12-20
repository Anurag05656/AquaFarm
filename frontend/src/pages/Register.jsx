import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Droplets, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, 
  User, MapPin, Building 
} from 'lucide-react';

const Register = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    farmName: '',
    city: '',
    state: '',
    country: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  // Auto-hide error messages after 3 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const validateStep1 = () => {
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('All fields are required');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    if (!/[A-Z]/.test(formData.password)) {
      setError('Password must contain at least one uppercase letter');
      return false;
    }
    if (!/[a-z]/.test(formData.password)) {
      setError('Password must contain at least one lowercase letter');
      return false;
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)) {
      setError('Password must contain at least one special character');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.farmName) {
      setError('Farm name is required');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        farmName: formData.farmName,
        location: {
          city: formData.city || '',
          state: formData.state || '',
          country: formData.country || ''
        }
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left side - Image/Illustration */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-success-600 via-primary-600 to-primary-700 items-center justify-center p-12">
        <div className="max-w-lg text-center text-white">
          <div className="mb-8">
            <div className="w-24 h-24 rounded-3xl bg-white/10 backdrop-blur-sm flex items-center justify-center mx-auto mb-6">
              <Droplets className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Join AquaFarm Today</h2>
            <p className="text-primary-100 text-lg">
              Start optimizing your farm's water usage with our intelligent dashboard. 
              Get personalized recommendations based on your crops and local weather.
            </p>
          </div>
          <div className="space-y-4">
            {[
              'Track water consumption in real-time',
              'Get weather-based irrigation advice',
              'Manage multiple fields easily',
              'Reduce water waste by up to 40%'
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-center space-x-3 text-primary-100">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-success-500 flex items-center justify-center shadow-lg shadow-primary-500/25">
              <Droplets className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gradient">AquaFarm</span>
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create your account</h1>
            <p className="text-gray-600">
              {step === 1 ? 'Enter your personal details' : 'Tell us about your farm'}
            </p>
          </div>

          {/* Progress indicator */}
          <div className="flex items-center mb-8">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
              step >= 1 ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              1
            </div>
            <div className={`flex-1 h-1 mx-2 rounded ${step >= 2 ? 'bg-primary-500' : 'bg-gray-200'}`} />
            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
              step >= 2 ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              2
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-3 text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {step === 1 ? (
              <>
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="input pl-12"
                      placeholder="John Doe"
                      autoComplete="name"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="input pl-12"
                      placeholder="you@example.com"
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <p className="text-xs text-gray-500 mb-2">Min 6 chars, 1 uppercase, 1 lowercase, 1 special char</p>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="input pl-12 pr-12"
                      placeholder="••••••••"
                      autoComplete="new-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="input pl-12"
                      placeholder="••••••••"
                      autoComplete="new-password"
                      required
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleNext}
                  className="btn-primary w-full py-3.5 text-base"
                >
                  Continue
                  <ArrowRight className="w-5 h-5 ml-2" />
                </button>
              </>
            ) : (
              <>
                <div>
                  <label htmlFor="farmName" className="block text-sm font-medium text-gray-700 mb-2">
                    Farm Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Building className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      id="farmName"
                      name="farmName"
                      value={formData.farmName}
                      onChange={handleChange}
                      className="input pl-12"
                      placeholder="Green Valley Farm"
                      autoComplete="organization"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="input pl-12"
                      placeholder="Your city"
                      autoComplete="address-level2"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
                      State/Province
                    </label>
                    <input
                      type="text"
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      className="input"
                      placeholder="State"
                      autoComplete="address-level1"
                    />
                  </div>
                  <div>
                    <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                      Country
                    </label>
                    <input
                      type="text"
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      className="input"
                      placeholder="Country"
                      autoComplete="country-name"
                    />
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="btn-secondary flex-1 py-3.5"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary flex-1 py-3.5"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Creating...
                      </div>
                    ) : (
                      <>
                        Create Account
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </form>

          <p className="mt-8 text-center text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;