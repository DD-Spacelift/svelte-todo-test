import { executeFlexibleQuery, formatAsPlainText } from '$lib/db/sqlHack';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
    try {
        const { where } = await request.json();
        const result = executeFlexibleQuery(where || undefined);
        const plainText = formatAsPlainText(result);
        
        return new Response(plainText, {
            headers: {
                'Content-Type': 'text/plain'
            }
        });
    } catch (error) {
        return new Response(String(error), { status: 400 });
    }
}; 