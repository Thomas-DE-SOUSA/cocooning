import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import { A_SPACE_CONTENTS } from '@cocooning/couple-client-business-logic/testing';
import type { NoteSpaceContentsResponse } from '@cocooning/couple-contract/notes';
import { ok, type Result } from '@cocooning/shared-kernel/utils';
import type { NoteLocation } from '../../view-models/note-place.view-model';
import { NoteSpaceContentsGateway } from '../ports/note-space-contents.gateway';

// Answers every place with the given contents, in the space asked, or with the given outcome.
export class FakeNoteSpaceContentsGateway extends NoteSpaceContentsGateway {
    readonly locations: NoteLocation[] = [];
    private contents: NoteSpaceContentsResponse = A_SPACE_CONTENTS;
    private outcome: Result<null, ApiError> = ok(null);

    givenContents(contents: NoteSpaceContentsResponse): void {
        this.contents = contents;
    }

    givenOutcome(outcome: Result<null, ApiError>): void {
        this.outcome = outcome;
    }

    override getSpaceContents(
        location: NoteLocation,
    ): Promise<Result<NoteSpaceContentsResponse, ApiError>> {
        this.locations.push(location);
        if (!this.outcome.success) return Promise.resolve(this.outcome);
        return Promise.resolve(ok({ ...this.contents, space: location.space }));
    }
}
