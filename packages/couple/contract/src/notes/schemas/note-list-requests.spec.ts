import { CreateNoteListRequestSchema } from './create-note-list.request';
import { EditNoteListRequestSchema } from './edit-note-list.request';
import { NoteListQueryRequestSchema } from './note-list-query.request';

describe('Feature: the requests on lists (R26, R28)', () => {
    describe('Scenario: creating a list', () => {
        it('accepts a section, a space, a trimmed title and no emoji', () => {
            expect(
                CreateNoteListRequestSchema.parse({
                    kind: 'GROCERIES',
                    space: 'SHARED',
                    title: ' Carrefour ',
                }),
            ).toEqual({
                kind: 'GROCERIES',
                space: 'SHARED',
                title: 'Carrefour',
                emoji: null,
            });
        });

        it('keeps a trimmed emoji, a joined sequence included', () => {
            expect(
                CreateNoteListRequestSchema.parse({
                    kind: 'TASKS',
                    space: 'PRIVATE',
                    title: 'Noël',
                    emoji: ' 👨‍👩‍👧‍👦 ',
                }).emoji,
            ).toBe('👨‍👩‍👧‍👦');
        });

        it.each([
            [
                'an unknown section',
                { kind: 'WISHES', space: 'SHARED', title: 'A' },
            ],
            ['a missing space', { kind: 'TASKS', title: 'Noël' }],
            [
                'an empty emoji',
                { kind: 'TASKS', space: 'SHARED', title: 'Noël', emoji: ' ' },
            ],
            [
                'an emoji over the limit',
                {
                    kind: 'TASKS',
                    space: 'SHARED',
                    title: 'Noël',
                    emoji: '🎄'.repeat(17),
                },
            ],
        ])('rejects %s', (_label, body) => {
            expect(CreateNoteListRequestSchema.safeParse(body).success).toBe(
                false,
            );
        });
    });

    describe('Scenario: editing a list', () => {
        it('accepts a title and an emoji, or null to remove it', () => {
            expect(
                EditNoteListRequestSchema.parse({ title: 'Lidl', emoji: null }),
            ).toEqual({ title: 'Lidl', emoji: null });
        });

        it('rejects a missing emoji and an empty title', () => {
            expect(
                EditNoteListRequestSchema.safeParse({ title: 'Lidl' }).success,
            ).toBe(false);
            expect(
                EditNoteListRequestSchema.safeParse({ title: ' ', emoji: null })
                    .success,
            ).toBe(false);
        });
    });

    describe('Scenario: the section of the home', () => {
        it('reads the section and rejects an unknown one', () => {
            expect(NoteListQueryRequestSchema.parse({ kind: 'TASKS' })).toEqual(
                { kind: 'TASKS' },
            );
            expect(NoteListQueryRequestSchema.safeParse({}).success).toBe(
                false,
            );
        });
    });
});
