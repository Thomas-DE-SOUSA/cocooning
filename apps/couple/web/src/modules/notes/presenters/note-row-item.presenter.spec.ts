import {
    A_FILLED_NOTE_CARD,
    A_PENDING_NOTE_CARD,
    A_SHARED_NOTE,
    A_SMART_SPACE_CONTENTS,
} from '@cocooning/couple-client-business-logic/testing';
import { NoteCardStatusEnum } from '@cocooning/couple-shared-kernel/enums';
import { toNoteRowItem } from './note-row-item.presenter';

const [FILLED, PENDING] = A_SMART_SPACE_CONTENTS.notes;

describe('Feature: the line of a card in its folder (R20, R21)', () => {
    it('has no line for a note without card', () => {
        expect(toNoteRowItem({ ...A_SHARED_NOTE, card: null }).card).toBeNull();
    });

    it('gives the first two values found, without the fields not found', () => {
        expect(toNoteRowItem(FILLED!).card).toEqual({
            status: NoteCardStatusEnum.FILLED,
            summary: '13 rue de Charonne, Paris · Bistrot',
        });
    });

    it('skips a field not found to give the next value', () => {
        const card = {
            ...A_FILLED_NOTE_CARD,
            fields: [
                { name: 'Adresse', value: null, isManual: false },
                ...A_FILLED_NOTE_CARD.fields.slice(1),
            ],
        };

        expect(toNoteRowItem({ ...FILLED!, card }).card?.summary).toBe(
            'Bistrot',
        );
    });

    it('has no summary while the card waits for its search', () => {
        expect(toNoteRowItem(PENDING!).card).toEqual({
            status: A_PENDING_NOTE_CARD.status,
            summary: null,
        });
    });
});
