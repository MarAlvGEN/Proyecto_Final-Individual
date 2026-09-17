class ListManager {
  constructor() {
    this.lists = [];
    this.loadFromStorage();
    if (this.lists.length === 0) {
      this.lists = [
        { id: 1, name: 'Inbox' },
        { id: 2, name: 'Compras' },
      ];
      this.save();
    }
  }

  loadFromStorage() {
    const stored = localStorage.getItem('todo_lists');
    if (stored) {
      try {
        this.lists = JSON.parse(stored);
      } catch (e) {
        this.lists = [];
      }
    }
  }

  save() {
    localStorage.setItem('todo_lists', JSON.stringify(this.lists));
  }

  getAll() {
    return this.lists;
  }

  getById(id) {
    return this.lists.find((l) => l.id === id);
  }

  create(name) {
    const newList = { id: Date.now(), name: name.trim() };
    this.lists.push(newList);
    this.save();
    return newList;
  }

  update(id, name) {
    const index = this.lists.findIndex((l) => l.id === id);
    if (index !== -1) {
      this.lists[index].name = name.trim();
      this.save();
      return this.lists[index];
    }
    return null;
  }

  delete(id) {
    if (this.lists.length <= 1) {
      return {
        success: false,
        reason: 'Debes mantener al menos una lista activa.',
      };
    }
    const index = this.lists.findIndex((l) => l.id === id);
    if (index !== -1) {
      this.lists.splice(index, 1);
      this.save();
      return { success: true };
    }
    return { success: false, reason: 'Lista no encontrada.' };
  }

  getFirst() {
    return this.lists[0];
  }
}
