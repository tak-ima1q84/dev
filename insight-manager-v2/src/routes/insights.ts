import { Elysia, t } from 'elysia';
import { db } from '../db';
import { insights } from '../db/schema';
import { eq, like, or, and } from 'drizzle-orm';

export const insightRoutes = new Elysia({ prefix: '/api/insights' })
  .post('/upload', async ({ body }) => {
    try {
      const formData = body as any;
      const file = formData.file;
      
      if (!file) {
        return { error: 'No file provided' };
      }

      const timestamp = Date.now();
      // Get file extension
      const ext = file.name.split('.').pop() || 'jpg';
      // Create URL-safe filename
      const filename = `${timestamp}.${ext}`;
      const filepath = `uploads/${filename}`;
      
      await Bun.write(filepath, file);
      
      return { url: `/${filepath}` };
    } catch (error) {
      console.error('Upload error:', error);
      return { error: 'Upload failed' };
    }
  })
  .get('/', async ({ query }) => {
    const conditions = [];
    
    if (query.creationNumber) conditions.push(eq(insights.creationNumber, Number(query.creationNumber)));
    if (query.subject) conditions.push(like(insights.subject, `%${query.subject}%`));
    if (query.insightId) conditions.push(like(insights.insightId, `%${query.insightId}%`));
    if (query.status) conditions.push(eq(insights.status, query.status));
    if (query.type) conditions.push(eq(insights.type, query.type));
    if (query.mainCategory) conditions.push(eq(insights.mainCategory, query.mainCategory));
    if (query.subCategory) conditions.push(like(insights.subCategory, `%${query.subCategory}%`));
    if (query.dataCategory) conditions.push(eq(insights.dataCategory, query.dataCategory));
    if (query.logicFormula) conditions.push(like(insights.logicFormula, `%${query.logicFormula}%`));
    if (query.relatedInsight) conditions.push(like(insights.relatedInsight, `%${query.relatedInsight}%`));

    let result = conditions.length > 0
      ? await db.select().from(insights).where(and(...conditions))
      : await db.select().from(insights);

    // Filter by targetBanks (JSON array field) - support multiple selections
    if (query.targetBanks) {
      const searchBanks = Array.isArray(query.targetBanks) ? query.targetBanks : [query.targetBanks];
      result = result.filter(insight => {
        const banks = insight.targetBanks as string[] || [];
        return searchBanks.some(searchBank => banks.includes(searchBank));
      });
    }

    // Filter by targetTables (JSON array field) - support multiple selections
    if (query.targetTables) {
      const searchTables = Array.isArray(query.targetTables) ? query.targetTables : [query.targetTables];
      result = result.filter(insight => {
        const tables = insight.targetTables as string[] || [];
        return searchTables.some(searchTable => tables.includes(searchTable));
      });
    }

    return result;
  })
  .get('/:id', async ({ params }) => {
    const result = await db.query.insights.findFirst({
      where: eq(insights.id, Number(params.id)),
    });
    return result;
  })
  .post('/', async ({ body, set }) => {
    try {
      const result = await db.insert(insights).values(body).returning();
      return result[0];
    } catch (error) {
      set.status = 400;
      return { error: 'Failed to create insight' };
    }
  })
  .put('/:id', async ({ params, body, set }) => {
    try {
      const result = await db
        .update(insights)
        .set({ ...body, updatedAt: new Date() })
        .where(eq(insights.id, Number(params.id)))
        .returning();
      return result[0];
    } catch (error) {
      set.status = 400;
      return { error: 'Failed to update insight' };
    }
  })
  .delete('/:id', async ({ params, set }) => {
    try {
      await db.delete(insights).where(eq(insights.id, Number(params.id)));
      return { success: true };
    } catch (error) {
      set.status = 400;
      return { error: 'Failed to delete insight' };
    }
  })
  .post('/import/csv', async ({ body, set }) => {
    try {
      const formData = body as any;
      const file = formData.file;
      
      if (!file) {
        set.status = 400;
        return { error: 'No file provided' };
      }

      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        set.status = 400;
        return { error: 'CSV file is empty or invalid' };
      }

      // Helper function to parse CSV line properly (handles commas in quoted fields)
      const parseCSVLine = (line: string): string[] => {
        const result = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
          } else {
            current += char;
          }
        }
        result.push(current.trim());
        return result;
      };

      // Helper function to safely parse JSON
      const safeJSONParse = (str: string, defaultValue: any = []) => {
        if (!str || str === '""' || str === '') return defaultValue;
        try {
          // Remove surrounding quotes if present
          const cleaned = str.replace(/^"(.*)"$/, '$1');
          return JSON.parse(cleaned);
        } catch {
          return defaultValue;
        }
      };

      // Skip header row
      const dataLines = lines.slice(1);
      const imported = [];
      const errors = [];

      for (let i = 0; i < dataLines.length; i++) {
        try {
          const values = parseCSVLine(dataLines[i]);
          
          // Parse the CSV row
          const insightData = {
            creationNumber: parseInt(values[1]) || 1,
            subject: values[2] || '',
            insightId: values[3] || '',
            status: values[4] || '',
            startDate: values[5] || null,
            updateDate: values[6] || null,
            endDate: values[7] || null,
            type: values[8] || '',
            mainCategory: values[9] || '',
            subCategory: values[10] || '',
            dataCategory: values[11] || '',
            targetBanks: safeJSONParse(values[12], []),
            logicFormula: values[13] || '',
            targetTables: safeJSONParse(values[14], []),
            targetUsers: values[15] || '',
            relatedInsight: values[16] || '',
            revenueCategory: values[17] || '',
            iconType: values[18] || '',
            score: values[19] || '',
            relevancePolicy: values[20] || '',
            relevanceScore: values[21] || '',
            displayCount: parseInt(values[22]) || 1,
            selectCount: parseInt(values[23]) || 1,
            nextPolicy: values[24] || '',
            nextValue: values[25] || '',
            appLink: values[26] || '',
            externalLink: values[27] || '',
            teaserImage: values[28] || null,
            storyImages: safeJSONParse(values[29], []),
            maintenanceDate: values[30] || '2099-12-31',
            maintenanceReason: values[31] || '',
            remarks: values[32] || '',
            updatedBy: values[33] || '',
          };

          const result = await db.insert(insights).values(insightData).returning();
          imported.push(result[0]);
        } catch (error) {
          errors.push({ row: i + 2, error: String(error) });
        }
      }

      return {
        success: true,
        imported: imported.length,
        errors: errors.length,
        errorDetails: errors
      };
    } catch (error) {
      console.error('CSV import error:', error);
      set.status = 400;
      return { error: 'Failed to import CSV: ' + String(error) };
    }
  })
  .get('/export/csv', async ({ set }) => {
    const allInsights = await db.select().from(insights);
    
    const headers = [
      'ID', '作成番号', 'インサイト件名', 'インサイトID', '表示ステータス',
      '配信開始日', '更新日', '配信停止日', 'インサイトタイプ', 'メインカテゴリ',
      'サブカテゴリ', 'データカテゴリ', '対象銀行', '表示ロジック', '使用データテーブル',
      '対象ユーザー', '関連インサイト', '収益カテゴリ', 'アイコンタイプ', 'スコア',
      '関連性ポリシー', '関連性スコア', '表示回数', '選択回数', '次回表示ポリシー',
      '次回表示設定値', 'アプリ内遷移先', '外部遷移先', 'ティーザー画像', 'ストーリー画像',
      '次回メンテナンス日', 'メンテナンス理由', '備考', '更新者'
    ];

    const rows = allInsights.map(insight => [
      insight.id,
      insight.creationNumber,
      insight.subject,
      insight.insightId,
      insight.status,
      insight.startDate,
      insight.updateDate,
      insight.endDate,
      insight.type,
      insight.mainCategory,
      insight.subCategory,
      insight.dataCategory,
      JSON.stringify(insight.targetBanks),
      insight.logicFormula,
      JSON.stringify(insight.targetTables),
      insight.targetUsers,
      insight.relatedInsight,
      insight.revenueCategory,
      insight.iconType,
      insight.score,
      insight.relevancePolicy,
      insight.relevanceScore,
      insight.displayCount,
      insight.selectCount,
      insight.nextPolicy,
      insight.nextValue,
      insight.appLink,
      insight.externalLink,
      insight.teaserImage,
      JSON.stringify(insight.storyImages),
      insight.maintenanceDate,
      insight.maintenanceReason,
      insight.remarks,
      insight.updatedBy,
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    
    set.headers['Content-Type'] = 'text/csv; charset=utf-8';
    set.headers['Content-Disposition'] = 'attachment; filename=insights.csv';
    
    return '\uFEFF' + csv; // BOM for Excel
  });
