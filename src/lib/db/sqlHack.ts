import type Database from 'better-sqlite3';
import { db } from '$lib/server/database';

interface QueryResult {
    rows: Record<string, any>[];
    columns: string[];
}

export function executeFlexibleQuery(whereClause?: string): QueryResult {
    // Base query with table joins using aliases
    let baseQuery = `
        SELECT 
            tl.id as list_id,
            tl.title as list_title,
            tl.description as list_description,
            ti.id as item_id,
            ti.text as item_text,
            ti.completed as item_completed,
            ti.list_id as item_list_id
        FROM todo_lists tl
        LEFT JOIN todo_items ti ON tl.id = ti.list_id
    `;

    // Add where clause if provided
    if (whereClause) {
        baseQuery += ` WHERE ${whereClause}`;
    }

    try {
        const stmt = db.prepare(baseQuery);
        const rows = stmt.all() as Record<string, any>[];
        
        // Get column names from the first row
        const columns = rows.length > 0 ? Object.keys(rows[0]) : [];
        
        return { rows, columns };
    } catch (error: unknown) {
        if (error instanceof Error) {
            throw new Error(`SQL Query Error: ${error.message}`);
        }
        throw new Error('Unknown SQL Query Error');
    }
}

export function formatAsPlainText(result: QueryResult): string {
    if (result.rows.length === 0) {
        return 'No results found';
    }

    // Calculate column widths
    const columnWidths = result.columns.map(col => {
        const maxDataWidth = Math.max(...result.rows.map(row => String(row[col]).length));
        return Math.max(col.length, maxDataWidth);
    });

    // Create header
    const header = result.columns.map((col, i) => col.padEnd(columnWidths[i])).join(' | ');
    const separator = columnWidths.map(width => '-'.repeat(width)).join('-+-');

    // Create rows
    const rows = result.rows.map(row =>
        result.columns.map((col, i) => String(row[col]).padEnd(columnWidths[i])).join(' | ')
    );

    return [header, separator, ...rows].join('\n');
} 