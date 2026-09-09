class TaskManager {
  constructor(currentId = 0) {
    this.tasks = [];
    this.currentId = currentId;
  }

  load() {
    const tasksJson = localStorage.getItem('tasks');
    if (tasksJson) {
      this.tasks = JSON.parse(tasksJson);
    }
    const currentId = localStorage.getItem('currentId');
    if (currentId) {
      this.currentId = Number(currentId);
    }
  }

  save() {
    const tasksJson = JSON.stringify(this.tasks);
    localStorage.setItem('tasks', tasksJson);
    const currentId = String(this.currentId);
    localStorage.setItem('currentId', currentId);
  }

  getAll() {
    return this.tasks;
  }

  getTaskById(id) {
    return this.tasks.find(t => t.id === id);
  }

  getFiltered(listId, dateFilter = '', searchQuery = '') {
    return this.tasks.filter(task => {
      const matchesList = task.listId === listId;
      const matchesDate = dateFilter ? task.date === dateFilter : true;
      const matchesSearch = searchQuery
        ? task.title.toLowerCase().includes(searchQuery) ||
          task.desc.toLowerCase().includes(searchQuery)
        : true;
      return matchesList && matchesDate && matchesSearch;
    });
  }

  getStatusInfo(status) {
    const map = {
      PORHACER: { label: 'Pendiente', class: 'status-pending' },
      pending: { label: 'Pendiente', class: 'status-pending' },
      DONE: { label: 'Completada', class: 'status-completed' },
      progress: { label: 'En progreso', class: 'status-progress' },
      completed: { label: 'Completada', class: 'status-completed' },
      urgent: { label: 'Urgente', class: 'status-urgent' },
    };
    return map[status] || map['pending'];
  }

  formatDate(dateStr) {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }

  createTaskHtml(id, name, description, dueDate, status) {
    const statusInfo = this.getStatusInfo(status);
    const isDone = status === 'DONE';
    return `
      <article class="task-card p-3 p-md-4 rounded-4 flex-shrink-0 ${isDone ? 'completed' : ''}"
               data-task-id="${id}">
        <div class="d-flex justify-content-between align-items-start mb-2">
          <h3 class="task-title h5 fw-bold mb-0">${name}</h3>
          <div class="d-flex align-items-center gap-2">
            <span class="task-status ${statusInfo.class}">${statusInfo.label}</span>
          </div>
        </div>
        <p class="task-desc mb-3">${description}</p>
        <div class="task-date d-flex align-items-center justify-content-between pt-2 border-top border-secondary border-opacity-10">
          <div class="small">
            <i class="bi bi-calendar-event me-1 text-crimson"></i>
            <span>Entrega: ${this.formatDate(dueDate)}</span>
          </div>
          <span class="small opacity-75">Creada: ${this.formatDate(dueDate)}</span>
        </div>
      </article>`;
  }

  render(renderFn) {
    if (typeof renderFn === 'function') {
      renderFn();
    }
  }

  addTask(name, description, dueDate, status) {
    this.currentId++;
    const newTask = {
      id: this.currentId,
      listId: 1,
      title: name,
      desc: description,
      createdAt: this.getTodayString(),
      date: dueDate,
      status: 'PORHACER',
      name: name,
      description: description,
      dueDate: dueDate
    };
    this.tasks.push(newTask);
    this.save();
    return newTask;
  }

  createTask(data, listId) {
    this.currentId++;
    const newTask = {
      id: this.currentId,
      listId,
      title: data.title.trim(),
      desc: data.desc.trim(),
      createdAt: this.getTodayString(),
      date: data.date,
      status: data.status,
    };
    this.tasks.push(newTask);
    this.save();
    return newTask;
  }

  update(id, data) {
    const index = this.tasks.findIndex(t => t.id === id);
    if (index !== -1) {
      this.tasks[index] = {
        ...this.tasks[index],
        ...data,
        listId: Number(data.listId),
      };
      this.save();
      return this.tasks[index];
    }
    return null;
  }

  delete(id) {
    const index = this.tasks.findIndex(t => t.id === id);
    if (index !== -1) {
      this.tasks.splice(index, 1);
      this.save();
      return true;
    }
    return false;
  }

  deleteTask(taskId) {
    const newTasks = [];
    for (let task of this.tasks) {
      if (task.id !== taskId) {
        newTasks.push(task);
      }
    }
    this.tasks = newTasks;
    this.save();
  }

  toggleComplete(id) {
    const task = this.getTaskById(id);
    if (task) {
      task.status = task.status === 'DONE' ? 'PORHACER' : 'DONE';
      this.save();
      return task;
    }
    return null;
  }

  getTodayString() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  clearAll() {
    this.tasks = [];
    this.save();
  }
}