import api from '../services/api';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  User,
  Mail,
  MapPin,
  Building,
  Lock,
  Eye,
  EyeOff,
  Save,
  AlertCircle,
  Bell,
  Globe,
  Droplets,
  Trash2,
  LogOut,
  Cloud,
  CheckCircle,
  Settings as SettingsIcon,
  X
} from 'lucide-react';

const Settings = () => {
  const { user, updateProfile, logout, deleteAccount } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    farmName: user?.farmName || '',
    city: user?.location?.city || '',
    state: user?.location?.state || '',
    country: user?.location?.country || ''
  });

  const [locationValidating, setLocationValidating] = useState(false);
  const [locationValid, setLocationValid] = useState(null);

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('notificationPreferences');
    return saved ? JSON.parse(saved) : {
      emailAlerts: true,
      weatherAlerts: true,
      irrigationReminders: true,
      weatherRecommendations: true,
      weeklyReports: false
    };
  });

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleNotificationChange = (key) => {
    const updated = { ...notifications, [key]: !notifications[key] };
    setNotifications(updated);
    localStorage.setItem('notificationPreferences', JSON.stringify(updated));
  };

  const validateLocation = async (city) => {
    if (!city || city.length < 2) {
      setLocationValid(null);
      return;
    }
    
    setLocationValidating(true);
    try {
      await api.get(`/weather/current?city=${encodeURIComponent(city)}`);
      setLocationValid(true);
    } catch {
      setLocationValid(false);
    } finally {
      setLocationValidating(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    
    if (profileData.city && locationValid === false) {
      setError('Please enter a valid city name');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await updateProfile({
        name: profileData.name,
        email: profileData.email,
        farmName: profileData.farmName,
        location: {
          city: profileData.city,
          state: profileData.state,
          country: profileData.country
        }
      });
      setSuccess('Profile updated successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (passwordData.currentPassword === passwordData.newPassword) {
      setError('New password must be different from current password');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setLoading(false);
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }
    if (!/[A-Z]/.test(passwordData.newPassword)) {
      setError('Password must contain at least one uppercase letter');
      setLoading(false);
      return;
    }
    if (!/[a-z]/.test(passwordData.newPassword)) {
      setError('Password must contain at least one lowercase letter');
      setLoading(false);
      return;
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(passwordData.newPassword)) {
      setError('Password must contain at least one special character');
      setLoading(false);
      return;
    }

    try {
      await updateProfile({
        currentPassword: passwordData.currentPassword,
        password: passwordData.newPassword
      });
      setSuccess('Password updated successfully');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to update password';
      setError(errorMsg);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotifications = () => {
    localStorage.setItem('notificationPreferences', JSON.stringify(notifications));
    setSuccess('Notification preferences saved');
  };

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'security', name: 'Security', icon: Lock },
    { id: 'notifications', name: 'Notifications', icon: Bell }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your account and preferences</p>
      </div>

      {error && (
        <div className="fixed top-4 right-4 z-50 w-80 animate-slide-in">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="p-3 flex items-center gap-2.5">
              <div className="bg-red-100 rounded-lg p-1.5 flex-shrink-0">
                <AlertCircle className="w-4 h-4 text-red-600" />
              </div>
              <p className="text-sm text-gray-800 flex-1">{error}</p>
              <button onClick={() => setError('')} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="h-0.5 bg-red-100">
              <div className="h-full bg-red-500 animate-[shrink_3s_linear]" style={{animation: 'shrink 3s linear forwards'}} />
            </div>
          </div>
        </div>
      )}
      {success && (
        <div className="fixed top-4 right-4 z-50 w-80 animate-slide-in">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="p-3 flex items-center gap-2.5">
              <div className="bg-green-100 rounded-lg p-1.5 flex-shrink-0">
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
              <p className="text-sm text-gray-800 flex-1">{success}</p>
              <button onClick={() => setSuccess('')} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="h-0.5 bg-green-100">
              <div className="h-full bg-green-500 animate-[shrink_3s_linear]" style={{animation: 'shrink 3s linear forwards'}} />
            </div>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <div className="card p-2">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all ${
                    activeTab === tab.id
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-primary-600' : 'text-gray-400'}`} />
                  <span className="font-medium">{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* User Card */}
          <div className="card p-6 mt-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-success-500 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl font-bold text-white">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="min-w-0 flex-1 overflow-hidden">
                <h3 className="font-semibold text-gray-900 truncate">{user?.name}</h3>
                <p className="text-gray-500 truncate" style={{fontSize: `${Math.max(10, Math.min(14, 140 / (user?.email?.length || 10)))}px`}}>{user?.email}</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center text-sm text-gray-600">
                <Building className="w-4 h-4 mr-2 text-gray-400" />
                {user?.farmName || 'My Farm'}
              </div>
              {user?.location?.city && (
                <div className="flex items-center text-sm text-gray-600 mt-2">
                  <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                  {user.location.city}{user.location.country && `, ${user.location.country}`}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Profile Information</h2>
              <form onSubmit={handleProfileSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        name="name"
                        value={profileData.name}
                        onChange={handleProfileChange}
                        className="input pl-12"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        name="email"
                        value={profileData.email}
                        onChange={handleProfileChange}
                        className="input pl-12"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Farm Name
                  </label>
                  <div className="relative">
                    <Building className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="farmName"
                      value={profileData.farmName}
                      onChange={handleProfileChange}
                      className="input pl-12"
                      placeholder="My Farm"
                    />
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                    <MapPin className="w-5 h-5 mr-2 text-gray-400" />
                    Location
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Your location is used for weather data and irrigation recommendations.
                  </p>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="city"
                          value={profileData.city}
                          onChange={(e) => {
                            handleProfileChange(e);
                            const timer = setTimeout(() => validateLocation(e.target.value), 500);
                            return () => clearTimeout(timer);
                          }}
                          className={`input pr-10 ${
                            locationValid === false ? 'border-red-300 focus:border-red-500 focus:ring-red-500' :
                            locationValid === true ? 'border-green-300 focus:border-green-500 focus:ring-green-500' : ''
                          }`}
                          placeholder="Your city"
                        />
                        {locationValidating && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <div className="w-4 h-4 border-2 border-gray-300 border-t-primary-600 rounded-full animate-spin" />
                          </div>
                        )}
                        {!locationValidating && locationValid === true && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          </div>
                        )}
                        {!locationValidating && locationValid === false && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <AlertCircle className="w-5 h-5 text-red-500" />
                          </div>
                        )}
                      </div>
                      {locationValid === false && (
                        <p className="text-xs text-red-600 mt-1">City not found. Please enter a valid city name.</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State/Province
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={profileData.state}
                        onChange={handleProfileChange}
                        className="input"
                        placeholder="State"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Country
                      </label>
                      <input
                        type="text"
                        name="country"
                        value={profileData.country}
                        onChange={handleProfileChange}
                        className="input"
                        placeholder="Country"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button type="submit" disabled={loading} className="btn-primary">
                    {loading ? (
                      <div className="flex items-center">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Saving...
                      </div>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="card p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Change Password</h2>
                <form onSubmit={handlePasswordSubmit} className="space-y-6 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        className="input pl-12 pr-12"
                        placeholder="••••••••"
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        className="input pl-12"
                        placeholder="••••••••"
                        required
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Min 6 chars, 1 uppercase, 1 lowercase, 1 special char</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        className="input pl-12"
                        placeholder="••••••••"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button type="submit" disabled={loading} className="btn-primary">
                      {loading ? (
                        <div className="flex items-center">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Updating...
                        </div>
                      ) : (
                        <>
                          <Lock className="w-4 h-4 mr-2" />
                          Update Password
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Danger Zone */}
              <div className="card p-6 border-red-200">
                <h2 className="text-lg font-semibold text-red-600 mb-4">Danger Zone</h2>
                <p className="text-sm text-gray-600 mb-4">
                  Once you delete your account, there is no going back. Please be certain.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="btn bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Account
                  </button>
                  <button
                    onClick={logout}
                    className="btn-secondary"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Notification Preferences</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                      <Mail className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Email Alerts</p>
                      <p className="text-sm text-gray-500">Receive important updates via email</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleNotificationChange('emailAlerts')}
                    className={`relative w-14 h-7 rounded-full transition-all duration-300 focus:outline-none hover:shadow-md ${
                      notifications.emailAlerts ? 'bg-gradient-to-r from-primary-500 to-primary-600' : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                    aria-label={`Toggle email alerts ${notifications.emailAlerts ? 'off' : 'on'}`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full transition-all duration-300 shadow-lg flex items-center justify-center ${
                        notifications.emailAlerts ? 'translate-x-7' : 'translate-x-0'
                      }`}
                    >
                      {notifications.emailAlerts ? (
                        <svg className="w-3 h-3 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      )}
                    </span>
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                      <Globe className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Weather Alerts</p>
                      <p className="text-sm text-gray-500">Get notified about significant weather changes</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleNotificationChange('weatherAlerts')}
                    className={`relative w-14 h-7 rounded-full transition-all duration-300 focus:outline-none hover:shadow-md ${
                      notifications.weatherAlerts ? 'bg-gradient-to-r from-primary-500 to-primary-600' : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                    aria-label={`Toggle weather alerts ${notifications.weatherAlerts ? 'off' : 'on'}`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full transition-all duration-300 shadow-lg flex items-center justify-center ${
                        notifications.weatherAlerts ? 'translate-x-7' : 'translate-x-0'
                      }`}
                    >
                      {notifications.weatherAlerts ? (
                        <svg className="w-3 h-3 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      )}
                    </span>
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Droplets className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Irrigation Reminders</p>
                      <p className="text-sm text-gray-500">Daily reminders based on recommendations</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleNotificationChange('irrigationReminders')}
                    className={`relative w-14 h-7 rounded-full transition-all duration-300 focus:outline-none hover:shadow-md ${
                      notifications.irrigationReminders ? 'bg-gradient-to-r from-primary-500 to-primary-600' : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                    aria-label={`Toggle irrigation reminders ${notifications.irrigationReminders ? 'off' : 'on'}`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full transition-all duration-300 shadow-lg flex items-center justify-center ${
                        notifications.irrigationReminders ? 'translate-x-7' : 'translate-x-0'
                      }`}
                    >
                      {notifications.irrigationReminders ? (
                        <svg className="w-3 h-3 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      )}
                    </span>
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors duration-300 ${
                      notifications.weatherRecommendations ? 'bg-purple-100' : 'bg-gray-100'
                    }`}>
                      <Cloud className={`w-5 h-5 transition-colors duration-300 ${
                        notifications.weatherRecommendations ? 'text-purple-600' : 'text-gray-400'
                      }`} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Weather Recommendations</p>
                      <p className="text-sm text-gray-500">Get irrigation advice based on weather forecasts</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleNotificationChange('weatherRecommendations')}
                    className={`relative w-14 h-7 rounded-full transition-all duration-300 focus:outline-none hover:shadow-md ${
                      notifications.weatherRecommendations ? 'bg-gradient-to-r from-primary-500 to-primary-600' : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                    aria-label={`Toggle weather recommendations ${notifications.weatherRecommendations ? 'off' : 'on'}`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full transition-all duration-300 shadow-lg flex items-center justify-center ${
                        notifications.weatherRecommendations ? 'translate-x-7' : 'translate-x-0'
                      }`}
                    >
                      {notifications.weatherRecommendations ? (
                        <svg className="w-3 h-3 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      )}
                    </span>
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                      <Bell className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Weekly Reports</p>
                      <p className="text-sm text-gray-500">Receive weekly summary of water usage</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleNotificationChange('weeklyReports')}
                    className={`relative w-14 h-7 rounded-full transition-all duration-300 focus:outline-none hover:shadow-md ${
                      notifications.weeklyReports ? 'bg-gradient-to-r from-primary-500 to-primary-600' : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                    aria-label={`Toggle weekly reports ${notifications.weeklyReports ? 'off' : 'on'}`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full transition-all duration-300 shadow-lg flex items-center justify-center ${
                        notifications.weeklyReports ? 'translate-x-7' : 'translate-x-0'
                      }`}
                    >
                      {notifications.weeklyReports ? (
                        <svg className="w-3 h-3 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      )}
                    </span>
                  </button>
                </div>
              </div>

              <div className="flex justify-end pt-6 mt-6 border-t border-gray-200">
                <button onClick={handleSaveNotifications} className="btn-primary">
                  <Save className="w-4 h-4 mr-2" />
                  Save Preferences
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-gray-900/50" onClick={() => setShowDeleteModal(false)} />
            <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Delete Account</h3>
              <p className="text-gray-600 text-center mb-6">
                Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    try {
                      await deleteAccount();
                      setShowDeleteModal(false);
                    } catch (error) {
                      setError(error.response?.data?.message || 'Failed to delete account');
                      setShowDeleteModal(false);
                    }
                  }}
                  className="btn bg-red-600 text-white hover:bg-red-700 flex-1"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;