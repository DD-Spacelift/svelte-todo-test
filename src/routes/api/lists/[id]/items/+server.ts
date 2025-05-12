import { json } from '@sveltejs/kit';
import { createItem, updateItemStatus, deleteItem } from '$lib/server/database';

export async function POST({ params, request }) {
    const { text, dueDate } = await request.json();
    const id = createItem(Number(params.id), text, dueDate);
    return json({ id, text, completed: false, dueDate });
}

export async function PATCH({ request }) {
    const { id, completed } = await request.json();
    updateItemStatus(id, completed);
    return json({ id, completed });
}

export async function DELETE({ request }) {
    const { id } = await request.json();
    deleteItem(id);
    return new Response(null, { status: 204 });
} 