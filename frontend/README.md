# Water Usage Optimization Dashboard (AquaFarm)

A comprehensive web application for farmers to monitor and optimize water usage across their fields with real-time weather integration and intelligent irrigation recommendations.

## Features

- **User Authentication**: Secure registration and login system with password validation (minimum 6 characters, 1 uppercase, 1 lowercase, 1 special character) and Google OAuth integration
- **Field Management**: Add, edit, and monitor multiple fields with crop-specific tracking
- **Water Usage Tracking**: Log and analyze water consumption patterns with overuse detection
- **Weather Integration**: Real-time weather data and 5-day forecasts with location validation
- **Smart Recommendations**: Crop-specific irrigation suggestions based on real-time weather, rainfall predictions, and field conditions
- **Rain-Based Irrigation**: Automatic adjustment of irrigation recommendations based on expected rainfall in next 48 hours
- **Intelligent Notifications**: Automatic alerts for irrigation recommendations and water overuse with customizable preferences
- **Analytics Dashboard**: Visual insights into water usage trends and efficiency with auto-refresh every 5 minutes
- **Feedback System**: Half-star rating system for farmer reviews displayed dynamically on home page
- **Location Validation**: Real-time city name validation using weather API

## Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **OpenWeatherMap API** for weather data
- **bcryptjs** for password hashing

### Frontend
- **React 18** with Vite
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Recharts** for data visualization
- **Lucide React** for icons
- **Axios** for API calls

## Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- OpenWeatherMap API key

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with the following variables:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/water
JWT_SECRET=your_jwt_secret_key_here
WEATHER_API_KEY=your_openweathermap_api_key_here
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

4. Start the development server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file:
```env
VITE_API_BASE_URL=http://localhost:5000
```

4. Start the development server:
```bash
npm run dev
```

## Environment Variables

### Backend (.env)
- `PORT`: Server port (default: 5000)
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT token generation
- `WEATHER_API_KEY`: OpenWeatherMap API key
- `FRONTEND_URL`: Frontend URL for CORS configuration
- `NODE_ENV`: Environment (development/production)

### Frontend (.env.local)
- `VITE_API_BASE_URL`: Backend API base URL

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Fields
- `GET /api/fields` - Get user fields
- `POST /api/fields` - Create new field
- `PUT /api/fields/:id` - Update field
- `DELETE /api/fields/:id` - Delete field

### Water Usage
- `GET /api/water` - Get water usage records
- `POST /api/water` - Add water usage record
- `GET /api/water/stats` - Get usage statistics
- `DELETE /api/water/:id` - Delete usage record

### Weather
- `GET /api/weather/current` - Get current weather
- `GET /api/weather/forecast` - Get weather forecast (5-day)
- `GET /api/weather/recommendations` - Get crop-specific irrigation recommendations

### Notifications
- `GET /api/notifications` - Get user notifications
- `POST /api/notifications` - Create new notification
- `PUT /api/notifications/:id/read` - Mark notification as read
- `DELETE /api/notifications/:id` - Delete notification

## Key Features Details

### Crop-Specific Water Recommendations
Different crops have different water requirements per hectare:
- Wheat: 80L/hectare
- Rice: 150L/hectare
- Corn: 120L/hectare
- Cotton: 100L/hectare
- Sugarcane: 200L/hectare
- Vegetables: 90L/hectare
- Fruits: 110L/hectare
- Other: 85L/hectare

### Rain-Based Irrigation Logic
- **Skip irrigation**: If expected rainfall > 5mm in next 48 hours
- **Reduce 50%**: If expected rainfall 2-5mm in next 48 hours
- **Normal irrigation**: If expected rainfall < 2mm in next 48 hours

### Water Overuse Detection
- Compares last 7 days actual usage vs weekly recommended amount
- Creates automatic notifications when usage exceeds recommendation
- Helps farmers optimize water consumption

### Notification System
- Automatic notifications for irrigation recommendations
- Water overuse alerts
- Customizable notification preferences (stored in localStorage)
- Filter by type: weather alerts, irrigation reminders, system updates

### Feedback & Reviews
- Half-star rating system (0.5 increments)
- Reviews stored in localStorage
- Home page displays 3 most recent reviews dynamically
- Auto-refresh every 3 seconds

## Security Features

- **Input Validation**: All user inputs are validated and sanitized
- **Password Requirements**: Minimum 6 characters, 1 uppercase, 1 lowercase, 1 special character
- **Password Hashing**: Passwords are hashed using bcrypt
- **JWT Authentication**: Secure token-based authentication
- **CORS Protection**: Configured for specific origins
- **Security Headers**: XSS protection, content type options, frame options
- **Rate Limiting**: Protection against abuse
- **Location Validation**: Real-time city validation using weather API
- **Error Boundaries**: Graceful error handling in React

## Usage

1. **Register/Login**: Create an account with farm name, city (required), and secure password
2. **Add Fields**: Define your agricultural fields with crop types and areas
3. **Set Location**: Validate and set your city in Settings for accurate weather data
4. **Log Water Usage**: Record irrigation activities with details
5. **Monitor Weather**: Check real-time conditions and 5-day forecasts
6. **Get Recommendations**: Receive crop-specific irrigation suggestions adjusted for rainfall
7. **Manage Notifications**: Customize notification preferences and view alerts
8. **Analyze Data**: View usage patterns with auto-refreshing dashboard (every 5 minutes)
9. **Provide Feedback**: Rate your experience with half-star precision

## UI/UX Enhancements

- **Clean Layout**: No duplicate page titles, streamlined navigation
- **Sidebar Navigation**: User menu at bottom with dropdown, notification bell integrated
- **Gradient Themes**: Modern gradient backgrounds and buttons (primary-600 to success-600)
- **Glassmorphism Effects**: Enhanced navbar with modern glass effects
- **Responsive Design**: Dynamic font sizing and proper text truncation
- **Auto-Refresh**: Dashboard updates every 5 minutes and on page visibility change
- **Inline Alerts**: Top-right positioned alerts with auto-hide after 3 seconds
- **Card Animations**: Staggered animations and hover effects
- **Enhanced Typography**: Increased font sizes for better readability

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Support

For support and questions, please open an issue in the repository.