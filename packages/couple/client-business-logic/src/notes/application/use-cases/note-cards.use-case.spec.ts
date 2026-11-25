import { fail, ok } from '@cocooning/shared-kernel/utils';
import { ApiErrorCodeEnum } from '../../../shared/api-error';
import { FakeNoteCardsGateway } from '../../../testing/fake-note-cards.gateway';
import {
    A_CHOOSING_NOTE_CARD,
    A_FILLED_NOTE_CARD,
    A_PENDING_NOTE_CARD,
} from '../../../testing/note-cards-fixtures';
import { A_SMART_FOLDER } from '../../../testing/note-folders-fixtures';
import { AddNoteCardUseCase } from './add-note-card.use-case';
import { ChooseNoteCardCandidateUseCase } from './choose-note-card-candidate.use-case';
import { CorrectNoteCardFieldUseCase } from './correct-note-card-field.use-case';
import { RefineNoteCardUseCase } from './refine-note-card.use-case';
import { RefreshNoteCardUseCase } from './refresh-note-card.use-case';

const FOLDER_ID = A_SMART_FOLDER.folderId;

describe('Feature: the note cards of a smart folder from the PWA (R19 to R22)', () => {
    let gateway: FakeNoteCardsGateway;

    beforeEach(() => {
        gateway = new FakeNoteCardsGateway();
    });

    it('adds a note by its name, its card waits for the search (R19, R20)', async () => {
        const added = await new AddNoteCardUseCase(gateway).execute(FOLDER_ID, {
            name: 'Le Bouchon',
        });
        expect(added.success && added.value.card?.status).toBe('PENDING');
        expect(gateway.calls).toEqual([
            {
                operation: 'addNoteCard',
                folderId: FOLDER_ID,
                request: { name: 'Le Bouchon' },
            },
        ]);
    });

    it('chooses a candidate, then refines and refreshes a card (R19, R22)', async () => {
        const noteId = A_CHOOSING_NOTE_CARD.noteId;
        await expect(
            new ChooseNoteCardCandidateUseCase(gateway).execute(noteId, 1),
        ).resolves.toEqual(ok({ ...A_PENDING_NOTE_CARD, noteId }));
        await new RefineNoteCardUseCase(gateway).execute(noteId, {
            query: 'Café des Arts Lyon',
        });
        await new RefreshNoteCardUseCase(gateway).execute(noteId);
        expect(gateway.calls).toEqual([
            {
                operation: 'chooseNoteCardCandidate',
                noteId,
                request: { candidateIndex: 1 },
            },
            {
                operation: 'refineNoteCard',
                noteId,
                request: { query: 'Café des Arts Lyon' },
            },
            { operation: 'refreshNoteCard', noteId },
        ]);
    });

    it('corrects one field by hand (R22)', async () => {
        const noteId = A_FILLED_NOTE_CARD.noteId;
        const corrected = await new CorrectNoteCardFieldUseCase(
            gateway,
        ).execute(noteId, 'Prix', { value: '25 €' });
        expect(corrected.success && corrected.value.fields[2]).toEqual({
            name: 'Prix',
            value: '25 €',
            isManual: true,
        });
        expect(gateway.calls).toEqual([
            {
                operation: 'correctNoteCardField',
                noteId,
                request: { name: 'Prix', value: '25 €' },
            },
        ]);
    });

    it('returns the refusal of the API unchanged', async () => {
        const searching = {
            code: ApiErrorCodeEnum.CONFLICT,
            message: 'Card is searching',
            backendCode: 'NOTE_CARD_STATUS_INVALID',
        };
        gateway.givenRefusal(searching);
        await expect(
            new RefreshNoteCardUseCase(gateway).execute(
                A_PENDING_NOTE_CARD.noteId,
            ),
        ).resolves.toEqual(fail(searching));
    });
});
