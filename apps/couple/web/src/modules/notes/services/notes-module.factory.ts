import 'server-only';
import {
    createNotesModule,
    type NotesModule,
} from '@cocooning/couple-client-infrastructure/shared';
import { serverEnv } from '@/env/server';
import { getSessionToken } from '@/shared/application/session/get-session-token';

// Built per request, never at import: `next build` loads this file without the runtime variables.
export function notesModule(): NotesModule {
    return createNotesModule(
        serverEnv.API_URL,
        serverEnv.API_TIMEOUT_MS,
        getSessionToken,
    );
}
