const sqlite3 = require('sqlite3').verbose();

const port = 8010;
const db = new sqlite3.Database(':memory:');

const app = require('./src/app')(db);
const buildSchemas = require('./src/schemas');

db.serialize(() => {
  buildSchemas(db);
  // eslint-disable-next-line no-console
  app.listen(port, () => console.log(`App started and listening on port ${port}`));
});
