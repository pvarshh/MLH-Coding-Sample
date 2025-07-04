// Global variables
let currentUser = null;
let authToken = null;
let currentWorkoutId = null;
let currentGoalId = null;

// DOM elements
const loadingScreen = document.getElementById('loading-screen');
const authScreen = document.getElementById('auth-screen');
const mainApp = document.getElementById('main-app');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const logoutBtn = document.getElementById('logout-btn');
const userWelcome = document.getElementById('user-welcome');

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupEventListeners();
});

// Initialize application
function initializeApp() {
    // Check for stored auth token
    const storedToken = localStorage.getItem('fitness_token');
    const storedUser = localStorage.getItem('fitness_user');
    
    if (storedToken && storedUser) {
        authToken = storedToken;
        currentUser = JSON.parse(storedUser);
        showMainApp();
    } else {
        setTimeout(() => {
            loadingScreen.classList.add('hidden');
            authScreen.classList.remove('hidden');
        }, 1500);
    }
}

// Setup event listeners
function setupEventListeners() {
    // Authentication forms
    loginForm.addEventListener('submit', handleLogin);
    registerForm.addEventListener('submit', handleRegister);
    logoutBtn.addEventListener('click', handleLogout);

    // Navigation
    document.querySelectorAll('.nav-button').forEach(button => {
        button.addEventListener('click', (e) => {
            const section = e.target.dataset.section;
            showSection(section);
        });
    });

    // Modal buttons
    document.getElementById('add-workout-btn').addEventListener('click', () => {
        currentWorkoutId = null;
        showModal('workout-modal');
        document.getElementById('workout-modal-title').textContent = 'Add Workout';
        document.getElementById('workout-form').reset();
        document.getElementById('exercises-container').innerHTML = '';
    });

    document.getElementById('add-goal-btn').addEventListener('click', () => {
        currentGoalId = null;
        showModal('goal-modal');
        document.getElementById('goal-modal-title').textContent = 'Add Goal';
        document.getElementById('goal-form').reset();
    });

    // Forms
    document.getElementById('workout-form').addEventListener('submit', handleWorkoutSubmit);
    document.getElementById('goal-form').addEventListener('submit', handleGoalSubmit);
    document.getElementById('add-exercise-btn').addEventListener('click', addExerciseField);

    // Modal close buttons
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            closeModal(modal.id);
        });
    });

    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeModal(e.target.id);
        }
    });
}

// Authentication functions
async function handleLogin(e) {
    e.preventDefault();
    const formData = new FormData(loginForm);
    const credentials = {
        username: formData.get('username'),
        password: formData.get('password')
    };

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(credentials)
        });

        const data = await response.json();

        if (response.ok) {
            authToken = data.token;
            currentUser = data.user;
            localStorage.setItem('fitness_token', authToken);
            localStorage.setItem('fitness_user', JSON.stringify(currentUser));
            showMainApp();
        } else {
            showMessage(data.error, 'error');
        }
    } catch (error) {
        showMessage('Login failed. Please try again.', 'error');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const formData = new FormData(registerForm);
    const userData = {
        username: formData.get('username'),
        email: formData.get('email'),
        password: formData.get('password')
    };

    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        const data = await response.json();

        if (response.ok) {
            authToken = data.token;
            currentUser = data.user;
            localStorage.setItem('fitness_token', authToken);
            localStorage.setItem('fitness_user', JSON.stringify(currentUser));
            showMainApp();
        } else {
            showMessage(data.error, 'error');
        }
    } catch (error) {
        showMessage('Registration failed. Please try again.', 'error');
    }
}

function handleLogout() {
    authToken = null;
    currentUser = null;
    localStorage.removeItem('fitness_token');
    localStorage.removeItem('fitness_user');
    
    mainApp.classList.add('hidden');
    authScreen.classList.remove('hidden');
    showLogin();
}

// UI Helper functions
function showMainApp() {
    loadingScreen.classList.add('hidden');
    authScreen.classList.add('hidden');
    mainApp.classList.remove('hidden');
    userWelcome.textContent = `Welcome, ${currentUser.username}!`;
    loadDashboard();
}

function showLogin() {
    document.getElementById('login-tab').classList.add('active');
    document.getElementById('register-tab').classList.remove('active');
    document.getElementById('login-form').classList.remove('hidden');
    document.getElementById('register-form').classList.add('hidden');
}

function showRegister() {
    document.getElementById('register-tab').classList.add('active');
    document.getElementById('login-tab').classList.remove('active');
    document.getElementById('register-form').classList.remove('hidden');
    document.getElementById('login-form').classList.add('hidden');
}

