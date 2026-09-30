function getTaskStatistics(tasks) {
  const completed = tasks.filter(task => task.completed);

  const pending = tasks.filter(task => !task.completed);

  const totalHours = tasks.reduce(
    (total, task) => total + task.hours,
    0
  );

  const completedHours = completed.reduce(
    (total, task) => total + task.hours,
    0
  );

  return {
    totalTasks: tasks.length,
    completedTasks: completed.length,
    pendingTasks: pending.length,
    totalHours,
    completedHours
  };
}

console.log(getTaskStatistics(tasks));