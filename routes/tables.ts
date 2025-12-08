import { Hono } from 'hono';
import type { Database } from 'bun:sqlite';

export const tableRoutes = new Hono<{ Variables: { db: Database } }>();

// Get all tables
tableRoutes.get('/', (c) => {
  const db = c.get('db');
  const tables = db.prepare('SELECT * FROM data_tables ORDER BY updated_at DESC').all();
  return c.json(tables);
});

// Get single table
tableRoutes.get('/:id', (c) => {
  const db = c.get('db');
  const id = c.req.param('id');
  const table = db.prepare('SELECT * FROM data_tables WHERE id = ?').get(id);
  
  if (!table) {
    return c.json({ error: 'Table not found' }, 404);
  }
  
  const columns = db.prepare('SELECT * FROM data_columns WHERE table_id = ?').all(id);
  return c.json({ ...table, columns });
});

// Create table
tableRoutes.post('/', async (c) => {
  const db = c.get('db');
  const body = await c.req.json();
  
  // Set updater to creator if not provided
  const updater = body.updater || body.creator;
  
  const stmt = db.prepare(`
    INSERT INTO data_tables (
      system_name, subsystem_name, schema_name, creator, updater,
      table_physical_name, table_logical_name, table_description,
      file_format, quote_char, delimiter_char, encoding, line_break_code
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  const result = stmt.run(
    body.system_name, body.subsystem_name, body.schema_name,
    body.creator, updater, body.table_physical_name,
    body.table_logical_name, body.table_description, body.file_format,
    body.quote_char, body.delimiter_char, body.encoding, body.line_break_code
  );
  
  return c.json({ id: result.lastInsertRowid, message: 'Table created' });
});

// Update table
tableRoutes.put('/:id', async (c) => {
  const db = c.get('db');
  const id = c.req.param('id');
  const body = await c.req.json();
  
  const stmt = db.prepare(`
    UPDATE data_tables SET
      system_name = ?, subsystem_name = ?, schema_name = ?,
      updater = ?, updated_at = CURRENT_TIMESTAMP,
      table_physical_name = ?, table_logical_name = ?,
      table_description = ?, file_format = ?, quote_char = ?,
      delimiter_char = ?, encoding = ?, line_break_code = ?
    WHERE id = ?
  `);
  
  stmt.run(
    body.system_name, body.subsystem_name, body.schema_name,
    body.updater, body.table_physical_name, body.table_logical_name,
    body.table_description, body.file_format, body.quote_char,
    body.delimiter_char, body.encoding, body.line_break_code, id
  );
  
  return c.json({ message: 'Table updated' });
});

// Delete table
tableRoutes.delete('/:id', (c) => {
  const db = c.get('db');
  const id = c.req.param('id');
  
  db.prepare('DELETE FROM data_tables WHERE id = ?').run(id);
  return c.json({ message: 'Table deleted' });
});
