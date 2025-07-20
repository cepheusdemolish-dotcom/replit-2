<template id="admin-dashboard">
    <div>
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2><i class="bi bi-speedometer2"></i> Admin Dashboard</h2>
            <div class="input-group" style="max-width: 300px;">
                <input type="text" class="form-control" placeholder="Search..." v-model="searchQuery" @keyup.enter="search">
                <button class="btn btn-outline-secondary" @click="search">
                    <i class="bi bi-search"></i>
                </button>
            </div>
        </div>

        <!-- Statistics Cards -->
        <div class="row mb-4">
            <div class="col-md-2">
                <div class="card text-center">
                    <div class="card-body">
                        <i class="bi bi-people-fill fs-2 text-primary"></i>
                        <h5 class="mt-2">{{ stats.total_users || 0 }}</h5>
                        <small class="text-muted">Users</small>
                    </div>
                </div>
            </div>
            <div class="col-md-2">
                <div class="card text-center">
                    <div class="card-body">
                        <i class="bi bi-book-fill fs-2 text-success"></i>
                        <h5 class="mt-2">{{ stats.total_subjects || 0 }}</h5>
                        <small class="text-muted">Subjects</small>
                    </div>
                </div>
            </div>
            <div class="col-md-2">
                <div class="card text-center">
                    <div class="card-body">
                        <i class="bi bi-collection-fill fs-2 text-info"></i>
                        <h5 class="mt-2">{{ stats.total_chapters || 0 }}</h5>
                        <small class="text-muted">Chapters</small>
                    </div>
                </div>
            </div>
            <div class="col-md-2">
                <div class="card text-center">
                    <div class="card-body">
                        <i class="bi bi-patch-question-fill fs-2 text-warning"></i>
                        <h5 class="mt-2">{{ stats.total_quizzes || 0 }}</h5>
                        <small class="text-muted">Quizzes</small>
                    </div>
                </div>
            </div>
            <div class="col-md-2">
                <div class="card text-center">
                    <div class="card-body">
                        <i class="bi bi-question-circle-fill fs-2 text-secondary"></i>
                        <h5 class="mt-2">{{ stats.total_questions || 0 }}</h5>
                        <small class="text-muted">Questions</small>
                    </div>
                </div>
            </div>
            <div class="col-md-2">
                <div class="card text-center">
                    <div class="card-body">
                        <i class="bi bi-clipboard-check-fill fs-2 text-danger"></i>
                        <h5 class="mt-2">{{ stats.total_attempts || 0 }}</h5>
                        <small class="text-muted">Attempts</small>
                    </div>
                </div>
            </div>
        </div>

        <!-- Management Options -->
        <div class="row">
            <div class="col-md-4 mb-3">
                <div class="card h-100">
                    <div class="card-body text-center">
                        <i class="bi bi-book-fill fs-1 text-primary mb-3"></i>
                        <h5 class="card-title">Manage Subjects</h5>
                        <p class="card-text">Create, edit, and organize subjects for your quizzes.</p>
                        <button class="btn btn-primary" @click="$emit('switch-view', 'subjects')">Manage Subjects</button>
                    </div>
                </div>
            </div>
            <div class="col-md-4 mb-3">
                <div class="card h-100">
                    <div class="card-body text-center">
                        <i class="bi bi-collection-fill fs-1 text-success mb-3"></i>
                        <h5 class="card-title">Manage Chapters</h5>
                        <p class="card-text">Organize chapters within subjects to structure your content.</p>
                        <button class="btn btn-success" @click="showSubjectsForChapters = true">Manage Chapters</button>
                    </div>
                </div>
            </div>
            <div class="col-md-4 mb-3">
                <div class="card h-100">
                    <div class="card-body text-center">
                        <i class="bi bi-patch-question-fill fs-1 text-info mb-3"></i>
                        <h5 class="card-title">Manage Quizzes</h5>
                        <p class="card-text">Create and manage quizzes with questions for each chapter.</p>
                        <button class="btn btn-info" @click="showChaptersForQuizzes = true">Manage Quizzes</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Subject Selection Modal for Chapters -->
        <div v-if="showSubjectsForChapters" class="modal d-block" style="background-color: rgba(0,0,0,0.5);">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Select Subject for Chapters</h5>
                        <button type="button" class="btn-close" @click="showSubjectsForChapters = false"></button>
                    </div>
                    <div class="modal-body">
                        <div v-if="subjects.length === 0" class="text-center">
                            <p>No subjects available. Please create a subject first.</p>
                            <button class="btn btn-primary" @click="$emit('switch-view', 'subjects'); showSubjectsForChapters = false">Create Subject</button>
                        </div>
                        <div v-else>
                            <div class="list-group">
                                <a v-for="subject in subjects" :key="subject.id" 
                                   href="#" 
                                   class="list-group-item list-group-item-action"
                                   @click="selectSubjectForChapters(subject.id)">
                                    <h6 class="mb-1">{{ subject.name }}</h6>
                                    <small>{{ subject.description }}</small>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Chapter Selection Modal for Quizzes -->
        <div v-if="showChaptersForQuizzes" class="modal d-block" style="background-color: rgba(0,0,0,0.5);">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Select Chapter for Quizzes</h5>
                        <button type="button" class="btn-close" @click="showChaptersForQuizzes = false"></button>
                    </div>
                    <div class="modal-body">
                        <div v-if="allChapters.length === 0" class="text-center">
                            <p>No chapters available. Please create chapters first.</p>
                            <button class="btn btn-primary" @click="showSubjectsForChapters = true; showChaptersForQuizzes = false">Manage Chapters</button>
                        </div>
                        <div v-else>
                            <div class="list-group">
                                <a v-for="chapter in allChapters" :key="chapter.id" 
                                   href="#" 
                                   class="list-group-item list-group-item-action"
                                   @click="selectChapterForQuizzes(chapter.id)">
                                    <h6 class="mb-1">{{ chapter.name }}</h6>
                                    <small>{{ chapter.subject_name }} - {{ chapter.description }}</small>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Search Results -->
        <div v-if="searchResults && searchQuery" class="mt-4">
            <h5>Search Results for "{{ searchQuery }}"</h5>
            
            <div v-if="searchResults.subjects.length > 0">
                <h6 class="text-primary">Subjects</h6>
                <div class="list-group mb-3">
                    <div v-for="item in searchResults.subjects" :key="item.id" class="list-group-item">
                        <h6 class="mb-1">{{ item.name }}</h6>
                        <small>{{ item.description }}</small>
                    </div>
                </div>
            </div>

            <div v-if="searchResults.chapters.length > 0">
                <h6 class="text-success">Chapters</h6>
                <div class="list-group mb-3">
                    <div v-for="item in searchResults.chapters" :key="item.id" class="list-group-item">
                        <h6 class="mb-1">{{ item.name }} <span class="badge bg-secondary">{{ item.subject_name }}</span></h6>
                        <small>{{ item.description }}</small>
                    </div>
                </div>
            </div>

            <div v-if="searchResults.quizzes.length > 0">
                <h6 class="text-info">Quizzes</h6>
                <div class="list-group mb-3">
                    <div v-for="item in searchResults.quizzes" :key="item.id" class="list-group-item">
                        <h6 class="mb-1">{{ item.title }} 
                            <span class="badge bg-secondary">{{ item.subject_name }}</span>
                            <span class="badge bg-info">{{ item.chapter_name }}</span>
                        </h6>
                        <small>Duration: {{ item.time_duration }} minutes</small>
                    </div>
                </div>
            </div>

            <div v-if="searchResults.users.length > 0">
                <h6 class="text-warning">Users</h6>
                <div class="list-group mb-3">
                    <div v-for="item in searchResults.users" :key="item.id" class="list-group-item">
                        <h6 class="mb-1">{{ item.full_name }} <span class="badge bg-secondary">@{{ item.username }}</span></h6>
                        <small>{{ item.email }}</small>
                    </div>
                </div>
            </div>

            <div v-if="searchResults.subjects.length === 0 && searchResults.chapters.length === 0 && searchResults.quizzes.length === 0 && searchResults.users.length === 0">
                <div class="alert alert-info">No results found for "{{ searchQuery }}"</div>
            </div>
        </div>
    </div>
