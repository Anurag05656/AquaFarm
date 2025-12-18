import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  Droplets,
  TrendingDown,
  TrendingUp,
  Cloud,
  Thermometer,
  Wind,
  MapPin,
  Calendar,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  RefreshCw,
  Droplet,
  Sun,
  CloudRain
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [weather, setWeather] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [fields, setFields] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, [user?.location?.city]);

  useEffect(() => {
    // Refresh dashboard when component becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchDashboardData();
      }
    };
    
    // Refresh every 5 minutes to get latest weather
    const intervalId = setInterval(() => {
      fetchDashboardData();
    }, 300000);
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(intervalId);
    };
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, fieldsRes] = await Promise.all([
        api.get('/water/stats?period=30'),
        api.get('/fields')
      ]);

      setStats(statsRes.data);
      setFields(fieldsRes.data);

      // Get real weather data and forecast
      const city = user?.location?.city;
      let weather = null;
      let forecast = null;
      
      if (city) {
        try {
          const [weatherRes, forecastRes] = await Promise.all([
            api.get(`/weather/current?city=${city}`),
            api.get(`/weather/forecast?city=${city}`)
          ]);
          weather = weatherRes.data;
          forecast = forecastRes.data;
        } catch (apiErr) {
          console.error('Weather API failed:', apiErr);
        }
      }
        
      setWeather(weather);
      
      // Generate recommendations only if weather data is available
      if (weather && fieldsRes.data.length > 0) {
        // Calculate expected rainfall from forecast
        const expectedRain = forecast?.daily?.slice(0, 2).reduce((sum, day) => sum + (day.totalRain || 0), 0) || 0;
        const cropIcons = {wheat: '🌾', rice: '🌾', corn: '🌽', cotton: '☁️', sugarcane: '🎋', vegetables: '🥬', fruits: '🍎', other: '🌱'};
        const cropWaterNeeds = {wheat: 80, rice: 150, corn: 120, cotton: 100, sugarcane: 200, vegetables: 90, fruits: 110, other: 85};
        
        const recs = fieldsRes.data.map(field => {
          const baseWater = (cropWaterNeeds[field.cropType] || 85) * field.area;
          let waterAmount = baseWater;
          let action = 'Normal irrigation';
          let urgency = 'medium';
          let reason = 'Regular schedule';
          
          // Check for expected rain first
          if (expectedRain > 5) {
            waterAmount = 0;
            action = 'Skip irrigation';
            urgency = 'low';
            reason = `${expectedRain}mm rain expected in next 48h`;
          } else if (weather.condition === 'rain' || expectedRain > 2) {
            waterAmount = Math.floor(baseWater * 0.5);
            action = 'Reduce irrigation';
            urgency = 'low';
            reason = `Light rain expected (${expectedRain}mm)`;
          } else if (weather.temperature > 30) {
            waterAmount = Math.floor(baseWater * 1.4);
            action = 'Increase irrigation';
            urgency = 'high';
            reason = `High temperature (${weather.temperature}°C)`;
          } else if (weather.humidity < 40) {
            waterAmount = Math.floor(baseWater * 1.2);
            action = 'Monitor closely';
            urgency = 'medium';
            reason = `Low humidity (${weather.humidity}%)`;
          }
          
          return {
            icon: cropIcons[field.cropType] || '🌱',
            title: `${field.name}: ${action}`,
            message: reason,
            urgency,
            waterAmount
          };
        });
        
        const totalWater = recs.reduce((sum, r) => sum + r.waterAmount, 0);
        const highUrgency = recs.filter(r => r.urgency === 'high').length;
        
        let advice = 'Monitor field conditions regularly';
        let overallUrgency = 'medium';
        let bestTime = 'Early morning (6-8 AM)';
        
        if (expectedRain > 5) {
          advice = `Skip irrigation - ${expectedRain}mm rain expected in next 48 hours`;
          overallUrgency = 'low';
          bestTime = 'Wait for rain to pass';
        } else if (expectedRain > 2) {
          advice = `Reduce irrigation by 50% - ${expectedRain}mm rain expected`;
          overallUrgency = 'low';
          bestTime = 'Light irrigation if needed';
        } else if (weather.condition === 'rain') {
          advice = 'Skip irrigation today - rain expected';
          overallUrgency = 'low';
          bestTime = 'Wait for clear weather';
        } else if (highUrgency > 0) {
          advice = `${highUrgency} field(s) need immediate attention`;
          overallUrgency = 'high';
          bestTime = 'Irrigate immediately';
        } else if (weather.temperature > 25) {
          advice = 'Irrigate during cooler hours to reduce evaporation';
          bestTime = 'Early morning (5-7 AM) or evening (6-8 PM)';
        }
        
        setRecommendations({
          irrigation: {
            advice,
            urgency: overallUrgency,
            bestTime,
            waterNeeded: { adjusted: totalWater },
            expectedRain
          },
          recommendations: recs
        });
        
        // Check for overuse and create notifications
        try {
          const waterUsageRes = await api.get('/water?period=7');
          const recentUsage = waterUsageRes.data;
          
          fieldsRes.data.forEach(field => {
            const fieldRec = recs.find(r => r.title.startsWith(field.name));
            if (!fieldRec) return;
            
            const fieldUsage = recentUsage
              .filter(u => u.field?._id === field._id || u.field?.name === field.name)
              .reduce((sum, u) => sum + u.waterAmount, 0);
            
            const weeklyRecommended = fieldRec.waterAmount * 7;
            
            if (fieldUsage > weeklyRecommended) {
              const excess = fieldUsage - weeklyRecommended;
              const percentOver = Math.round((excess / weeklyRecommended) * 100);
              
              api.post('/notifications', {
                type: 'water',
                title: `⚠️ Overuse Alert: ${field.name}`,
                message: `Water usage (${fieldUsage.toLocaleString()}L) exceeded recommendation (${weeklyRecommended.toLocaleString()}L) by ${percentOver}% this week`,
                priority: percentOver > 50 ? 'high' : 'medium'
              }).catch(() => {});
            }
          });
          
          // Create irrigation recommendation notification
          api.post('/notifications', {
            type: 'irrigation',
            title: 'Irrigation Recommendation',
            message: advice,
            priority: overallUrgency
          }).catch(() => {});
        } catch (err) {
          console.error('Failed to check water usage:', err);
        }
      }
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#0ea5e9', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6'];

  const getWeatherIcon = (condition) => {
    switch (condition?.toLowerCase()) {
      case 'clear':
        return <Sun className="w-8 h-8 text-yellow-500" />;
      case 'rain':
      case 'drizzle':
        return <CloudRain className="w-8 h-8 text-blue-500" />;
      case 'clouds':
        return <Cloud className="w-8 h-8 text-gray-500" />;
      default:
        return <Sun className="w-8 h-8 text-yellow-500" />;
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'low':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-600 to-success-600 rounded-2xl p-6 sm:p-8 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">
              Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}, {user?.name?.split(' ')[0]}! 👋
            </h1>
            <p className="text-primary-100">
              Here's an overview of your farm's water usage and recommendations.
            </p>
          </div>
          <button
            onClick={fetchDashboardData}
            className="mt-4 sm:mt-0 btn bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
              <Droplets className="w-6 h-6 text-primary-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">
            {stats?.summary?.totalWater?.toLocaleString() || 0}L
          </h3>
          <p className="text-gray-500 text-sm">Total Water Used (30 days)</p>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-success-100 flex items-center justify-center">
              <MapPin className="w-6 h-6 text-success-600" />
            </div>
            <span className="flex items-center text-sm font-medium text-blue-600">
              Active
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{fields.length}</h3>
          <p className="text-gray-500 text-sm">Registered Fields</p>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">
            {Math.round(stats?.summary?.avgDaily || 0)}L
          </h3>
          <p className="text-gray-500 text-sm">Average Daily Usage</p>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
              <Thermometer className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">
            {weather ? `${Math.round(weather.temperature)}°C` : '--'}
          </h3>
          <p className="text-gray-500 text-sm">{weather?.location || 'Current Temperature'}</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Water Usage Chart */}
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Water Usage Trend</h2>
            <span className="text-sm text-gray-500">Last 30 days</span>
          </div>
          {stats?.daily && stats.daily.length > 0 ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.daily}>
                  <defs>
                    <linearGradient id="waterGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="_id"
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    tickFormatter={(value) => `${value}L`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                    formatter={(value) => [`${value.toLocaleString()}L`, 'Water Used']}
                    labelFormatter={(label) => new Date(label).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                  />
                  <Area
                    type="monotone"
                    dataKey="totalWater"
                    stroke="#0ea5e9"
                    strokeWidth={2}
                    fill="url(#waterGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-72 flex items-center justify-center bg-gray-50 rounded-xl">
              <div className="text-center">
                <Droplet className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No water usage data yet</p>
                <Link to="/water-usage" className="text-primary-600 text-sm font-medium hover:underline">
                  Add your first record
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Weather Widget */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Current Weather</h2>
            <Link to="/weather" className="text-primary-600 text-sm font-medium hover:underline">
              View More
            </Link>
          </div>
          {weather ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-4xl font-bold text-gray-900">{Math.round(weather.temperature)}°C</p>
                  <p className="text-gray-500 capitalize">{weather.description}</p>
                </div>
                {getWeatherIcon(weather.main)}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center text-gray-500 mb-1">
                    <Droplet className="w-4 h-4 mr-2" />
                    Humidity
                  </div>
                  <p className="text-xl font-semibold text-gray-900">{weather.humidity}%</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center text-gray-500 mb-1">
                    <Wind className="w-4 h-4 mr-2" />
                    Wind
                  </div>
                  <p className="text-xl font-semibold text-gray-900">{weather.windSpeed} m/s</p>
                </div>
              </div>
              <div className="flex items-center text-gray-500 text-sm">
                <MapPin className="w-4 h-4 mr-1" />
                {weather.location}, {weather.country}
              </div>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center bg-gray-50 rounded-xl">
              <div className="text-center">
                <Cloud className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Weather data unavailable</p>
                <p className="text-gray-400 text-sm">Set your location in settings</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Second Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Irrigation Recommendations */}
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Irrigation Recommendations</h2>
            {recommendations && (
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getUrgencyColor(recommendations.irrigation?.urgency)}`}>
                {recommendations.irrigation?.urgency === 'high' ? 'Action Needed' : 
                 recommendations.irrigation?.urgency === 'low' ? 'All Good' : 'Normal'}
              </span>
            )}
          </div>
          {recommendations ? (
            <div className="space-y-4">
              {/* Main Advice */}
              <div className={`p-4 rounded-xl border ${getUrgencyColor(recommendations.irrigation?.urgency)}`}>
                <div className="flex items-start space-x-3">
                  {recommendations.irrigation?.urgency === 'high' ? (
                    <AlertTriangle className="w-6 h-6 flex-shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle className="w-6 h-6 flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="font-medium">{recommendations.irrigation?.advice}</p>
                    <p className="text-sm mt-1 opacity-80">
                      Best time to irrigate: {recommendations.irrigation?.bestTime}
                    </p>
                  </div>
                </div>
              </div>

              {/* Recommendations List */}
              <div className="space-y-3">
                {recommendations.recommendations?.map((rec, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-start space-x-3">
                      <span className="text-2xl">{rec.icon}</span>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{rec.title}</p>
                        <p className="text-gray-500 text-xs mt-1">{rec.message}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-primary-600">{rec.waterAmount.toLocaleString()}L</p>
                      <p className="text-xs text-gray-500">recommended</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Water Needed & Rain Forecast */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 bg-primary-50 rounded-xl">
                  <p className="text-sm text-primary-700">Recommended Water Amount</p>
                  <p className="text-2xl font-bold text-primary-900">
                    {parseInt(recommendations.irrigation?.waterNeeded?.adjusted || 0).toLocaleString()}L
                  </p>
                  <Link to="/water-usage" className="text-sm text-primary-600 hover:underline mt-2 inline-flex items-center">
                    Log Usage <ArrowRight className="w-3 h-3 ml-1" />
                  </Link>
                </div>
                {recommendations.irrigation?.expectedRain !== undefined && (
                  <div className="p-4 bg-blue-50 rounded-xl">
                    <p className="text-sm text-blue-700">Expected Rain (48h)</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {recommendations.irrigation.expectedRain}mm
                    </p>
                    <p className="text-sm text-blue-600 mt-1">
                      {recommendations.irrigation.expectedRain > 5 ? 'Heavy rain expected' : 
                       recommendations.irrigation.expectedRain > 2 ? 'Light rain expected' : 'No significant rain'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-xl">
              <div className="text-center">
                <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Recommendations unavailable</p>
                <p className="text-gray-400 text-sm">Add fields and set location to get advice</p>
              </div>
            </div>
          )}
        </div>

        {/* Usage by Field */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Usage by Field</h2>
            <Link to="/fields" className="text-primary-600 text-sm font-medium hover:underline">
              Manage
            </Link>
          </div>
          {stats?.byField && stats.byField.length > 0 ? (
            <div className="space-y-4">
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.byField}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="totalWater"
                      nameKey="fieldName"
                    >
                      {stats.byField.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [`${value.toLocaleString()}L`, 'Water Used']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2">
                {stats.byField.map((field, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-sm text-gray-600">{field.fieldName}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {field.totalWater.toLocaleString()}L
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-xl">
              <div className="text-center">
                <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No fields added yet</p>
                <Link to="/fields" className="text-primary-600 text-sm font-medium hover:underline">
                  Add your first field
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to="/water-usage" className="card-hover p-6 group">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Droplets className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Log Water Usage</h3>
              <p className="text-sm text-gray-500">Record irrigation data</p>
            </div>
          </div>
        </Link>

        <Link to="/fields" className="card-hover p-6 group">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-success-100 flex items-center justify-center group-hover:scale-110 transition-transform">
              <MapPin className="w-6 h-6 text-success-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Manage Fields</h3>
              <p className="text-sm text-gray-500">Add or edit fields</p>
            </div>
          </div>
        </Link>

        <Link to="/weather" className="card-hover p-6 group">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Cloud className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Weather Forecast</h3>
              <p className="text-sm text-gray-500">5-day forecast</p>
            </div>
          </div>
        </Link>

        <Link to="/settings" className="card-hover p-6 group">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Settings</h3>
              <p className="text-sm text-gray-500">Profile & preferences</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;