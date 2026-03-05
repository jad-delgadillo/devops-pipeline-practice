let tasks = [];
let nextId = 1;

function getAll() {
  return tasks;
}

function create(title) {
  const task = {
    id: nextId,
    title,
    done: false
  };

  nextId += 1;
  tasks.push(task);

  return task;
}

function remove(id) {
  const index = tasks.findIndex((task) => task.id === id);

  if (index === -1) {
    return false;
  }

  tasks.splice(index, 1);
  return true;
}

function reset() {
  tasks = [];
  nextId = 1;
}

module.exports = {
  getAll,
  create,
  remove,
  reset
};
