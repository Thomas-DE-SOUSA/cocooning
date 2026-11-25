import { NoteExceptionCodeEnum } from '@cocooning/couple-contract/notes';
import {
    CARD_CANDIDATE_MAX_COUNT,
    NOTE_CARD_QUERY_MAX_LENGTH,
    NOTE_CARD_SOURCE_MAX_COUNT,
} from '@cocooning/couple-shared-kernel/limits';
import { NoteCardStatusEnum } from '@cocooning/couple-shared-kernel/enums';
import { NoteCardSearchedEvent } from '../events/note-card-searched.event';
import { NoteCardTemplateAdoptedEvent } from '../events/note-card-template-adopted.event';
import { CardTemplate } from '../value-objects/card-template.vo';
import { NoteCardQuery } from '../value-objects/note-card-query.vo';
import { NoteId } from '../value-objects/note-id.vo';
import {
    AS_A,
    NOW,
    NotesTestContext,
    PARTNER_A,
} from '../../__tests__/fixtures/notes-test.context';
import type { NoteCard } from './note-card.aggregate';

const LATER = new Date('2026-11-23T11:00:00.000Z');

describe('Feature: the outcome of a search on a card (R19 to R25)', () => {
    let ctx: NotesTestContext;
    let card: NoteCard;

    beforeEach(() => {
        ctx = new NotesTestContext();
        card = ctx.givenCardOf(ctx.givenNoteOf(AS_A, 'Chez Paul'));
    });
    afterEach(() => NoteId.resetForTests());

    it('R19: shows at most three candidates', () => {
        const candidates = Array.from({ length: 5 }, (_, index) => ({
            label: `Chez Paul ${index}`,
            detail: '',
        }));
        card.recordCandidates(candidates, LATER);
        expect(card.status).toBe(NoteCardStatusEnum.CHOOSING);
        expect(card.candidates).toHaveLength(CARD_CANDIDATE_MAX_COUNT);
        expect(card.searchedAt).toEqual(LATER);
    });

    it('R21: keeps at most ten sources, and a value never over a field corrected by hand', () => {
        card.correctField(PARTNER_A, 'Prix', '25 €', NOW);
        const sources = Array.from(
            { length: 12 },
            (_, index) => `https://example.org/${index}`,
        );
        card.recordResult({ Adresse: 'Lyon', Prix: '40 €' }, sources, LATER);
        expect(card.fields).toEqual([
            { name: 'Adresse', value: 'Lyon', isManual: false },
            { name: 'Cuisine', value: null, isManual: false },
            { name: 'Prix', value: '25 €', isManual: true },
        ]);
        expect(card.sources).toHaveLength(NOTE_CARD_SOURCE_MAX_COUNT);
    });

    it.each([
        ['fails', (it: NoteCard) => it.fail(LATER), NoteCardStatusEnum.FAILED],
        [
            'stops at the daily limit',
            (it: NoteCard) => it.markLimitReached(LATER),
            NoteCardStatusEnum.LIMIT_REACHED,
        ],
    ])(
        'R20, R23: %s without a search date, in the name of the requester',
        (_label, end, status) => {
            end(card);
            expect(card.status).toBe(status);
            expect(card.searchedAt).toBeNull();
            expect([card.coupleId, card.requestedBy]).toEqual([
                AS_A.coupleId,
                PARTNER_A,
            ]);
            expect(card.getDomainEvents()).toEqual([
                expect.objectContaining({
                    eventName: NoteCardSearchedEvent.EVENT_NAME,
                    context: AS_A,
                    data: { noteId: card.noteId, status },
                }),
            ]);
        },
    );

    it('refuses a result once the search is over', () => {
        card.fail(LATER);
        expect(() => card.recordResult({}, [], LATER)).toThrow(
            expect.objectContaining({
                code: NoteExceptionCodeEnum.NOTE_CARD_STATUS_INVALID,
            }),
        );
    });

    it('R25: takes the template of another smart folder, keeping the fields of the same name, without searching', () => {
        card.recordResult({ Adresse: 'Lyon', Prix: '40 €' }, [], NOW);
        card.adoptTemplate(
            PARTNER_A,
            CardTemplate.create(['prix', 'Note']),
            LATER,
        );
        expect(card.status).toBe(NoteCardStatusEnum.FILLED);
        expect(card.fields).toEqual([
            { name: 'prix', value: '40 €', isManual: false },
            { name: 'Note', value: null, isManual: false },
        ]);
        expect(card.getDomainEvents().at(-1)).toMatchObject({
            eventName: NoteCardTemplateAdoptedEvent.EVENT_NAME,
        });
    });

    it('keeps a chosen candidate within the query bound, without an empty detail', () => {
        expect(NoteCardQuery.ofCandidate(' Chez Paul ', ' ').value).toBe(
            'Chez Paul',
        );
        expect(
            NoteCardQuery.ofCandidate(
                'a'.repeat(NOTE_CARD_QUERY_MAX_LENGTH),
                'Lyon',
            ).value,
        ).toHaveLength(NOTE_CARD_QUERY_MAX_LENGTH);
    });
});
