import type {
    NoteCardNameForm,
    NoteCardQueryForm,
} from '@cocooning/couple-client-business-logic/notes';
import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import type { Result } from '@cocooning/shared-kernel/utils';
import { NoteCardCommandGateway } from '../ports/note-card-command.gateway';
import { FakeAnswers } from './fake-answers';
import type { NoteCardCommandCall } from './note-card-command-call';

export class FakeNoteCardCommandGateway extends NoteCardCommandGateway {
    readonly answers = new FakeAnswers<NoteCardCommandCall>();

    override addNoteCard(
        folderId: string,
        form: NoteCardNameForm,
    ): Promise<Result<null, ApiError>> {
        return this.answers.answer({
            operation: 'addNoteCard',
            folderId,
            form,
        });
    }

    override chooseNoteCardCandidate(
        noteId: string,
        candidateIndex: number,
    ): Promise<Result<null, ApiError>> {
        return this.answers.answer({
            operation: 'chooseNoteCardCandidate',
            noteId,
            candidateIndex,
        });
    }

    override refineNoteCard(
        noteId: string,
        form: NoteCardQueryForm,
    ): Promise<Result<null, ApiError>> {
        return this.answers.answer({
            operation: 'refineNoteCard',
            noteId,
            form,
        });
    }
}
