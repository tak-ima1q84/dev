let currentTables = [];
let currentTableId = null;
let searchTimeout;

// Load tables on page load
document.addEventListener('DOMContentLoaded', () => {
  loadTables();
  
  // Search functionality
  document.getElementById('searchInput').addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      if (e.target.value.trim()) {
        searchTables(e.target.value);
      } else {
        loadTables();
      }
    }, 300);
  });
  
  // Form submissions
  document.getElementById('tableForm').addEventListener('submit', handleTableFormSubmit);
  document.getElementById('columnForm').addEventListener('submit', handleColumnFormSubmit);
});

async function loadTables() {
  try {
    const response = await fetch('/api/tables');
    currentTables = await response.json();
    renderTables(currentTables);
  } catch (error) {
    console.error('Failed to load tables:', error);
    document.getElementById('tableList').innerHTML = '<div class="empty-state">データの読み込みに失敗しました</div>';
  }
}

async function searchTables(query) {
  try {
    const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
    const results = await response.json();
    renderTables(results);
  } catch (error) {
    console.error('Search failed:', error);
  }
}

function renderTables(tables) {
  const listEl = document.getElementById('tableList');
  
  if (tables.length === 0) {
    listEl.innerHTML = '<div class="empty-state">テーブルが見つかりません</div>';
    return;
  }
  
  listEl.innerHTML = tables.map(table => `
    <div class="table-item" onclick="viewTableDetail(${table.id})">
      <div class="table-name">${table.table_logical_name} (${table.table_physical_name})</div>
      <div class="table-desc">${table.table_description || '説明なし'}</div>
      <div class="table-meta">
        システム: ${table.system_name} | 更新: ${new Date(table.updated_at).toLocaleDateString('ja-JP')}
      </div>
    </div>
  `).join('');
}

async function viewTableDetail(id) {
  try {
    const response = await fetch(`/api/tables/${id}`);
    const table = await response.json();
    
    currentTableId = id;
    
    // Show detail view
    document.getElementById('listView').classList.remove('active');
    document.getElementById('detailView').classList.add('active');
    
    // Render table info
    document.getElementById('detailTitle').textContent = `${table.table_logical_name} (${table.table_physical_name})`;
    
    const infoHtml = `
      <tr><td>システム名</td><td>${table.system_name || '-'}</td></tr>
      <tr><td>サブシステム名</td><td>${table.subsystem_name || '-'}</td></tr>
      <tr><td>スキーマ名</td><td>${table.schema_name || '-'}</td></tr>
      <tr><td>テーブル物理名</td><td>${table.table_physical_name}</td></tr>
      <tr><td>テーブル論理名</td><td>${table.table_logical_name}</td></tr>
      <tr><td>テーブル概要</td><td>${table.table_description || '-'}</td></tr>
      <tr><td>ファイル形式</td><td>${table.file_format || '-'}</td></tr>
      <tr><td>作成者</td><td>${table.creator}</td></tr>
      <tr><td>更新者</td><td>${table.updater}</td></tr>
      <tr><td>作成日</td><td>${new Date(table.created_at).toLocaleString('ja-JP')}</td></tr>
      <tr><td>更新日</td><td>${new Date(table.updated_at).toLocaleString('ja-JP')}</td></tr>
    `;
    document.querySelector('#tableInfo tbody').innerHTML = infoHtml;
    
    // Render columns
    const columnsHtml = table.columns.map(col => `
      <tr>
        <td>${col.column_physical_name}</td>
        <td>${col.column_logical_name}</td>
        <td>${col.data_type}</td>
        <td>${col.data_length || '-'}</td>
        <td>${col.is_pk ? '✓' : ''}</td>
        <td>${col.is_fk ? '✓' : ''}</td>
        <td>${col.is_nullable ? 'YES' : 'NO'}</td>
        <td>${col.default_value || '-'}</td>
        <td>${col.remarks || '-'}</td>
        <td><button class="btn btn-sm btn-danger" onclick="deleteColumn(${col.id})">削除</button></td>
      </tr>
    `).join('');
    
    document.querySelector('#columnsTable tbody').innerHTML = columnsHtml || '<tr><td colspan="10" style="text-align:center;">カラムがありません</td></tr>';
    
  } catch (error) {
    console.error('Failed to load table detail:', error);
    alert('テーブル詳細の読み込みに失敗しました');
  }
}

function showListView() {
  document.getElementById('detailView').classList.remove('active');
  document.getElementById('listView').classList.add('active');
  currentTableId = null;
  loadTables();
}

function showCreateModal() {
  document.getElementById('modalTitle').textContent = '新規テーブル作成';
  document.getElementById('tableForm').reset();
  document.getElementById('tableModal').classList.add('active');
}

function showAddColumnModal() {
  if (!currentTableId) {
    alert('テーブルが選択されていません');
    return;
  }
  document.getElementById('columnForm').reset();
  document.getElementById('columnModal').classList.add('active');
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.remove('active');
}

async function handleTableFormSubmit(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData);
  data.updater = data.creator;
  
  try {
    const response = await fetch('/api/tables', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (response.ok) {
      closeModal('tableModal');
      loadTables();
      alert('テーブルを作成しました');
    }
  } catch (error) {
    console.error('Failed to create table:', error);
    alert('作成に失敗しました');
  }
}

async function handleColumnFormSubmit(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const data = {
    table_id: currentTableId,
    column_physical_name: formData.get('column_physical_name'),
    column_logical_name: formData.get('column_logical_name'),
    data_type: formData.get('data_type'),
    data_length: formData.get('data_length'),
    is_pk: formData.get('is_pk') === 'on',
    is_fk: formData.get('is_fk') === 'on',
    is_nullable: formData.get('is_nullable') === 'on',
    default_value: formData.get('default_value'),
    remarks: formData.get('remarks'),
    index_name: formData.get('index_name'),
    index_target_column: formData.get('index_target_column')
  };
  
  try {
    const response = await fetch('/api/columns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    const result = await response.json();
    
    if (response.ok) {
      closeModal('columnModal');
      viewTableDetail(currentTableId);
      alert('カラムを追加しました');
    } else {
      alert(result.error || 'カラムの追加に失敗しました');
    }
  } catch (error) {
    console.error('Failed to add column:', error);
    alert('カラムの追加に失敗しました');
  }
}

async function deleteColumn(columnId) {
  if (!confirm('このカラムを削除しますか？')) return;
  
  try {
    const response = await fetch(`/api/columns/${columnId}`, {
      method: 'DELETE'
    });
    
    if (response.ok) {
      viewTableDetail(currentTableId);
      alert('カラムを削除しました');
    }
  } catch (error) {
    console.error('Failed to delete column:', error);
    alert('削除に失敗しました');
  }
}

async function downloadCSV() {
  if (!currentTableId) return;
  window.location.href = `/api/backup/csv/${currentTableId}`;
}

async function editTable() {
  alert('編集機能は今後実装予定です');
}

async function deleteTable() {
  if (!currentTableId) return;
  if (!confirm('このテーブルを削除しますか？関連するカラムもすべて削除されます。')) return;
  
  try {
    const response = await fetch(`/api/tables/${currentTableId}`, {
      method: 'DELETE'
    });
    
    if (response.ok) {
      alert('テーブルを削除しました');
      showListView();
    }
  } catch (error) {
    console.error('Failed to delete table:', error);
    alert('削除に失敗しました');
  }
}
