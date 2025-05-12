import { json } from '@sveltejs/kit';
import { executeFlexibleQuery } from '$lib/db/sqlHack';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
    try {
        const { where } = await request.json();
        const result = executeFlexibleQuery(where || undefined);
        return json(result.rows);
    } catch (error) {
        return new Response(String(error), { status: 400 });
    }
}; 