function showSection(sectionName) {
    // Update navigation
    document.querySelectorAll('.nav-button').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');

    // Update sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionName).classList.add('active');

    // Load section data
    switch(sectionName) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'workouts':
            loadWorkouts();
            break;
        case 'goals':
            loadGoals();
            break;
        case 'stats':
            loadStats();
            break;
    }
}

function showModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function showMessage(message, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    // Insert at the top of the current form
    const activeForm = document.querySelector('.auth-form:not(.hidden)');
    if (activeForm) {
        activeForm.insertBefore(messageDiv, activeForm.firstChild);
        setTimeout(() => messageDiv.remove(), 5000);
    }
}

// API Helper functions
async function apiRequest(endpoint, options = {}) {
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
        }
    };

    const mergedOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers
        }
    };

    try {
        const response = await fetch(endpoint, mergedOptions);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Request failed');
        }
        
        return data;
    } catch (error) {
        console.error('API request failed:', error);
        throw error;
    }
}

// Dashboard functions
async function loadDashboard() {
    try {
        const [workouts, goals, stats] = await Promise.all([
            apiRequest('/api/workouts'),
            apiRequest('/api/goals'),
            apiRequest('/api/stats/consistency')
        ]);

        // Update dashboard stats
        document.getElementById('total-workouts').textContent = workouts.workouts.length;
        document.getElementById('current-streak').textContent = stats.currentStreak;
        
        // Calculate weekly workouts
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const weeklyWorkouts = workouts.workouts.filter(w => 
            new Date(w.date) >= oneWeekAgo
        ).length;
        document.getElementById('weekly-workouts').textContent = weeklyWorkouts;

        // Count active goals
        const activeGoals = goals.goals.filter(g => !g.achieved).length;
        document.getElementById('active-goals').textContent = activeGoals;

        // Display recent workouts
        displayRecentWorkouts(workouts.workouts.slice(0, 5));
        
        // Display goal progress
        displayGoalProgress(goals.goals.slice(0, 5));
    } catch (error) {
        console.error('Failed to load dashboard:', error);
    }
}

function displayRecentWorkouts(workouts) {
    const container = document.getElementById('recent-workouts-list');
    
    if (workouts.length === 0) {
        container.innerHTML = '<p class="empty-state">No workouts yet. <a href="#" onclick="showSection(\'workouts\')">Add your first workout!</a></p>';
        return;
    }

    container.innerHTML = workouts.map(workout => `
        <div class="workout-item">
            <div class="workout-header">
                <h4 class="workout-title">${workout.name}</h4>
                <span class="workout-date">${formatDate(workout.date)}</span>
            </div>
            <div class="workout-stats">
                <span class="stat">
                    <i class="fas fa-clock"></i> ${workout.duration || 'N/A'} min
                </span>
                <span class="stat">
                    <i class="fas fa-dumbbell"></i> ${workout.exercise_count || 0} exercises
                </span>
            </div>
        </div>
    `).join('');
}

function displayGoalProgress(goals) {
    const container = document.getElementById('goal-progress-list');
    
    if (goals.length === 0) {
        container.innerHTML = '<p class="empty-state">No goals set. <a href="#" onclick="showSection(\'goals\')">Set your first goal!</a></p>';
        return;
    }

    container.innerHTML = goals.map(goal => {
        const progress = (goal.current_value / goal.target_value) * 100;
        return `
            <div class="goal-item">
                <div class="goal-header">
                    <h4 class="goal-title">${goal.title}</h4>
                    <span class="goal-progress-text">${progress.toFixed(1)}%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${Math.min(progress, 100)}%"></div>
                </div>
                <p class="goal-stats">${goal.current_value} / ${goal.target_value} ${goal.unit}</p>
            </div>
        `;
    }).join('');
}

// Workout functions
async function loadWorkouts() {
    try {
        const data = await apiRequest('/api/workouts');
        displayWorkouts(data.workouts);
    } catch (error) {
        console.error('Failed to load workouts:', error);
    }
}

