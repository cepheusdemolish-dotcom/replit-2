<template id="login-component">
    <div class="row justify-content-center">
        <div class="col-md-6">
            <div class="card">
                <div class="card-header">
                    <h4 class="mb-0"><i class="bi bi-box-arrow-in-right"></i> Login</h4>
                </div>
                <div class="card-body">
                    <div v-if="error" class="alert alert-danger">{{ error }}</div>
                    <form @submit.prevent="login">
                        <div class="mb-3">
                            <label for="email" class="form-label">Email Address</label>
                            <input type="email" class="form-control" id="email" v-model="form.email" required>
                        </div>
                        <div class="mb-3">
                            <label for="password" class="form-label">Password</label>
                            <input type="password" class="form-control" id="password" v-model="form.password" required>
                        </div>
                        <div class="d-grid">
                            <button type="submit" class="btn btn-primary" :disabled="loading">
                                <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                                {{ loading ? 'Logging in...' : 'Login' }}
                            </button>
                        </div>
                    </form>
                    <hr>
                    <div class="text-center">
                        <p>Don't have an account? <a href="#" @click="$emit('switch-to-register')">Register here</a></p>
                        <small class="text-muted">Admin Login: admin@quizmaster.com / admin123</small>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
app.component('login-component', {
    template: '#login-component',
    data() {
        return {
            form: {
                email: '',
                password: ''
            },
            loading: false,
            error: ''
        }
    },
    methods: {
        async login() {
            this.loading = true;
            this.error = '';
            
            try {
                const response = await axios.post('/api/login', this.form);
                
                if (response.data.access_token) {
                    localStorage.setItem('access_token', response.data.access_token);
                    localStorage.setItem('user', JSON.stringify(response.data.user));
                    
                    this.$emit('login-success', response.data.user);
                } else {
                    this.error = 'Login failed. Please try again.';
                }
            } catch (error) {
                this.error = error.response?.data?.error || 'Login failed. Please try again.';
            } finally {
                this.loading = false;
            }
        }
    }
});
</script>
