// NexusDaily - Fixed Todo Application with Working Click Handlers
class NexusDaily {
    constructor() {
        console.log('NexusDaily constructor called');
        
        this.currentView = 'today';
        this.isListening = false;
        this.timerActive = false;
        this.timerMinutes = 25;
        this.timerSeconds = 0;
        this.timerInterval = null;
        this.currentEditingTask = null;
        
        // Initialize with empty data as requested
        this.data = {
            tasks: [], // Empty by default
            settings: {
                theme: 'auto',
                notifications: true,
                voiceEnabled: true,
                pomodoroLength: 25,
                shortBreak: 5,
                longBreak: 15,
                workingHours: {
                    start: '09:00',
                    end: '17:00'
                }
            },
            stats: {
                currentStreak: 0,
                longestStreak: 0,
                totalTasksCompleted: 0,
                lastCompletionDate: null,
                weeklyTasksCompleted: 0,
                weeklyFocusTime: 0
            }
        };
        
        console.log('Initial data:', this.data);
    }

    init() {
        console.log('Initializing NexusDaily...');
        
        try {
            this.loadData();
            this.updateDateTime();
            this.setupEventListeners();
            this.renderCurrentView();
            this.updateCounters();
            this.updateStreakDisplay();
            this.startPeriodicUpdates();
            
            console.log('NexusDaily initialized successfully');
            this.showNotification('Welcome!', 'Ready to be productive?', 'success');
        } catch (error) {
            console.error('Error during initialization:', error);
            this.showNotification('Error', 'Failed to initialize app', 'error');
        }
    }

    loadData() {
        try {
            const savedData = localStorage.getItem('nexusDaily');
            if (savedData) {
                const parsed = JSON.parse(savedData);
                this.data = { ...this.data, ...parsed };
                console.log('Data loaded from localStorage:', this.data);
            } else {
                console.log('No saved data found, using defaults');
            }
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }

    saveData() {
        try {
            localStorage.setItem('nexusDaily', JSON.stringify(this.data));
            console.log('Data saved to localStorage');
        } catch (error) {
            console.error('Error saving data:', error);
        }
    }

    updateDateTime() {
        const now = new Date();
        const options = { 
            weekday: 'long', 
            month: 'long', 
            day: 'numeric'
        };
        const dateDisplay = document.getElementById('dateDisplay');
        if (dateDisplay) {
            dateDisplay.textContent = `Today, ${now.toLocaleDateString('en-US', options)}`;
        }
    }

    setupEventListeners() {
        console.log('Setting up event listeners...');
        
        try {
            // Navigation buttons
            document.querySelectorAll('.nav-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const view = e.target.closest('.nav-btn').dataset.view;
                    console.log('Navigation clicked:', view);
                    this.switchView(view);
                });
            });

            // Quick add functionality
            const quickInput = document.getElementById('quickInput');
            const quickAddBtn = document.getElementById('quickAddBtn');
            
            if (quickAddBtn) {
                quickAddBtn.addEventListener('click', (e) => {
                    console.log('Quick add button clicked');
                    e.preventDefault();
                    this.quickAddTask();
                });
            }
            
