import type { NoteSpacesResponse } from '@cocooning/couple-contract/notes';
import type { Result } from '@cocooning/shared-kernel/utils';
import type { ApiError } from '../../../shared/api-error';
import type { NoteFoldersGateway } from '../../domain/ports/note-folders.gateway';

// R10: « Partagé » and the partner's own « Privé », with what each holds.
export class ListNoteSpacesUseCase {
    constructor(private readonly noteFoldersGateway: NoteFoldersGateway) {}

    execute(): Promise<Result<NoteSpacesResponse, ApiError>> {
        return this.noteFoldersGateway.listSpaces();
    }
}
