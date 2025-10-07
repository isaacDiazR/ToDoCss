// Pixel Todo App - JavaScript
class PixelTodoApp {
    constructor() {
        this.baseURL = 'https://todoapitest.juansegaliz.com/todos';
        this.todos = [];
        this.currentFilter = 'all';
        this.editingTodoId = null;
        this.deletingTodoId = null;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadTodos();
    }

    setupEventListeners() {
        // Form submission
        document.getElementById('todo-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.createTodo();
        });

        // Edit form submission
        document.getElementById('edit-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateTodo();
        });

        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.filter);
            });
        });

        // Modal controls
        document.getElementById('close-modal').addEventListener('click', () => {
            this.closeEditModal();
        });

        document.getElementById('cancel-edit').addEventListener('click', () => {
            this.closeEditModal();
        });

        document.getElementById('close-delete-modal').addEventListener('click', () => {
            this.closeDeleteModal();
        });

        document.getElementById('cancel-delete').addEventListener('click', () => {
            this.closeDeleteModal();
        });

        document.getElementById('confirm-delete').addEventListener('click', () => {
            this.confirmDelete();
        });

        // Close modals on backdrop click
        document.getElementById('edit-modal').addEventListener('click', (e) => {
            if (e.target.id === 'edit-modal') {
                this.closeEditModal();
            }
        });

        document.getElementById('delete-modal').addEventListener('click', (e) => {
            if (e.target.id === 'delete-modal') {
                this.closeDeleteModal();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeEditModal();
                this.closeDeleteModal();
            }
        });
    }

    // API Methods
    async apiRequest(url, options = {}) {
        try {
            this.showLoading();
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = response.status !== 204 ? await response.json() : null;
            return data;
        } catch (error) {
            console.error('API Request failed:', error);
            this.showToast(`ERROR: ${error.message}`, 'error');
            throw error;
        } finally {
            this.hideLoading();
        }
    }

    async loadTodos() {
        try {
            const response = await this.apiRequest(this.baseURL);
            // El API devuelve {code: 200, data: [...], messages: []}
            this.todos = Array.isArray(response?.data) ? response.data : [];
            this.renderTodos();
            this.updateStats();
            this.showToast('TAREAS CARGADAS EXITOSAMENTE!', 'success');
        } catch (error) {
            this.todos = [];
            this.renderTodos();
            this.updateStats();
        }
    }

    async createTodo() {
        const form = document.getElementById('todo-form');
        const formData = new FormData(form);
        
        const todoData = {
            title: formData.get('title').trim(),
            description: formData.get('description').trim(),
            isCompleted: false
        };

        if (!todoData.title) {
            this.showToast('EL TÍTULO ES REQUERIDO!', 'error');
            return;
        }

        try {
            const response = await this.apiRequest(this.baseURL, {
                method: 'POST',
                body: JSON.stringify(todoData)
            });

            // Si el API devuelve {data: {...}}, extraer el todo creado
            const newTodo = response?.data || response;
            this.todos.push(newTodo);
            this.renderTodos();
            this.updateStats();
            form.reset();
            this.showToast('NUEVA TAREA CREADA!', 'success');
        } catch (error) {
            // Error already handled in apiRequest
        }
    }

    async updateTodo() {
        const form = document.getElementById('edit-form');
        const formData = new FormData(form);
        
        const todoData = {
            id: parseInt(document.getElementById('edit-id').value),
            title: formData.get('title').trim(),
            description: formData.get('description').trim(),
            isCompleted: document.getElementById('edit-completed').checked
        };

        if (!todoData.title) {
            this.showToast('EL TÍTULO ES REQUERIDO!', 'error');
            return;
        }

        try {
            const response = await this.apiRequest(`${this.baseURL}/${todoData.id}`, {
                method: 'PUT',
                body: JSON.stringify(todoData)
            });

            // Actualizar el todo en la lista local
            const index = this.todos.findIndex(todo => todo.id === todoData.id);
            if (index !== -1) {
                this.todos[index] = { ...this.todos[index], ...todoData };
            }

            this.renderTodos();
            this.updateStats();
            this.closeEditModal();
            this.showToast('TAREA ACTUALIZADA!', 'success');
        } catch (error) {
            // Error already handled in apiRequest
        }
    }

    async deleteTodo(id) {
        try {
            await this.apiRequest(`${this.baseURL}/${id}`, {
                method: 'DELETE'
            });

            this.todos = this.todos.filter(todo => todo.id !== id);
            this.renderTodos();
            this.updateStats();
            this.closeDeleteModal();
            this.showToast('TAREA ELIMINADA!', 'success');
        } catch (error) {
            // Error already handled in apiRequest
        }
    }

    async toggleComplete(id) {
        const todo = this.todos.find(t => t.id === id);
        if (!todo) return;

        const updatedTodo = {
            ...todo,
            isCompleted: !todo.isCompleted
        };

        try {
            await this.apiRequest(`${this.baseURL}/${id}`, {
                method: 'PUT',
                body: JSON.stringify(updatedTodo)
            });

            const index = this.todos.findIndex(t => t.id === id);
            if (index !== -1) {
                this.todos[index] = updatedTodo;
            }

            this.renderTodos();
            this.updateStats();
            const status = updatedTodo.isCompleted ? 'COMPLETADA' : 'REABIERTA';
            this.showToast(`TAREA ${status}!`, 'success');
        } catch (error) {
            // Error already handled in apiRequest
        }
    }

    // UI Methods
    renderTodos() {
        const container = document.getElementById('todos-container');
        const emptyState = document.getElementById('empty-state');
        
        const filteredTodos = this.getFilteredTodos();
        
        if (filteredTodos.length === 0) {
            container.innerHTML = '';
            emptyState.classList.remove('hidden');
            return;
        }

        emptyState.classList.add('hidden');
        
        container.innerHTML = filteredTodos.map(todo => `
            <div class="todo-item ${todo.isCompleted ? 'completed' : ''}" data-id="${todo.id}">
                <div class="todo-header">
                    <h3 class="todo-title">${this.escapeHtml(todo.title)}</h3>
                    <span class="todo-status ${todo.isCompleted ? 'completed' : ''}">
                        ${todo.isCompleted ? 'COMPLETADA' : 'PENDIENTE'}
                    </span>
                </div>
                <p class="todo-description">${this.escapeHtml(todo.description || 'Sin descripción')}</p>
                <div class="todo-actions">
                    <button class="action-btn complete" onclick="app.toggleComplete(${todo.id})">
                        ${todo.isCompleted ? 'REABRIR' : 'COMPLETAR'}
                    </button>
                    <button class="action-btn edit" onclick="app.openEditModal(${todo.id})">
                        EDITAR
                    </button>
                    <button class="action-btn delete" onclick="app.openDeleteModal(${todo.id})">
                        ELIMINAR
                    </button>
                </div>
            </div>
        `).join('');
    }

    getFilteredTodos() {
        switch (this.currentFilter) {
            case 'completed':
                return this.todos.filter(todo => todo.isCompleted);
            case 'pending':
                return this.todos.filter(todo => !todo.isCompleted);
            default:
                return this.todos;
        }
    }

    setFilter(filter) {
        this.currentFilter = filter;
        
        // Update filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
        
        this.renderTodos();
    }

    updateStats() {
        const total = this.todos.length;
        const completed = this.todos.filter(todo => todo.isCompleted).length;
        const pending = total - completed;

        document.getElementById('total-count').textContent = total;
        document.getElementById('completed-count').textContent = completed;
        document.getElementById('pending-count').textContent = pending;
    }

    // Modal Methods
    openEditModal(id) {
        const todo = this.todos.find(t => t.id === id);
        if (!todo) return;

        this.editingTodoId = id;
        
        // Agregar el ID al input hidden - ESTO ERA EL PROBLEMA
        document.getElementById('edit-id').value = todo.id;
        document.getElementById('edit-title').value = todo.title;
        document.getElementById('edit-description').value = todo.description || '';
        document.getElementById('edit-completed').checked = todo.isCompleted;
        
        document.getElementById('edit-modal').classList.remove('hidden');
        document.getElementById('edit-title').focus();
    }

    closeEditModal() {
        document.getElementById('edit-modal').classList.add('hidden');
        document.getElementById('edit-form').reset();
        this.editingTodoId = null;
    }

    openDeleteModal(id) {
        this.deletingTodoId = id;
        document.getElementById('delete-modal').classList.remove('hidden');
    }

    closeDeleteModal() {
        document.getElementById('delete-modal').classList.add('hidden');
        this.deletingTodoId = null;
    }

    confirmDelete() {
        if (this.deletingTodoId) {
            this.deleteTodo(this.deletingTodoId);
        }
    }

    // Utility Methods
    showLoading() {
        document.getElementById('loading').classList.remove('hidden');
    }

    hideLoading() {
        document.getElementById('loading').classList.add('hidden');
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        document.getElementById('toast-container').appendChild(toast);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 3000);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new PixelTodoApp();
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Enter to submit form
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        const activeElement = document.activeElement;
        if (activeElement && activeElement.form) {
            const submitButton = activeElement.form.querySelector('button[type="submit"]');
            if (submitButton) {
                submitButton.click();
            }
        }
    }
    
    // Alt + N for new todo
    if (e.altKey && e.key === 'n') {
        e.preventDefault();
        document.getElementById('todo-title').focus();
    }
});

// Handle online/offline status
window.addEventListener('online', () => {
    document.body.classList.remove('offline');
    if (window.app) {
        window.app.showToast('CONEXIÓN RESTAURADA!', 'success');
        window.app.loadTodos();
    }
});

window.addEventListener('offline', () => {
    document.body.classList.add('offline');
    if (window.app) {
        window.app.showToast('MODO OFFLINE - LOS CAMBIOS PUEDEN NO SINCRONIZAR', 'error');
    }
});

// Error boundary for unhandled errors
window.addEventListener('error', (event) => {
    console.error('Unhandled error:', event.error);
    if (window.app) {
        window.app.showToast('ERROR INESPERADO OCURRIDO', 'error');
    }
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    if (window.app) {
        window.app.showToast('ERROR DE RED - VERIFICAR CONEXIÓN', 'error');
    }
    event.preventDefault();
});