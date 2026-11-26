import { NoteExceptionCodeEnum } from '@cocooning/couple-contract/notes';
import { NOTE_LIST_EMOJI_MAX_LENGTH } from '@cocooning/couple-shared-kernel/limits';
import { NoteListEmoji } from './note-list-emoji.vo';

describe('Feature: the emoji of a list (R26)', () => {
    describe('Scenario: what a partner chose', () => {
        it('trims it and keeps a joined sequence whole', () => {
            expect(NoteListEmoji.create(' 👨‍👩‍👧‍👦 ').value).toBe('👨‍👩‍👧‍👦');
        });

        it('accepts exactly the limit in code points, refuses one more', () => {
            const atLimit = '🍎'.repeat(NOTE_LIST_EMOJI_MAX_LENGTH);
            expect(NoteListEmoji.create(atLimit).value).toBe(atLimit);
            expect(() => NoteListEmoji.create(`${atLimit}🍎`)).toThrow(
                expect.objectContaining({
                    code: NoteExceptionCodeEnum.NOTE_LIST_EMOJI_INVALID,
                    context: { min: 1, max: NOTE_LIST_EMOJI_MAX_LENGTH },
                }),
            );
        });

        it('refuses an empty one', () => {
            expect(() => NoteListEmoji.create('  ')).toThrow(
                expect.objectContaining({
                    code: NoteExceptionCodeEnum.NOTE_LIST_EMOJI_INVALID,
                }),
            );
        });
    });

    describe('Scenario: no emoji', () => {
        it('stays null', () => {
            expect(NoteListEmoji.createOptional(null)).toBeNull();
        });
    });
});
