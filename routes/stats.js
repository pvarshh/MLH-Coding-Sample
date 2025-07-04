const express = require('express');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get comprehensive workout statistics
router.get('/', authenticateToken, async (req, res) => {
    try {
        const db = req.db;
        const userId = req.user.id;

        // Basic workout stats
        const workoutStats = await db.get(`
            SELECT 
                COUNT(*) as total_workouts,
                SUM(duration) as total_duration,
                AVG(duration) as avg_duration,
                MIN(date) as first_workout,
                MAX(date) as last_workout
            FROM workouts 
            WHERE user_id = ?
        `, [userId]);

        // Exercise stats
        const exerciseStats = await db.get(`
            SELECT 
                COUNT(*) as total_exercises,
                SUM(sets) as total_sets,
                SUM(reps) as total_reps,
                SUM(sets * reps) as total_volume,
                AVG(weight) as avg_weight
            FROM exercises e
            JOIN workouts w ON e.workout_id = w.id
            WHERE w.user_id = ?
        `, [userId]);

        // Most popular exercises
        const popularExercises = await db.all(`
            SELECT 
                e.name,
                COUNT(*) as frequency,
                SUM(e.sets) as total_sets,
                SUM(e.reps) as total_reps,
                AVG(e.weight) as avg_weight
            FROM exercises e
            JOIN workouts w ON e.workout_id = w.id
            WHERE w.user_id = ?
            GROUP BY e.name
            ORDER BY frequency DESC
            LIMIT 10
        `, [userId]);

        // Workout frequency by day of week
        const weeklyFrequency = await db.all(`
            SELECT 
                CASE strftime('%w', date)
                    WHEN '0' THEN 'Sunday'
                    WHEN '1' THEN 'Monday'
                    WHEN '2' THEN 'Tuesday'
                    WHEN '3' THEN 'Wednesday'
                    WHEN '4' THEN 'Thursday'
                    WHEN '5' THEN 'Friday'
                    WHEN '6' THEN 'Saturday'
                END as day_of_week,
                COUNT(*) as workout_count
            FROM workouts
            WHERE user_id = ?
            GROUP BY strftime('%w', date)
            ORDER BY strftime('%w', date)
        `, [userId]);

        // Monthly workout trend (last 12 months)
        const monthlyTrend = await db.all(`
            SELECT 
                strftime('%Y-%m', date) as month,
                COUNT(*) as workout_count,
                SUM(duration) as total_duration
            FROM workouts
            WHERE user_id = ? 
            AND date >= date('now', '-12 months')
            GROUP BY strftime('%Y-%m', date)
            ORDER BY month
        `, [userId]);

        // Personal records (highest weight for each exercise)
        const personalRecords = await db.all(`
            SELECT 
                e.name,
                MAX(e.weight) as max_weight,
                MAX(e.reps) as max_reps,
                w.date as record_date
            FROM exercises e
            JOIN workouts w ON e.workout_id = w.id
            WHERE w.user_id = ? AND e.weight IS NOT NULL
            GROUP BY e.name
            ORDER BY max_weight DESC
            LIMIT 10
        `, [userId]);

        res.json({
            workoutStats,
            exerciseStats,
            popularExercises,
            weeklyFrequency,
            monthlyTrend,
            personalRecords
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ error: 'Failed to get statistics' });
    }
});

// Get progress data for specific exercise
router.get('/exercise/:name', authenticateToken, async (req, res) => {
    try {
        const db = req.db;
        const userId = req.user.id;
        const exerciseName = req.params.name;

        const progressData = await db.all(`
            SELECT 
                w.date,
                e.weight,
                e.reps,
                e.sets,
                (e.weight * e.reps * e.sets) as total_volume
            FROM exercises e
            JOIN workouts w ON e.workout_id = w.id
            WHERE w.user_id = ? AND e.name = ?
            ORDER BY w.date ASC
        `, [userId, exerciseName]);

        res.json({ exerciseName, progressData });
    } catch (error) {
        console.error('Get exercise progress error:', error);
        res.status(500).json({ error: 'Failed to get exercise progress' });
    }
});

// Get workout consistency data
router.get('/consistency', authenticateToken, async (req, res) => {
    try {
        const db = req.db;
        const userId = req.user.id;

        // Get workout dates for the last 90 days
        const workoutDates = await db.all(`
            SELECT DISTINCT date
            FROM workouts
            WHERE user_id = ?
            AND date >= date('now', '-90 days')
            ORDER BY date
        `, [userId]);

        // Calculate streaks
        let currentStreak = 0;
        let longestStreak = 0;
        let tempStreak = 0;
        
        const today = new Date();
        const workoutDateSet = new Set(workoutDates.map(w => w.date));

        // Check current streak (working backwards from today)
        for (let i = 0; i < 90; i++) {
            const checkDate = new Date(today);
            checkDate.setDate(today.getDate() - i);
            const dateStr = checkDate.toISOString().split('T')[0];
            
            if (workoutDateSet.has(dateStr)) {
                if (i === 0 || currentStreak > 0) {
                    currentStreak++;
                }
            } else if (i === 0) {
                // If no workout today, check yesterday
                continue;
            } else {
                break;
            }
        }

        // Calculate longest streak
        const sortedDates = workoutDates.map(w => new Date(w.date)).sort((a, b) => a - b);
        
        for (let i = 0; i < sortedDates.length; i++) {
            if (i === 0) {
                tempStreak = 1;
            } else {
                const dayDiff = (sortedDates[i] - sortedDates[i-1]) / (1000 * 60 * 60 * 24);
                if (dayDiff === 1) {
                    tempStreak++;
                } else {
                    longestStreak = Math.max(longestStreak, tempStreak);
                    tempStreak = 1;
                }
            }
        }
        longestStreak = Math.max(longestStreak, tempStreak);

        // Weekly consistency (last 12 weeks)
        const weeklyConsistency = await db.all(`
            SELECT 
                strftime('%Y-%W', date) as week,
                COUNT(*) as workout_count
            FROM workouts
            WHERE user_id = ?
            AND date >= date('now', '-84 days')
            GROUP BY strftime('%Y-%W', date)
            ORDER BY week
        `, [userId]);

        res.json({
            currentStreak,
            longestStreak,
            totalWorkoutDays: workoutDates.length,
            weeklyConsistency
        });
    } catch (error) {
        console.error('Get consistency error:', error);
        res.status(500).json({ error: 'Failed to get consistency data' });
    }
});

module.exports = router;
