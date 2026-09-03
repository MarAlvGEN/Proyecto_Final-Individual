document.addEventListener('DOMContentLoaded', () => {
  const taskManager = new TaskManager();
  const listManager = new ListManager();

  console.log(taskManager.tasks);

  let currentListId = listManager.getFirst()?.id || 1;
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
  const editTaskCreatedAtInput = document.getElementById('editTaskCreatedAtInput');
  const editTaskDateInput = document.getElementById('editTaskDateInput');
  const editTaskStatusInput = document.getElementById('editTaskStatusInput');
  const newTaskStatusInput = document.getElementById('newTaskStatusInput');
  const updateTaskBtn = document.getElementById('updateTaskBtn');
  const deleteTaskBtn = document.getElementById('deleteTaskBtn');

  const statusMap = {
    PORHACER: { label: 'Pendiente', class: 'status-pending' },
    pending: { label: 'Pendiente', class: 'status-pending' },
    progress: { label: 'En progreso', class: 'status-progress' },
    completed: { label: 'Completada', class: 'status-completed' },
    urgent: { label: 'Urgente', class: 'status-urgent' },
  };

  function updateSelectStatusColor(selectElement) {
    if (selectElement) {
      selectElement.setAttribute('data-status', selectElement.value);
    }
  }

  [newTaskStatusInput, editTaskStatusInput].forEach((select) => {
    if (select) {
      updateSelectStatusColor(select);
      select.addEventListener('change', (e) => updateSelectStatusColor(e.target));
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
      headerDate.textContent = today.toLocaleDateString('en-US', options).toUpperCase();
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
      document.getElementById('newTaskNameInput')?.classList.add('border-danger', 'is-invalid');
      return { isValid: false, message: 'El campo "Título" no puede estar vacío.' };
    }
    if (!data.desc || data.desc.trim() === '') {
      document.getElementById('newTaskDescInput')?.classList.add('border-danger', 'is-invalid');
      return { isValid: false, message: 'El campo "Descripción" no puede estar vacío.' };
    }
    if (!data.date || data.date.trim() === '') {
      document.getElementById('newTaskDateInput')?.classList.add('border-danger', 'is-invalid');
      return { isValid: false, message: 'Debes seleccionar una fecha de entrega.' };
    }
    if (!data.status || data.status.trim() === '') {
      document.getElementById('newTaskStatusInput')?.classList.add('border-danger', 'is-invalid');
      return { isValid: false, message: 'Debes seleccionar un estado para la tarea.' };
    }
    return { isValid: true, message: '' };
  }

  function renderLists() {
    listsContainer.innerHTML = '';
    const lists = listManager.getAll();
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
        const activeList = listManager.getById(currentListId);
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
      listManager.update(listId, newName);
      if (currentListId === listId) {
        currentListTitle.textContent = newName;
      }
      const modalInstance = bootstrap.Modal.getInstance(document.getElementById('editListModal'));
      if (modalInstance) modalInstance.hide();
      renderLists();
      Toast.fire({ icon: 'success', title: 'Lista actualizada' });
    }
  });

  document.getElementById('deleteListBtn').addEventListener('click', () => {
    const listId = Number(document.getElementById('editListIdInput').value);

    const modalInstance = bootstrap.Modal.getInstance(document.getElementById('editListModal'));
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
        const deleteResult = listManager.delete(listId);
        if (!deleteResult.success) {
          Swal.fire({
            icon: 'error',
            title: 'Acción no permitida',
            text: deleteResult.reason,
            background: '#120d18',
            color: '#fff',
          });
          return;
        }
        taskManager.tasks = taskManager.tasks.filter((t) => t.listId !== listId);
        taskManager.save();

        if (currentListId === listId) {
          const firstList = listManager.getFirst();
          currentListId = firstList.id;
          currentListTitle.textContent = firstList.name;
        }

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
    const lists = listManager.getAll();
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

  function handleToggleComplete(taskId) {
    const updatedTask = taskManager.toggleComplete(taskId);
    if (updatedTask) {
      renderTasks();
    }
  }

  function renderTasks() {
    taskList.innerHTML = '';

    const filteredTasks = taskManager.getFiltered(currentListId, activeDateFilter, activeSearchQuery);

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
      const isCompleted = task.status === 'completed';
      article.className = `task-card p-3 p-md-4 rounded-4 flex-shrink-0 ${isCompleted ? 'completed' : ''}`;
      article.style.animationDelay = `${index * 0.06}s`;

      const toggleIcon = isCompleted ? 'bi-check-circle-fill' : 'bi-circle';
      const toggleClass = isCompleted ? 'completed' : '';

      article.innerHTML = `
        <div class="d-flex justify-content-between align-items-start mb-2">
          <h3 class="task-title h5 fw-bold mb-0">${task.title}</h3>
          <div class="d-flex align-items-center gap-2">
            <span class="task-status ${statusInfo.class}">${statusInfo.label}</span>
            <button
              class="btn btn-sm btn-toggle-complete ${toggleClass}"
              data-task-id="${task.id}"
              aria-label="${isCompleted ? 'Marcar como pendiente' : 'Marcar como completada'}"
            >
              <i class="bi ${toggleIcon}"></i>
            </button>
          </div>
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

      const toggleBtn = article.querySelector('.btn-toggle-complete');
      toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        handleToggleComplete(task.id);
      });

      article.addEventListener('click', () => openEditModal(task));
      taskList.appendChild(article);
    });
  }

  saveListBtn.addEventListener('click', () => {
    const name = newListInput.value.trim();
    if (name) {
      listManager.create(name);
      newListInput.value = '';
      const modalInstance = bootstrap.Modal.getInstance(document.getElementById('newListModal'));
      if (modalInstance) modalInstance.hide();
      renderLists();
      Toast.fire({ icon: 'success', title: 'Lista creada' });
    }
  });

  const newTaskForm = document.getElementById('newTaskForm');

  newTaskForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const formData = {
      title: document.querySelector('#newTaskNameInput').value,
      desc: document.querySelector('#newTaskDescInput').value,
      date: document.querySelector('#newTaskDateInput').value,
      status: document.querySelector('#newTaskStatusInput').value,
    };

    const validation = validFormFieldInput(formData);
    const formAlert = document.getElementById('formAlert');

    if (!validation.isValid) {
      document.getElementById('formAlertMessage').textContent = validation.message;
      formAlert.classList.remove('d-none');
    } else {
      formAlert.classList.add('d-none');

      taskManager.addTask(
        formData.title.trim(),
        formData.desc.trim(),
        formData.date,
        formData.status
      );
      newTaskForm.reset();
      updateSelectStatusColor(newTaskStatusInput);

      const modalInstance = bootstrap.Modal.getInstance(document.getElementById('newTaskModal'));
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
      listId: editTaskListSelect.value,
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

    taskManager.update(id, formData);

    const modalInstance = bootstrap.Modal.getInstance(document.getElementById('editTaskModal'));
    if (modalInstance) modalInstance.hide();
    renderTasks();
    Toast.fire({ icon: 'success', title: 'Tarea actualizada' });
  });

  deleteTaskBtn.addEventListener('click', () => {
    const id = Number(editTaskId.value);

    const modalInstance = bootstrap.Modal.getInstance(document.getElementById('editTaskModal'));
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
        taskManager.delete(id);
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