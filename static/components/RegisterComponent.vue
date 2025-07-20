<template id="register-component">
    <div class="row justify-content-center">
        <div class="col-md-8">
            <div class="card">
                <div class="card-header">
                    <h4 class="mb-0"><i class="bi bi-person-plus"></i> Register</h4>
                </div>
                <div class="card-body">
                    <div v-if="error" class="alert alert-danger">{{ error }}</div>
                    <form @submit.prevent="register">
                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="username" class="form-label">Username</label>
                                    <input type="text" class="form-control" id="username" v-model="form.username" required>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="email" class="form-label">Email Address</label>
                                    <input type="email" class="form-control" id="email" v-model="form.email" required>
                                </div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="password" class="form-label">Password</label>
                                    <input type="password" class="form-control" id="password" v-model="form.password" required>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="full_name" class="form-label">Full Name</label>
                                    <input type="text" class="form-control" id="full_name" v-model="form.full_name" required>
                                </div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="qualification" class="form-label">Qualification</label>
                                    <input type="text" class="form-control" id="qualification" v-model="form.qualification" required>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="dob" class="form-label">Date of Birth</label>
                                    <input type="date" class="form-control" id="dob" v-model="form.dob" required>
                                </div>
                            </div>
                        </div>
                        <div class="d-grid">
                            <button type="submit" class="btn btn-primary" :disabled="loading">
                                <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                                {{ loading ? 'Registering...' : 'Register' }}
                            </button>
                        </div>
                    </form>
                    <hr>
                    <div class="text-center">
                        <p>Already have an account? <a href="#" @click="$emit('switch-to-login')">Login here</a></p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
app.component('register-component', {
    template: '#register-component',
    data() {
        return {
            form: {
                username: '',
                email: '',
                password: '',
                full_name: '',
                qualification: '',
                dob: ''
            },
            loading: false,
            error: ''
        }
    },
    methods: {
        async register() {
            this.loading = true;
            this.error = '';
            
            try {
                const response = await axios.post('/api/register', this.form);
                
                if (response.data.access_token) {
                    localStorage.setItem('access_token', response.data.access_token);
                    localStorage.setItem('user', JSON.stringify(response.data.user));
                    
                    this.$emit('register-success', response.data.user);
                } else {
                    this.error = 'Registration failed. Please try again.';
                }
            } catch (error) {
                this.error = error.response?.data?.error || 'Registration failed. Please try again.';
            } finally {
                this.loading = false;
            }
        }
    }
});
</script>
