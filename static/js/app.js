// Configure axios defaults
axios.defaults.baseURL = window.location.origin;

// Add request interceptor to include auth token
axios.interceptors.request.use(function (config) {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, function (error) {
    return Promise.reject(error);
});

// Add response interceptor to handle auth errors
axios.interceptors.response.use(function (response) {
    return response;
}, function (error) {
    if (error.response && error.response.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        window.location.reload();
    }
    return Promise.reject(error);
});

// Vue 3 Application
const { createApp } = Vue;

const app = createApp({
    data() {
        return {
            currentView: 'home',
            user: null,
            isLoggedIn: false,
            selectedSubjectId: null,
            selectedChapterId: null,
            selectedQuizId: null
        }
    },
    mounted() {
        this.checkAuthStatus();
    },
    methods: {
        checkAuthStatus() {
            const token = localStorage.getItem('access_token');
            const userString = localStorage.getItem('user');
            
            if (token && userString) {
                try {
                    this.user = JSON.parse(userString);
                    this.isLoggedIn = true;
                    
                    // Verify token is still valid
                    this.verifyToken();
                } catch (error) {
                    console.error('Error parsing user data:', error);
                    this.logout();
                }
            } else {
                this.isLoggedIn = false;
                this.user = null;
            }
        },
        async verifyToken() {
            try {
                const response = await axios.get('/api/me');
                this.user = response.data.user;
            } catch (error) {
                console.error('Token verification failed:', error);
                this.logout();
            }
        },
        onLoginSuccess(user) {
            this.user = user;
            this.isLoggedIn = true;
            this.currentView = user.role === 'admin' ? 'admin-dashboard' : 'user-dashboard';
        },
        onRegisterSuccess(user) {
            this.user = user;
            this.isLoggedIn = true;
            this.currentView = 'user-dashboard';
        },
        logout() {
            localStorage.removeItem('access_token');
            localStorage.removeItem('user');
            this.user = null;
            this.isLoggedIn = false;
            this.currentView = 'home';
        },
        switchView(view, subjectId = null, chapterId = null, quizId = null) {
            this.currentView = view;
            this.selectedSubjectId = subjectId;
            this.selectedChapterId = chapterId;
            this.selectedQuizId = quizId;
        },
        onQuizCompleted(redirectTo = null) {
            if (redirectTo) {
                this.currentView = redirectTo;
            } else {
                this.currentView = this.user?.role === 'admin' ? 'admin-dashboard' : 'user-dashboard';
            }
            this.selectedQuizId = null;
        }
    }
});

// Mount the app
app.mount('#app');
