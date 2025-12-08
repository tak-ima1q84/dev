import { Hono } from 'hono';
import type { Database } from 'bun:sqlite';

export const backupRoutes = new Hono<{ Variables: { db: Database } }>();

// Manual backup trigger
backupRoutes.post('/', async (c) => {
  const db = c.get('db');
  
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = `./backups/catalog_backup_${timestamp}.json`;
    
    const tables = db.prepare('SELECT * FROM data_tables').all();
    const columns = db.prepare('SELECT * FROM data_columns').all();
    const users = db.prepare('SELECT * FROM users').all();
    
    const backupData = { tables, columns, users, timestamp };
    
    await Bun.write(backupPath, JSON.stringify(backupData, null, 2));
    
    return c.json({ message: 'Backup created', path: backupPath });
  } catch (error) {
    return c.json({ error: 'Backup failed' }, 500);
  }
});

// Download table as CSV
backupRoutes.get('/csv/:id', (c) => {
  const db = c.get('db');
  const id = c.req.param('id');
  
  const table: any = db.prepare('SELECT * FROM data_tables WHERE id = ?').get(id);
  if (!table) {
    return c.json({ error: 'Table not found' }, 404);
  }
  
  const columns: any[] = db.prepare('SELECT * FROM data_columns WHERE table_id = ?').all(id);
  
  // Generate CSV with table info and columns
  const escape = (val: any) => String(val || '').replace(/"/g, '""');
  
  let csv = '# テーブル情報\n';
  csv += 'システム名,サブシステム名,スキーマ名,テーブル物理名,テーブル論理名,テーブル概要\n';
  csv += `"${escape(table.system_name)}","${escape(table.subsystem_name)}","${escape(table.schema_name)}",`;
  csv += `"${escape(table.table_physical_name)}","${escape(table.table_logical_name)}","${escape(table.table_description)}"\n\n`;
  
  csv += '# カラム定義\n';
  csv += 'カラム物理名,カラム論理名,データ型,データ長,主キー,外部キー,NULL許可,デフォルト値,備考,インデックス名,インデックス対象カラム\n';
  
  columns.forEach(col => {
    csv += `"${escape(col.column_physical_name)}","${escape(col.column_logical_name)}","${escape(col.data_type)}","${escape(col.data_length)}",`;
    csv += `"${col.is_pk ? 'PK' : ''}","${col.is_fk ? 'FK' : ''}","${col.is_nullable ? 'YES' : 'NO'}",`;
    csv += `"${escape(col.default_value)}","${escape(col.remarks)}","${escape(col.index_name)}","${escape(col.index_target_column)}"\n`;
  });
  
  return c.text(csv, 200, {
    'Content-Type': 'text/csv; charset=utf-8',
    'Content-Disposition': `attachment; filename="${table.table_physical_name}.csv"`
  });
});
