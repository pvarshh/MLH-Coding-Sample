const express = require('express');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// ELO rating calculation
const calculateELO = (ratingA, ratingB, scoreA, scoreB) => {
    const K = 32; // K-factor for ELO calculation
    const expectedA = 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
    const expectedB = 1 / (1 + Math.pow(10, (ratingA - ratingB) / 400));
    
    const actualA = scoreA > scoreB ? 1 : scoreA < scoreB ? 0 : 0.5;
    const actualB = scoreB > scoreA ? 1 : scoreB < scoreA ? 0 : 0.5;
    
    const newRatingA = Math.round(ratingA + K * (actualA - expectedA));
    const newRatingB = Math.round(ratingB + K * (actualB - expectedB));
    
    return { newRatingA, newRatingB };
};

// Get rank tier based on ELO
const getRankTier = (elo) => {
    if (elo >= 2000) return 'Diamond';
    if (elo >= 1700) return 'Platinum';
    if (elo >= 1400) return 'Gold';
    if (elo >= 1200) return 'Silver';
    return 'Bronze';
};

// Get user's ranking info
router.get('/profile', authenticateToken, async (req, res) => {
    try {
        const db = req.db;
        const userId = req.user.id;

        // Get or create user ranking
        let ranking = await db.get(
            'SELECT * FROM user_rankings WHERE user_id = ?',
            [userId]
        );

        if (!ranking) {
            const result = await db.run(
                'INSERT INTO user_rankings (user_id) VALUES (?)',
                [userId]
            );
            ranking = await db.get(
                'SELECT * FROM user_rankings WHERE id = ?',
                [result.id]
            );
        }

        // Get user's position in leaderboard
        const position = await db.get(`
            SELECT COUNT(*) + 1 as position 
            FROM user_rankings 
            WHERE elo_rating > ? AND user_id != ?
        `, [ranking.elo_rating, userId]);

        // Get recent matches
        const recentMatches = await db.all(`
            SELECT 
                c.*,
                u1.username as challenger_name,
                u2.username as challenged_name
            FROM challenges c
            JOIN users u1 ON c.challenger_id = u1.id
            JOIN users u2 ON c.challenged_id = u2.id
            WHERE (c.challenger_id = ? OR c.challenged_id = ?) 
            AND c.status = 'completed'
            ORDER BY c.completed_at DESC
            LIMIT 5
        `, [userId, userId]);

        res.json({
            ranking: {
                ...ranking,
                rank_tier: getRankTier(ranking.elo_rating),
                position: position.position
            },
            recentMatches
        });
    } catch (error) {
        console.error('Get ranking profile error:', error);
        res.status(500).json({ error: 'Failed to get ranking profile' });
    }
});

// Get leaderboard
router.get('/leaderboard', authenticateToken, async (req, res) => {
    try {
        const db = req.db;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;

        const leaderboard = await db.all(`
            SELECT 
                ur.*,
                u.username,
                u.email,
                ROW_NUMBER() OVER (ORDER BY ur.elo_rating DESC) as position
            FROM user_rankings ur
            JOIN users u ON ur.user_id = u.id
            ORDER BY ur.elo_rating DESC
            LIMIT ? OFFSET ?
        `, [limit, offset]);

        const totalUsers = await db.get('SELECT COUNT(*) as count FROM user_rankings');

        res.json({
            leaderboard: leaderboard.map(user => ({
                ...user,
                rank_tier: getRankTier(user.elo_rating)
            })),
            pagination: {
                page,
                limit,
                total: totalUsers.count,
                pages: Math.ceil(totalUsers.count / limit)
            }
        });
    } catch (error) {
        console.error('Get leaderboard error:', error);
        res.status(500).json({ error: 'Failed to get leaderboard' });
    }
});

