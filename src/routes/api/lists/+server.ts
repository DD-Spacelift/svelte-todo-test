import { json } from '@sveltejs/kit';
import { getAllLists, createList } from '$lib/server/database';

export async function GET() {
    const lists = getAllLists();
    return json(lists);
}

export async function POST({ request }) {
    const { title, description } = await request.json();
    const id = createList(title, description);
    return json({ id, title, description });
} 