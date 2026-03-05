const request = require('supertest');
const app = require('../src/app');
const store = require('../src/tasks.store');

describe('Task API', () => {
  beforeEach(() => {
    store.reset();
  });

  it('POST /tasks creates a task with id and done=false', async () => {
    const response = await request(app)
      .post('/tasks')
      .send({ title: 'Write tests' });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      id: 1,
      title: 'Write tests',
      done: false
    });
  });

  it('GET /tasks returns created tasks', async () => {
    await request(app).post('/tasks').send({ title: 'Task 1' });
    await request(app).post('/tasks').send({ title: 'Task 2' });

    const response = await request(app).get('/tasks');

    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      { id: 1, title: 'Task 1', done: false },
      { id: 2, title: 'Task 2', done: false }
    ]);
  });

  it('DELETE /tasks/:id deletes and task list no longer includes it', async () => {
    await request(app).post('/tasks').send({ title: 'Delete me' });

    const deleteResponse = await request(app).delete('/tasks/1');
    expect(deleteResponse.status).toBe(204);

    const listResponse = await request(app).get('/tasks');
    expect(listResponse.status).toBe(200);
    expect(listResponse.body).toEqual([]);
  });

  it('DELETE /tasks/:id returns 404 for non-existing task', async () => {
    const response = await request(app).delete('/tasks/999');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'Task not found' });
  });
});
