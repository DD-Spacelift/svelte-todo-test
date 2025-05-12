import { json } from '@sveltejs/kit';
import { executeFlexibleQuery } from '$lib/db/sqlHack';
import type { RequestHandler } from './$types';
import { dev } from '$app/environment';

const PROD_ERROR_MESSAGES = [
    "Nice try, but like HAL 9000, I can't let you do that.",
    "This endpoint is as forbidden in production as entering the Matrix with a blue pill.",
    "Warning: Attempting to access this in production may cause a temporal paradox.",
    "Access denied: This is a development-only endpoint, like a lightsaber with a 'debug-only' label.",
    "Error 451: This endpoint has been contained by the SCP Foundation for everyone's safety.",
];

export const POST: RequestHandler = async ({ request }) => {
    if (!dev) {
        const randomMessage = PROD_ERROR_MESSAGES[Math.floor(Math.random() * PROD_ERROR_MESSAGES.length)];
        return new Response(randomMessage, { 
            status: 451,  // Unavailable For Legal Reasons (seemed fitting)
            headers: {
                'Content-Type': 'text/plain',
                'X-Error-Type': 'Production-Safety-Lock'
            }
        });
    }

    try {
        const { where } = await request.json();
        const result = executeFlexibleQuery(where || undefined);
        return json(result.rows);
    } catch (error) {
        return new Response(String(error), { status: 400 });
    }
}; 