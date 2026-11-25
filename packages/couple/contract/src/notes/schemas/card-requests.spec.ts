import {
    CARD_FIELD_NAME_MAX_LENGTH,
    CARD_FIELD_VALUE_MAX_LENGTH,
    CARD_TEMPLATE_MAX_FIELDS,
    FOLDER_SUBJECT_MAX_LENGTH,
    NOTE_CARD_QUERY_MAX_LENGTH,
} from '@cocooning/couple-shared-kernel/limits';
import { AddNoteCardRequestSchema } from './add-note-card.request';
import { ChooseNoteCardCandidateRequestSchema } from './choose-note-card-candidate.request';
import { CorrectNoteCardFieldRequestSchema } from './correct-note-card-field.request';
import { CreateFolderRequestSchema } from './create-folder.request';
import { EditFolderTemplateRequestSchema } from './edit-folder-template.request';
import { ProposeFolderTemplateRequestSchema } from './propose-folder-template.request';
import { RefineNoteCardRequestSchema } from './refine-note-card.request';

const TEMPLATE = ['Adresse', 'Cuisine', 'Prix'];
const fields = (count: number): string[] =>
    Array.from({ length: count }, (_, index) => `Case ${index}`);

describe('Feature: the requests of the smart folders and their cards (R17 to R25)', () => {
    describe('Scenario: R17, creating a smart folder', () => {
        it('reads a classic folder when the kind is left out', () => {
            expect(
                CreateFolderRequestSchema.parse({
                    space: 'SHARED',
                    parentFolderId: null,
                    name: 'Courses',
                }),
            ).toEqual({
                space: 'SHARED',
                parentFolderId: null,
                name: 'Courses',
                kind: 'CLASSIC',
                subject: null,
                cardTemplate: null,
            });
        });

        it('accepts a subject and a template, both trimmed', () => {
            expect(
                CreateFolderRequestSchema.parse({
                    space: 'SHARED',
                    parentFolderId: null,
                    name: 'Restaurants',
                    kind: 'SMART',
                    subject: ' Les restaurants à essayer ',
                    cardTemplate: [' Adresse ', 'Prix'],
                }),
            ).toMatchObject({
                kind: 'SMART',
                subject: 'Les restaurants à essayer',
                cardTemplate: ['Adresse', 'Prix'],
            });
        });

        it('rejects an unknown kind', () => {
            expect(
                CreateFolderRequestSchema.safeParse({
                    space: 'SHARED',
                    parentFolderId: null,
                    name: 'Restaurants',
                    kind: 'MAGIC',
                }).success,
            ).toBe(false);
        });
    });

    describe('Scenario: R17, the subject and the template of a smart folder', () => {
        it('accepts the bounds exactly', () => {
            const request = {
                subject: 'a'.repeat(FOLDER_SUBJECT_MAX_LENGTH),
                cardTemplate: [
                    'a'.repeat(CARD_FIELD_NAME_MAX_LENGTH),
                    ...fields(CARD_TEMPLATE_MAX_FIELDS - 1),
                ],
            };
            expect(EditFolderTemplateRequestSchema.parse(request)).toEqual(
                request,
            );
        });

        it.each([
            ['an empty subject', { subject: ' ', cardTemplate: TEMPLATE }],
            [
                'a subject one sign too long',
                {
                    subject: 'a'.repeat(FOLDER_SUBJECT_MAX_LENGTH + 1),
                    cardTemplate: TEMPLATE,
                },
            ],
            ['a template without field', { subject: 'S', cardTemplate: [] }],
            [
                'one field too many',
                {
                    subject: 'S',
                    cardTemplate: fields(CARD_TEMPLATE_MAX_FIELDS + 1),
                },
            ],
            [
                'a field name one sign too long',
                {
                    subject: 'S',
                    cardTemplate: ['a'.repeat(CARD_FIELD_NAME_MAX_LENGTH + 1)],
                },
            ],
            [
                'twice the same field, whatever the case',
                { subject: 'S', cardTemplate: ['Prix', 'prix'] },
            ],
        ])('rejects %s', (_label, body) => {
            expect(
                EditFolderTemplateRequestSchema.safeParse(body).success,
            ).toBe(false);
        });
    });

    describe('Scenario: R17, asking for a proposal', () => {
        it('reads the name and the place of the folder', () => {
            expect(
                ProposeFolderTemplateRequestSchema.parse({
                    space: 'PRIVATE',
                    parentFolderId: null,
                    name: ' Cadeaux ',
                }),
            ).toEqual({
                space: 'PRIVATE',
                parentFolderId: null,
                name: 'Cadeaux',
            });
        });

        it('rejects a missing name', () => {
            expect(
                ProposeFolderTemplateRequestSchema.safeParse({
                    space: 'SHARED',
                    parentFolderId: null,
                }).success,
            ).toBe(false);
        });
    });

    describe('Scenario: R19, adding, choosing and refining', () => {
        it('reads a trimmed name, a candidate and a refined query', () => {
            expect(
                AddNoteCardRequestSchema.parse({ name: ' Chez Paul ' }),
            ).toEqual({ name: 'Chez Paul' });
            expect(
                ChooseNoteCardCandidateRequestSchema.parse({
                    candidateIndex: 2,
                }),
            ).toEqual({ candidateIndex: 2 });
            expect(
                RefineNoteCardRequestSchema.parse({
                    query: 'a'.repeat(NOTE_CARD_QUERY_MAX_LENGTH),
                }).query,
            ).toHaveLength(NOTE_CARD_QUERY_MAX_LENGTH);
        });

        it.each([
            ['an empty name', AddNoteCardRequestSchema, { name: ' ' }],
            [
                'a fourth candidate',
                ChooseNoteCardCandidateRequestSchema,
                { candidateIndex: 3 },
            ],
            [
                'a negative candidate',
                ChooseNoteCardCandidateRequestSchema,
                { candidateIndex: -1 },
            ],
            [
                'a query one sign too long',
                RefineNoteCardRequestSchema,
                { query: 'a'.repeat(NOTE_CARD_QUERY_MAX_LENGTH + 1) },
            ],
        ])('rejects %s', (_label, schema, body) => {
            expect(schema.safeParse(body).success).toBe(false);
        });
    });

    describe('Scenario: R22, correcting a field', () => {
        it('reads the field and its trimmed value', () => {
            expect(
                CorrectNoteCardFieldRequestSchema.parse({
                    name: 'Prix',
                    value: ' 25 € ',
                }),
            ).toEqual({ name: 'Prix', value: '25 €' });
        });

        it.each([
            ['an empty value', { name: 'Prix', value: ' ' }],
            [
                'a value one sign too long',
                {
                    name: 'Prix',
                    value: 'a'.repeat(CARD_FIELD_VALUE_MAX_LENGTH + 1),
                },
            ],
        ])('rejects %s', (_label, body) => {
            expect(
                CorrectNoteCardFieldRequestSchema.safeParse(body).success,
            ).toBe(false);
        });
    });
});
