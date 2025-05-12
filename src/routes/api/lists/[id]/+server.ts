import { json } from '@sveltejs/kit';
import { getListById, getItemsByListId, deleteList } from '$lib/server/database';

export async function GET({ params }) {
    const list = getListById(Number(params.id));
    if (!list) {
        return new Response('Not found', { status: 404 });
    }
    
    const items = getItemsByListId(Number(params.id));
    return json({ ...list, items });
}

export async function DELETE({ params }) {
    deleteList(Number(params.id));
    return new Response(null, { status: 204 });
} 