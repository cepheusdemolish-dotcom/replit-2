// Vue component loader utility
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
        
        // Create a new component definition
        const componentDefinition = new Function(`
            ${scriptContent}
            const componentOptions = (typeof exports !== 'undefined' ? exports : {});
            const defaultExport = componentOptions.default || componentOptions;
            defaultExport.template = \`${template}\`;
            return defaultExport;
        `)();
        
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
const app = createApp({
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
                    { name: 'LoginComponent', path: '/static/components/LoginComponent.vue' },
                    { name: 'RegisterComponent', path: '/static/components/RegisterComponent.vue' },
                    { name: 'AdminDashboard', path: '/static/components/AdminDashboard.vue' },
                    { name: 'UserDashboard', path: '/static/components/UserDashboard.vue' },
                    { name: 'SubjectManager', path: '/static/components/SubjectManager.vue' },
                    { name: 'ChapterManager', path: '/static/components/ChapterManager.vue' },
                    { name: 'QuizManager', path: '/static/components/QuizManager.vue' },
                    { name: 'QuizAttempt', path: '/static/components/QuizAttempt.vue' },
                    { name: 'QuizHistory', path: '/static/components/QuizHistory.vue' }
                ];

                for (const { name, path } of components) {
                    const component = await loadVueComponent(name, path);
                    if (component) {
                        app.component(name.toLowerCase().replace(/([A-Z])/g, '-$1').substring(1), component);
                    }
                }
                
                this.componentsLoaded = true;
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
});

// Mount the app
app.mount('#app');