const Database = require('./database/database');

async function seedDatabase() {
    console.log('🌱 Seeding database with demo data...');
    
    const db = new Database();
    
    try {
        // Wait for database to initialize
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Create a demo user
        const bcrypt = require('bcrypt');
        const hashedPassword = await bcrypt.hash('demo123', 10);
        
        const userResult = await db.run(
            'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
            ['demouser', 'demo@example.com', hashedPassword]
        );
        
        const userId = userResult.id;
        console.log(`✅ Created demo user with ID: ${userId}`);
        
        // Create demo workouts
        const workouts = [
            {
                name: 'Morning Cardio',
                date: '2024-01-15',
                duration: 30,
                notes: 'Great start to the day!',
                exercises: [
                    { name: 'Running', sets: 1, reps: 30, weight: null },
                    { name: 'Burpees', sets: 3, reps: 10, weight: null }
                ]
            },
            {
                name: 'Strength Training',
                date: '2024-01-14',
                duration: 45,
                notes: 'Upper body focus',
                exercises: [
                    { name: 'Push-ups', sets: 3, reps: 15, weight: null },
                    { name: 'Bench Press', sets: 3, reps: 10, weight: 135 },
                    { name: 'Bicep Curls', sets: 3, reps: 12, weight: 25 }
                ]
            },
            {
                name: 'Leg Day',
                date: '2024-01-13',
                duration: 50,
                notes: 'Intense leg workout',
                exercises: [
                    { name: 'Squats', sets: 4, reps: 12, weight: 185 },
                    { name: 'Lunges', sets: 3, reps: 10, weight: 50 },
                    { name: 'Deadlifts', sets: 3, reps: 8, weight: 205 }
                ]
            }
        ];
        
        for (const workout of workouts) {
            const workoutResult = await db.run(
                'INSERT INTO workouts (user_id, name, date, duration, notes) VALUES (?, ?, ?, ?, ?)',
                [userId, workout.name, workout.date, workout.duration, workout.notes]
            );
            
            for (const exercise of workout.exercises) {
                await db.run(
                    'INSERT INTO exercises (workout_id, name, sets, reps, weight) VALUES (?, ?, ?, ?, ?)',
                    [workoutResult.id, exercise.name, exercise.sets, exercise.reps, exercise.weight]
                );
            }
        }
        
        console.log(`✅ Created ${workouts.length} demo workouts`);
        
        // Create demo goals
        const goals = [
            {
                title: 'Lose 10 pounds',
                description: 'Weight loss goal for summer',
                target_value: 10,
                current_value: 3,
                unit: 'lbs',
                target_date: '2024-06-01'
            },
            {
                title: 'Run 5K',
                description: 'Complete a 5K run without stopping',
                target_value: 5,
                current_value: 2.5,
                unit: 'km',
                target_date: '2024-03-15'
            },
            {
                title: 'Bench Press 200 lbs',
                description: 'Increase bench press strength',
                target_value: 200,
                current_value: 135,
                unit: 'lbs',
                target_date: '2024-07-01'
            }
        ];
        
        for (const goal of goals) {
            await db.run(
                'INSERT INTO goals (user_id, title, description, target_value, current_value, unit, target_date) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [userId, goal.title, goal.description, goal.target_value, goal.current_value, goal.unit, goal.target_date]
            );
        }
        
        console.log(`✅ Created ${goals.length} demo goals`);
        
        console.log('🎉 Database seeding completed successfully!');
        console.log('');
        console.log('Demo credentials:');
        console.log('  Username: demouser');
        console.log('  Email: demo@example.com');
        console.log('  Password: demo123');
        
    } catch (error) {
        console.error('❌ Error seeding database:', error);
    } finally {
        await db.close();
        process.exit(0);
    }
}

// Run the seeder
seedDatabase();
