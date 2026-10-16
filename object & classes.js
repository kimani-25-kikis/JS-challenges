const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const taskList = document.getElementById("task-list");
const filterButtons = document.querySelectorAll(".filter-btn");
const progressBar = document.getElementById("progress-bar");
const progressText = document.getElementById("progress-text");
const taskCount = document.getElementById("task-count");
const clearCompletedButton = document.getElementById("clear-completed");

let tasks = JSON.parse(localStorage.getItem("taskflow-tasks")) || [];
let currentFilter = "all";

function saveTasks() {
  localStorage.setItem("taskflow-tasks", JSON.stringify(tasks));
}

function addTask(name) {
  const trimmedName = name.trim();

  if (!trimmedName) {
    alert("Please enter a task.");
    return;
  }

  const task = {
    id: Date.now().toString() + Math.random().toString(36).slice(2),
    name: trimmedName,
    completed: false,
    priority: "medium",
    dueDate: ""
  };

  tasks.push(task);
  saveTasks();
  renderTasks();
  taskInput.value = "";
  taskInput.focus();
}

function toggleTask(id) {
  tasks = tasks.map(task =>
    task.id === id
      ? { ...task, completed: !task.completed }
      : task
  );

  saveTasks();
  renderTasks();
}

function deleteTask(id) {
  tasks = tasks.filter(task => task.id !== id);
  saveTasks();
  renderTasks();
}

function updatePriority(id, priority) {
  tasks = tasks.map(task =>
    task.id === id ? { ...task, priority } : task
  );

  saveTasks();
  renderTasks();
}

function updateDueDate(id, dueDate) {
  tasks = tasks.map(task =>
    task.id === id ? { ...task, dueDate } : task
  );

  saveTasks();
  renderTasks();
}

function setFilter(filter) {
  currentFilter = filter;

  filterButtons.forEach(button => {
    const isActive = button.dataset.filter === filter;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  renderTasks();
}

function getFilteredTasks() {
  if (currentFilter === "active") {
    return tasks.filter(task => !task.completed);
  }

  if (currentFilter === "completed") {
    return tasks.filter(task => task.completed);
  }

  return tasks;
}

function createTaskElement(task) {
  const li = document.createElement("li");
  li.className = `task-item${task.completed ? " completed" : ""}`;
  li.dataset.id = task.id;

  const taskContent = document.createElement("div");
  taskContent.className = "task-content";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className = "task-checkbox";
  checkbox.checked = task.completed;
  checkbox.setAttribute("aria-label", `Complete ${task.name}`);
  checkbox.addEventListener("change", () => toggleTask(task.id));

  const name = document.createElement("span");
  name.className = "task-name";
  name.textContent = task.name;

  taskContent.append(checkbox, name);

  const taskOptions = document.createElement("div");
  taskOptions.className = "task-options";

  const prioritySelect = document.createElement("select");
  prioritySelect.className = `task-priority ${task.priority}`;
  prioritySelect.setAttribute("aria-label", `Priority for ${task.name}`);

  ["low", "medium", "high"].forEach(priority => {
    const option = document.createElement("option");
    option.value = priority;
    option.textContent =
      priority.charAt(0).toUpperCase() + priority.slice(1);
    option.selected = task.priority === priority;
    prioritySelect.appendChild(option);
  });

  prioritySelect.addEventListener("change", event => {
    updatePriority(task.id, event.target.value);
  });

  const dueDateInput = document.createElement("input");
  dueDateInput.type = "date";
  dueDateInput.className = "task-due-date";
  dueDateInput.value = task.dueDate;
  dueDateInput.setAttribute("aria-label", `Due date for ${task.name}`);

  dueDateInput.addEventListener("change", event => {
    updateDueDate(task.id, event.target.value);
  });

  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.className = "delete-task";
  deleteButton.textContent = "Delete";
  deleteButton.setAttribute("aria-label", `Delete ${task.name}`);
  deleteButton.addEventListener("click", () => deleteTask(task.id));

  taskOptions.append(prioritySelect, dueDateInput, deleteButton);
  li.append(taskContent, taskOptions);

  return li;
}

function updateProgress() {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.completed).length;
  const percentage = totalTasks === 0
    ? 0
    : Math.round((completedTasks / totalTasks) * 100);

  if (progressBar) {
    progressBar.style.width = `${percentage}%`;
    progressBar.setAttribute("aria-valuenow", String(percentage));
  }

  if (progressText) {
    progressText.textContent = `${percentage}% completed`;
  }

  if (taskCount) {
    const remaining = totalTasks - completedTasks;
    taskCount.textContent =
      `${remaining} task${remaining === 1 ? "" : "s"} remaining`;
  }
}

function renderTasks() {
  taskList.replaceChildren();

  const filteredTasks = getFilteredTasks();

  filteredTasks.forEach(task => {
    taskList.appendChild(createTaskElement(task));
  });

  if (filteredTasks.length === 0) {
    const emptyMessage = document.createElement("li");
    emptyMessage.className = "empty-message";

    if (tasks.length === 0) {
      emptyMessage.textContent = "No tasks yet. Add your first task!";
    } else {
      emptyMessage.textContent = "No tasks match this filter.";
    }

    taskList.appendChild(emptyMessage);
  }

  updateProgress();
}

taskForm.addEventListener("submit", event => {
  event.preventDefault();
  addTask(taskInput.value);
});

filterButtons.forEach(button => {
  button.addEventListener("click", () => {
    setFilter(button.dataset.filter);
  });
});

if (clearCompletedButton) {
  clearCompletedButton.addEventListener("click", () => {
    tasks = tasks.filter(task => !task.completed);
    saveTasks();
    renderTasks();
  });
}

renderTasks();