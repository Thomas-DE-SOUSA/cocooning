import type { NoteCardNameForm } from '@cocooning/couple-client-business-logic/notes';
import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import type { Result } from '@cocooning/shared-kernel/utils';

// R19 to R22: the commands on the cards of a smart folder, sent by server actions; the page reads the card again.
export abstract class NoteCardCommandGateway {
    abstract addNoteCard(
        folderId: string,
        form: NoteCardNameForm,
    ): Promise<Result<null, ApiError>>;
}
