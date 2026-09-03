class TaskManager {
  constructor(currentId = 0) {
    this.tasks = [];
    this.currentId = currentId;
    this.loadFromStorage();
  }

  loadFromStorage() {
    const stored = localStorage.getItem('todo_tasks');
    if (stored) {
      try {
        this.tasks = JSON.parse(stored);
        const maxId = this.tasks.reduce((max, task) => Math.max(max, task.id), 0);
        this.currentId = Math.max(this.currentId, maxId);
      } catch (e) {
        this.tasks = [];
        this.currentId = 0;
      }
    }
  }

  save() {
    localStorage.setItem('todo_tasks', JSON.stringify(this.tasks));
  }

  getAll() {
    return this.tasks;
  }

  getById(id) {
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
    const task = this.getById(id);
    if (task) {
      task.status = task.status === 'completed' ? 'pending' : 'completed';
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