<template>
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
</template>

<script>
export default {
    name: 'SubjectManager',
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
                const response = await axios.get('/api/subjects');
                this.subjects = response.data;
            } catch (error) {
                console.error('Failed to load subjects:', error);
            }
        },
        async createSubject() {
            this.loading = true;
            this.error = '';

            if (!this.newSubject.name) {
                this.error = 'Subject name is required.';
                this.loading = false;
                return;
            }

            try {
                // Debug: log user and token
                console.log('User:', localStorage.getItem('user'));
                console.log('Token:', localStorage.getItem('token'));
                await axios.post('/api/subjects', {
                    name: this.newSubject.name,
                    description: this.newSubject.description
                });
                this.showCreateModal = false;
                this.newSubject = { name: '', description: '' };
                this.loadSubjects();
            } catch (error) {
                if (error.response && error.response.data && error.response.data.error) {
                    this.error = error.response.data.error;
                } else if (error.response && error.response.data && error.response.data.message) {
                    this.error = error.response.data.message;
                } else {
                    this.error = 'Failed to create subject.';
                }
                // Debug: log error
                console.error('Subject creation error:', error.response?.data || error);
            } finally {
                this.loading = false;
            }
        },
        async deleteSubject(subjectId) {
            if (confirm('Are you sure you want to delete this subject?')) {
                try {
                    await axios.delete(`/api/subjects/${subjectId}`);
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
</script>