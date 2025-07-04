const express = require('express');
const { authenticateToken, validateGoal } = require('../middleware/auth');

const router = express.Router();

// Get all goals for user
router.get('/', authenticateToken, async (req, res) => {
    try {
        const db = req.db;
        const userId = req.user.id;

        const goals = await db.all(`
            SELECT *,
                   ROUND((current_value / target_value) * 100, 2) as progress_percentage
            FROM goals 
            WHERE user_id = ?
            ORDER BY created_at DESC
        `, [userId]);

        res.json({ goals });
    } catch (error) {
        console.error('Get goals error:', error);
        res.status(500).json({ error: 'Failed to get goals' });
    }
});

// Create new goal
router.post('/', authenticateToken, validateGoal, async (req, res) => {
    try {
        const db = req.db;
        const userId = req.user.id;
        const { title, description, target_value, unit, target_date } = req.body;

        const result = await db.run(
            'INSERT INTO goals (user_id, title, description, target_value, unit, target_date) VALUES (?, ?, ?, ?, ?, ?)',
            [userId, title, description || null, target_value, unit, target_date || null]
        );

        const goal = await db.get(
            'SELECT *, ROUND((current_value / target_value) * 100, 2) as progress_percentage FROM goals WHERE id = ?',
            [result.id]
        );

        res.status(201).json({
            message: 'Goal created successfully',
            goal
        });
    } catch (error) {
        console.error('Create goal error:', error);
        res.status(500).json({ error: 'Failed to create goal' });
    }
});

// Update goal progress
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const db = req.db;
        const userId = req.user.id;
        const goalId = req.params.id;
        const { current_value, title, description, target_value, unit, target_date } = req.body;

        // Check if goal exists and belongs to user
        const existingGoal = await db.get(
            'SELECT * FROM goals WHERE id = ? AND user_id = ?',
            [goalId, userId]
        );

        if (!existingGoal) {
            return res.status(404).json({ error: 'Goal not found' });
        }

        // Update goal
        const newCurrentValue = current_value !== undefined ? current_value : existingGoal.current_value;
        const newTargetValue = target_value !== undefined ? target_value : existingGoal.target_value;
        const achieved = newCurrentValue >= newTargetValue;

        await db.run(
            `UPDATE goals SET 
                title = ?, 
                description = ?, 
                target_value = ?, 
                current_value = ?, 
                unit = ?, 
                target_date = ?,
                achieved = ?
            WHERE id = ? AND user_id = ?`,
            [
                title || existingGoal.title,
                description !== undefined ? description : existingGoal.description,
                newTargetValue,
                newCurrentValue,
                unit || existingGoal.unit,
                target_date !== undefined ? target_date : existingGoal.target_date,
                achieved,
                goalId,
                userId
            ]
        );

        // Get updated goal
        const updatedGoal = await db.get(
            'SELECT *, ROUND((current_value / target_value) * 100, 2) as progress_percentage FROM goals WHERE id = ?',
            [goalId]
        );

        res.json({
            message: 'Goal updated successfully',
            goal: updatedGoal
        });
    } catch (error) {
        console.error('Update goal error:', error);
        res.status(500).json({ error: 'Failed to update goal' });
    }
});

// Delete goal
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const db = req.db;
        const userId = req.user.id;
        const goalId = req.params.id;

        // Check if goal exists and belongs to user
        const goal = await db.get(
            'SELECT * FROM goals WHERE id = ? AND user_id = ?',
            [goalId, userId]
        );

        if (!goal) {
            return res.status(404).json({ error: 'Goal not found' });
        }

        // Delete goal
        await db.run('DELETE FROM goals WHERE id = ? AND user_id = ?', [goalId, userId]);

        res.json({ message: 'Goal deleted successfully' });
    } catch (error) {
        console.error('Delete goal error:', error);
        res.status(500).json({ error: 'Failed to delete goal' });
    }
});

// Get goal statistics
router.get('/stats', authenticateToken, async (req, res) => {
    try {
        const db = req.db;
        const userId = req.user.id;

        const stats = await db.get(`
            SELECT 
                COUNT(*) as total_goals,
                COUNT(CASE WHEN achieved = 1 THEN 1 END) as achieved_goals,
                COUNT(CASE WHEN achieved = 0 THEN 1 END) as active_goals,
                ROUND(AVG(CASE WHEN achieved = 0 THEN (current_value / target_value) * 100 END), 2) as avg_progress
            FROM goals 
            WHERE user_id = ?
        `, [userId]);

        res.json({ stats });
    } catch (error) {
        console.error('Get goal stats error:', error);
        res.status(500).json({ error: 'Failed to get goal statistics' });
    }
});

module.exports = router;
