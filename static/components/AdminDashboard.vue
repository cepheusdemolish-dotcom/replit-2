<template>
    <div>
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2><i class="bi bi-speedometer2"></i> Admin Dashboard</h2>
        </div>
        
        <div class="row mb-4">
            <div class="col-md-3">
                <div class="card bg-primary text-white">
                    <div class="card-body">
                        <div class="d-flex justify-content-between">
                            <div>
                                <h6 class="card-title">Total Users</h6>
                                <h3>{{ stats.total_users }}</h3>
                            </div>
                            <i class="bi bi-people fs-1"></i>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card bg-success text-white">
                    <div class="card-body">
                        <div class="d-flex justify-content-between">
                            <div>
                                <h6 class="card-title">Total Subjects</h6>
                                <h3>{{ stats.total_subjects }}</h3>
                            </div>
                            <i class="bi bi-book fs-1"></i>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card bg-info text-white">
                    <div class="card-body">
                        <div class="d-flex justify-content-between">
                            <div>
                                <h6 class="card-title">Total Quizzes</h6>
                                <h3>{{ stats.total_quizzes }}</h3>
                            </div>
                            <i class="bi bi-clipboard-check fs-1"></i>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card bg-warning text-dark">
                    <div class="card-body">
                        <div class="d-flex justify-content-between">
                            <div>
                                <h6 class="card-title">Total Attempts</h6>
                                <h3>{{ stats.total_attempts }}</h3>
                            </div>
                            <i class="bi bi-graph-up fs-1"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="row">
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header">
                        <h5><i class="bi bi-gear"></i> Quick Actions</h5>
                    </div>
                    <div class="card-body">
                        <div class="d-grid gap-2">
                            <button class="btn btn-primary" @click="$emit('switch-view', 'subjects')">
                                <i class="bi bi-book"></i> Manage Subjects
                            </button>
                            <button class="btn btn-success" @click="$emit('switch-view', 'quiz-manager')">
                                <i class="bi bi-clipboard-plus"></i> Create Quiz
                            </button>
                            <button class="btn btn-info" @click="loadStats">
                                <i class="bi bi-arrow-clockwise"></i> Refresh Stats
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header">
                        <h5><i class="bi bi-trophy"></i> Recent Activity</h5>
                    </div>
                    <div class="card-body">
                        <div v-if="recentActivity.length === 0" class="text-muted">No recent activity</div>
                        <div v-else>
                            <div v-for="activity in recentActivity" :key="activity.id" class="mb-2">
                                <small class="text-muted">{{ activity.time }}</small><br>
                                <span>{{ activity.description }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'AdminDashboard',
    data() {
        return {
            stats: {
                total_users: 0,
                total_subjects: 0,
                total_quizzes: 0,
                total_attempts: 0
            },
            recentActivity: []
        };
    },
    mounted() {
        this.loadStats();
    },
    methods: {
        async loadStats() {
            try {
                const response = await axios.get('/api/admin/stats');
                this.stats = response.data;
            } catch (error) {
                console.error('Failed to load stats:', error);
            }
        }
    }
};
</script>