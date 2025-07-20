// Axios configuration
axios.defaults.baseURL = '/api';

// Set up axios interceptor for JWT token
axios.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    error => Promise.reject(error)
);

// Login Component
const LoginComponent = {
    template: `
        <div class="row justify-content-center">
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header">
                        <h4><i class="bi bi-box-arrow-in-right"></i> Login</h4>
                    </div>
                    <div class="card-body">
                        <form @submit.prevent="login">
                            <div class="mb-3">
                                <label for="email" class="form-label">Email</label>
                                <input type="email" class="form-control" v-model="form.email" required>
                            </div>
                            <div class="mb-3">
                                <label for="password" class="form-label">Password</label>
                                <input type="password" class="form-control" v-model="form.password" required>
                            </div>
                            <div v-if="error" class="alert alert-danger">{{ error }}</div>
                            <button type="submit" class="btn btn-primary w-100" :disabled="loading">
                                <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                                Login
                            </button>
                        </form>
                        <div class="text-center mt-3">
                            <p>Don't have an account? <a href="#" @click="$emit('switch-to-register')">Register here</a></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            form: {
                email: '',
                password: ''
            },
            loading: false,
            error: ''
        };
    },
    methods: {
        async login() {
            this.loading = true;
            this.error = '';
            
            try {
                const response = await axios.post('/auth/login', this.form);
                localStorage.setItem('token', response.data.access_token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                this.$emit('login-success', response.data.user);
            } catch (error) {
                this.error = error.response?.data?.message || 'Login failed. Please try again.';
            } finally {
                this.loading = false;
            }
        }
    }
};

// Register Component
const RegisterComponent = {
    template: `
        <div class="row justify-content-center">
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header">
                        <h4><i class="bi bi-person-plus"></i> Register</h4>
                    </div>
                    <div class="card-body">
                        <form @submit.prevent="register">
                            <div class="mb-3">
                                <label for="full_name" class="form-label">Full Name</label>
                                <input type="text" class="form-control" v-model="form.full_name" required>
                            </div>
                            <div class="mb-3">
                                <label for="email" class="form-label">Email</label>
                                <input type="email" class="form-control" v-model="form.email" required>
                            </div>
                            <div class="mb-3">
                                <label for="password" class="form-label">Password</label>
                                <input type="password" class="form-control" v-model="form.password" required>
                            </div>
                            <div class="mb-3">
                                <label for="confirm_password" class="form-label">Confirm Password</label>
                                <input type="password" class="form-control" v-model="form.confirm_password" required>
                            </div>
                            <div v-if="error" class="alert alert-danger">{{ error }}</div>
                            <button type="submit" class="btn btn-primary w-100" :disabled="loading">
                                <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                                Register
                            </button>
                        </form>
                        <div class="text-center mt-3">
                            <p>Already have an account? <a href="#" @click="$emit('switch-to-login')">Login here</a></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            form: {
                full_name: '',
                email: '',
                password: '',
                confirm_password: ''
            },
            loading: false,
            error: ''
        };
    },
    methods: {
        async register() {
            if (this.form.password !== this.form.confirm_password) {
                this.error = 'Passwords do not match.';
                return;
            }
            
            this.loading = true;
            this.error = '';
            
            try {
                const response = await axios.post('/auth/register', {
                    full_name: this.form.full_name,
                    email: this.form.email,
                    password: this.form.password
                });
                this.$emit('register-success', response.data.message);
            } catch (error) {
                this.error = error.response?.data?.message || 'Registration failed. Please try again.';
            } finally {
                this.loading = false;
            }
        }
    }
};