function displayWorkouts(workouts) {
    const container = document.getElementById('workouts-list');
    
    if (workouts.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-dumbbell"></i>
                <h3>No workouts yet</h3>
                <p>Start tracking your fitness journey by adding your first workout!</p>
                <button class="btn btn-primary" onclick="document.getElementById('add-workout-btn').click()">
                    <i class="fas fa-plus"></i> Add Workout
                </button>
            </div>
        `;
        return;
    }

    container.innerHTML = workouts.map(workout => `
        <div class="workout-item">
            <div class="workout-header">
                <h3 class="workout-title">${workout.name}</h3>
                <span class="workout-date">${formatDate(workout.date)}</span>
            </div>
            <div class="workout-stats">
                <span class="stat">
                    <i class="fas fa-clock"></i> ${workout.duration || 'N/A'} min
                </span>
                <span class="stat">
                    <i class="fas fa-dumbbell"></i> ${workout.exercise_count || 0} exercises
                </span>
                <span class="stat">
                    <i class="fas fa-chart-line"></i> ${workout.total_volume || 0} total reps
                </span>
            </div>
            ${workout.notes ? `<p class="workout-notes">${workout.notes}</p>` : ''}
            <div class="action-buttons">
                <button class="btn btn-secondary btn-small" onclick="editWorkout(${workout.id})">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn btn-danger btn-small" onclick="deleteWorkout(${workout.id})">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `).join('');
}

async function handleWorkoutSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const exercises = [];
    
    // Collect exercise data
    document.querySelectorAll('.exercise-item').forEach(item => {
        const name = item.querySelector('.exercise-name').textContent;
        const sets = item.querySelector('input[placeholder="Sets"]').value;
        const reps = item.querySelector('input[placeholder="Reps"]').value;
        const weight = item.querySelector('input[placeholder="Weight"]').value;
        
        if (name && sets && reps) {
            exercises.push({
                name,
                sets: parseInt(sets),
                reps: parseInt(reps),
                weight: weight ? parseFloat(weight) : null
            });
        }
    });

    const workoutData = {
        name: formData.get('name') || document.getElementById('workout-name').value,
        date: formData.get('date') || document.getElementById('workout-date').value,
        duration: formData.get('duration') || document.getElementById('workout-duration').value,
        notes: formData.get('notes') || document.getElementById('workout-notes').value,
        exercises
    };

    try {
        if (currentWorkoutId) {
            await apiRequest(`/api/workouts/${currentWorkoutId}`, {
                method: 'PUT',
                body: JSON.stringify(workoutData)
            });
        } else {
            await apiRequest('/api/workouts', {
                method: 'POST',
                body: JSON.stringify(workoutData)
            });
        }
        
        closeModal('workout-modal');
        loadWorkouts();
        if (document.querySelector('.nav-button.active').dataset.section === 'dashboard') {
            loadDashboard();
        }
    } catch (error) {
        alert('Failed to save workout. Please try again.');
    }
}

async function editWorkout(workoutId) {
    try {
        const data = await apiRequest(`/api/workouts/${workoutId}`);
        const workout = data.workout;
        
        currentWorkoutId = workoutId;
        document.getElementById('workout-modal-title').textContent = 'Edit Workout';
        document.getElementById('workout-name').value = workout.name;
        document.getElementById('workout-date').value = workout.date;
        document.getElementById('workout-duration').value = workout.duration || '';
        document.getElementById('workout-notes').value = workout.notes || '';
        
        // Populate exercises
        const container = document.getElementById('exercises-container');
        container.innerHTML = '';
        
        workout.exercises.forEach(exercise => {
            addExerciseField(exercise);
        });
        
        showModal('workout-modal');
    } catch (error) {
        alert('Failed to load workout data.');
    }
}

async function deleteWorkout(workoutId) {
    if (confirm('Are you sure you want to delete this workout?')) {
        try {
            await apiRequest(`/api/workouts/${workoutId}`, {
                method: 'DELETE'
            });
            loadWorkouts();
            if (document.querySelector('.nav-button.active').dataset.section === 'dashboard') {
                loadDashboard();
            }
        } catch (error) {
            alert('Failed to delete workout.');
        }
    }
}

function addExerciseField(exerciseData = null) {
    const container = document.getElementById('exercises-container');
    const exerciseDiv = document.createElement('div');
    exerciseDiv.className = 'exercise-item';
    
    exerciseDiv.innerHTML = `
        <div class="exercise-header">
            <input type="text" class="exercise-name" placeholder="Exercise name" 
                   value="${exerciseData?.name || ''}" required>
            <span class="remove-exercise" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </span>
        </div>
        <div class="exercise-inputs">
            <input type="number" placeholder="Sets" min="1" 
                   value="${exerciseData?.sets || ''}" required>
            <input type="number" placeholder="Reps" min="1" 
                   value="${exerciseData?.reps || ''}" required>
            <input type="number" placeholder="Weight" min="0" step="0.5" 
                   value="${exerciseData?.weight || ''}">
        </div>
    `;
    
    container.appendChild(exerciseDiv);
}

// Goal functions
async function loadGoals() {
    try {
        const data = await apiRequest('/api/goals');
        displayGoals(data.goals);
    } catch (error) {
        console.error('Failed to load goals:', error);
    }
}

