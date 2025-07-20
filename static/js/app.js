// Vue component loader utility for .vue files
async function loadVueComponent(name, path) {
    try {
        const response = await fetch(path);
        const componentText = await response.text();
        
        // Parse the .vue file content
        const templateMatch = componentText.match(/<template>([\s\S]*?)<\/template>/);
        const scriptMatch = componentText.match(/<script>([\s\S]*?)<\/script>/);
        
        if (!templateMatch || !scriptMatch) {
            console.error(`Invalid Vue component: ${name}`);
            return null;
        }
        
        const template = templateMatch[1].trim();
        const scriptContent = scriptMatch[1].trim();
        
        // Extract the component definition from the script
        const exportMatch = scriptContent.match(/export\s+default\s+({[\s\S]*})/);
        if (!exportMatch) {
            console.error(`No default export found in component: ${name}`);
            return null;
        }
        
        // Evaluate the component definition safely
        const componentDefinition = new Function('return ' + exportMatch[1])();
        componentDefinition.template = template;
        
        return componentDefinition;
    } catch (error) {
        console.error(`Failed to load component ${name}:`, error);
        return null;
    }
}

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

// Main Vue App
const { createApp } = Vue;

// Create the main app
let app;

const appConfig = {
    data() {
        return {
            currentView: 'home',
            isLoggedIn: false,
            user: null,
            selectedSubjectId: null,
            selectedChapterId: null,
            selectedQuizId: null,
            componentsLoaded: false
        };
    },
    async mounted() {
        await this.loadComponents();
        this.checkAuthStatus();
    },
    methods: {
        async loadComponents() {
            try {
                // Load all Vue components
                const components = [
                    { name: 'login-component', component: 'LoginComponent', path: '/static/components/LoginComponent.vue' },
                    { name: 'register-component', component: 'RegisterComponent', path: '/static/components/RegisterComponent.vue' },
                    { name: 'admin-dashboard', component: 'AdminDashboard', path: '/static/components/AdminDashboard.vue' },
                    { name: 'user-dashboard', component: 'UserDashboard', path: '/static/components/UserDashboard.vue' },
                    { name: 'subject-manager', component: 'SubjectManager', path: '/static/components/SubjectManager.vue' },
                    { name: 'chapter-manager', component: 'ChapterManager', path: '/static/components/ChapterManager.vue' },
                    { name: 'quiz-manager', component: 'QuizManager', path: '/static/components/QuizManager.vue' },
                    { name: 'quiz-attempt', component: 'QuizAttempt', path: '/static/components/QuizAttempt.vue' },
                    { name: 'quiz-history', component: 'QuizHistory', path: '/static/components/QuizHistory.vue' }
                ];

                for (const { name, component, path } of components) {
                    const componentDefinition = await loadVueComponent(component, path);
                    if (componentDefinition) {
                        app.component(name, componentDefinition);
                        console.log(`Successfully loaded component: ${name}`);
                    }
                }
                
                this.componentsLoaded = true;
                this.$forceUpdate(); // Force re-render after components are loaded
            } catch (error) {
                console.error('Failed to load components:', error);
            }
        },
        
        checkAuthStatus() {
            const token = localStorage.getItem('token');
            const userStr = localStorage.getItem('user');
            
            if (token && userStr) {
                try {
                    this.user = JSON.parse(userStr);
                    this.isLoggedIn = true;
                } catch (error) {
                    console.error('Error parsing user data:', error);
                    this.logout();
                }
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
};

// Create and mount the app
app = createApp(appConfig);
app.mount('#app');