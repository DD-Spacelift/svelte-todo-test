# SQL Hack Documentation

This document explains the flexible SQL query functionality that allows you to query the todo application's database directly through an HTTP endpoint.

## Overview

The SQL hack provides a flexible way to query the todo database using custom WHERE clauses. The base query joins the `todo_lists` and `todo_items` tables, providing a complete view of all todos and their items.

## Endpoints

There are two POST endpoints available:
- `/api/hack/sql/plain` - Returns results in a formatted plain text table
- `/api/hack/sql/data` - Returns results as JSON data

Both endpoints accept a JSON body with an optional `where` field containing the SQL WHERE clause.

## Database Schema

### todo_lists
- `id` (INTEGER): Primary key
- `title` (TEXT): List title
- `description` (TEXT): List description
- `created_at` (TIMESTAMP): Creation timestamp

### todo_items
- `id` (INTEGER): Primary key
- `list_id` (INTEGER): Foreign key to todo_lists
- `text` (TEXT): Item text
- `completed` (BOOLEAN): Completion status
- `created_at` (TIMESTAMP): Creation timestamp

## Base Query Structure

```sql
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
```

## Example Queries

Here are some example curl commands to demonstrate different query scenarios:

1. Get all todos (no where clause):
```bash
# Plain text format
curl -X POST http://localhost:5173/api/hack/sql/plain \
  -H "Content-Type: application/json" \
  -d '{}'

# JSON format
curl -X POST http://localhost:5173/api/hack/sql/data \
  -H "Content-Type: application/json" \
  -d '{}'
```

2. Get all completed items:
```bash
# Plain text format
curl -X POST http://localhost:5173/api/hack/sql/plain \
  -H "Content-Type: application/json" \
  -d '{"where": "ti.completed = 1"}'

# JSON format
curl -X POST http://localhost:5173/api/hack/sql/data \
  -H "Content-Type: application/json" \
  -d '{"where": "ti.completed = 1"}'
```

3. Get todos from a specific list:
```bash
# Plain text format
curl -X POST http://localhost:5173/api/hack/sql/plain \
  -H "Content-Type: application/json" \
  -d '{"where": "tl.id = 1"}'

# JSON format
curl -X POST http://localhost:5173/api/hack/sql/data \
  -H "Content-Type: application/json" \
  -d '{"where": "tl.id = 1"}'
```

4. Get incomplete items from a specific list:
```bash
# Plain text format
curl -X POST http://localhost:5173/api/hack/sql/plain \
  -H "Content-Type: application/json" \
  -d '{"where": "tl.id = 1 AND ti.completed = 0"}'

# JSON format
curl -X POST http://localhost:5173/api/hack/sql/data \
  -H "Content-Type: application/json" \
  -d '{"where": "tl.id = 1 AND ti.completed = 0"}'
```

5. Search todos by title or description:
```bash
# Plain text format
curl -X POST http://localhost:5173/api/hack/sql/plain \
  -H "Content-Type: application/json" \
  -d '{"where": "tl.title LIKE \"%work%\" OR tl.description LIKE \"%work%\""}'

# JSON format
curl -X POST http://localhost:5173/api/hack/sql/data \
  -H "Content-Type: application/json" \
  -d '{"where": "tl.title LIKE \"%work%\" OR tl.description LIKE \"%work%\""}'
```

6. Get items created today:
```bash
# Plain text format
curl -X POST http://localhost:5173/api/hack/sql/plain \
  -H "Content-Type: application/json" \
  -d '{"where": "date(ti.created_at) = date(\"now\")"}'

# JSON format
curl -X POST http://localhost:5173/api/hack/sql/data \
  -H "Content-Type: application/json" \
  -d '{"where": "date(ti.created_at) = date(\"now\")"}'
```

## Response Format

### Plain Text Response (/api/hack/sql/plain)
The response will be returned in a formatted table-like structure for easy reading. For example:

```
list_id | list_title   | list_description | item_id | item_text        | item_completed
--------|-------------|-----------------|---------|-----------------|---------------
1       | Work Tasks  | Work todos      | 1       | Project proposal| 0
1       | Work Tasks  | Work todos      | 2       | Review code     | 1
```

### JSON Response (/api/hack/sql/data)
The response will be returned as a JSON array of objects, each containing the row data:

```json
[
  {
    "list_id": 1,
    "list_title": "Work Tasks",
    "list_description": "Work todos",
    "item_id": 1,
    "item_text": "Project proposal",
    "item_completed": 0,
    "item_list_id": 1
  },
  ...
]
```

## Security Note

This is a development/debugging tool and should not be exposed in production environments as it could pose security risks through SQL injection. Always validate and sanitize any user input used in WHERE clauses. 