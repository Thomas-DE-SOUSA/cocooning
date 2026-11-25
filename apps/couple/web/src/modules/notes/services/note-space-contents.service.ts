import 'server-only';
import type { GetNoteSpaceContentsUseCase } from '@cocooning/couple-client-business-logic/notes';
import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import type { NoteSpaceContentsResponse } from '@cocooning/couple-contract/notes';
import { fail, type Result } from '@cocooning/shared-kernel/utils';
import { invalid } from './note-commands.service';
import { NoteLocationSchema } from './note-location.zod';

// R10: a place of the move picker; it comes from the browser and is validated again (core-frontend.md rule 14).
export function readNoteSpaceContents(
    locationInput: unknown,
    useCase: GetNoteSpaceContentsUseCase,
): Promise<Result<NoteSpaceContentsResponse, ApiError>> {
    const location = NoteLocationSchema.safeParse(locationInput);
    if (!location.success) {
        return Promise.resolve(fail(invalid('Invalid note place')));
    }
    return useCase.execute(location.data.space, location.data.folderId);
}
