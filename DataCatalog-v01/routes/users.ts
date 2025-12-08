import { Hono } from 'hono';
import type { Database } from 'bun:sqlite';

export const userRoutes = new Hono<{ Variables: { db: Database } }>();

// Get all users
userRoutes.get('/', (c) => {
  const db = c.get('db');
  const users = db.prepare('SELECT * FROM users').all();
  return c.json(users);
});

// Create user
userRoutes.post('/', async (c) => {
  const db = c.get('db');
  const body = await c.req.json();
  
  const stmt = db.prepare('INSERT INTO users (name, role) VALUES (?, ?)');
  const result = stmt.run(body.name, body.role);
  
  return c.json({ id: result.lastInsertRowid, message: 'User created' });
});

// Update user role
userRoutes.put('/:id', async (c) => {
  const db = c.get('db');
  const id = c.req.param('id');
  const body = await c.req.json();
  
  db.prepare('UPDATE users SET name = ?, role = ? WHERE id = ?').run(body.name, body.role, id);
  return c.json({ message: 'User updated' });
});

// Delete user
userRoutes.delete('/:id', (c) => {
  const db = c.get('db');
  const id = c.req.param('id');
  
  db.prepare('DELETE FROM users WHERE id = ?').run(id);
  return c.json({ message: 'User deleted' });
});
