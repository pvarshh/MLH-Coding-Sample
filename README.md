# 🏃‍♂️ FitQuest - Your Ultimate Fitness Companion

> Transform your fitness journey with workout tracking, goal setting, and competitive challenges with friends!

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![MLH Fellowship](https://img.shields.io/badge/MLH-Fellowship-blue)](https://fellowship.mlh.io/)

## ✨ What Makes FitQuest Special?

FitQuest isn't just another fitness tracker—it's your personal fitness companion that turns working out into an exciting adventure! Whether you're a beginner starting your fitness journey or a seasoned athlete looking to push your limits, FitQuest has something amazing for you.

### 🎯 Core Features

- **📊 Smart Workout Tracking**: Log your exercises with detailed metrics and watch your progress unfold
- **🏆 Goal Setting & Achievement**: Set personalized fitness goals and celebrate every milestone
- **⚡ Real-time Statistics**: Beautiful charts and insights to visualize your fitness journey
- **🎮 Competitive Challenges**: Battle friends in 1v1 fitness challenges with ELO ranking system
- **🏅 Leaderboards**: Climb the ranks and become the fitness champion in your community
- **📱 Mobile-Friendly**: Seamless experience across all your devices

### 🚀 The Challenge System

What sets FitQuest apart is our unique **ELO-based ranking system**:
- Challenge friends to head-to-head workout competitions
- Earn/lose ELO points based on your performance
- Climb through rank tiers: Bronze → Silver → Gold → Platinum → Diamond
- Compete on global leaderboards
- Seasonal rankings to keep things fresh

## 🎮 How to Get Started

### Option 1: Quick Start (Recommended)
1. **Clone the repository**
   ```bash
   git clone https://github.com/parney2004/fitquest.git
   cd fitquest
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start your fitness journey**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000` and start tracking!

### Option 2: Deploy to Vercel
1. **Make sure you have Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Run our deployment script**
   ```bash
   ./deploy-vercel.sh
   ```

3. **Follow the prompts** and your app will be live on Vercel!

## 🛠️ Technology Stack

**Frontend:**
- Vanilla JavaScript (ES6+)
- HTML5 & CSS3
- Font Awesome Icons
- Responsive Design

**Backend:**
- Node.js & Express.js
- SQLite Database
- JWT Authentication
- BCrypt Password Hashing

**Deployment:**
- Vercel Ready
- Docker Support
- Environment Configuration

## 📱 Features Deep Dive

### 🏠 Dashboard
Your fitness command center featuring:
- Real-time workout statistics
- Goal progress tracking
- Recent workout history
- Motivational streaks counter

### 💪 Workout Tracking
- **Exercise Library**: Pre-built exercise database
- **Custom Workouts**: Create your own workout routines
- **Progress Tracking**: Monitor improvements over time
- **Workout History**: Never lose track of what you've done

### 🎯 Goal Setting
- **SMART Goals**: Set specific, measurable, achievable goals
- **Progress Monitoring**: Visual progress bars and charts
- **Achievement Badges**: Celebrate your victories
- **Goal Categories**: Strength, cardio, flexibility, and more

### 🏆 Competitive Features
- **1v1 Challenges**: Challenge friends to fitness battles
- **ELO Rating System**: Fair and competitive ranking
- **Rank Tiers**: Bronze to Diamond progression
- **Leaderboards**: Global and seasonal rankings
- **Challenge History**: Track your competitive journey

## 🌟 Why FitQuest?

### For Beginners
- **Friendly Interface**: Easy to navigate and understand
- **Guided Experience**: Helpful tips and suggestions
- **Progress Motivation**: See your improvements daily
- **Community Support**: Connect with other fitness enthusiasts

### For Advanced Users
- **Detailed Analytics**: Deep insights into your performance
- **Competitive Features**: Challenge yourself against others
- **Custom Workouts**: Full control over your routine
- **Export Data**: Your data, your way

### For Everyone
- **100% Free**: No hidden costs or premium features
- **Privacy Focused**: Your data stays yours
- **Mobile Friendly**: Works perfectly on all devices
- **Open Source**: Contribute and make it better

## 🚀 Deployment Options

### Vercel (Recommended)
```bash
# Using our deployment script
./deploy-vercel.sh

# Or manually
npm install -g vercel
vercel --prod
```

### Other Platforms
- **Heroku**: `git push heroku main`
- **Railway**: Connect your GitHub repo
- **Netlify**: Deploy the built static files
- **Docker**: `docker build -t fitquest .`

## 🔧 Configuration

### Environment Variables
Create a `.env` file in your project root:
```env
NODE_ENV=production
PORT=3000
JWT_SECRET=your-secret-key-here
DATABASE_URL=your-database-url
```

### Database Setup
FitQuest uses SQLite by default, but you can easily switch to:
- PostgreSQL
- MySQL
- MongoDB
- Any SQL database

## 📊 Project Structure

```
fitquest/
├── 📁 public/           # Frontend assets
│   ├── index.html       # Main HTML file
│   ├── styles.css       # Styling
│   └── app.js          # Client-side JavaScript
├── 📁 routes/          # API routes
│   ├── auth.js         # Authentication
│   ├── workouts.js     # Workout management
│   ├── goals.js        # Goal tracking
│   ├── stats.js        # Statistics
│   └── rankings.js     # ELO & challenges
├── 📁 database/        # Database setup
├── 📁 middleware/      # Express middleware
├── 📁 tests/          # Test files
├── server.js          # Main server file
├── vercel.json        # Vercel configuration
└── deploy-vercel.sh   # Deployment script
```

## 🎯 MLH Fellowship Submission

This project was created as part of the MLH Fellowship application, showcasing:
- **Full-stack development** skills
- **Modern web technologies**
- **User experience design**
- **Competitive programming** concepts (ELO system)
- **Deployment and DevOps** practices

### Key Technical Highlights
- Implemented ELO rating system for fair competition
- Built responsive, mobile-first design
- Created RESTful API architecture
- Integrated JWT authentication
- Designed scalable database schema
- Implemented real-time statistics
- Added comprehensive error handling

## 🤝 Contributing

We love contributions! Here's how you can help make FitQuest even better:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Make your changes**
4. **Test thoroughly**
5. **Commit your changes** (`git commit -m 'Add amazing feature'`)
6. **Push to the branch** (`git push origin feature/amazing-feature`)
7. **Open a Pull Request**

See our [Contributing Guide](CONTRIBUTING.md) for detailed instructions.

## 📚 Documentation

- **[Technical Documentation](TECHNICAL_DOCS.md)** - Deep dive into the architecture
- **[API Reference](docs/API.md)** - Complete API documentation
- **[Deployment Guide](docs/DEPLOYMENT.md)** - Step-by-step deployment instructions
- **[Contributing Guide](CONTRIBUTING.md)** - How to contribute to the project

## 🐛 Bug Reports & Feature Requests

Found a bug? Have a cool feature idea? We'd love to hear from you!

- **🐛 Bug Reports**: [Open an issue](https://github.com/parney2004/fitquest/issues) with the bug label
- **✨ Feature Requests**: [Open an issue](https://github.com/parney2004/fitquest/issues) with the enhancement label
- **💬 Questions**: Start a [discussion](https://github.com/parney2004/fitquest/discussions)

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **MLH Fellowship** for the opportunity to showcase this project
- **The fitness community** for inspiration and motivation
- **Open source contributors** who make projects like this possible
- **You!** for checking out FitQuest and considering contributing

## 🔗 Links

- **🌐 Live Demo**: [Coming Soon - Deploy to see it live!]
- **📱 Documentation**: [View Docs](TECHNICAL_DOCS.md)
- **💬 Community**: [Join Discussions](https://github.com/parney2004/fitquest/discussions)
- **🐦 Updates**: [Follow on Twitter](https://twitter.com/parney2004)

---

**Ready to transform your fitness journey?** 🏃‍♂️✨

Get started today and become the best version of yourself with FitQuest!
