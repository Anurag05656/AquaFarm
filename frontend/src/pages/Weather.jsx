import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  Cloud,
  Sun,
  CloudRain,
  CloudSnow,
  Wind,
  Droplets,
  Thermometer,
  Eye,
  Sunrise,
  Sunset,
  MapPin,
  Search,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  CloudDrizzle,
  CloudLightning,
  Clock,
  X
} from 'lucide-react';

const Weather = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [error, setError] = useState('');
  const [searchCity, setSearchCity] = useState('');
  const [currentCity, setCurrentCity] = useState('');

  useEffect(() => {
    const city = user?.location?.city || 'London';
    setCurrentCity(city);
    fetchWeatherData(city);
  }, [user]);

  // Auto-hide error messages after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const fetchWeatherData = async (city) => {
    setLoading(true);
    setError('');

    try {
      const [weatherRes, forecastRes, recsRes] = await Promise.all([
        api.get(`/weather/current?city=${city}`),
        api.get(`/weather/forecast?city=${city}`),
        api.get(`/weather/recommendations?city=${city}`)
      ]);

      setCurrentWeather(weatherRes.data);
      setForecast(forecastRes.data);
      setRecommendations(recsRes.data);
      setCurrentCity(city);
      localStorage.setItem('weatherData', JSON.stringify({ current: weatherRes.data, forecast: forecastRes.data, recommendations: recsRes.data, city }));
    } catch (err) {
      const cached = localStorage.getItem('weatherData');
      if (cached) {
        const data = JSON.parse(cached);
        setCurrentWeather(data.current);
        setForecast(data.forecast);
        setRecommendations(data.recommendations);
        setCurrentCity(data.city);
      } else {
        setError('Failed to load weather data. Please check your location.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchCity.trim()) return;

    setSearchLoading(true);
    setError('');

    try {
      await fetchWeatherData(searchCity.trim());
      setSearchCity('');
    } catch (err) {
      setError('City not found. Please try another location.');
    } finally {
      setSearchLoading(false);
    }
  };

  const getWeatherIcon = (condition, size = 'w-8 h-8') => {
    const iconClass = size;
    switch (condition?.toLowerCase()) {
      case 'clear':
        return <Sun className={`${iconClass} text-yellow-500`} />;
      case 'clouds':
        return <Cloud className={`${iconClass} text-gray-500`} />;
      case 'rain':
        return <CloudRain className={`${iconClass} text-blue-500`} />;
      case 'drizzle':
        return <CloudDrizzle className={`${iconClass} text-blue-400`} />;
      case 'thunderstorm':
        return <CloudLightning className={`${iconClass} text-purple-500`} />;
      case 'snow':
        return <CloudSnow className={`${iconClass} text-blue-200`} />;
      default:
        return <Sun className={`${iconClass} text-yellow-500`} />;
    }
  };

  const getUrgencyStyles = (urgency) => {
    switch (urgency) {
      case 'high':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-700',
          icon: <AlertTriangle className="w-6 h-6" />
        };
      case 'low':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          text: 'text-green-700',
          icon: <CheckCircle className="w-6 h-6" />
        };
      default:
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          text: 'text-yellow-700',
          icon: <AlertTriangle className="w-6 h-6" />
        };
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading weather data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Weather & Irrigation</h1>
          <p className="text-gray-600">Weather-based irrigation recommendations</p>
        </div>
        <form onSubmit={handleSearch} className="flex items-center space-x-2">
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchCity}
              onChange={(e) => setSearchCity(e.target.value)}
              placeholder="Search city..."
              className="input pl-10 pr-4 py-2 w-48 sm:w-64"
            />
          </div>
          <button
            type="submit"
            disabled={searchLoading}
            className="btn-primary py-2.5"
          >
            {searchLoading ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <Search className="w-5 h-5" />
            )}
          </button>
        </form>
      </div>

      {error && (
        <div className="fixed top-4 right-4 z-50 w-80 animate-slide-in">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="p-3 flex items-center gap-2.5">
              <div className="bg-red-100 rounded-lg p-1.5 flex-shrink-0">
                <AlertTriangle className="w-4 h-4 text-red-600" />
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

      {currentWeather && (
        <>
          {/* Current Weather Card */}
          <div className="card overflow-hidden">
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-6 sm:p-8 text-white">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <MapPin className="w-5 h-5" />
                    <span className="text-lg">{currentWeather.location}, {currentWeather.country}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-6xl sm:text-7xl font-bold">
                      {Math.round(currentWeather.temperature)}°
                    </span>
                    <div>
                      <p className="text-xl capitalize">{currentWeather.description}</p>
                      <p className="text-primary-200">
                        Feels like {Math.round(currentWeather.feelsLike)}°C
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-6 sm:mt-0">
                  {getWeatherIcon(currentWeather.main, 'w-24 h-24')}
                </div>
              </div>
            </div>

            {/* Weather Details */}
            <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                <Droplets className="w-8 h-8 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-500">Humidity</p>
                  <p className="text-xl font-semibold text-gray-900">{currentWeather.humidity}%</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                <Wind className="w-8 h-8 text-teal-500" />
                <div>
                  <p className="text-sm text-gray-500">Wind Speed</p>
                  <p className="text-xl font-semibold text-gray-900">{currentWeather.windSpeed} m/s</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                <Eye className="w-8 h-8 text-purple-500" />
                <div>
                  <p className="text-sm text-gray-500">Visibility</p>
                  <p className="text-xl font-semibold text-gray-900">{(currentWeather.visibility / 1000).toFixed(1)} km</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                <Thermometer className="w-8 h-8 text-red-500" />
                <div>
                  <p className="text-sm text-gray-500">Pressure</p>
                  <p className="text-xl font-semibold text-gray-900">{currentWeather.pressure} hPa</p>
                </div>
              </div>
            </div>

            {/* Sunrise/Sunset */}
            <div className="px-6 pb-6">
              <div className="flex items-center justify-center space-x-8 p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl">
                <div className="flex items-center space-x-3">
                  <Sunrise className="w-6 h-6 text-orange-500" />
                  <div>
                    <p className="text-xs text-gray-500">Sunrise</p>
                    <p className="font-semibold text-gray-900">{formatTime(currentWeather.sunrise)}</p>
                  </div>
                </div>
                <div className="w-px h-10 bg-gray-200" />
                <div className="flex items-center space-x-3">
                  <Sunset className="w-6 h-6 text-orange-600" />
                  <div>
                    <p className="text-xs text-gray-500">Sunset</p>
                    <p className="font-semibold text-gray-900">{formatTime(currentWeather.sunset)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recommendations Card */}
          {recommendations && (
            <div className="card overflow-hidden">
              <div className="bg-gradient-to-r from-primary-600 to-success-600 p-6 text-white">
                <h2 className="text-xl font-bold mb-2">💧 Irrigation Recommendations</h2>
                <p className="text-primary-100">Smart water management based on real-time weather data</p>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Main Advice */}
                {(() => {
                  const styles = getUrgencyStyles(recommendations.irrigation?.urgency);
                  return (
                    <div className={`p-5 rounded-xl border-2 ${styles.bg} ${styles.border} ${styles.text} shadow-md`}>
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0 mt-1">{styles.icon}</div>
                        <div className="flex-1">
                          <p className="font-bold text-lg mb-2">{recommendations.irrigation?.advice}</p>
                          <div className="flex items-center space-x-2 text-sm opacity-90">
                            <Clock className="w-4 h-4" />
                            <span>Best time: {recommendations.irrigation?.bestTime}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Water Stats Grid */}
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="p-5 bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl border border-primary-200 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-primary-700">Recommended Water</p>
                      <Droplets className="w-5 h-5 text-primary-600" />
                    </div>
                    <p className="text-3xl font-bold text-primary-900 mb-1">
                      {parseInt(recommendations.irrigation?.waterNeeded?.adjusted || 0).toLocaleString()}L
                    </p>
                    <p className="text-xs text-primary-600">
                      Base: {parseInt(recommendations.irrigation?.waterNeeded?.base || 0).toLocaleString()}L
                    </p>
                  </div>
                  <div className="p-5 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-blue-700">Expected Rain (24h)</p>
                      <CloudRain className="w-5 h-5 text-blue-600" />
                    </div>
                    <p className="text-3xl font-bold text-blue-900 mb-1">
                      {recommendations.forecast?.expectedRainfall || 0}mm
                    </p>
                    <p className="text-xs text-blue-600">
                      {recommendations.forecast?.expectedRainfall > 5 ? 'Heavy rain' : recommendations.forecast?.expectedRainfall > 2 ? 'Light rain' : 'No significant rain'}
                    </p>
                  </div>
                  <div className="p-5 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-orange-700">Water Need Level</p>
                      <Thermometer className="w-5 h-5 text-orange-600" />
                    </div>
                    <p className="text-3xl font-bold text-orange-900 mb-1 capitalize">
                      {recommendations.irrigation?.waterNeedLevel || 'Normal'}
                    </p>
                    <p className="text-xs text-orange-600">
                      Based on weather conditions
                    </p>
                  </div>
                </div>

                {/* Field-wise Recommendations */}
                {recommendations.recommendations && recommendations.recommendations.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <MapPin className="w-5 h-5 mr-2 text-primary-600" />
                      Field-wise Recommendations
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {recommendations.recommendations.map((rec, index) => (
                        <div key={index} className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                          <div className="flex items-start space-x-3">
                            <span className="text-3xl flex-shrink-0">{rec.icon}</span>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-900 mb-1">{rec.title}</p>
                              <p className="text-sm text-gray-600 mb-2">{rec.message}</p>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500">Recommended</span>
                                <span className="text-sm font-bold text-primary-600">Amount varies by field</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Button */}
                <div className="flex justify-center pt-4">
                  <Link to="/water-usage" className="btn-primary px-8 py-3">
                    <Droplets className="w-5 h-5 mr-2" />
                    Log Water Usage
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* 5-Day Forecast */}
          {forecast && forecast.daily && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">5-Day Forecast</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {forecast.daily.slice(0, 5).map((day, index) => (
                  <div
                    key={index}
                    className="p-4 bg-gray-50 rounded-xl text-center hover:bg-gray-100 transition-colors"
                  >
                    <p className="text-sm font-medium text-gray-600 mb-2">
                      {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </p>
                    <div className="flex justify-center mb-2">
                      {getWeatherIcon(day.mainCondition, 'w-10 h-10')}
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <span className="font-semibold text-gray-900">{Math.round(day.maxTemp)}°</span>
                      <span className="text-gray-400">/</span>
                      <span className="text-gray-500">{Math.round(day.minTemp)}°</span>
                    </div>
                    <div className="mt-2 flex items-center justify-center text-xs text-blue-600">
                      <Droplets className="w-3 h-3 mr-1" />
                      {day.totalRain}mm
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hourly Forecast */}
          {forecast && forecast.hourly && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">24-Hour Forecast</h2>
              <div className="overflow-x-auto">
                <div className="flex space-x-4 pb-4" style={{ minWidth: 'max-content' }}>
                  {forecast.hourly.slice(0, 12).map((hour, index) => (
                    <div
                      key={index}
                      className="flex flex-col items-center p-3 bg-gray-50 rounded-xl min-w-[80px]"
                    >
                      <p className="text-xs text-gray-500 mb-2">
                        {new Date(hour.dateTime).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true })}
                      </p>
                      {getWeatherIcon(hour.main, 'w-8 h-8')}
                      <p className="font-semibold text-gray-900 mt-2">{Math.round(hour.temperature)}°</p>
                      {hour.rain > 0 && (
                        <div className="flex items-center text-xs text-blue-600 mt-1">
                          <Droplets className="w-3 h-3 mr-1" />
                          {hour.rain.toFixed(1)}mm
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Weather;