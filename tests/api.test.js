const request = require('supertest');
const app = require('../server');

describe('Fitness Tracker API', () => {
    let authToken;
    let userId;

    // Test user registration
    describe('POST /api/auth/register', () => {
        it('should register a new user', async () => {
            const userData = {
                username: 'testuser',
                email: 'test@example.com',
                password: 'password123'
            };

            const response = await request(app)
                .post('/api/auth/register')
                .send(userData)
                .expect(201);

            expect(response.body.user.username).toBe(userData.username);
            expect(response.body.user.email).toBe(userData.email);
            expect(response.body.token).toBeDefined();
            
            authToken = response.body.token;
            userId = response.body.user.id;
        });

        it('should not register user with existing email', async () => {
            const userData = {
                username: 'testuser2',
                email: 'test@example.com',
                password: 'password123'
            };

            await request(app)
                .post('/api/auth/register')
                .send(userData)
                .expect(400);
        });
    });

    // Test user login
    describe('POST /api/auth/login', () => {
        it('should login with valid credentials', async () => {
            const credentials = {
                username: 'testuser',
                password: 'password123'
            };

            const response = await request(app)
                .post('/api/auth/login')
                .send(credentials)
                .expect(200);

            expect(response.body.user.username).toBe(credentials.username);
            expect(response.body.token).toBeDefined();
        });

        it('should not login with invalid credentials', async () => {
            const credentials = {
                username: 'testuser',
                password: 'wrongpassword'
            };

            await request(app)
                .post('/api/auth/login')
                .send(credentials)
                .expect(401);
        });
    });

    // Test workout creation
    describe('POST /api/workouts', () => {
        it('should create a new workout', async () => {
            const workoutData = {
                name: 'Morning Cardio',
                date: '2024-01-15',
                duration: 30,
                notes: 'Great workout!',
                exercises: [
                    {
                        name: 'Push-ups',
                        sets: 3,
                        reps: 15,
                        weight: null
                    },
                    {
                        name: 'Squats',
                        sets: 3,
                        reps: 20,
                        weight: null
                    }
                ]
            };

            const response = await request(app)
                .post('/api/workouts')
                .set('Authorization', `Bearer ${authToken}`)
                .send(workoutData)
                .expect(201);

            expect(response.body.workout.name).toBe(workoutData.name);
            expect(response.body.workout.exercises).toHaveLength(2);
        });

        it('should not create workout without authentication', async () => {
            const workoutData = {
                name: 'Test Workout',
                date: '2024-01-15'
            };

            await request(app)
                .post('/api/workouts')
                .send(workoutData)
                .expect(401);
        });
    });

    // Test goal creation
    describe('POST /api/goals', () => {
        it('should create a new goal', async () => {
            const goalData = {
                title: 'Lose 10 pounds',
                description: 'Weight loss goal for summer',
                target_value: 10,
                unit: 'lbs',
                target_date: '2024-06-01'
            };

            const response = await request(app)
                .post('/api/goals')
                .set('Authorization', `Bearer ${authToken}`)
                .send(goalData)
                .expect(201);

            expect(response.body.goal.title).toBe(goalData.title);
            expect(response.body.goal.target_value).toBe(goalData.target_value);
        });
    });

    // Test getting user workouts
    describe('GET /api/workouts', () => {
        it('should get user workouts', async () => {
            const response = await request(app)
                .get('/api/workouts')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.workouts).toBeDefined();
            expect(Array.isArray(response.body.workouts)).toBe(true);
        });
    });

    // Test getting user goals
    describe('GET /api/goals', () => {
        it('should get user goals', async () => {
            const response = await request(app)
                .get('/api/goals')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.goals).toBeDefined();
            expect(Array.isArray(response.body.goals)).toBe(true);
        });
    });

    // Test getting statistics
    describe('GET /api/stats', () => {
        it('should get user statistics', async () => {
            const response = await request(app)
                .get('/api/stats')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.workoutStats).toBeDefined();
            expect(response.body.popularExercises).toBeDefined();
        });
    });
});

// Clean up test database after tests
afterAll(async () => {
    // Close database connection
    if (app.db) {
        await app.db.close();
    }
});
