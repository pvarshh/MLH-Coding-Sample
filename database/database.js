const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class Database {
    constructor() {
        this.db = new sqlite3.Database(path.join(__dirname, 'fitness.db'), (err) => {
            if (err) {
                console.error('Error opening database:', err);
            } else {
                console.log('📊 Connected to SQLite database');
                this.initializeTables();
            }
        });
    }

    initializeTables() {
        // Users table
        this.db.run(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Workouts table
        this.db.run(`
            CREATE TABLE IF NOT EXISTS workouts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                name TEXT NOT NULL,
                date DATE NOT NULL,
                duration INTEGER, -- in minutes
                notes TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        `);

        // Exercises table
        this.db.run(`
            CREATE TABLE IF NOT EXISTS exercises (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                workout_id INTEGER NOT NULL,
                name TEXT NOT NULL,
                sets INTEGER NOT NULL,
                reps INTEGER NOT NULL,
                weight REAL, -- in pounds/kg
                rest_time INTEGER, -- in seconds
                notes TEXT,
                FOREIGN KEY (workout_id) REFERENCES workouts (id)
            )
        `);

        // Goals table
        this.db.run(`
            CREATE TABLE IF NOT EXISTS goals (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                title TEXT NOT NULL,
                description TEXT,
                target_value REAL NOT NULL,
                current_value REAL DEFAULT 0,
                unit TEXT NOT NULL, -- 'lbs', 'kg', 'minutes', 'reps', etc.
                target_date DATE,
                achieved BOOLEAN DEFAULT FALSE,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        `);

        // Exercise templates (predefined exercises)
        this.db.run(`
            CREATE TABLE IF NOT EXISTS exercise_templates (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                category TEXT NOT NULL, -- 'strength', 'cardio', 'flexibility'
                muscle_group TEXT NOT NULL,
                description TEXT,
                instructions TEXT
            )
        `, (err) => {
            if (err) {
                console.error('Error creating exercise_templates table:', err);
            } else {
                // Populate exercise templates after table is created
                this.populateExerciseTemplates();
            }
        });
    }

    populateExerciseTemplates() {
        const exercises = [
            ['Push-ups', 'strength', 'chest', 'Bodyweight chest exercise', 'Start in plank position, lower body to ground, push back up'],
            ['Squats', 'strength', 'legs', 'Bodyweight leg exercise', 'Stand with feet hip-width apart, lower hips back and down, return to standing'],
            ['Plank', 'strength', 'core', 'Core strengthening exercise', 'Hold body in straight line from head to heels'],
            ['Burpees', 'cardio', 'full-body', 'Full-body cardio exercise', 'Squat, jump back to plank, jump feet forward, jump up'],
            ['Lunges', 'strength', 'legs', 'Single-leg strength exercise', 'Step forward into lunge position, return to standing'],
            ['Mountain Climbers', 'cardio', 'core', 'Cardio core exercise', 'In plank position, alternate bringing knees to chest'],
            ['Deadlifts', 'strength', 'back', 'Hip-hinge strength exercise', 'Lift weight from ground by extending hips and knees'],
            ['Bench Press', 'strength', 'chest', 'Chest pressing exercise', 'Lie on bench, lower barbell to chest, press back up'],
            ['Running', 'cardio', 'legs', 'Cardiovascular exercise', 'Run at steady pace for desired duration'],
            ['Bicep Curls', 'strength', 'arms', 'Arm strengthening exercise', 'Curl weights up to shoulders, lower with control']
        ];

        exercises.forEach(exercise => {
            this.db.run(`
                INSERT OR IGNORE INTO exercise_templates (name, category, muscle_group, description, instructions)
                VALUES (?, ?, ?, ?, ?)
            `, exercise);
        });
    }

    // Generic query methods
    get(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.get(sql, params, (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }

    all(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    run(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function(err) {
                if (err) reject(err);
                else resolve({ id: this.lastID, changes: this.changes });
            });
        });
    }

    close() {
        return new Promise((resolve, reject) => {
            this.db.close((err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    }
}

module.exports = Database;
