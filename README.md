# Personal Fitness Tracker

A comprehensive web application for tracking personal fitness activities, workouts, and progress over time. Built as a code sample for the MLH Fellowship application.

## 🌟 Features

- **Workout Tracking**: Log different types of exercises with sets, reps, and weights
- **Goal Setting**: Set and track fitness goals (weight loss, muscle gain, endurance)
- **Progress Monitoring**: Visual charts showing workout progress over time
- **Exercise Database**: Built-in database of common exercises with instructions
- **User Authentication**: Secure user registration and login with JWT tokens
- **Statistics Dashboard**: Comprehensive analytics and progress visualization
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🚀 Tech Stack

- **Backend**: Node.js with Express framework
- **Database**: SQLite with custom abstraction layer
- **Frontend**: Vanilla JavaScript with modern CSS
- **Authentication**: JWT tokens with bcrypt password hashing
- **Charts**: Chart.js for data visualization
- **Testing**: Jest for unit and integration testing

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd fitness-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the application**
   ```bash
   # Development mode with auto-reload
   npm run dev
   
   # Production mode
   npm start
   ```

4. **Seed with demo data (optional)**
   ```bash
   npm run seed
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 🎯 Quick Start

### Demo Account
If you ran the seed script, you can use these credentials:
- **Username**: `demouser`
- **Email**: `demo@example.com`
- **Password**: `demo123`

### Or Create Your Own Account
1. Click "Register" on the login page
2. Fill in your details
3. Start tracking your workouts!

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile

### Workouts
- `GET /api/workouts` - Get user's workouts
- `POST /api/workouts` - Create new workout
- `GET /api/workouts/:id` - Get specific workout
- `PUT /api/workouts/:id` - Update workout
- `DELETE /api/workouts/:id` - Delete workout

### Goals
- `GET /api/goals` - Get user's goals
- `POST /api/goals` - Create new goal
- `PUT /api/goals/:id` - Update goal progress
- `DELETE /api/goals/:id` - Delete goal

### Statistics
- `GET /api/stats` - Get comprehensive workout statistics
- `GET /api/stats/exercise/:name` - Get exercise-specific progress
- `GET /api/stats/consistency` - Get workout consistency data

## 🏗️ Project Structure

```
fitness-tracker/
├── server.js              # Main server file
├── package.json           # Dependencies and scripts
├── seed.js                # Database seeding script
├── database/
│   └── database.js        # Database abstraction layer
├── middleware/
│   └── auth.js            # Authentication middleware
├── routes/
│   ├── auth.js           # Authentication routes
│   ├── workouts.js       # Workout management routes
│   ├── goals.js          # Goal management routes
│   └── stats.js          # Statistics routes
├── public/
│   ├── index.html        # Main HTML file
│   ├── styles.css        # Application styles
│   └── app.js            # Frontend JavaScript
└── tests/
    └── api.test.js       # API tests
```

## 🧪 Testing

Run the test suite:
```bash
npm test
```

## 🎨 Screenshots

*Note: Add screenshots here when deploying to GitHub*

## 🌍 Real-World Problem Solved

This application addresses several common fitness tracking challenges:

1. **Consistency**: Many people struggle to maintain workout routines without proper tracking
2. **Progress Visibility**: Hard to see improvement over time without data visualization
3. **Goal Setting**: Need for clear, measurable fitness objectives with progress tracking
4. **Motivation**: Visual progress indicators help maintain long-term motivation
5. **Accessibility**: Simple, device-agnostic interface for tracking anywhere

## 🔒 Security Features

- **Password Hashing**: Bcrypt with salt rounds for secure password storage
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Comprehensive validation for all user inputs
- **SQL Injection Prevention**: Parameterized queries throughout
- **CORS Configuration**: Proper cross-origin resource sharing setup

## 📱 Mobile Responsiveness

The application is fully responsive and works great on:
- Desktop computers
- Tablets
- Mobile phones
- Various screen sizes and orientations

## 🚀 Future Enhancements

- **Social Features**: Friend connections, shared workouts
- **Wearable Integration**: Fitbit, Apple Watch sync
- **Nutrition Tracking**: Calorie and macro tracking
- **Workout Plans**: Predefined training programs
- **Exercise Library**: Video demonstrations
- **Progress Photos**: Visual progress tracking
- **Export Data**: PDF reports, CSV exports

## 🤝 Contributing

This is a code sample for the MLH Fellowship application. While not open for contributions, feel free to fork and modify for your own use.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📧 Contact

Built by [Your Name] as a code sample for the MLH Fellowship application.

---

*This project demonstrates full-stack development skills including backend API development, database design, frontend user interface, authentication systems, and responsive design principles.*