function displayGoals(goals) {
    const container = document.getElementById('goals-list');
    
    if (goals.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-target"></i>
                <h3>No goals set</h3>
                <p>Set your first fitness goal to stay motivated!</p>
                <button class="btn btn-primary" onclick="document.getElementById('add-goal-btn').click()">
                    <i class="fas fa-plus"></i> Add Goal
                </button>
            </div>
        `;
        return;
    }

    container.innerHTML = goals.map(goal => {
        const progress = (goal.current_value / goal.target_value) * 100;
        const isAchieved = goal.achieved;
        
        return `
            <div class="goal-item ${isAchieved ? 'achieved' : ''}">
                <div class="goal-header">
                    <h3 class="goal-title">${goal.title}</h3>
                    <span class="goal-progress-text">${progress.toFixed(1)}%</span>
                </div>
                ${goal.description ? `<p class="goal-description">${goal.description}</p>` : ''}
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${Math.min(progress, 100)}%"></div>
                </div>
                <div class="goal-stats">
                    <span class="stat">
                        <i class="fas fa-chart-line"></i> ${goal.current_value} / ${goal.target_value} ${goal.unit}
                    </span>
                    ${goal.target_date ? `<span class="stat">
                        <i class="fas fa-calendar"></i> ${formatDate(goal.target_date)}
                    </span>` : ''}
                    ${isAchieved ? '<span class="stat achieved-badge"><i class="fas fa-check"></i> Achieved!</span>' : ''}
                </div>
                <div class="action-buttons">
                    <button class="btn btn-secondary btn-small" onclick="editGoal(${goal.id})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-danger btn-small" onclick="deleteGoal(${goal.id})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

async function handleGoalSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const goalData = {
        title: formData.get('title') || document.getElementById('goal-title').value,
        description: formData.get('description') || document.getElementById('goal-description').value,
        target_value: parseFloat(formData.get('target_value') || document.getElementById('goal-target').value),
        current_value: parseFloat(formData.get('current_value') || document.getElementById('goal-current').value),
        unit: formData.get('unit') || document.getElementById('goal-unit').value,
        target_date: formData.get('target_date') || document.getElementById('goal-date').value
    };

    try {
        if (currentGoalId) {
            await apiRequest(`/api/goals/${currentGoalId}`, {
                method: 'PUT',
                body: JSON.stringify(goalData)
            });
        } else {
            await apiRequest('/api/goals', {
                method: 'POST',
                body: JSON.stringify(goalData)
            });
        }
        
        closeModal('goal-modal');
        loadGoals();
        if (document.querySelector('.nav-button.active').dataset.section === 'dashboard') {
            loadDashboard();
        }
    } catch (error) {
        alert('Failed to save goal. Please try again.');
    }
}

async function editGoal(goalId) {
    try {
        const data = await apiRequest('/api/goals');
        const goal = data.goals.find(g => g.id === goalId);
        
        if (!goal) return;
        
        currentGoalId = goalId;
        document.getElementById('goal-modal-title').textContent = 'Edit Goal';
        document.getElementById('goal-title').value = goal.title;
        document.getElementById('goal-description').value = goal.description || '';
        document.getElementById('goal-target').value = goal.target_value;
        document.getElementById('goal-current').value = goal.current_value;
        document.getElementById('goal-unit').value = goal.unit;
        document.getElementById('goal-date').value = goal.target_date || '';
        
        showModal('goal-modal');
    } catch (error) {
        alert('Failed to load goal data.');
    }
}

async function deleteGoal(goalId) {
    if (confirm('Are you sure you want to delete this goal?')) {
        try {
            await apiRequest(`/api/goals/${goalId}`, {
                method: 'DELETE'
            });
            loadGoals();
            if (document.querySelector('.nav-button.active').dataset.section === 'dashboard') {
                loadDashboard();
            }
        } catch (error) {
            alert('Failed to delete goal.');
        }
    }
}

// Statistics functions
async function loadStats() {
    try {
        const data = await apiRequest('/api/stats');
        displayStats(data);
    } catch (error) {
        console.error('Failed to load statistics:', error);
    }
}

function displayStats(data) {
    // Create monthly workout chart
    const monthlyCtx = document.getElementById('monthly-chart').getContext('2d');
    new Chart(monthlyCtx, {
        type: 'line',
        data: {
            labels: data.monthlyTrend.map(item => item.month),
            datasets: [{
                label: 'Workouts per Month',
                data: data.monthlyTrend.map(item => item.workout_count),
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Monthly Workout Trend'
                }
            }
        }
    });

    // Create popular exercises chart
    const exerciseCtx = document.getElementById('exercise-chart').getContext('2d');
    new Chart(exerciseCtx, {
        type: 'bar',
        data: {
            labels: data.popularExercises.slice(0, 5).map(ex => ex.name),
            datasets: [{
                label: 'Exercise Frequency',
                data: data.popularExercises.slice(0, 5).map(ex => ex.frequency),
                backgroundColor: '#667eea'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Most Popular Exercises'
                }
            }
        }
    });
}

// Utility functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Set today's date as default for new workouts
document.addEventListener('DOMContentLoaded', () => {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('workout-date').value = today;
});
