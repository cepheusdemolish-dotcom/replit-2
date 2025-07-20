<template id="quiz-history">
    <div>
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h3><i class="bi bi-clock-history"></i> Quiz History</h3>
            <div class="d-flex gap-2">
                <select class="form-select" v-model="filterBy" @change="applyFilters" style="width: auto;">
                    <option value="">All Subjects</option>
                    <option v-for="subject in subjects" :key="subject" :value="subject">{{ subject }}</option>
                </select>
                <select class="form-select" v-model="sortBy" @change="applySort" style="width: auto;">
                    <option value="recent">Recent First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="score_high">Highest Score</option>
                    <option value="score_low">Lowest Score</option>
                </select>
            </div>
        </div>

        <!-- Statistics Cards -->
        <div class="row mb-4">
            <div class="col-md-3">
                <div class="card text-center">
                    <div class="card-body">
                        <i class="bi bi-clipboard-check-fill fs-2 text-primary"></i>
                        <h5 class="mt-2">{{ totalAttempts }}</h5>
                        <small class="text-muted">Total Attempts</small>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card text-center">
                    <div class="card-body">
                        <i class="bi bi-percent fs-2 text-success"></i>
                        <h5 class="mt-2">{{ averageScore }}%</h5>
                        <small class="text-muted">Average Score</small>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card text-center">
                    <div class="card-body">
                        <i class="bi bi-trophy-fill fs-2 text-warning"></i>
                        <h5 class="mt-2">{{ highestScore }}%</h5>
                        <small class="text-muted">Highest Score</small>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card text-center">
                    <div class="card-body">
                        <i class="bi bi-calendar-check fs-2 text-info"></i>
                        <h5 class="mt-2">{{ recentAttempts }}</h5>
                        <small class="text-muted">This Week</small>
                    </div>
                </div>
            </div>
        </div>

        <!-- Performance Chart -->
        <div v-if="scores.length > 0" class="card mb-4">
            <div class="card-header">
                <h5><i class="bi bi-graph-up"></i> Performance Trend</h5>
            </div>
            <div class="card-body">
                <canvas ref="performanceChart" width="400" height="100"></canvas>
            </div>
        </div>

        <!-- Quiz History Table -->
        <div class="card">
            <div class="card-header">
                <h5>Quiz Attempts ({{ filteredScores.length }})</h5>
            </div>
            <div class="card-body">
                <div v-if="loading" class="text-center">
                    <div class="spinner-border" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <p class="mt-3">Loading quiz history...</p>
                </div>

                <div v-else-if="filteredScores.length === 0" class="text-center">
                    <i class="bi bi-inbox fs-1 text-muted"></i>
                    <p class="mt-3">
                        {{ scores.length === 0 ? 'No quiz attempts yet.' : 'No quiz attempts match your filters.' }}
                    </p>
                    <div v-if="scores.length === 0">
                        <button class="btn btn-primary" @click="$emit('switch-view', 'user-dashboard')">
                            <i class="bi bi-patch-question"></i> Take Your First Quiz
                        </button>
                    </div>
                </div>

                <div v-else class="table-responsive">
                    <table class="table table-hover">
                        <thead>
                            <tr>
                                <th>Quiz</th>
                                <th>Subject</th>
                                <th>Chapter</th>
                                <th>Score</th>
                                <th>Percentage</th>
                                <th>Time Taken</th>
                                <th>Date</th>
                                <th>Performance</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="score in paginatedScores" :key="score.id">
                                <td>
                                    <strong>{{ score.quiz_title }}</strong>
                                </td>
                                <td>
                                    <span class="badge bg-secondary">{{ score.subject_name }}</span>
                                </td>
                                <td>
                                    <span class="badge bg-info">{{ score.chapter_name }}</span>
                                </td>
                                <td>
                                    <span class="fw-bold">{{ score.total_scored }} / {{ score.total_questions }}</span>
                                </td>
                                <td>
                                    <div class="d-flex align-items-center">
                                        <div class="progress me-2" style="width: 60px; height: 20px;">
                                            <div class="progress-bar" 
                                                 :class="getScoreClass(score.percentage)"
                                                 :style="{width: score.percentage + '%'}">
                                            </div>
                                        </div>
                                        <span :class="getScoreTextClass(score.percentage)">
                                            {{ Math.round(score.percentage) }}%
                                        </span>
                                    </div>
                                </td>
                                <td>
                                    <i class="bi bi-stopwatch me-1"></i>
                                    {{ formatTime(score.time_taken) }}
                                </td>
                                <td>
                                    <small>{{ formatDate(score.attempt_date) }}</small>
                                </td>
                                <td>
                                    <span class="badge" :class="getPerformanceBadgeClass(score.percentage)">
                                        {{ getPerformanceLabel(score.percentage) }}
                                    </span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Pagination -->
                <div v-if="totalPages > 1" class="d-flex justify-content-center mt-4">
                    <nav aria-label="Quiz history pagination">
                        <ul class="pagination">
                            <li class="page-item" :class="{ disabled: currentPage === 1 }">
                                <a class="page-link" href="#" @click.prevent="goToPage(currentPage - 1)">Previous</a>
                            </li>
                            <li v-for="page in visiblePages" :key="page" 
                                class="page-item" :class="{ active: page === currentPage }">
                                <a class="page-link" href="#" @click.prevent="goToPage(page)">{{ page }}</a>
                            </li>
                            <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                                <a class="page-link" href="#" @click.prevent="goToPage(currentPage + 1)">Next</a>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
