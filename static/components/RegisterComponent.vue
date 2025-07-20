<template>
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
</template>

<script>
export default {
    name: 'RegisterComponent',
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
                const response = await axios.post('/api/auth/register', {
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
</script>