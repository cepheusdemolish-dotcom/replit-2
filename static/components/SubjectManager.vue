<template id="subject-manager">
    <div>
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h3><i class="bi bi-book-fill"></i> Subject Manager</h3>
            <button class="btn btn-primary" @click="showCreateForm = true">
                <i class="bi bi-plus-lg"></i> Add Subject
            </button>
        </div>

        <!-- Create/Edit Form -->
        <div v-if="showCreateForm || editingSubject" class="card mb-4">
            <div class="card-header">
                <h5>{{ editingSubject ? 'Edit Subject' : 'Create New Subject' }}</h5>
            </div>
            <div class="card-body">
                <div v-if="error" class="alert alert-danger">{{ error }}</div>
                <form @submit.prevent="saveSubject">
                    <div class="mb-3">
                        <label for="name" class="form-label">Subject Name</label>
                        <input type="text" class="form-control" id="name" v-model="form.name" required>
                    </div>
                    <div class="mb-3">
                        <label for="description" class="form-label">Description</label>
                        <textarea class="form-control" id="description" v-model="form.description" rows="3"></textarea>
                    </div>
                    <div class="d-flex gap-2">
                        <button type="submit" class="btn btn-success" :disabled="loading">
                            <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                            {{ loading ? 'Saving...' : (editingSubject ? 'Update' : 'Create') }}
                        </button>
                        <button type="button" class="btn btn-secondary" @click="cancelForm">Cancel</button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Subjects List -->
        <div class="card">
            <div class="card-header">
                <h5>Subjects ({{ subjects.length }})</h5>
            </div>
            <div class="card-body">
                <div v-if="subjects.length === 0" class="text-center">
                    <i class="bi bi-inbox fs-1 text-muted"></i>
                    <p class="mt-3">No subjects created yet.</p>
                </div>
                <div v-else class="table-responsive">
                    <table class="table">
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
                                <td>
                                    <strong>{{ subject.name }}</strong>
                                </td>
                                <td>{{ subject.description || '-' }}</td>
                                <td>
                                    <span class="badge bg-info">{{ subject.chapter_count }}</span>
                                </td>
                                <td>{{ formatDate(subject.created_at) }}</td>
                                <td>
                                    <div class="btn-group btn-group-sm">
                                        <button class="btn btn-outline-primary" @click="editSubject(subject)" title="Edit">
                                            <i class="bi bi-pencil"></i>
                                        </button>
                                        <button class="btn btn-outline-info" @click="manageChapters(subject.id)" title="Manage Chapters">
                                            <i class="bi bi-collection"></i>
                                        </button>
                                        <button class="btn btn-outline-danger" @click="deleteSubject(subject.id)" title="Delete">
                                            <i class="bi bi-trash"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
app.component('subject-manager', {
    template: '#subject-manager',
    data() {
        return {
            subjects: [],
            showCreateForm: false,
            editingSubject: null,
            form: {
                name: '',
                description: ''
            },
            loading: false,
            error: ''
        }
    },
    async mounted() {
        await this.loadSubjects();
    },
    methods: {
        async loadSubjects() {
            try {
                const response = await axios.get('/api/subjects', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
                });
                this.subjects = response.data;
            } catch (error) {
                console.error('Error loading subjects:', error);
            }
        },
        async saveSubject() {
            this.loading = true;
            this.error = '';
            
            try {
                let response;
                if (this.editingSubject) {
                    response = await axios.put(`/api/subjects/${this.editingSubject.id}`, this.form, {
                        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
                    });
                } else {
                    response = await axios.post('/api/subjects', this.form, {
                        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
                    });
                }
                
                await this.loadSubjects();
                this.cancelForm();
            } catch (error) {
                this.error = error.response?.data?.error || 'Error saving subject';
            } finally {
                this.loading = false;
            }
        },
        editSubject(subject) {
            this.editingSubject = subject;
            this.form.name = subject.name;
            this.form.description = subject.description || '';
            this.showCreateForm = false;
        },
        async deleteSubject(subjectId) {
            if (!confirm('Are you sure you want to delete this subject? This will also delete all chapters and quizzes under it.')) {
                return;
            }
            
            try {
                await axios.delete(`/api/subjects/${subjectId}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
                });
                await this.loadSubjects();
            } catch (error) {
                alert('Error deleting subject: ' + (error.response?.data?.error || error.message));
            }
        },
        cancelForm() {
            this.showCreateForm = false;
            this.editingSubject = null;
            this.form.name = '';
            this.form.description = '';
            this.error = '';
        },
        manageChapters(subjectId) {
            this.$emit('switch-view', 'chapters', subjectId);
        },
        formatDate(dateString) {
            return new Date(dateString).toLocaleDateString();
        }
    }
});
</script>
