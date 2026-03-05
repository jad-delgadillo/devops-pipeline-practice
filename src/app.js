const express = require('express');
const tasksRouter = require('./routes.tasks');

const app = express();

app.use(express.json());

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/tasks', tasksRouter);

module.exports = app;
