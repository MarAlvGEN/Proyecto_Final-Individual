document.addEventListener('DOMContentLoaded', () => {
  let lists = JSON.parse(localStorage.getItem('todo_lists')) || [
    { id: 1, name: 'Inbox' },
    { id: 2, name: 'Compras' },
  ];

  let tasks = JSON.parse(localStorage.getItem('todo_tasks')) || [
    {
      id: 1,
      listId: 1,
      title: 'Estudiar para el examen de JS',
      desc: 'Repasar los conceptos de manipulación del DOM, eventos e iteradores en JavaScript.',
      createdAt: '2026-08-01',
      date: '2026-08-08',
      status: 'pending',
    },
    {
      id: 2,
      listId: 1,
      title: 'Entrega de Proyecto Individual 002',
      desc: 'Completar la maquetación del tablero de tareas y subir los cambios a GitHub.',
      createdAt: '2026-08-02',
      date: '2026-08-10',
      status: 'urgent',
    },
  ];

  let currentListId = lists[0]?.id || 1;
  let activeDateFilter = '';
  let activeSearchQuery = '';

  const listsContainer = document.getElementById('listsContainer');
  const taskList = document.getElementById('taskList');
  const currentListTitle = document.getElementById('currentListTitle');
  const calendarFilter = document.getElementById('calendarFilter');
  const clearDateBtn = document.getElementById('clearDateBtn');
  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');

  const saveListBtn = document.getElementById('saveListBtn');
  const newListInput = document.getElementById('newListInput');
  const saveTaskBtn = document.getElementById('saveTaskBtn');

  const editTaskId = document.getElementById('editTaskId');
  const editTaskTitleInput = document.getElementById('editTaskTitleInput');
  const editTaskDescInput = document.getElementById('editTaskDescInput');
  const editTaskListSelect = document.getElementById('editTaskListSelect');
  const editTaskCreatedAtInput = document.getElementById(
    'editTaskCreatedAtInput',
  );
  const editTaskDateInput = document.getElementById('editTaskDateInput');
  const editTaskStatusInput = document.getElementById('editTaskStatusInput');
  const newTaskStatusInput = document.getElementById('newTaskStatusInput');
  const updateTaskBtn = document.getElementById('updateTaskBtn');
  const deleteTaskBtn = document.getElementById('deleteTaskBtn');

  const statusMap = {
    pending: { label: 'Pendiente', class: 'status-pending' },
    progress: { label: 'En progreso', class: 'status-progress' },
    completed: { label: 'Completada', class: 'status-completed' },
    urgent: { label: 'Urgente', class: 'status-urgent' },
  };

  function saveData() {
    localStorage.setItem('todo_lists', JSON.stringify(lists));
    localStorage.setItem('todo_tasks', JSON.stringify(tasks));
  }

  function updateSelectStatusColor(selectElement) {
    if (selectElement) {
      selectElement.setAttribute('data-status', selectElement.value);
    }
  }

  [newTaskStatusInput, editTaskStatusInput].forEach((select) => {
    if (select) {
      updateSelectStatusColor(select);
      select.addEventListener('change', (e) =>
        updateSelectStatusColor(e.target),
      );
    }
  });

  const Toast = Swal.mixin({
    toast: true,
    position: 'bottom-end',
    showConfirmButton: false,
    timer: 2000,
    timerProgressBar: true,
    background: '#120d18',
    color: '#f8f9fa',
    customClass: {
      popup: 'border border-danger rounded-4 shadow-lg',
    },
  });

  function setDynamicHeaderDate() {
    const headerDate = document.querySelector('header h2');
    if (headerDate) {
      const today = new Date();
      const options = { month: 'short', day: '2-digit' };
      headerDate.textContent = today
        .toLocaleDateString('en-US', options)
        .toUpperCase();
    }
  }

  function formatDate(dateStr) {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }

  function getTodayString() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function validFormFieldInput(data) {
    const inputs = [
      'newTaskNameInput',
      'newTaskDescInput',
      'newTaskDateInput',
      'newTaskStatusInput',
    ];
    inputs.forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.classList.remove('border-danger', 'is-invalid');
    });

    if (!data.title || data.title.trim() === '') {
      document
        .getElementById('newTaskNameInput')
        ?.classList.add('border-danger', 'is-invalid');
      return {
        isValid: false,
        message: 'El campo "Título" no puede estar vacío.',
      };
    }
    if (!data.desc || data.desc.trim() === '') {
      document
        .getElementById('newTaskDescInput')
        ?.classList.add('border-danger', 'is-invalid');
      return {
        isValid: false,
        message: 'El campo "Descripción" no puede estar vacío.',
      };
    }
    if (!data.date || data.date.trim() === '') {
      document
        .getElementById('newTaskDateInput')
        ?.classList.add('border-danger', 'is-invalid');
      return {
        isValid: false,
        message: 'Debes seleccionar una fecha de entrega.',
      };
    }
    if (!data.status || data.status.trim() === '') {
      document
        .getElementById('newTaskStatusInput')
        ?.classList.add('border-danger', 'is-invalid');
      return {
        isValid: false,
        message: 'Debes seleccionar un estado para la tarea.',
      };
    }
    return { isValid: true, message: '' };
  }

  function renderLists() {
    listsContainer.innerHTML = '';
    lists.forEach((list) => {
      const listWrapper = document.createElement('div');
      listWrapper.className = 'd-flex align-items-center gap-1 mb-1';

      const btn = document.createElement('button');
      btn.className = `btn btn-list py-2 px-3 flex-grow-1 text-truncate fw-semibold ${
        list.id === currentListId ? 'active' : 'text-muted'
      }`;
      btn.textContent = list.name;
      btn.addEventListener('click', () => {
        currentListId = list.id;
        const activeList = lists.find((l) => l.id === currentListId);
        currentListTitle.textContent = activeList ? activeList.name : '';
        renderLists();
        renderTasks();
      });

      const editBtn = document.createElement('button');
      editBtn.className = 'btn btn-outline-crimson btn-sm px-2 py-1 rounded-3';
      editBtn.innerHTML = `<i class="bi bi-pencil-fill"></i>`;
      editBtn.title = 'Editar o borrar lista';
      editBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openEditListModal(list);
      });

      listWrapper.appendChild(btn);
      listWrapper.appendChild(editBtn);
      listsContainer.appendChild(listWrapper);
    });
  }

  function openEditListModal(list) {
    document.getElementById('editListIdInput').value = list.id;
    document.getElementById('editListInput').value = list.name;

    const modalEl = document.getElementById('editListModal');
    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.show();
  }

  document.getElementById('updateListBtn').addEventListener('click', () => {
    const listId = Number(document.getElementById('editListIdInput').value);
    const newName = document.getElementById('editListInput').value.trim();

    if (newName) {
      const listIndex = lists.findIndex((l) => l.id === listId);
      if (listIndex !== -1) {
        lists[listIndex].name = newName;
        if (currentListId === listId) {
          currentListTitle.textContent = newName;
        }
      }

      saveData();
      const modalInstance = bootstrap.Modal.getInstance(
        document.getElementById('editListModal'),
      );
      if (modalInstance) modalInstance.hide();
      renderLists();
      Toast.fire({ icon: 'success', title: 'Lista actualizada' });
    }
  });

  document.getElementById('deleteListBtn').addEventListener('click', () => {
    const listId = Number(document.getElementById('editListIdInput').value);

    if (lists.length <= 1) {
      Swal.fire({
        icon: 'error',
        title: 'Acción no permitida',
        text: 'Debes mantener al menos una lista activa.',
        background: '#120d18',
        color: '#fff',
      });
      return;
    }

    const modalInstance = bootstrap.Modal.getInstance(
      document.getElementById('editListModal'),
    );
    if (modalInstance) modalInstance.hide();

    Swal.fire({
      title: '¿Eliminar lista?',
      text: 'Se eliminarán también las tareas asociadas a esta lista.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ff0055',
      cancelButtonColor: '#343a40',
      confirmButtonText: 'Sí, borrar',
      cancelButtonText: 'Cancelar',
      background: '#120d18',
      color: '#fff',
    }).then((result) => {
      if (result.isConfirmed) {
        lists = lists.filter((l) => l.id !== listId);
        tasks = tasks.filter((t) => t.listId !== listId);

        if (currentListId === listId) {
          currentListId = lists[0].id;
          currentListTitle.textContent = lists[0].name;
        }

        saveData();
        renderLists();
        renderTasks();
        Toast.fire({ icon: 'success', title: 'Lista eliminada' });
      }
    });
  });

  function openEditModal(task) {
    editTaskId.value = task.id;
    editTaskTitleInput.value = task.title;
    editTaskDescInput.value = task.desc;
    editTaskCreatedAtInput.value = formatDate(task.createdAt);
    editTaskDateInput.value = task.date;
    editTaskStatusInput.value = task.status;

    updateSelectStatusColor(editTaskStatusInput);

    editTaskListSelect.innerHTML = '';
    lists.forEach((l) => {
      const option = document.createElement('option');
      option.value = l.id;
      option.textContent = l.name;
      if (l.id === task.listId) option.selected = true;
      editTaskListSelect.appendChild(option);
    });

    const editModalEl = document.getElementById('editTaskModal');
    const modal = bootstrap.Modal.getOrCreateInstance(editModalEl);
    modal.show();
  }

  function renderTasks() {
    taskList.innerHTML = '';

    const filteredTasks = tasks.filter((task) => {
      const matchesList = task.listId === currentListId;
      const matchesDate = activeDateFilter
        ? task.date === activeDateFilter
        : true;
      const matchesSearch = activeSearchQuery
        ? task.title.toLowerCase().includes(activeSearchQuery) ||
          task.desc.toLowerCase().includes(activeSearchQuery)
        : true;

      return matchesList && matchesDate && matchesSearch;
    });

    if (filteredTasks.length === 0) {
      taskList.innerHTML = `
        <div class="text-center my-5 py-4">
          <i class="bi bi-inbox fs-1 opacity-50"></i>
          <p class="mt-2">No hay tareas encontradas aquí.</p>
        </div>`;
      return;
    }

    filteredTasks.forEach((task, index) => {
      const statusInfo = statusMap[task.status] || statusMap['pending'];
      const article = document.createElement('article');
      article.className = 'task-card p-3 p-md-4 rounded-4 flex-shrink-0';
      article.style.animationDelay = `${index * 0.06}s`;

      article.innerHTML = `
        <div class="d-flex justify-content-between align-items-start mb-2">
          <h3 class="task-title h5 fw-bold mb-0">${task.title}</h3>
          <span class="task-status ${statusInfo.class}">${statusInfo.label}</span>
        </div>
        <p class="task-desc mb-3">${task.desc}</p>
        <div
          class="task-date d-flex align-items-center justify-content-between pt-2 border-top border-secondary border-opacity-10"
        >
          <div class="small">
            <i class="bi bi-calendar-event me-1 text-crimson"></i>
            <span>Entrega: ${formatDate(task.date)}</span>
          </div>
          <span class="small opacity-75">Creada: ${formatDate(task.createdAt)}</span>
        </div>
      `;

      article.addEventListener('click', () => openEditModal(task));
      taskList.appendChild(article);
    });
  }

  saveListBtn.addEventListener('click', () => {
    const name = newListInput.value.trim();
    if (name) {
      const newList = { id: Date.now(), name: name };
      lists.push(newList);
      newListInput.value = '';
      saveData();
      const modalInstance = bootstrap.Modal.getInstance(
        document.getElementById('newListModal'),
      );
      if (modalInstance) modalInstance.hide();
      renderLists();
      Toast.fire({ icon: 'success', title: 'Lista creada' });
    }
  });

  saveTaskBtn.addEventListener('click', () => {
    const formData = {
      title: document.querySelector('#newTaskNameInput').value,
      desc: document.querySelector('#newTaskDescInput').value,
      date: document.querySelector('#newTaskDateInput').value,
      status: document.querySelector('#newTaskStatusInput').value,
    };

    const validation = validFormFieldInput(formData);
    const formAlert = document.getElementById('formAlert');

    if (!validation.isValid) {
      document.getElementById('formAlertMessage').textContent =
        validation.message;
      formAlert.classList.remove('d-none');
    } else {
      formAlert.classList.add('d-none');

      const newTask = {
        id: Date.now(),
        listId: currentListId,
        title: formData.title.trim(),
        desc: formData.desc.trim(),
        createdAt: getTodayString(),
        date: formData.date,
        status: formData.status,
      };

      tasks.push(newTask);
      saveData();
      document.getElementById('taskForm').reset();
      updateSelectStatusColor(newTaskStatusInput);

      const modalInstance = bootstrap.Modal.getInstance(
        document.getElementById('newTaskModal'),
      );
      if (modalInstance) modalInstance.hide();
      renderTasks();
      Toast.fire({ icon: 'success', title: 'Tarea agregada' });
    }
  });

  updateTaskBtn.addEventListener('click', () => {
    const id = Number(editTaskId.value);
    const formData = {
      title: editTaskTitleInput.value.trim(),
      desc: editTaskDescInput.value.trim(),
      date: editTaskDateInput.value,
      status: editTaskStatusInput.value,
    };

    const validation = validFormFieldInput(formData);
    if (!validation.isValid) {
      Swal.fire({
        icon: 'error',
        title: 'Error de validación',
        text: validation.message,
        background: '#120d18',
        color: '#fff',
      });
      return;
    }

    const taskIndex = tasks.findIndex((t) => t.id === id);
    if (taskIndex !== -1) {
      tasks[taskIndex] = {
        ...tasks[taskIndex],
        listId: Number(editTaskListSelect.value),
        title: formData.title,
        desc: formData.desc,
        date: formData.date,
        status: formData.status,
      };
      saveData();
    }

    const modalInstance = bootstrap.Modal.getInstance(
      document.getElementById('editTaskModal'),
    );
    if (modalInstance) modalInstance.hide();
    renderTasks();
    Toast.fire({ icon: 'success', title: 'Tarea actualizada' });
  });

  deleteTaskBtn.addEventListener('click', () => {
    const id = Number(editTaskId.value);

    const modalInstance = bootstrap.Modal.getInstance(
      document.getElementById('editTaskModal'),
    );
    if (modalInstance) modalInstance.hide();

    Swal.fire({
      title: '¿Eliminar tarea?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ff0055',
      cancelButtonColor: '#343a40',
      confirmButtonText: 'Borrar',
      cancelButtonText: 'Cancelar',
      background: '#120d18',
      color: '#fff',
    }).then((result) => {
      if (result.isConfirmed) {
        tasks = tasks.filter((t) => t.id !== id);
        saveData();
        renderTasks();
        Toast.fire({ icon: 'success', title: 'Tarea borrada' });
      }
    });
  });

  calendarFilter.addEventListener('change', (e) => {
    activeDateFilter = e.target.value;
    renderTasks();
  });

  clearDateBtn.addEventListener('click', () => {
    calendarFilter.value = '';
    activeDateFilter = '';
    renderTasks();
  });

  searchBtn.addEventListener('click', () => {
    activeSearchQuery = searchInput.value.trim().toLowerCase();
    renderTasks();
  });

  searchInput.addEventListener('keyup', (e) => {
    activeSearchQuery = e.target.value.trim().toLowerCase();
    renderTasks();
  });

  setDynamicHeaderDate();
  renderLists();
  renderTasks();
});