app.component('quiz-history', {
    template: '#quiz-history',
    data() {
        return {
            scores: [],
            filteredScores: [],
            loading: true,
            filterBy: '',
            sortBy: 'recent',
            currentPage: 1,
            itemsPerPage: 10,
            performanceChart: null
        }
    },
    computed: {
        subjects() {
            return [...new Set(this.scores.map(score => score.subject_name))];
        },
        totalAttempts() {
            return this.scores.length;
        },
        averageScore() {
            if (this.scores.length === 0) return 0;
            const sum = this.scores.reduce((acc, score) => acc + score.percentage, 0);
            return Math.round(sum / this.scores.length);
        },
        highestScore() {
            if (this.scores.length === 0) return 0;
            return Math.round(Math.max(...this.scores.map(score => score.percentage)));
        },
        recentAttempts() {
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            return this.scores.filter(score => new Date(score.attempt_date) >= oneWeekAgo).length;
        },
        totalPages() {
            return Math.ceil(this.filteredScores.length / this.itemsPerPage);
        },
        paginatedScores() {
            const start = (this.currentPage - 1) * this.itemsPerPage;
            return this.filteredScores.slice(start, start + this.itemsPerPage);
        },
        visiblePages() {
            const pages = [];
            const maxVisible = 5;
            let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
            let end = Math.min(this.totalPages, start + maxVisible - 1);
            
            if (end - start < maxVisible - 1) {
                start = Math.max(1, end - maxVisible + 1);
            }
            
            for (let i = start; i <= end; i++) {
                pages.push(i);
            }
            return pages;
        }
    },
    async mounted() {
        await this.loadScores();
        this.applyFilters();
        this.$nextTick(() => {
            this.createPerformanceChart();
        });
    },
    methods: {
        async loadScores() {
            try {
                const response = await axios.get('/api/user/scores', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
                });
                this.scores = response.data;
            } catch (error) {
                console.error('Error loading scores:', error);
            } finally {
                this.loading = false;
            }
        },
        applyFilters() {
            this.filteredScores = this.scores.filter(score => {
                if (this.filterBy && score.subject_name !== this.filterBy) {
                    return false;
                }
                return true;
            });
            this.applySort();
        },
        applySort() {
            this.filteredScores.sort((a, b) => {
                switch (this.sortBy) {
                    case 'recent':
                        return new Date(b.attempt_date) - new Date(a.attempt_date);
                    case 'oldest':
                        return new Date(a.attempt_date) - new Date(b.attempt_date);
                    case 'score_high':
                        return b.percentage - a.percentage;
                    case 'score_low':
                        return a.percentage - b.percentage;
                    default:
                        return 0;
                }
            });
            this.currentPage = 1;
        },
        goToPage(page) {
            if (page >= 1 && page <= this.totalPages) {
                this.currentPage = page;
            }
        },
        formatDate(dateString) {
            const date = new Date(dateString);
            return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        },
        formatTime(seconds) {
            if (!seconds) return 'N/A';
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = seconds % 60;
            return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
        },
        getScoreClass(percentage) {
            if (percentage >= 90) return 'bg-success';
            if (percentage >= 70) return 'bg-primary';
            if (percentage >= 50) return 'bg-warning';
            return 'bg-danger';
        },
        getScoreTextClass(percentage) {
            if (percentage >= 90) return 'text-success fw-bold';
            if (percentage >= 70) return 'text-primary fw-bold';
            if (percentage >= 50) return 'text-warning fw-bold';
            return 'text-danger fw-bold';
        },
        getPerformanceBadgeClass(percentage) {
            if (percentage >= 90) return 'bg-success';
            if (percentage >= 70) return 'bg-primary';
            if (percentage >= 50) return 'bg-warning text-dark';
            return 'bg-danger';
        },
        getPerformanceLabel(percentage) {
            if (percentage >= 90) return 'Excellent';
            if (percentage >= 70) return 'Good';
            if (percentage >= 50) return 'Average';
            return 'Needs Improvement';
        },
        createPerformanceChart() {
            if (!this.$refs.performanceChart || this.scores.length === 0) return;

            const ctx = this.$refs.performanceChart.getContext('2d');
            
            // Prepare data for chart
            const sortedScores = [...this.scores].sort((a, b) => new Date(a.attempt_date) - new Date(b.attempt_date));
            const labels = sortedScores.map(score => new Date(score.attempt_date).toLocaleDateString());
            const data = sortedScores.map(score => Math.round(score.percentage));

            if (this.performanceChart) {
                this.performanceChart.destroy();
            }

            this.performanceChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Score (%)',
                        data: data,
                        borderColor: 'rgb(75, 192, 192)',
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        tension: 0.1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 100,
                            ticks: {
                                callback: function(value) {
                                    return value + '%';
                                }
                            }
                        }
                    },
                    plugins: {
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return 'Score: ' + context.parsed.y + '%';
                                }
                            }
                        }
                    }
                }
            });
        }
    }
});
</script>
