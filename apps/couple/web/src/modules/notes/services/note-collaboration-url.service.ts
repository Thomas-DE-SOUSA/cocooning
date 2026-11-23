import 'server-only';
import { serverEnv } from '@/env/server';

// Read per request, never at import: `next build` loads the page without the runtime variables.
export function noteCollaborationUrl(): string {
    return serverEnv.NOTES_COLLABORATION_URL;
}
