import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import type { NoteSpaceContentsResponse } from '@cocooning/couple-contract/notes';
import type { Result } from '@cocooning/shared-kernel/utils';
import type { NoteLocation } from '../../view-models/note-place.view-model';

// R10: a place read on demand, after the one the page read, when the partner walks the move picker.
export abstract class NoteSpaceContentsGateway {
    abstract getSpaceContents(
        location: NoteLocation,
    ): Promise<Result<NoteSpaceContentsResponse, ApiError>>;
}