// Admin Dashboard Component
const AdminDashboard = {
    template: `
        <div>
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2><i class="bi bi-speedometer2"></i> Admin Dashboard</h2>
            </div>
            
            <div class="row mb-4">
                <div class="col-md-3">
                    <div class="card bg-primary text-white">
                        <div class="card-body">
                            <div class="d-flex justify-content-between">
                                <div>
                                    <h6 class="card-title">Total Users</h6>
                                    <h3>{{ stats.total_users }}</h3>
                                </div>
                                <i class="bi bi-people fs-1"></i>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card bg-success text-white">
                        <div class="card-body">
                            <div class="d-flex justify-content-between">
                                <div>
                                    <h6 class="card-title">Total Subjects</h6>
                                    <h3>{{ stats.total_subjects }}</h3>
                                </div>
                                <i class="bi bi-book fs-1"></i>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card bg-info text-white">
                        <div class="card-body">
                            <div class="d-flex justify-content-between">
                                <div>
                                    <h6 class="card-title">Total Quizzes</h6>
                                    <h3>{{ stats.total_quizzes }}</h3>
                                </div>
                                <i class="bi bi-clipboard-check fs-1"></i>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card bg-warning text-dark">
                        <div class="card-body">
                            <div class="d-flex justify-content-between">
                                <div>
                                    <h6 class="card-title">Total Attempts</h6>
                                    <h3>{{ stats.total_attempts }}</h3>
                                </div>
                                <i class="bi bi-graph-up fs-1"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="row">
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-header">
                            <h5><i class="bi bi-gear"></i> Quick Actions</h5>
                        </div>
                        <div class="card-body">
                            <div class="d-grid gap-2">
                                <button class="btn btn-primary" @click="$emit('switch-view', 'subjects')">
                                    <i class="bi bi-book"></i> Manage Subjects
                                </button>
                                <button class="btn btn-success" @click="$emit('switch-view', 'quiz-manager')">
                                    <i class="bi bi-clipboard-plus"></i> Create Quiz
                                </button>
                                <button class="btn btn-info" @click="loadStats">
                                    <i class="bi bi-arrow-clockwise"></i> Refresh Stats
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-header">
                            <h5><i class="bi bi-trophy"></i> Recent Activity</h5>
                        </div>
                        <div class="card-body">
                            <div v-if="recentActivity.length === 0" class="text-muted">No recent activity</div>
                            <div v-else>
                                <div v-for="activity in recentActivity" :key="activity.id" class="mb-2">
                                    <small class="text-muted">{{ activity.time }}</small><br>
                                    <span>{{ activity.description }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            stats: {
                total_users: 0,
                total_subjects: 0,
                total_quizzes: 0,
                total_attempts: 0
            },
            recentActivity: []
        };
    },
    mounted() {
        this.loadStats();
    },
    methods: {
        async loadStats() {
            try {
                const response = await axios.get('/admin/stats');
                this.stats = response.data;
            } catch (error) {
                console.error('Failed to load stats:', error);
            }
        }
    }
};

// User Dashboard Component
const UserDashboard = {
    template: `
        <div>
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2><i class="bi bi-person-circle"></i> User Dashboard</h2>
            </div>
            
            <div class="row mb-4">
                <div class="col-md-4">
                    <div class="card bg-primary text-white">
                        <div class="card-body">
                            <div class="d-flex justify-content-between">
                                <div>
                                    <h6 class="card-title">Quizzes Taken</h6>
                                    <h3>{{ stats.quizzes_taken }}</h3>
                                </div>
                                <i class="bi bi-clipboard-check fs-1"></i>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card bg-success text-white">
                        <div class="card-body">
                            <div class="d-flex justify-content-between">
                                <div>
                                    <h6 class="card-title">Average Score</h6>
                                    <h3>{{ stats.average_score }}%</h3>
                                </div>
                                <i class="bi bi-trophy fs-1"></i>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card bg-info text-white">
                        <div class="card-body">
                            <div class="d-flex justify-content-between">
                                <div>
                                    <h6 class="card-title">Best Score</h6>
                                    <h3>{{ stats.best_score }}%</h3>
                                </div>
                                <i class="bi bi-star fs-1"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="row">
                <div class="col-md-8">
                    <div class="card">
                        <div class="card-header">
                            <h5><i class="bi bi-book"></i> Available Subjects</h5>
                        </div>
                        <div class="card-body">
                            <div v-if="subjects.length === 0" class="text-muted">No subjects available yet.</div>
                            <div v-else class="row">
                                <div v-for="subject in subjects" :key="subject.id" class="col-md-6 mb-3">
                                    <div class="card h-100">
                                        <div class="card-body">
                                            <h6 class="card-title">{{ subject.name }}</h6>
                                            <p class="card-text">{{ subject.description }}</p>
                                            <button class="btn btn-primary btn-sm" @click="viewSubjectQuizzes(subject.id)">
                                                View Quizzes
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card">
                        <div class="card-header">
                            <h5><i class="bi bi-clock-history"></i> Recent Scores</h5>
                        </div>
                        <div class="card-body">
                            <div v-if="recentScores.length === 0" class="text-muted">No quiz attempts yet.</div>
                            <div v-else>
                                <div v-for="score in recentScores" :key="score.id" class="mb-3">
                                    <div class="d-flex justify-content-between">
                                        <small class="text-muted">{{ score.quiz_name }}</small>
                                        <span class="badge bg-primary">{{ score.score }}%</span>
                                    </div>
                                    <small class="text-muted">{{ score.date }}</small>
                                </div>
                            </div>
                            <button class="btn btn-outline-primary btn-sm w-100 mt-2" @click="$emit('switch-view', 'quiz-history')">
                                View All History
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            stats: {
                quizzes_taken: 0,
                average_score: 0,
                best_score: 0
            },
            subjects: [],
            recentScores: []
        };
    },
    mounted() {
        this.loadDashboardData();
    },
    methods: {
        async loadDashboardData() {
            try {
                const [statsResponse, subjectsResponse, scoresResponse] = await Promise.all([
                    axios.get('/user/stats'),
                    axios.get('/subjects'),
                    axios.get('/user/recent-scores')
                ]);
                
                this.stats = statsResponse.data;
                this.subjects = subjectsResponse.data;
                this.recentScores = scoresResponse.data;
            } catch (error) {
                console.error('Failed to load dashboard data:', error);
            }
        },
        viewSubjectQuizzes(subjectId) {
            this.$emit('switch-view', 'chapters', { subjectId });
        }
    }
};

