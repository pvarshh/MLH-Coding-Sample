const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};

// Generate JWT token
const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, username: user.username, email: user.email },
        JWT_SECRET,
        { expiresIn: '24h' }
    );
};

// Validation middleware
const validateWorkout = (req, res, next) => {
    const { name, date, exercises } = req.body;

    if (!name || !date) {
        return res.status(400).json({ error: 'Workout name and date are required' });
    }

    if (exercises && !Array.isArray(exercises)) {
        return res.status(400).json({ error: 'Exercises must be an array' });
    }

    next();
};

const validateGoal = (req, res, next) => {
    const { title, target_value, unit } = req.body;

    if (!title || !target_value || !unit) {
        return res.status(400).json({ error: 'Goal title, target value, and unit are required' });
    }

    if (target_value <= 0) {
        return res.status(400).json({ error: 'Target value must be positive' });
    }

    next();
};

const validateUser = (req, res, next) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ error: 'Username, email, and password are required' });
    }

    if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Please provide a valid email address' });
    }

    next();
};

module.exports = {
    authenticateToken,
    generateToken,
    validateWorkout,
    validateGoal,
    validateUser,
    JWT_SECRET
};
