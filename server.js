const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const Database = require('./database/database');
const authRoutes = require('./routes/auth');
const workoutRoutes = require('./routes/workouts');
const goalRoutes = require('./routes/goals');
const statsRoutes = require('./routes/stats');
const rankingsRoutes = require('./routes/rankings');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize database
const db = new Database();

// Middleware
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? ['https://fitquest.vercel.app', 'https://fitquest-parney2004.vercel.app']
        : ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Make database available to routes
app.use((req, res, next) => {
    req.db = db;
    next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/rankings', rankingsRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Serve the main app
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).json({ 
        error: process.env.NODE_ENV === 'production' 
            ? 'Something went wrong!' 
            : err.message 
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 FitQuest server running on port ${PORT}`);
    console.log(`📱 Visit: http://localhost:${PORT}`);
    console.log(`🏃‍♂️ Ready to track your fitness journey!`);
});

module.exports = app;
