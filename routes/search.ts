import { Hono } from 'hono';
import type { Database } from 'bun:sqlite';

export const searchRoutes = new Hono<{ Variables: { db: Database } }>();

// Search tables by partial match
searchRoutes.get('/', (c) => {
  const db = c.get('db');
  const query = c.req.query('q') || '';
  
  if (!query) {
    return c.json([]);
  }
  
  const searchPattern = `%${query}%`;
  
  // Search in tables
  const tableResults = db.prepare(`
    SELECT DISTINCT dt.* FROM data_tables dt
    WHERE dt.table_logical_name LIKE ?
       OR dt.table_physical_name LIKE ?
       OR dt.table_description LIKE ?
  `).all(searchPattern, searchPattern, searchPattern);
  
  // Search in columns and get parent tables
  const columnResults = db.prepare(`
    SELECT DISTINCT dt.* FROM data_tables dt
    INNER JOIN data_columns dc ON dt.id = dc.table_id
    WHERE dc.column_logical_name LIKE ?
       OR dc.column_physical_name LIKE ?
  `).all(searchPattern, searchPattern);
  
  // Merge and deduplicate results
  const allResults = [...tableResults, ...columnResults];
  const uniqueResults = Array.from(
    new Map(allResults.map(item => [item.id, item])).values()
  );
  
  return c.json(uniqueResults);
});
