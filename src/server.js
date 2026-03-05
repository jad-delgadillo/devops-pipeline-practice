const app = require('./app');

const PORT = Number.parseInt(process.env.PORT, 10) || 3000;

app.listen(PORT, () => {
  console.log(`Task API listening on port ${PORT}`);
});
