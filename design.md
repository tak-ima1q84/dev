### 1. Database Design
Database column names are in English. UI labels remain in Japanese as requested.

#### 1.1 Table Definitions (data_tables)
| UI Label (JP) | Physical Name (DB Column) | Type | Required | Remarks |
| :--- | :--- | :--- | :--- | :--- |
| ID | `id` | Integer | Yes | PK, Auto Increment |
| システム名 | `system_name` | Varchar | Yes | |
| サブシステム名 | `subsystem_name` | Varchar | No | |
| スキーマ名 | `schema_name` | Varchar | No | |
| 作成者 | `creator` | Varchar | Yes | |
| 更新者 | `updater` | Varchar | Yes | |
| 作成日 | `created_at` | Timestamp | Yes | |
| 更新日 | `updated_at` | Timestamp | Yes | |
| テーブル物理名 | `table_physical_name` | Varchar | Yes | Search Target |
| テーブル論理名 | `table_logical_name` | Varchar | Yes | Search Target |
| テーブル概要 | `table_description` | Text | No | Search Target |
| ファイル形式 | `file_format` | Varchar | No | parquet, csv, pickle, etc. |
| quote | `quote_char` | Varchar | No | |
| delimiter | `delimiter_char` | Varchar | No | |
| 文字コード | `encoding` | Varchar | No | |
| 改行コード | `line_break_code` | Varchar | No | |

#### 1.2 Column Definitions (data_columns)
| UI Label (JP) | Physical Name (DB Column) | Type | Required | Remarks |
| :--- | :--- | :--- | :--- | :--- |
| ID | `id` | Integer | Yes | PK, Auto Increment |
| テーブルID | `table_id` | Integer | Yes | FK (data_tables.id) |
| カラム物理名 | `column_physical_name` | Varchar | Yes | Search Target |
| カラム論理名 | `column_logical_name` | Varchar | Yes | Search Target |
| データ型 | `data_type` | Varchar | Yes | |
| データ長 | `data_length` | Varchar | No | |
| 主キー（PK） | `is_pk` | Boolean | Yes | Default: False |
| 外部キー（FK） | `is_fk` | Boolean | Yes | Default: False |
| NULL制約 | `is_nullable` | Boolean | Yes | Default: True |
| デフォルト値 | `default_value` | Varchar | No | |
| 備考 | `remarks` | Text | No | Code values, etc. |
| インデックス名 | `index_name` | Varchar | No | |
| インデックス名対象カラム | `index_target_column` | Varchar | No | |

### 2. Permission Design
*   **Editor**: `role = 'editor'`
*   **Viewer**: `role = 'viewer'`
