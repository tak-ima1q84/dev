import { Hono } from 'hono';
import { serveStatic } from 'hono/bun';
import { Database } from 'bun:sqlite';
import { initDatabase } from './db';
import { tableRoutes } from './routes/tables';
import { columnRoutes } from './routes/columns';
import { userRoutes } from './routes/users';
import { searchRoutes } from './routes/search';
import { backupRoutes } from './routes/backup';

type Variables = {
  db: Database;
};

const app = new Hono<{ Variables: Variables }>();
const db = new Database('catalog.db', { create: true });

// Initialize database
initDatabase(db);

// Middleware to attach db to context
app.use('*', async (c, next) => {
  c.set('db', db);
  await next();
});

// Static files
app.use('/public/*', serveStatic({ root: './' }));
app.get('/', serveStatic({ path: './public/index.html' }));

// API routes
app.route('/api/tables', tableRoutes);
app.route('/api/columns', columnRoutes);
app.route('/api/users', userRoutes);
app.route('/api/search', searchRoutes);
app.route('/api/backup', backupRoutes);

const port = process.env.PORT || 3000;
console.log(`Server running on http://localhost:${port}`);

export default {
  port,
  fetch: app.fetch,
};