// Create a challenge
router.post('/challenge', authenticateToken, async (req, res) => {
    try {
        const db = req.db;
        const userId = req.user.id;
        const { 
            challenged_username, 
            challenge_type, 
            challenge_title, 
            challenge_description, 
            target_value, 
            duration_days 
        } = req.body;

        // Validate challenge type
        const validTypes = ['workout_count', 'total_reps', 'duration', 'weight_lifted'];
        if (!validTypes.includes(challenge_type)) {
            return res.status(400).json({ error: 'Invalid challenge type' });
        }

        // Find challenged user
        const challengedUser = await db.get(
            'SELECT id FROM users WHERE username = ?',
            [challenged_username]
        );

        if (!challengedUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (challengedUser.id === userId) {
            return res.status(400).json({ error: 'Cannot challenge yourself' });
        }

        // Check if users already have an active challenge
        const existingChallenge = await db.get(`
            SELECT id FROM challenges 
            WHERE ((challenger_id = ? AND challenged_id = ?) OR (challenger_id = ? AND challenged_id = ?))
            AND status IN ('pending', 'active')
        `, [userId, challengedUser.id, challengedUser.id, userId]);

        if (existingChallenge) {
            return res.status(400).json({ error: 'You already have an active challenge with this user' });
        }

        // Create challenge
        const result = await db.run(`
            INSERT INTO challenges (
                challenger_id, challenged_id, challenge_type, challenge_title, 
                challenge_description, target_value, duration_days
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [userId, challengedUser.id, challenge_type, challenge_title, 
            challenge_description, target_value, duration_days]);

        const challenge = await db.get(`
            SELECT 
                c.*,
                u1.username as challenger_name,
                u2.username as challenged_name
            FROM challenges c
            JOIN users u1 ON c.challenger_id = u1.id
            JOIN users u2 ON c.challenged_id = u2.id
            WHERE c.id = ?
        `, [result.id]);

        res.status(201).json({
            message: 'Challenge created successfully',
            challenge
        });
    } catch (error) {
        console.error('Create challenge error:', error);
        res.status(500).json({ error: 'Failed to create challenge' });
    }
});

// Accept/Decline challenge
router.put('/challenge/:id/respond', authenticateToken, async (req, res) => {
    try {
        const db = req.db;
        const userId = req.user.id;
        const challengeId = req.params.id;
        const { response } = req.body; // 'accept' or 'decline'

        const challenge = await db.get(`
            SELECT * FROM challenges 
            WHERE id = ? AND challenged_id = ? AND status = 'pending'
        `, [challengeId, userId]);

        if (!challenge) {
            return res.status(404).json({ error: 'Challenge not found or not pending' });
        }

        if (response === 'accept') {
            // Get both users' ELO ratings
            const [challengerRanking, challengedRanking] = await Promise.all([
                db.get('SELECT * FROM user_rankings WHERE user_id = ?', [challenge.challenger_id]),
                db.get('SELECT * FROM user_rankings WHERE user_id = ?', [challenge.challenged_id])
            ]);

            // Update challenge with ELO ratings and start it
            await db.run(`
                UPDATE challenges 
                SET status = 'active', 
                    started_at = CURRENT_TIMESTAMP,
                    challenger_elo_before = ?,
                    challenged_elo_before = ?
                WHERE id = ?
            `, [challengerRanking?.elo_rating || 1200, challengedRanking?.elo_rating || 1200, challengeId]);

            res.json({ message: 'Challenge accepted successfully' });
        } else if (response === 'decline') {
            await db.run('UPDATE challenges SET status = ? WHERE id = ?', ['cancelled', challengeId]);
            res.json({ message: 'Challenge declined' });
        } else {
            res.status(400).json({ error: 'Invalid response. Use "accept" or "decline"' });
        }
    } catch (error) {
        console.error('Respond to challenge error:', error);
        res.status(500).json({ error: 'Failed to respond to challenge' });
    }
});

// Get user's challenges
router.get('/challenges', authenticateToken, async (req, res) => {
    try {
        const db = req.db;
        const userId = req.user.id;

        const challenges = await db.all(`
            SELECT 
                c.*,
                u1.username as challenger_name,
                u2.username as challenged_name
            FROM challenges c
            JOIN users u1 ON c.challenger_id = u1.id
            JOIN users u2 ON c.challenged_id = u2.id
            WHERE c.challenger_id = ? OR c.challenged_id = ?
            ORDER BY c.created_at DESC
        `, [userId, userId]);

        res.json({ challenges });
    } catch (error) {
        console.error('Get challenges error:', error);
        res.status(500).json({ error: 'Failed to get challenges' });
    }
});

// Complete challenge (called when challenge period ends)
router.post('/challenge/:id/complete', authenticateToken, async (req, res) => {
    try {
        const db = req.db;
        const challengeId = req.params.id;

        const challenge = await db.get(`
            SELECT * FROM challenges 
            WHERE id = ? AND status = 'active'
        `, [challengeId]);

        if (!challenge) {
            return res.status(404).json({ error: 'Active challenge not found' });
        }

        // Calculate results based on challenge type
        let challengerResult = 0;
        let challengedResult = 0;

        const startDate = new Date(challenge.started_at);
        const endDate = new Date(startDate.getTime() + challenge.duration_days * 24 * 60 * 60 * 1000);

        switch (challenge.challenge_type) {
            case 'workout_count':
                const workoutCounts = await db.all(`
                    SELECT 
                        w.user_id,
                        COUNT(*) as count
                    FROM workouts w
                    WHERE w.user_id IN (?, ?) 
                    AND w.date >= ? AND w.date <= ?
                    GROUP BY w.user_id
                `, [challenge.challenger_id, challenge.challenged_id, startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]]);

                challengerResult = workoutCounts.find(w => w.user_id === challenge.challenger_id)?.count || 0;
                challengedResult = workoutCounts.find(w => w.user_id === challenge.challenged_id)?.count || 0;
                break;

            case 'total_reps':
                const repCounts = await db.all(`
                    SELECT 
                        w.user_id,
                        SUM(e.sets * e.reps) as total_reps
                    FROM workouts w
                    JOIN exercises e ON w.id = e.workout_id
                    WHERE w.user_id IN (?, ?) 
                    AND w.date >= ? AND w.date <= ?
                    GROUP BY w.user_id
                `, [challenge.challenger_id, challenge.challenged_id, startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]]);

                challengerResult = repCounts.find(w => w.user_id === challenge.challenger_id)?.total_reps || 0;
                challengedResult = repCounts.find(w => w.user_id === challenge.challenged_id)?.total_reps || 0;
                break;

            case 'duration':
                const durations = await db.all(`
                    SELECT 
                        w.user_id,
                        SUM(w.duration) as total_duration
                    FROM workouts w
                    WHERE w.user_id IN (?, ?) 
                    AND w.date >= ? AND w.date <= ?
                    AND w.duration IS NOT NULL
                    GROUP BY w.user_id
                `, [challenge.challenger_id, challenge.challenged_id, startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]]);

                challengerResult = durations.find(w => w.user_id === challenge.challenger_id)?.total_duration || 0;
                challengedResult = durations.find(w => w.user_id === challenge.challenged_id)?.total_duration || 0;
                break;

            case 'weight_lifted':
                const weights = await db.all(`
                    SELECT 
                        w.user_id,
                        SUM(e.weight * e.sets * e.reps) as total_weight
                    FROM workouts w
                    JOIN exercises e ON w.id = e.workout_id
                    WHERE w.user_id IN (?, ?) 
                    AND w.date >= ? AND w.date <= ?
                    AND e.weight IS NOT NULL
                    GROUP BY w.user_id
                `, [challenge.challenger_id, challenge.challenged_id, startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]]);

                challengerResult = weights.find(w => w.user_id === challenge.challenger_id)?.total_weight || 0;
                challengedResult = weights.find(w => w.user_id === challenge.challenged_id)?.total_weight || 0;
                break;
        }

        // Determine winner
        let winnerId = null;
        if (challengerResult > challengedResult) {
            winnerId = challenge.challenger_id;
        } else if (challengedResult > challengerResult) {
            winnerId = challenge.challenged_id;
        }

        // Calculate new ELO ratings
        const { newRatingA: challengerNewElo, newRatingB: challengedNewElo } = calculateELO(
            challenge.challenger_elo_before,
            challenge.challenged_elo_before,
            challengerResult,
            challengedResult
        );

        // Update challenge with results
        await db.run(`
            UPDATE challenges 
            SET status = 'completed',
                completed_at = CURRENT_TIMESTAMP,
                winner_id = ?,
                challenger_result = ?,
                challenged_result = ?,
                challenger_elo_after = ?,
                challenged_elo_after = ?
            WHERE id = ?
        `, [winnerId, challengerResult, challengedResult, challengerNewElo, challengedNewElo, challengeId]);

        // Update user rankings
        await Promise.all([
            db.run(`
                UPDATE user_rankings 
                SET elo_rating = ?,
                    wins = wins + ?,
                    losses = losses + ?,
                    draws = draws + ?,
                    total_matches = total_matches + 1,
                    current_streak = CASE 
                        WHEN ? = user_id THEN current_streak + 1
                        ELSE 0
                    END,
                    best_streak = CASE 
                        WHEN ? = user_id AND current_streak + 1 > best_streak THEN current_streak + 1
                        ELSE best_streak
                    END,
                    rank_tier = ?,
                    last_match_date = CURRENT_TIMESTAMP,
                    updated_at = CURRENT_TIMESTAMP
                WHERE user_id = ?
            `, [
                challengerNewElo,
                winnerId === challenge.challenger_id ? 1 : 0,
                winnerId === challenge.challenged_id ? 1 : 0,
                winnerId === null ? 1 : 0,
                winnerId,
                winnerId,
                getRankTier(challengerNewElo),
                challenge.challenger_id
            ]),
            db.run(`
                UPDATE user_rankings 
                SET elo_rating = ?,
                    wins = wins + ?,
                    losses = losses + ?,
                    draws = draws + ?,
                    total_matches = total_matches + 1,
                    current_streak = CASE 
                        WHEN ? = user_id THEN current_streak + 1
                        ELSE 0
                    END,
                    best_streak = CASE 
                        WHEN ? = user_id AND current_streak + 1 > best_streak THEN current_streak + 1
                        ELSE best_streak
                    END,
                    rank_tier = ?,
                    last_match_date = CURRENT_TIMESTAMP,
                    updated_at = CURRENT_TIMESTAMP
                WHERE user_id = ?
            `, [
                challengedNewElo,
                winnerId === challenge.challenged_id ? 1 : 0,
                winnerId === challenge.challenger_id ? 1 : 0,
                winnerId === null ? 1 : 0,
                winnerId,
                winnerId,
                getRankTier(challengedNewElo),
                challenge.challenged_id
            ])
        ]);

        res.json({
            message: 'Challenge completed successfully',
            result: {
                challengerResult,
                challengedResult,
                winner: winnerId,
                challengerNewElo,
                challengedNewElo
            }
        });
    } catch (error) {
        console.error('Complete challenge error:', error);
        res.status(500).json({ error: 'Failed to complete challenge' });
    }
});

// Get challenge statistics
router.get('/stats', authenticateToken, async (req, res) => {
    try {
        const db = req.db;

        // Get ranking distribution
        const rankDistribution = await db.all(`
            SELECT 
                CASE 
                    WHEN elo_rating >= 2000 THEN 'Diamond'
                    WHEN elo_rating >= 1700 THEN 'Platinum'
                    WHEN elo_rating >= 1400 THEN 'Gold'
                    WHEN elo_rating >= 1200 THEN 'Silver'
                    ELSE 'Bronze'
                END as rank_tier,
                COUNT(*) as count
            FROM user_rankings
            GROUP BY rank_tier
            ORDER BY MIN(elo_rating) DESC
        `);

        // Get most active challengers
        const topChallengers = await db.all(`
            SELECT 
                u.username,
                ur.elo_rating,
                ur.wins,
                ur.losses,
                ur.draws,
                ur.total_matches,
                ur.current_streak,
                ur.best_streak,
                ur.rank_tier
            FROM user_rankings ur
            JOIN users u ON ur.user_id = u.id
            WHERE ur.total_matches > 0
            ORDER BY ur.total_matches DESC, ur.elo_rating DESC
            LIMIT 10
        `);

        // Get recent completed challenges
        const recentChallenges = await db.all(`
            SELECT 
                c.*,
                u1.username as challenger_name,
                u2.username as challenged_name,
                winner.username as winner_name
            FROM challenges c
            JOIN users u1 ON c.challenger_id = u1.id
            JOIN users u2 ON c.challenged_id = u2.id
            LEFT JOIN users winner ON c.winner_id = winner.id
            WHERE c.status = 'completed'
            ORDER BY c.completed_at DESC
            LIMIT 10
        `);

        res.json({
            rankDistribution,
            topChallengers,
            recentChallenges
        });
    } catch (error) {
        console.error('Get ranking stats error:', error);
        res.status(500).json({ error: 'Failed to get ranking statistics' });
    }
});

module.exports = router;
