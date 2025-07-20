<template id="chapter-manager">
    <div>
        <div class="d-flex justify-content-between align-items-center mb-4">
            <div>
                <h3><i class="bi bi-collection-fill"></i> Chapter Manager</h3>
                <nav aria-label="breadcrumb">
                    <ol class="breadcrumb">
                        <li class="breadcrumb-item">
                            <a href="#" @click="$emit('switch-view', 'subjects')">Subjects</a>
                        </li>
                        <li class="breadcrumb-item active">{{ currentSubject?.name || 'Chapters' }}</li>
                    </ol>
                </nav>
            </div>
            <button class="btn btn-primary" @click="showCreateForm = true" :disabled="!subjectId">
                <i class="bi bi-plus-lg"></i> Add Chapter
            </button>
        </div>

        <!-- Subject Selection -->
        <div v-if="!subjectId" class="card mb-4">
            <div class="card-header">
                <h5>Select Subject</h5>
            </div>
            <div class="card-body">
                <div v-if="subjects.length === 0" class="text-center">
                    <p>No subjects available. Please create a subject first.</p>
                    <button class="btn btn-primary" @click="$emit('switch-view', 'subjects')">Create Subject</button>
                </div>
                <div v-else class="row">
                    <div v-for="subject in subjects" :key="subject.id" class="col-md-6 mb-3">
                        <div class="card">
                            <div class="card-body">
                                <h6 class="card-title">{{ subject.name }}</h6>
                                <p class="card-text">{{ subject.description || 'No description' }}</p>
                                <button class="btn btn-primary btn-sm" @click="selectSubject(subject.id)">
                                    Select Subject
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Chapter Management -->
        <div v-if="subjectId">
            <!-- Create/Edit Form -->
            <div v-if="showCreateForm || editingChapter" class="card mb-4">
                <div class="card-header">
                    <h5>{{ editingChapter ? 'Edit Chapter' : 'Create New Chapter' }}</h5>
                </div>
                <div class="card-body">
                    <div v-if="error" class="alert alert-danger">{{ error }}</div>
                    <form @submit.prevent="saveChapter">
                        <div class="mb-3">
                            <label for="name" class="form-label">Chapter Name</label>
                            <input type="text" class="form-control" id="name" v-model="form.name" required>
                        </div>
                        <div class="mb-3">
                            <label for="description" class="form-label">Description</label>
                            <textarea class="form-control" id="description" v-model="form.description" rows="3"></textarea>
                        </div>
                        <div class="d-flex gap-2">
                            <button type="submit" class="btn btn-success" :disabled="loading">
                                <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                                {{ loading ? 'Saving...' : (editingChapter ? 'Update' : 'Create') }}
                            </button>
                            <button type="button" class="btn btn-secondary" @click="cancelForm">Cancel</button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- Chapters List -->
            <div class="card">
                <div class="card-header">
                    <h5>Chapters in {{ currentSubject?.name }} ({{ chapters.length }})</h5>
                </div>
                <div class="card-body">
                    <div v-if="chapters.length === 0" class="text-center">
                        <i class="bi bi-inbox fs-1 text-muted"></i>
                        <p class="mt-3">No chapters created yet.</p>
                    </div>
                    <div v-else class="table-responsive">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Description</th>
                                    <th>Quizzes</th>
                                    <th>Created</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="chapter in chapters" :key="chapter.id">
                                    <td>
                                        <strong>{{ chapter.name }}</strong>
                                    </td>
                                    <td>{{ chapter.description || '-' }}</td>
                                    <td>
                                        <span class="badge bg-info">{{ chapter.quiz_count }}</span>
                                    </td>
                                    <td>{{ formatDate(chapter.created_at) }}</td>
                                    <td>
                                        <div class="btn-group btn-group-sm">
                                            <button class="btn btn-outline-primary" @click="editChapter(chapter)" title="Edit">
                                                <i class="bi bi-pencil"></i>
                                            </button>
                                            <button class="btn btn-outline-info" @click="manageQuizzes(chapter.id)" title="Manage Quizzes">
                                                <i class="bi bi-patch-question"></i>
                                            </button>
                                            <button class="btn btn-outline-danger" @click="deleteChapter(chapter.id)" title="Delete">
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
    </div>
</template>

<script>
app.component('chapter-manager', {
    template: '#chapter-manager',
    props: ['subjectId'],
    data() {
        return {
            subjects: [],
            chapters: [],
            currentSubject: null,
            showCreateForm: false,
            editingChapter: null,
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
        if (this.subjectId) {
            await this.loadChapters();
        }
    },
    watch: {
        subjectId: async function(newVal) {
            if (newVal) {
                await this.loadChapters();
            }
        }
    },
    methods: {
        async loadSubjects() {
            try {
                const response = await axios.get('/api/subjects', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
                });
                this.subjects = response.data;
                if (this.subjectId) {
                    this.currentSubject = this.subjects.find(s => s.id === parseInt(this.subjectId));
                }
            } catch (error) {
                console.error('Error loading subjects:', error);
            }
        },
        async loadChapters() {
            if (!this.subjectId) return;
            
            try {
                const response = await axios.get(`/api/subjects/${this.subjectId}/chapters`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
                });
                this.chapters = response.data;
            } catch (error) {
                console.error('Error loading chapters:', error);
            }
        },
        selectSubject(subjectId) {
            this.$emit('switch-view', 'chapters', subjectId);
        },
        async saveChapter() {
            this.loading = true;
            this.error = '';
            
            try {
                let response;
                const payload = { ...this.form, subject_id: parseInt(this.subjectId) };
                
                if (this.editingChapter) {
                    response = await axios.put(`/api/chapters/${this.editingChapter.id}`, payload, {
                        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
                    });
                } else {
                    response = await axios.post('/api/chapters', payload, {
                        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
                    });
                }
                
                await this.loadChapters();
                this.cancelForm();
            } catch (error) {
                this.error = error.response?.data?.error || 'Error saving chapter';
            } finally {
                this.loading = false;
            }
        },
        editChapter(chapter) {
            this.editingChapter = chapter;
            this.form.name = chapter.name;
            this.form.description = chapter.description || '';
            this.showCreateForm = false;
        },
        async deleteChapter(chapterId) {
            if (!confirm('Are you sure you want to delete this chapter? This will also delete all quizzes under it.')) {
                return;
            }
            
            try {
                await axios.delete(`/api/chapters/${chapterId}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
                });
                await this.loadChapters();
            } catch (error) {
                alert('Error deleting chapter: ' + (error.response?.data?.error || error.message));
            }
        },
        cancelForm() {
            this.showCreateForm = false;
            this.editingChapter = null;
            this.form.name = '';
            this.form.description = '';
            this.error = '';
        },
        manageQuizzes(chapterId) {
            this.$emit('switch-view', 'quiz-manager', null, chapterId);
        },
        formatDate(dateString) {
            return new Date(dateString).toLocaleDateString();
        }
    }
});
</script>
