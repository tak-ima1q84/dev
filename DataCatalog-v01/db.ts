import { Database } from 'bun:sqlite';

export function initDatabase(db: Database) {
  // Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('editor', 'viewer'))
    )
  `);

  // Data tables
  db.run(`
    CREATE TABLE IF NOT EXISTS data_tables (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      system_name TEXT NOT NULL,
      subsystem_name TEXT,
      schema_name TEXT,
      creator TEXT NOT NULL,
      updater TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      table_physical_name TEXT NOT NULL,
      table_logical_name TEXT NOT NULL,
      table_description TEXT,
      file_format TEXT,
      quote_char TEXT,
      delimiter_char TEXT,
      encoding TEXT,
      line_break_code TEXT
    )
  `);

  // Data columns
  db.run(`
    CREATE TABLE IF NOT EXISTS data_columns (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      table_id INTEGER NOT NULL,
      column_physical_name TEXT NOT NULL,
      column_logical_name TEXT NOT NULL,
      data_type TEXT NOT NULL,
      data_length TEXT,
      is_pk INTEGER DEFAULT 0,
      is_fk INTEGER DEFAULT 0,
      is_nullable INTEGER DEFAULT 1,
      default_value TEXT,
      remarks TEXT,
      index_name TEXT,
      index_target_column TEXT,
      FOREIGN KEY (table_id) REFERENCES data_tables(id) ON DELETE CASCADE
    )
  `);

  // Create indexes for search
  db.run(`
    CREATE INDEX IF NOT EXISTS idx_table_logical ON data_tables(table_logical_name)
  `);
  db.run(`
    CREATE INDEX IF NOT EXISTS idx_table_physical ON data_tables(table_physical_name)
  `);
  db.run(`
    CREATE INDEX IF NOT EXISTS idx_table_description ON data_tables(table_description)
  `);
  db.run(`
    CREATE INDEX IF NOT EXISTS idx_column_logical ON data_columns(column_logical_name)
  `);
  db.run(`
    CREATE INDEX IF NOT EXISTS idx_column_physical ON data_columns(column_physical_name)
  `);

  // Insert default editor user if no users exist
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as {
    count: number;
  };
  if (userCount.count === 0) {
    db.prepare('INSERT INTO users (username, name, role) VALUES (?, ?, ?)').run(
      'admin',
      '管理者',
      'editor',
    );
    console.log('Default editor user created: admin');
  }

  console.log('Database initialized');
}
