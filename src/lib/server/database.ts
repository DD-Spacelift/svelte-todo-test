import Database from 'better-sqlite3';
import { DB_PATH } from '$env/static/private';
import { dev } from '$app/environment';

const DB_VERSION = 1; // Current database schema version

// Check if we should force persistent DB in dev mode
const forcePersistentDb = process.env.FORCE_PERSISTENT_DB === 'true';
const useInMemory = dev && !forcePersistentDb;

// Initialize database connection
export const db = new Database(useInMemory ? ':memory:' : DB_PATH);

// Create version tracking table and check current version
db.exec(`
    CREATE TABLE IF NOT EXISTS db_metadata (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
    );
`);

// Get current database version
interface VersionRow {
    value: string;
}
const versionRow = db.prepare('SELECT value FROM db_metadata WHERE key = ?').get('version') as VersionRow | undefined;
const currentVersion = versionRow ? parseInt(versionRow.value) : 0;

// Initialize or upgrade database if needed
if (currentVersion < DB_VERSION) {
    db.transaction(() => {
        // Create or recreate tables
        db.exec(`
            CREATE TABLE IF NOT EXISTS todo_lists (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS todo_items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                list_id INTEGER NOT NULL,
                text TEXT NOT NULL,
                completed BOOLEAN DEFAULT 0,
                due_date TIMESTAMP NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (list_id) REFERENCES todo_lists(id) ON DELETE CASCADE
            );
        `);

        // Update database version
        db.prepare('INSERT OR REPLACE INTO db_metadata (key, value) VALUES (?, ?)').run('version', DB_VERSION.toString());
        
        // Insert initial data only for new databases
        if (currentVersion === 0) {
            const todoListCount = db.prepare('SELECT COUNT(*) as count FROM todo_lists').get() as { count: number };

            if (todoListCount.count === 0) {
                const insertList = db.prepare('INSERT INTO todo_lists (title, description) VALUES (?, ?)');
                const insertItem = db.prepare('INSERT INTO todo_items (list_id, text, completed) VALUES (?, ?, ?)');

                const lists = [
                    { 
                        title: 'Work Tasks', 
                        description: 'All my work-related todos',
                        items: [
                            { text: 'Complete project proposal', completed: false },
                            { text: 'Review code changes', completed: true },
                            { text: 'Update documentation', completed: false }
                        ]
                    },
                    { 
                        title: 'Shopping List', 
                        description: 'Things to buy',
                        items: [
                            { text: 'Groceries for the week', completed: false },
                            { text: 'New headphones', completed: false }
                        ]
                    },
                    { 
                        title: 'Personal Goals', 
                        description: 'Personal development tasks',
                        items: [
                            { text: 'Read a chapter of the book', completed: true },
                            { text: 'Go to the gym', completed: false },
                            { text: 'Practice meditation', completed: false }
                        ]
                    }
                ];

                lists.forEach(list => {
                    const result = insertList.run(list.title, list.description);
                    const listId = result.lastInsertRowid;
                    
                    list.items.forEach(item => {
                        insertItem.run(listId, item.text, item.completed ? 1 : 0);
                    });
                });
            }
        }
    })();
}

// Database helper functions
export function getAllLists() {
    return db.prepare('SELECT * FROM todo_lists ORDER BY created_at DESC').all();
}

export function getListById(id: number) {
    return db.prepare('SELECT * FROM todo_lists WHERE id = ?').get(id);
}

export function getItemsByListId(listId: number) {
    return db.prepare('SELECT * FROM todo_items WHERE list_id = ? ORDER BY created_at').all(listId);
}

export function createList(title: string, description: string) {
    const stmt = db.prepare('INSERT INTO todo_lists (title, description) VALUES (?, ?)');
    const result = stmt.run(title, description);
    return result.lastInsertRowid;
}

export function createItem(listId: number, text: string, dueDate?: string) {
    const stmt = db.prepare('INSERT INTO todo_items (list_id, text, due_date) VALUES (?, ?, ?)');
    const result = stmt.run(listId, text, dueDate || null);
    return result.lastInsertRowid;
}

export function updateItemStatus(itemId: number, completed: boolean) {
    const stmt = db.prepare('UPDATE todo_items SET completed = ? WHERE id = ?');
    return stmt.run(completed ? 1 : 0, itemId);
}

export function deleteList(id: number) {
    const stmt = db.prepare('DELETE FROM todo_lists WHERE id = ?');
    return stmt.run(id);
}

export function deleteItem(id: number) {
    const stmt = db.prepare('DELETE FROM todo_items WHERE id = ?');
    return stmt.run(id);
}

interface TodoList {
    id: number;
    title: string;
    description: string;
    created_at: string;
    items: string;
}

interface TodoItem {
    id: number;
    text: string;
    completed: boolean;
    due_date: string | null;
}

export function getAllListsWithItems() {
    const lists = db.prepare(`
        SELECT 
            l.id, 
            l.title, 
            l.description, 
            l.created_at,
            (
                SELECT json_group_array(
                    json_object(
                        'id', i2.id,
                        'text', i2.text,
                        'completed', i2.completed,
                        'due_date', i2.due_date
                    )
                )
                FROM todo_items i2 
                WHERE i2.list_id = l.id AND i2.completed = 0
            ) as items
        FROM todo_lists l
        ORDER BY l.created_at DESC
    `).all() as TodoList[];
    
    return lists.map((list: TodoList) => ({
        ...list,
        items: JSON.parse(list.items).filter((item: TodoItem) => item.id !== null)
    }));
} 