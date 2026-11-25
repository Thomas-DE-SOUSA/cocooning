import {
    type ApiError,
    ApiErrorCodeEnum,
} from '@cocooning/couple-client-business-logic/shared';
import type { NoteSpaceContentsResponse } from '@cocooning/couple-contract/notes';
import type { Result } from '@cocooning/shared-kernel/utils';
import { runServerAction } from '@/shared/application/server-action/run-server-action';
import type { NoteLocation } from '../../view-models/note-place.view-model';
import { NoteSpaceContentsGateway } from '../ports/note-space-contents.gateway';

export type NoteSpaceContentsAction = (
    location: NoteLocation,
) => Promise<Result<NoteSpaceContentsResponse, ApiError>>;

const UNREACHABLE: ApiError = {
    code: ApiErrorCodeEnum.NETWORK_ERROR,
    message: 'Note spaces server action unreachable',
    backendCode: null,
};

export class ServerActionNoteSpaceContentsGateway extends NoteSpaceContentsGateway {
    constructor(private readonly action: NoteSpaceContentsAction) {
        super();
    }

    override getSpaceContents(
        location: NoteLocation,
    ): Promise<Result<NoteSpaceContentsResponse, ApiError>> {
        return runServerAction(() => this.action(location), UNREACHABLE);
    }
}
