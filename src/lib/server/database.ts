import Database from 'better-sqlite3';
import { DB_PATH } from '$env/static/private';
import { dev } from '$app/environment';

// Use in-memory database for development
export const db = new Database(dev ? ':memory:' : DB_PATH);

// Create tables if they don't exist
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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (list_id) REFERENCES todo_lists(id) ON DELETE CASCADE
    );
`);

// Insert initial data if tables are empty
const todoListCount = db.prepare('SELECT COUNT(*) as count FROM todo_lists').get().count;

if (todoListCount === 0) {
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

    db.transaction(() => {
        lists.forEach(list => {
            const result = insertList.run(list.title, list.description);
            const listId = result.lastInsertRowid;
            
            list.items.forEach(item => {
                insertItem.run(listId, item.text, item.completed ? 1 : 0);
            });
        });
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

export function createItem(listId: number, text: string) {
    const stmt = db.prepare('INSERT INTO todo_items (list_id, text) VALUES (?, ?)');
    const result = stmt.run(listId, text);
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