            if (quickInput) {
                quickInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        console.log('Enter pressed in quick input');
                        e.preventDefault();
                        this.quickAddTask();
                    }
                });
            }

            // Add task buttons
            const addTaskBtn = document.getElementById('addTaskBtn');
            const addFirstTaskBtn = document.getElementById('addFirstTask');
            
            if (addTaskBtn) {
                addTaskBtn.addEventListener('click', (e) => {
                    console.log('Add task button clicked');
                    e.preventDefault();
                    this.showTaskModal();
                });
            }
            
            if (addFirstTaskBtn) {
                addFirstTaskBtn.addEventListener('click', (e) => {
                    console.log('Add first task button clicked');
                    e.preventDefault();
                    this.showTaskModal();
                });
            }

            // Voice command
            const voiceBtn = document.getElementById('voiceBtn');
            if (voiceBtn) {
                voiceBtn.addEventListener('click', (e) => {
                    console.log('Voice button clicked');
                    e.preventDefault();
                    this.toggleVoiceCommand();
                });
            }

            // Timer
            const timerBtn = document.getElementById('timerBtn');
            if (timerBtn) {
                timerBtn.addEventListener('click', (e) => {
                    console.log('Timer button clicked');
                    e.preventDefault();
                    this.toggleTimer();
                });
            }

            // Settings
            const settingsBtn = document.getElementById('settingsBtn');
            if (settingsBtn) {
                settingsBtn.addEventListener('click', (e) => {
                    console.log('Settings button clicked');
                    e.preventDefault();
                    this.showSettingsModal();
                });
            }

            // Setup modal listeners
            this.setupModalListeners();
            
            console.log('Event listeners set up successfully');
        } catch (error) {
            console.error('Error setting up event listeners:', error);
        }
    }

    setupModalListeners() {
        console.log('Setting up modal listeners...');
        
        // Task modal
        const taskModalClose = document.getElementById('taskModalClose');
        const taskModalCancel = document.getElementById('taskModalCancel');
        const taskModalSave = document.getElementById('taskModalSave');

        if (taskModalClose) {
            taskModalClose.addEventListener('click', (e) => {
                console.log('Task modal close clicked');
                e.preventDefault();
                this.closeTaskModal();
            });
        }
        
        if (taskModalCancel) {
            taskModalCancel.addEventListener('click', (e) => {
                console.log('Task modal cancel clicked');
                e.preventDefault();
                this.closeTaskModal();
            });
        }
        
        if (taskModalSave) {
            taskModalSave.addEventListener('click', (e) => {
                console.log('Task modal save clicked');
                e.preventDefault();
                this.saveTask();
            });
        }

        // Settings modal
        const settingsModalClose = document.getElementById('settingsModalClose');
        const saveSettingsBtn = document.getElementById('saveSettings');
        
        if (settingsModalClose) {
            settingsModalClose.addEventListener('click', (e) => {
                console.log('Settings modal close clicked');
                e.preventDefault();
                this.closeSettingsModal();
            });
        }
        
        if (saveSettingsBtn) {
            saveSettingsBtn.addEventListener('click', (e) => {
                console.log('Save settings clicked');
                e.preventDefault();
                this.saveSettings();
            });
        }

        // Close modals when clicking outside
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                console.log('Modal backdrop clicked');
                e.target.classList.add('hidden');
            }
        });
        
        console.log('Modal listeners set up successfully');
    }

    switchView(viewName) {
        console.log('Switching to view:', viewName);
        
        // Update navigation
        document.querySelectorAll('.nav-btn').forEach(item => {
            item.classList.remove('active');
        });
        const navItem = document.querySelector(`[data-view="${viewName}"]`);
        if (navItem) {
            navItem.classList.add('active');
        }

        // Update content
        document.querySelectorAll('.view').forEach(view => {
            view.classList.remove('active');
        });
        const targetView = document.getElementById(`${viewName}View`);
        if (targetView) {
            targetView.classList.add('active');
        }

        this.currentView = viewName;
        this.renderCurrentView();
    }

    renderCurrentView() {
        console.log('Rendering view:', this.currentView);
        
        switch(this.currentView) {
            case 'today':
                this.renderTodayView();
                break;
            case 'tasks':
                this.renderAllTasksView();
                break;
            case 'analytics':
                this.renderAnalyticsView();
                break;
            default:
                console.log('Unknown view:', this.currentView);
        }
    }

    renderTodayView() {
        console.log('Rendering today view');
        
        const todayTasks = this.getTodayTasks();
        const emptyState = document.getElementById('emptyState');
        const tasksList = document.getElementById('tasksList');
        
        if (todayTasks.length === 0) {
            if (emptyState) emptyState.classList.remove('hidden');
            if (tasksList) tasksList.classList.add('hidden');
        } else {
            if (emptyState) emptyState.classList.add('hidden');
            if (tasksList) {
                tasksList.classList.remove('hidden');
                this.renderTasksList(tasksList, todayTasks);
            }
        }
        
        this.updateTodayStats();
    }

    renderAllTasksView() {
        console.log('Rendering all tasks view');
        
        const allTasksList = document.getElementById('allTasksList');
        if (allTasksList) {
            this.renderTasksList(allTasksList, this.data.tasks);
        }
    }

    renderTasksList(container, tasks) {
        if (!container) return;
        
        container.innerHTML = '';
        
        tasks.forEach(task => {
            const taskElement = this.createTaskElement(task);
            container.appendChild(taskElement);
        });
        
        console.log(`Rendered ${tasks.length} tasks`);
    }

    createTaskElement(task) {
        const taskElement = document.createElement('div');
        taskElement.className = `task-item ${task.completed ? 'completed' : ''}`;
        taskElement.dataset.taskId = task.id;

        const categoryIcons = {
            work: '💼',
            personal: '🏠',
            health: '🏃‍♂️',
            learning: '📚'
        };

        const formatDate = (dateStr) => {
            if (!dateStr) return '';
            const date = new Date(dateStr);
            return date.toLocaleDateString();
        };

        const formatTime = (timeStr) => {
            if (!timeStr) return '';
            return timeStr;
        };

        taskElement.innerHTML = `
            <div class="task-header">
                <div class="task-left">
                    <h3 class="task-title">${task.title}</h3>
                    <div class="task-meta">
                        <div class="task-category">
                            <span>${categoryIcons[task.category] || '📝'}</span>
                            <span>${task.category}</span>
                        </div>
                        ${task.dueDate ? `
                            <div class="task-due">
                                <i class="fas fa-calendar"></i>
                                <span>${formatDate(task.dueDate)}</span>
                            </div>
                        ` : ''}
                        ${task.dueTime ? `
                            <div class="task-due">
                                <i class="fas fa-clock"></i>
                                <span>${formatTime(task.dueTime)}</span>
                            </div>
                        ` : ''}
                    </div>
                </div>
                <div class="task-right">
                    <div class="priority-badge priority-${task.priority}">${task.priority}</div>
                </div>
            </div>
            ${task.description ? `<p class="task-description">${task.description}</p>` : ''}
            <div class="task-actions">
                <div class="task-checkbox ${task.completed ? 'checked' : ''}" data-task-id="${task.id}">
                    ${task.completed ? '<i class="fas fa-check"></i>' : ''}
                </div>
                <button class="btn btn--sm" data-action="start-timer" data-task-id="${task.id}">
                    <i class="fas fa-play"></i> Focus
                </button>
                <button class="btn btn--sm btn--secondary" data-action="edit" data-task-id="${task.id}">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn btn--sm btn--outline" data-action="delete" data-task-id="${task.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;

        // Add event listeners to task actions
        taskElement.querySelector('.task-checkbox').addEventListener('click', (e) => {
            console.log('Task checkbox clicked for task:', task.id);
            e.stopPropagation();
            this.toggleTask(task.id);
        });

        taskElement.querySelectorAll('[data-action]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = e.target.closest('[data-action]').dataset.action;
                const taskId = parseInt(e.target.closest('[data-action]').dataset.taskId);
                console.log('Task action clicked:', action, 'for task:', taskId);
                
                switch(action) {
                    case 'start-timer':
                        this.startTaskTimer(taskId);
                        break;
                    case 'edit':
                        this.editTask(taskId);
                        break;
                    case 'delete':
                        this.deleteTask(taskId);
                        break;
                }
            });
        });

        return taskElement;
    }

    getTodayTasks() {
        const today = new Date().toISOString().split('T')[0];
        return this.data.tasks.filter(task => {
            // Include tasks due today or overdue tasks
            if (task.dueDate === today) return true;
            if (task.dueDate && task.dueDate < today && !task.completed) return true;
            // Include tasks without due date that aren't completed
            if (!task.dueDate && !task.completed) return true;
            return false;
        }).sort((a, b) => {
            const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
        });
    }

    quickAddTask() {
        console.log('Quick add task called');
        
        const input = document.getElementById('quickInput');
        if (!input || !input.value.trim()) {
            console.log('No input value');
            this.showNotification('Error', 'Please enter a task title', 'error');
            return;
        }

        const title = input.value.trim();
        const newTask = {
            id: Date.now(),
            title: title,
            description: '',
            category: this.detectCategory(title),
            priority: 'medium',
            dueDate: new Date().toISOString().split('T')[0],
            dueTime: '',
            completed: false,
            createdAt: new Date().toISOString()
        };

        console.log('Creating new task:', newTask);
        
        this.data.tasks.push(newTask);
        input.value = '';
        
        this.saveData();
        this.renderCurrentView();
        this.updateCounters();
        this.showNotification('Task Added!', `"${title}" added to your tasks`, 'success');
    }

    detectCategory(title) {
        const titleLower = title.toLowerCase();
        
        if (titleLower.includes('work') || titleLower.includes('meeting') || 
            titleLower.includes('project') || titleLower.includes('report')) {
            return 'work';
        }
        if (titleLower.includes('workout') || titleLower.includes('exercise') || 
            titleLower.includes('health') || titleLower.includes('run')) {
            return 'health';
        }
        if (titleLower.includes('learn') || titleLower.includes('study') || 
            titleLower.includes('read') || titleLower.includes('course')) {
            return 'learning';
        }
        
        return 'personal';
    }

    toggleTask(taskId) {
        console.log('Toggling task:', taskId);
        
        const task = this.data.tasks.find(t => t.id === taskId);
        if (!task) {
            console.error('Task not found:', taskId);
            return;
        }

        task.completed = !task.completed;
        task.completedAt = task.completed ? new Date().toISOString() : null;
        
        if (task.completed) {
            this.updateStreak();
            this.showNotification('Task Completed!', `Great job finishing "${task.title}"!`, 'success');
        } else {
            this.showNotification('Task Reopened', `"${task.title}" marked as incomplete`, 'info');
        }

        this.saveData();
        this.renderCurrentView();
        this.updateCounters();
        this.updateStreakDisplay();
    }

    updateStreak() {
        console.log('Updating streak');
        
        const today = new Date().toDateString();
        const lastCompletion = this.data.stats.lastCompletionDate;
        
        if (!lastCompletion) {
            // First completion ever
            this.data.stats.currentStreak = 1;
            console.log('First completion, streak = 1');
        } else {
            const lastDate = new Date(lastCompletion).toDateString();
            const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
            
            if (lastDate === yesterday) {
                // Consecutive day
                this.data.stats.currentStreak++;
                console.log('Consecutive day, streak =', this.data.stats.currentStreak);
            } else if (lastDate !== today) {
                // Reset streak
                this.data.stats.currentStreak = 1;
                console.log('Reset streak to 1');
            }
        }
        
        this.data.stats.lastCompletionDate = today;
        this.data.stats.totalTasksCompleted++;
        
        // Update longest streak
        if (this.data.stats.currentStreak > this.data.stats.longestStreak) {
            this.data.stats.longestStreak = this.data.stats.currentStreak;
        }
        
        this.saveData();
    }

    updateStreakDisplay() {
        const streakCount = document.getElementById('streakCount');
        if (streakCount) {
            streakCount.textContent = this.data.stats.currentStreak;
        }
    }

    showTaskModal(task = null) {
        console.log('Showing task modal for task:', task?.id || 'new');
        
        this.currentEditingTask = task;
        const modal = document.getElementById('taskModal');
        const modalTitle = document.getElementById('modalTitle');
        
        if (task) {
            modalTitle.textContent = 'Edit Task';
            this.populateTaskForm(task);
        } else {
            modalTitle.textContent = 'Create New Task';
            this.clearTaskForm();
        }
        
        modal.classList.remove('hidden');
        
        // Focus on title input
        setTimeout(() => {
            const titleInput = document.getElementById('taskTitle');
            if (titleInput) titleInput.focus();
        }, 100);
    }

    populateTaskForm(task) {
        document.getElementById('taskTitle').value = task.title || '';
        document.getElementById('taskDescription').value = task.description || '';
        document.getElementById('taskCategory').value = task.category || 'personal';
        document.getElementById('taskPriority').value = task.priority || 'medium';
        document.getElementById('taskDueDate').value = task.dueDate || '';
        document.getElementById('taskDueTime').value = task.dueTime || '';
    }

    clearTaskForm() {
        document.getElementById('taskTitle').value = '';
        document.getElementById('taskDescription').value = '';
        document.getElementById('taskCategory').value = 'personal';
        document.getElementById('taskPriority').value = 'medium';
        document.getElementById('taskDueDate').value = new Date().toISOString().split('T')[0];
        document.getElementById('taskDueTime').value = '';
    }

    saveTask() {
        console.log('Saving task');
        
        const title = document.getElementById('taskTitle').value.trim();
        if (!title) {
            this.showNotification('Error', 'Please enter a task title', 'error');
            return;
        }

        const taskData = {
            title: title,
            description: document.getElementById('taskDescription').value.trim(),
            category: document.getElementById('taskCategory').value,
            priority: document.getElementById('taskPriority').value,
            dueDate: document.getElementById('taskDueDate').value,
            dueTime: document.getElementById('taskDueTime').value
        };

        if (this.currentEditingTask) {
            // Update existing task
            console.log('Updating existing task:', this.currentEditingTask.id);
            Object.assign(this.currentEditingTask, taskData);
            this.showNotification('Task Updated!', 'Your changes have been saved', 'success');
        } else {
            // Create new task
            console.log('Creating new task');
            const newTask = {
                id: Date.now(),
                ...taskData,
                completed: false,
                createdAt: new Date().toISOString()
            };
            
            this.data.tasks.push(newTask);
            this.showNotification('Task Created!', `"${title}" has been added to your tasks`, 'success');
        }

        this.saveData();
        this.closeTaskModal();
        this.renderCurrentView();
        this.updateCounters();
    }

    editTask(taskId) {
        console.log('Editing task:', taskId);
        
        const task = this.data.tasks.find(t => t.id === taskId);
        if (task) {
            this.showTaskModal(task);
        }
    }

    deleteTask(taskId) {
        console.log('Deleting task:', taskId);
        
        const taskIndex = this.data.tasks.findIndex(t => t.id === taskId);
        if (taskIndex !== -1) {
            const task = this.data.tasks[taskIndex];
            this.data.tasks.splice(taskIndex, 1);
            
            this.saveData();
            this.renderCurrentView();
            this.updateCounters();
            this.showNotification('Task Deleted', `"${task.title}" has been removed`, 'info');
        }
    }

    closeTaskModal() {
        console.log('Closing task modal');
        document.getElementById('taskModal').classList.add('hidden');
        this.currentEditingTask = null;
    }

    toggleVoiceCommand() {
        console.log('Toggling voice command');
        
        if (this.isListening) {
            this.stopVoiceCommand();
        } else {
            this.startVoiceCommand();
        }
    }

    startVoiceCommand() {
        console.log('Starting voice command');
        
        this.isListening = true;
        const voiceBtn = document.getElementById('voiceBtn');
        const voiceIndicator = document.getElementById('voiceIndicator');
        
        if (voiceBtn) voiceBtn.classList.add('listening');
        if (voiceIndicator) voiceIndicator.classList.remove('hidden');
        
        // Simulate voice recognition (in a real app, this would use Web Speech API)
        setTimeout(() => {
            this.processVoiceCommand("Add task review weekly reports");
        }, 3000);
    }

    stopVoiceCommand() {
        console.log('Stopping voice command');
        
        this.isListening = false;
        const voiceBtn = document.getElementById('voiceBtn');
        const voiceIndicator = document.getElementById('voiceIndicator');
        
        if (voiceBtn) voiceBtn.classList.remove('listening');
        if (voiceIndicator) voiceIndicator.classList.add('hidden');
    }

    processVoiceCommand(command) {
        console.log('Processing voice command:', command);
        
        this.stopVoiceCommand();
        
        const lowerCommand = command.toLowerCase();
        
        if (lowerCommand.includes('add task') || lowerCommand.includes('create task')) {
            const taskTitle = command.replace(/add task|create task/i, '').trim();
            if (taskTitle) {
                const quickInput = document.getElementById('quickInput');
                if (quickInput) {
                    quickInput.value = taskTitle;
                    this.quickAddTask();
                }
            } else {
                this.showTaskModal();
            }
            this.showNotification('Voice Command', 'Task command processed', 'success');
        } else if (lowerCommand.includes('start timer') || lowerCommand.includes('focus')) {
            this.startTimer();
            this.showNotification('Voice Command', 'Starting focus timer', 'success');
        } else {
            this.showNotification('Voice Command', 'Try: "Add task [name]", "Start timer"', 'info');
        }
    }

    toggleTimer() {
        console.log('Toggling timer');
        
        if (this.timerActive) {
            this.stopTimer();
        } else {
            this.startTimer();
        }
    }

    startTimer() {
        console.log('Starting timer');
        
        this.timerActive = true;
        this.timerMinutes = this.data.settings.pomodoroLength;
        this.timerSeconds = 0;
        
        const timerBtn = document.getElementById('timerBtn');
        if (timerBtn) {
            timerBtn.textContent = 'Stop';
            timerBtn.classList.add('btn--error');
        }
        
        this.timerInterval = setInterval(() => {
            if (this.timerSeconds > 0) {
                this.timerSeconds--;
            } else if (this.timerMinutes > 0) {
                this.timerMinutes--;
                this.timerSeconds = 59;
            } else {
                this.timerComplete();
                return;
            }
            this.updateTimerDisplay();
        }, 1000);
        
        this.showNotification('Focus Timer Started', `${this.data.settings.pomodoroLength} minutes of focused work ahead!`, 'success');
    }

    stopTimer() {
        console.log('Stopping timer');
        
        this.timerActive = false;
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        
        const timerBtn = document.getElementById('timerBtn');
        if (timerBtn) {
            timerBtn.textContent = 'Focus';
            timerBtn.classList.remove('btn--error');
        }
        
        this.timerMinutes = this.data.settings.pomodoroLength;
        this.timerSeconds = 0;
        this.updateTimerDisplay();
    }

    timerComplete() {
        console.log('Timer completed');
        
        this.stopTimer();
        this.data.stats.weeklyFocusTime += this.data.settings.pomodoroLength;
        this.saveData();
        this.showNotification('Focus Session Complete!', `Great job! Take a ${this.data.settings.shortBreak}-minute break.`, 'success');
    }

    startTaskTimer(taskId) {
        console.log('Starting task timer for:', taskId);
        
        const task = this.data.tasks.find(t => t.id === taskId);
        if (task) {
            this.startTimer();
            this.showNotification('Focus Timer', `Timer started for "${task.title}"`, 'success');
        }
    }

    updateTimerDisplay() {
        const timerDisplay = document.getElementById('timerDisplay');
        if (timerDisplay) {
            const display = `${this.timerMinutes.toString().padStart(2, '0')}:${this.timerSeconds.toString().padStart(2, '0')}`;
            timerDisplay.textContent = display;
        }
    }

    showSettingsModal() {
        console.log('Showing settings modal');
        
        const modal = document.getElementById('settingsModal');
        if (modal) {
            modal.classList.remove('hidden');
            
            // Populate current settings
            document.getElementById('pomodoroLength').value = this.data.settings.pomodoroLength;
            document.getElementById('enableNotifications').checked = this.data.settings.notifications;
            document.getElementById('enableVoice').checked = this.data.settings.voiceEnabled;
        }
    }

    closeSettingsModal() {
        console.log('Closing settings modal');
        document.getElementById('settingsModal').classList.add('hidden');
    }

    saveSettings() {
        console.log('Saving settings');
        
        this.data.settings.pomodoroLength = parseInt(document.getElementById('pomodoroLength').value);
        this.data.settings.notifications = document.getElementById('enableNotifications').checked;
        this.data.settings.voiceEnabled = document.getElementById('enableVoice').checked;
        
        this.saveData();
        this.closeSettingsModal();
        this.showNotification('Settings Saved', 'Your preferences have been updated', 'success');
    }

    updateCounters() {
        console.log('Updating counters');
        
        const todayTasks = this.getTodayTasks();
        const allTasks = this.data.tasks.filter(t => !t.completed);
        
        const todayCount = document.getElementById('todayCount');
        const allTasksCount = document.getElementById('allTasksCount');
        
        if (todayCount) todayCount.textContent = todayTasks.length;
        if (allTasksCount) allTasksCount.textContent = allTasks.length;
    }

    updateTodayStats() {
        const todayTasks = this.getTodayTasks();
        const completedToday = todayTasks.filter(t => t.completed).length;
        
        const completedTodayEl = document.getElementById('completedToday');
        const totalTodayEl = document.getElementById('totalToday');
        
        if (completedTodayEl) completedTodayEl.textContent = completedToday;
        if (totalTodayEl) totalTodayEl.textContent = todayTasks.length;
    }

    renderAnalyticsView() {
        console.log('Rendering analytics view');
        
        const totalCompleted = document.getElementById('totalCompleted');
        const currentStreak = document.getElementById('currentStreak');
        
        if (totalCompleted) totalCompleted.textContent = this.data.stats.totalTasksCompleted;
        if (currentStreak) currentStreak.textContent = this.data.stats.currentStreak;
    }

    showNotification(title, message, type = 'info') {
        console.log('Showing notification:', title, message, type);
        
        const container = document.getElementById('notifications');
        if (!container) return;
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        notification.innerHTML = `
            <div class="notification-title">${title}</div>
            <div class="notification-message">${message}</div>
        `;
        
        container.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }

    startPeriodicUpdates() {
        console.log('Starting periodic updates');
        
        // Update every minute
        setInterval(() => {
            this.updateDateTime();
        }, 60000);
        
        // Save data every 5 minutes
        setInterval(() => {
            this.saveData();
        }, 300000);
    }
}

// Initialize the application when DOM is ready
let app = null;

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded - Initializing app');
    try {
        app = new NexusDaily();
        app.init();
        
        // Make app available globally for debugging
        window.app = app;
        console.log('App initialized and available as window.app');
    } catch (error) {
        console.error('Failed to initialize app:', error);
    }
});

// Fallback initialization if DOMContentLoaded already fired
if (document.readyState === 'loading') {
    console.log('Document still loading, waiting for DOMContentLoaded');
} else {
    console.log('Document already loaded, initializing immediately');
    app = new NexusDaily();
    app.init();
    window.app = app;
}