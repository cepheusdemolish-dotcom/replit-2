<template>
    <div>
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2><i class="bi bi-list-ul"></i> Chapter Manager</h2>
            <div>
                <button class="btn btn-secondary me-2" @click="$emit('switch-view', 'subjects')">
                    <i class="bi bi-arrow-left"></i> Back to Subjects
                </button>
                <button class="btn btn-primary" @click="showCreateModal = true">
                    <i class="bi bi-plus"></i> Add Chapter
                </button>
            </div>
        </div>
        
        <div class="card">
            <div class="card-body">
                <div v-if="chapters.length === 0" class="text-center text-muted py-4">
                    No chapters found. Create your first chapter!
                </div>
                <div v-else class="table-responsive">
                    <table class="table table-striped">
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
                                <td>{{ chapter.name }}</td>
                                <td>{{ chapter.description }}</td>
                                <td>{{ chapter.quiz_count || 0 }}</td>
                                <td>{{ formatDate(chapter.created_at) }}</td>
                                <td>
                                    <button class="btn btn-sm btn-primary me-2" @click="manageQuizzes(chapter.id)">
                                        <i class="bi bi-clipboard-check"></i> Quizzes
                                    </button>
                                    <button class="btn btn-sm btn-outline-danger" @click="deleteChapter(chapter.id)">
                                        <i class="bi bi-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- Create Chapter Modal -->
        <div v-if="showCreateModal" class="modal d-block" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Create New Chapter</h5>
                        <button type="button" class="btn-close" @click="showCreateModal = false"></button>
                    </div>
                    <div class="modal-body">
                        <form @submit.prevent="createChapter">
                            <div class="mb-3">
                                <label for="name" class="form-label">Chapter Name</label>
                                <input type="text" class="form-control" v-model="newChapter.name" required>
                            </div>
                            <div class="mb-3">
                                <label for="description" class="form-label">Description</label>
                                <textarea class="form-control" v-model="newChapter.description" rows="3"></textarea>
                            </div>
                            <div v-if="error" class="alert alert-danger">{{ error }}</div>
                            <button type="submit" class="btn btn-primary" :disabled="loading">
                                <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                                Create Chapter
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
    name: 'ChapterManager',
    props: ['subjectId'],
    data() {
        return {
            chapters: [],
            showCreateModal: false,
            newChapter: {
                name: '',
                description: ''
            },
            loading: false,
            error: ''
        };
    },
    mounted() {
        this.loadChapters();
    },
    methods: {
        async loadChapters() {
            try {
                const response = await axios.get(`/api/subjects/${this.subjectId}/chapters`);
                this.chapters = response.data;
            } catch (error) {
                console.error('Failed to load chapters:', error);
            }
        },
        async createChapter() {
            this.loading = true;
            this.error = '';

            if (!this.subjectId || !this.newChapter.name) {
                this.error = 'Chapter name and subject are required.';
                this.loading = false;
                return;
            }

            try {
                // Debug: log user and token
                console.log('User:', localStorage.getItem('user'));
                console.log('Token:', localStorage.getItem('token'));
                await axios.post(`/api/chapters`, {
                    ...this.newChapter,
                    subject_id: this.subjectId
                });
                this.showCreateModal = false;
                this.newChapter = { name: '', description: '' };
                this.loadChapters();
            } catch (error) {
                if (error.response && error.response.data && error.response.data.error) {
                    this.error = error.response.data.error;
                } else if (error.response && error.response.data && error.response.data.message) {
                    this.error = error.response.data.message;
                } else {
                    this.error = 'Failed to create chapter.';
                }
                // Debug: log error
                console.error('Chapter creation error:', error.response?.data || error);
            } finally {
                this.loading = false;
            }
        },
        async deleteChapter(chapterId) {
            if (confirm('Are you sure you want to delete this chapter?')) {
                try {
                    await axios.delete(`/api/chapters/${chapterId}`);
                    this.loadChapters();
                } catch (error) {
                    alert('Failed to delete chapter.');
                }
            }
        },
        manageQuizzes(chapterId) {
            this.$emit('switch-view', 'quiz-manager', { chapterId });
        },
        formatDate(dateString) {
            return new Date(dateString).toLocaleDateString();
        }
    }
};
</script>