// Subject Manager Component
const SubjectManager = {
    template: `
        <div>
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2><i class="bi bi-book"></i> Subject Manager</h2>
                <button class="btn btn-primary" @click="showCreateModal = true">
                    <i class="bi bi-plus"></i> Add Subject
                </button>
            </div>
            
            <div class="card">
                <div class="card-body">
                    <div v-if="subjects.length === 0" class="text-center text-muted py-4">
                        No subjects found. Create your first subject!
                    </div>
                    <div v-else class="table-responsive">
                        <table class="table table-striped">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Description</th>
                                    <th>Chapters</th>
                                    <th>Created</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="subject in subjects" :key="subject.id">
                                    <td>{{ subject.name }}</td>
                                    <td>{{ subject.description }}</td>
                                    <td>{{ subject.chapter_count || 0 }}</td>
                                    <td>{{ formatDate(subject.created_at) }}</td>
                                    <td>
                                        <button class="btn btn-sm btn-primary me-2" @click="manageChapters(subject.id)">
                                            <i class="bi bi-list"></i> Chapters
                                        </button>
                                        <button class="btn btn-sm btn-outline-danger" @click="deleteSubject(subject.id)">
                                            <i class="bi bi-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- Create Subject Modal -->
            <div v-if="showCreateModal" class="modal d-block" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Create New Subject</h5>
                            <button type="button" class="btn-close" @click="showCreateModal = false"></button>
                        </div>
                        <div class="modal-body">
                            <form @submit.prevent="createSubject">
                                <div class="mb-3">
                                    <label for="name" class="form-label">Subject Name</label>
                                    <input type="text" class="form-control" v-model="newSubject.name" required>
                                </div>
                                <div class="mb-3">
                                    <label for="description" class="form-label">Description</label>
                                    <textarea class="form-control" v-model="newSubject.description" rows="3"></textarea>
                                </div>
                                <div v-if="error" class="alert alert-danger">{{ error }}</div>
                                <button type="submit" class="btn btn-primary" :disabled="loading">
                                    <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                                    Create Subject
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            subjects: [],
            showCreateModal: false,
            newSubject: {
                name: '',
                description: ''
            },
            loading: false,
            error: ''
        };
    },
    mounted() {
        this.loadSubjects();
    },
    methods: {
        async loadSubjects() {
            try {
                const response = await axios.get('/subjects');
                this.subjects = response.data;
            } catch (error) {
                console.error('Failed to load subjects:', error);
            }
        },
        async createSubject() {
            this.loading = true;
            this.error = '';
            
            try {
                await axios.post('/admin/subjects', this.newSubject);
                this.showCreateModal = false;
                this.newSubject = { name: '', description: '' };
                this.loadSubjects();
            } catch (error) {
                this.error = error.response?.data?.message || 'Failed to create subject.';
            } finally {
                this.loading = false;
            }
        },
        async deleteSubject(subjectId) {
            if (confirm('Are you sure you want to delete this subject?')) {
                try {
                    await axios.delete(\`/admin/subjects/\${subjectId}\`);
                    this.loadSubjects();
                } catch (error) {
                    alert('Failed to delete subject.');
                }
            }
        },
        manageChapters(subjectId) {
            this.$emit('switch-view', 'chapters', { subjectId });
        },
        formatDate(dateString) {
            return new Date(dateString).toLocaleDateString();
        }
    }
};

// Other components (ChapterManager, QuizManager, etc.) will be similar...
// For now, let's create simple placeholder components

const ChapterManager = {
    template: '<div>Chapter Manager - Coming Soon</div>',
    props: ['subjectId']
};

const QuizManager = {
    template: '<div>Quiz Manager - Coming Soon</div>',
    props: ['chapterId']
};

const QuizAttempt = {
    template: '<div>Quiz Attempt - Coming Soon</div>',
    props: ['quizId']
};

const QuizHistory = {
    template: '<div>Quiz History - Coming Soon</div>'
};

// Main Vue App
const { createApp } = Vue;

createApp({
    components: {
        LoginComponent,
        RegisterComponent,
        AdminDashboard,
        UserDashboard,
        SubjectManager,
        ChapterManager,
        QuizManager,
        QuizAttempt,
        QuizHistory
    },
    data() {
        return {
            currentView: 'home',
            isLoggedIn: false,
            user: null,
            selectedSubjectId: null,
            selectedChapterId: null,
            selectedQuizId: null
        };
    },
    mounted() {
        this.checkAuthStatus();
    },
    methods: {
        checkAuthStatus() {
            const token = localStorage.getItem('token');
            const userStr = localStorage.getItem('user');
            
            if (token && userStr) {
                this.user = JSON.parse(userStr);
                this.isLoggedIn = true;
            }
        },
        onLoginSuccess(user) {
            this.user = user;
            this.isLoggedIn = true;
            this.currentView = user.role === 'admin' ? 'admin-dashboard' : 'user-dashboard';
        },
        onRegisterSuccess(message) {
            alert(message);
            this.currentView = 'login';
        },
        logout() {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            this.user = null;
            this.isLoggedIn = false;
            this.currentView = 'home';
        },
        switchView(view, params = {}) {
            this.currentView = view;
            if (params.subjectId) this.selectedSubjectId = params.subjectId;
            if (params.chapterId) this.selectedChapterId = params.chapterId;
            if (params.quizId) this.selectedQuizId = params.quizId;
        },
        onQuizCompleted(result) {
            this.currentView = 'user-dashboard';
            // Could show results or redirect as needed
        }
    }
}).mount('#app');