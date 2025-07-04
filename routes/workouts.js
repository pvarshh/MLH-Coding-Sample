const express = require('express');
const { authenticateToken, validateWorkout } = require('../middleware/auth');

const router = express.Router();

// Get all workouts for user
router.get('/', authenticateToken, async (req, res) => {
    try {
        const db = req.db;
        const userId = req.user.id;

        const workouts = await db.all(`
            SELECT w.*, 
                   COUNT(e.id) as exercise_count,
                   SUM(e.sets * e.reps) as total_volume
            FROM workouts w
            LEFT JOIN exercises e ON w.id = e.workout_id
            WHERE w.user_id = ?
            GROUP BY w.id
            ORDER BY w.date DESC, w.created_at DESC
        `, [userId]);

        res.json({ workouts });
    } catch (error) {
        console.error('Get workouts error:', error);
        res.status(500).json({ error: 'Failed to get workouts' });
    }
});

// Get specific workout with exercises
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const db = req.db;
        const userId = req.user.id;
        const workoutId = req.params.id;

        const workout = await db.get(
            'SELECT * FROM workouts WHERE id = ? AND user_id = ?',
            [workoutId, userId]
        );

        if (!workout) {
            return res.status(404).json({ error: 'Workout not found' });
        }

        const exercises = await db.all(
            'SELECT * FROM exercises WHERE workout_id = ? ORDER BY id',
            [workoutId]
        );

        res.json({ workout: { ...workout, exercises } });
    } catch (error) {
        console.error('Get workout error:', error);
        res.status(500).json({ error: 'Failed to get workout' });
    }
});

// Create new workout
router.post('/', authenticateToken, validateWorkout, async (req, res) => {
    try {
        const db = req.db;
        const userId = req.user.id;
        const { name, date, duration, notes, exercises } = req.body;

        // Create workout
        const workoutResult = await db.run(
            'INSERT INTO workouts (user_id, name, date, duration, notes) VALUES (?, ?, ?, ?, ?)',
            [userId, name, date, duration || null, notes || null]
        );

        const workoutId = workoutResult.id;

        // Add exercises if provided
        if (exercises && exercises.length > 0) {
            for (const exercise of exercises) {
                await db.run(
                    'INSERT INTO exercises (workout_id, name, sets, reps, weight, rest_time, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
                    [workoutId, exercise.name, exercise.sets, exercise.reps, exercise.weight || null, exercise.rest_time || null, exercise.notes || null]
                );
            }
        }

        // Get the complete workout with exercises
        const completeWorkout = await db.get(
            'SELECT * FROM workouts WHERE id = ?',
            [workoutId]
        );

        const workoutExercises = await db.all(
            'SELECT * FROM exercises WHERE workout_id = ?',
            [workoutId]
        );

        res.status(201).json({
            message: 'Workout created successfully',
            workout: { ...completeWorkout, exercises: workoutExercises }
        });
    } catch (error) {
        console.error('Create workout error:', error);
        res.status(500).json({ error: 'Failed to create workout' });
    }
});

// Update workout
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const db = req.db;
        const userId = req.user.id;
        const workoutId = req.params.id;
        const { name, date, duration, notes } = req.body;

        // Check if workout exists and belongs to user
        const existingWorkout = await db.get(
            'SELECT * FROM workouts WHERE id = ? AND user_id = ?',
            [workoutId, userId]
        );

        if (!existingWorkout) {
            return res.status(404).json({ error: 'Workout not found' });
        }

        // Update workout
        await db.run(
            'UPDATE workouts SET name = ?, date = ?, duration = ?, notes = ? WHERE id = ? AND user_id = ?',
            [name || existingWorkout.name, date || existingWorkout.date, duration, notes, workoutId, userId]
        );

        // Get updated workout
        const updatedWorkout = await db.get(
            'SELECT * FROM workouts WHERE id = ?',
            [workoutId]
        );

        const exercises = await db.all(
            'SELECT * FROM exercises WHERE workout_id = ?',
            [workoutId]
        );

        res.json({
            message: 'Workout updated successfully',
            workout: { ...updatedWorkout, exercises }
        });
    } catch (error) {
        console.error('Update workout error:', error);
        res.status(500).json({ error: 'Failed to update workout' });
    }
});

// Delete workout
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const db = req.db;
        const userId = req.user.id;
        const workoutId = req.params.id;

        // Check if workout exists and belongs to user
        const workout = await db.get(
            'SELECT * FROM workouts WHERE id = ? AND user_id = ?',
            [workoutId, userId]
        );

        if (!workout) {
            return res.status(404).json({ error: 'Workout not found' });
        }

        // Delete exercises first (foreign key constraint)
        await db.run('DELETE FROM exercises WHERE workout_id = ?', [workoutId]);

        // Delete workout
        await db.run('DELETE FROM workouts WHERE id = ? AND user_id = ?', [workoutId, userId]);

        res.json({ message: 'Workout deleted successfully' });
    } catch (error) {
        console.error('Delete workout error:', error);
        res.status(500).json({ error: 'Failed to delete workout' });
    }
});

// Get exercise templates
router.get('/templates/exercises', async (req, res) => {
    try {
        const db = req.db;
        const templates = await db.all('SELECT * FROM exercise_templates ORDER BY category, name');
        res.json({ templates });
    } catch (error) {
        console.error('Get exercise templates error:', error);
        res.status(500).json({ error: 'Failed to get exercise templates' });
    }
});

module.exports = router;
