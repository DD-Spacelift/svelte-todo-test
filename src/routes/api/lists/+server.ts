import { json } from '@sveltejs/kit';
import { getAllListsWithItems, createList } from '$lib/server/database';

export async function GET() {
    const lists = getAllListsWithItems();
    return json(lists);
}

export async function POST({ request }) {
    const { title, description } = await request.json();
    const id = createList(title, description);
    return json({ id, title, description });
} 