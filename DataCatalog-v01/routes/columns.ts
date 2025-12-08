import { Hono } from 'hono';
import type { Database } from 'bun:sqlite';

export const columnRoutes = new Hono<{ Variables: { db: Database } }>();

// Get columns for a table
columnRoutes.get('/table/:tableId', (c) => {
  const db = c.get('db');
  const tableId = c.req.param('tableId');
  const columns = db.prepare('SELECT * FROM data_columns WHERE table_id = ?').all(tableId);
  return c.json(columns);
});

// Create column
columnRoutes.post('/', async (c) => {
  const db = c.get('db');
  const body = await c.req.json();
  
  // Validate column limit (500 max per table)
  const count = db.prepare('SELECT COUNT(*) as count FROM data_columns WHERE table_id = ?').get(body.table_id) as { count: number };
  if (count.count >= 500) {
    return c.json({ error: 'Maximum 500 columns per table exceeded' }, 400);
  }
  
  const stmt = db.prepare(`
    INSERT INTO data_columns (
      table_id, column_physical_name, column_logical_name,
      data_type, data_length, is_pk, is_fk,
      is_nullable, default_value, remarks, index_name, index_target_column
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  const result = stmt.run(
    body.table_id, body.column_physical_name, body.column_logical_name,
    body.data_type, body.data_length, body.is_pk ? 1 : 0, body.is_fk ? 1 : 0,
    body.is_nullable ? 1 : 0, body.default_value,
    body.remarks, body.index_name, body.index_target_column
  );
  
  return c.json({ id: result.lastInsertRowid, message: 'Column created' });
});

// Update column
columnRoutes.put('/:id', async (c) => {
  const db = c.get('db');
  const id = c.req.param('id');
  const body = await c.req.json();
  
  const stmt = db.prepare(`
    UPDATE data_columns SET
      column_physical_name = ?, column_logical_name = ?,
      data_type = ?, data_length = ?, is_pk = ?, is_fk = ?,
      is_nullable = ?, default_value = ?,
      remarks = ?, index_name = ?, index_target_column = ?
    WHERE id = ?
  `);
  
  stmt.run(
    body.column_physical_name, body.column_logical_name,
    body.data_type, body.data_length, body.is_pk ? 1 : 0, body.is_fk ? 1 : 0,
    body.is_nullable ? 1 : 0, body.default_value,
    body.remarks, body.index_name, body.index_target_column, id
  );
  
  return c.json({ message: 'Column updated' });
});

// Delete column
columnRoutes.delete('/:id', (c) => {
  const db = c.get('db');
  const id = c.req.param('id');
  
  db.prepare('DELETE FROM data_columns WHERE id = ?').run(id);
  return c.json({ message: 'Column deleted' });
});
