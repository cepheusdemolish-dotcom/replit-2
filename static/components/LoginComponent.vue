<template>
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
</template>

<script>
export default {
    name: 'LoginComponent',
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
                const response = await axios.post('/api/auth/login', this.form);
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
</script>