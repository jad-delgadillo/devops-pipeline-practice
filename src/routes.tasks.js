const express = require('express');
const store = require('./tasks.store');

const router = express.Router();

router.get('/', (_req, res) => {
  res.status(200).json(store.getAll());
});

router.post('/', (req, res) => {
  const { title } = req.body;

  if (typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({
      error: '"title" is required and must be a non-empty string'
    });
  }

  const task = store.create(title.trim());
  return res.status(201).json(task);
});

router.delete('/:id', (req, res) => {
  const id = Number.parseInt(req.params.id, 10);

  if (Number.isNaN(id)) {
    return res.status(404).json({ error: 'Task not found' });
  }

  const deleted = store.remove(id);

  if (!deleted) {
    return res.status(404).json({ error: 'Task not found' });
  }

  return res.status(204).send();
});

module.exports = router;