</template>

<script>
app.component('admin-dashboard', {
    template: '#admin-dashboard',
    data() {
        return {
            stats: {},
            searchQuery: '',
            searchResults: null,
            subjects: [],
            allChapters: [],
            showSubjectsForChapters: false,
            showChaptersForQuizzes: false
        }
    },
    async mounted() {
        await this.loadStats();
        await this.loadSubjects();
        await this.loadAllChapters();
    },
    methods: {
        async loadStats() {
            try {
                const response = await axios.get('/api/dashboard/stats', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
                });
                this.stats = response.data;
            } catch (error) {
                console.error('Error loading stats:', error);
            }
        },
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
        async loadAllChapters() {
            try {
                this.allChapters = [];
                for (const subject of this.subjects) {
                    const response = await axios.get(`/api/subjects/${subject.id}/chapters`, {
                        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
                    });
                    this.allChapters.push(...response.data.map(chapter => ({
                        ...chapter,
                        subject_name: subject.name
                    })));
                }
            } catch (error) {
                console.error('Error loading chapters:', error);
            }
        },
        async search() {
            if (!this.searchQuery.trim()) {
                this.searchResults = null;
                return;
            }

            try {
                const response = await axios.get(`/api/search?q=${encodeURIComponent(this.searchQuery)}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
                });
                this.searchResults = response.data;
            } catch (error) {
                console.error('Error searching:', error);
            }
        },
        selectSubjectForChapters(subjectId) {
            this.showSubjectsForChapters = false;
            this.$emit('switch-view', 'chapters', subjectId);
        },
        selectChapterForQuizzes(chapterId) {
            this.showChaptersForQuizzes = false;
            this.$emit('switch-view', 'quiz-manager', null, chapterId);
        }
    }
});
</script>
