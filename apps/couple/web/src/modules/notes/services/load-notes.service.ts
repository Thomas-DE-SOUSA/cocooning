import 'server-only';
import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import type { NotePageResponse } from '@cocooning/couple-contract/notes';
import { MAX_PAGE_SIZE } from '@cocooning/shared-kernel/domain';
import type { Result } from '@cocooning/shared-kernel/utils';
import { notesModule } from './notes-module.factory';

// Read by the home page with the session cookie of the request (decision 0036): the most recent page, as large as the API allows.
export function loadNotes(): Promise<Result<NotePageResponse, ApiError>> {
    return notesModule().listNotes.execute({
        page: 1,
        pageSize: MAX_PAGE_SIZE,
    });
}
