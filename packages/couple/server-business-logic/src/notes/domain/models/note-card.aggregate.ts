import {
    type NoteCardStatus,
    NoteCardStatusEnum,
} from '@cocooning/couple-shared-kernel/enums';
import {
    CARD_CANDIDATE_MAX_COUNT,
    NOTE_CARD_SOURCE_MAX_COUNT,
} from '@cocooning/couple-shared-kernel/limits';
import { AggregateRoot, EntityMetadata } from '@cocooning/shared-kernel/domain';
import { NoteCardCorrectedEvent } from '../events/note-card-corrected.event';
import { NoteCardRequestedEvent } from '../events/note-card-requested.event';
import { NoteCardSearchedEvent } from '../events/note-card-searched.event';
import { NoteCardTemplateAdoptedEvent } from '../events/note-card-template-adopted.event';
import { NoteCardCandidateValidator } from '../services/note-card-candidate.validator';
import { NoteCardStatusValidator } from '../services/note-card-status.validator';
import type { CardTemplate } from '../value-objects/card-template.vo';
import { NoteCardId } from '../value-objects/note-card-id.vo';
import { NoteCardQuery } from '../value-objects/note-card-query.vo';
import {
    addsFields,
    type CardFieldValues,
    emptyFieldsOf,
    fieldsAdopting,
    fieldsCorrecting,
    fieldsFilledWith,
} from './card-fields';
import type {
    CardCandidate,
    CardField,
    CreateNoteCardInput,
    NoteCardProps,
    NoteCardSnapshot,
} from './note-card.aggregate.type';
import { noteCardFromSnapshot, noteCardSnapshotOf } from './note-card.snapshot';

const INITIAL_VERSION = 1;
const { PENDING, CHOOSING, FILLED, FAILED, LIMIT_REACHED } = NoteCardStatusEnum;
// A search in progress takes no new request: the result would land on it.
const NOT_SEARCHING = [CHOOSING, FILLED, FAILED, LIMIT_REACHED];

// R20: the card at the top of a note of a smart folder, filled in the background (decision 0054).
export class NoteCard extends AggregateRoot {
    private constructor(private readonly props: NoteCardProps) {
        super();
    }

    // R19, R20: the note exists at once, its card « en recherche » with every field to find.
    static create(input: CreateNoteCardInput, now: Date): NoteCard {
        const card = new NoteCard({
            id: NoteCardId.generate(),
            coupleId: input.coupleId,
            noteId: input.noteId,
            status: PENDING,
            query: input.query,
            fields: emptyFieldsOf(input.template),
            candidates: [],
            sources: [],
            searchedAt: null,
            requestedBy: input.requestedBy,
            version: INITIAL_VERSION,
            metadata: EntityMetadata.create(now),
        });
        card.addDomainEvent(
            new NoteCardRequestedEvent(
                card.eventParams(input.requestedBy, now),
            ),
        );
        return card;
    }

    static fromSnapshot(snapshot: NoteCardSnapshot): NoteCard {
        return new NoteCard(noteCardFromSnapshot(snapshot));
    }

    // R19: one of the candidates shown becomes the query.
    chooseCandidate(userId: string, candidateIndex: number, now: Date): void {
        NoteCardStatusValidator.ensureIn(this.props.status, [CHOOSING]);
        const candidate = NoteCardCandidateValidator.candidateAt(
            this.props.candidates,
            candidateIndex,
        );
        this.props.query = NoteCardQuery.ofCandidate(
            candidate.label,
            candidate.detail,
        );
        this.requestSearch(userId, now);
    }

    // R19: « je précise », then the AI searches again.
    refine(userId: string, query: NoteCardQuery, now: Date): void {
        NoteCardStatusValidator.ensureIn(this.props.status, NOT_SEARCHING);
        this.props.query = query;
        this.requestSearch(userId, now);
    }

    // R20, R22, R23, R25: « Mettre à jour », with the template of the folder; the fields corrected by hand stay.
    refresh(userId: string, template: CardTemplate, now: Date): void {
        NoteCardStatusValidator.ensureIn(this.props.status, NOT_SEARCHING);
        this.props.fields = fieldsAdopting(this.props.fields, template);
        this.requestSearch(userId, now);
    }

    // R22: by hand, kept by every later search.
    correctField(userId: string, name: string, value: string, now: Date): void {
        this.props.fields = fieldsCorrecting(this.props.fields, name, value);
        this.props.metadata = this.props.metadata.recordUpdate(now);
        this.addDomainEvent(
            new NoteCardCorrectedEvent(this.eventParams(userId, now)),
        );
    }

    // R25: moved into another smart folder, the card takes its template; « Mettre à jour » fills the rest.
    adoptTemplate(userId: string, template: CardTemplate, now: Date): void {
        this.adopt(userId, template, this.props.status, now);
    }

    // R22: a field added to the template is searched on the filled cards; the daily limit applies (R23).
    applyEditedTemplate(
        userId: string,
        template: CardTemplate,
        now: Date,
    ): void {
        const searchesAgain =
            this.props.status === FILLED &&
            addsFields(this.props.fields, template);
        this.adopt(
            userId,
            template,
            searchesAgain ? PENDING : this.props.status,
            now,
        );
    }

    // R19: several distinct items match the name: at most CARD_CANDIDATE_MAX_COUNT are shown.
    recordCandidates(
        candidates: ReadonlyArray<CardCandidate>,
        now: Date,
    ): void {
        NoteCardStatusValidator.ensureIn(this.props.status, [PENDING]);
        this.props.candidates = candidates.slice(0, CARD_CANDIDATE_MAX_COUNT);
        this.endSearch(CHOOSING, now, now);
    }

    // R21: one value per field, « non trouvé » when the texts do not give it, with the sources and the date.
    recordResult(
        values: CardFieldValues,
        sources: ReadonlyArray<string>,
        now: Date,
    ): void {
        NoteCardStatusValidator.ensureIn(this.props.status, [PENDING]);
        this.props.fields = fieldsFilledWith(this.props.fields, values);
        this.props.sources = sources.slice(0, NOTE_CARD_SOURCE_MAX_COUNT);
        this.props.candidates = [];
        this.endSearch(FILLED, now, now);
    }

    // R20: the note stays, the couple tries again.
    fail(now: Date): void {
        NoteCardStatusValidator.ensureIn(this.props.status, [PENDING]);
        this.endSearch(FAILED, this.props.searchedAt, now);
    }

    // R23: the daily limit is reached, « réessaie demain ».
    markLimitReached(now: Date): void {
        NoteCardStatusValidator.ensureIn(this.props.status, [PENDING]);
        this.endSearch(LIMIT_REACHED, this.props.searchedAt, now);
    }

    get id(): NoteCardId {
        return this.props.id;
    }

    get coupleId(): string {
        return this.props.coupleId;
    }

    get noteId(): string {
        return this.props.noteId.getValue();
    }

    get status(): NoteCardStatus {
        return this.props.status;
    }

    get query(): NoteCardQuery {
        return this.props.query;
    }

    get fields(): ReadonlyArray<CardField> {
        return this.props.fields;
    }

    get candidates(): ReadonlyArray<CardCandidate> {
        return this.props.candidates;
    }

    get sources(): ReadonlyArray<string> {
        return this.props.sources;
    }

    get searchedAt(): Date | null {
        return this.props.searchedAt === null
            ? null
            : new Date(this.props.searchedAt);
    }

    get requestedBy(): string {
        return this.props.requestedBy;
    }

    get updatedAt(): Date {
        return this.props.metadata.updatedAt;
    }

    toSnapshot(): NoteCardSnapshot {
        return noteCardSnapshotOf(this.props);
    }

    private requestSearch(userId: string, now: Date): void {
        this.props.status = PENDING;
        this.props.candidates = [];
        this.props.requestedBy = userId;
        this.props.metadata = this.props.metadata.recordUpdate(now);
        this.addDomainEvent(
            new NoteCardRequestedEvent(this.eventParams(userId, now)),
        );
    }

    private adopt(
        userId: string,
        template: CardTemplate,
        status: NoteCardStatus,
        now: Date,
    ): void {
        this.props.fields = fieldsAdopting(this.props.fields, template);
        this.props.status = status;
        this.props.metadata = this.props.metadata.recordUpdate(now);
        this.addDomainEvent(
            new NoteCardTemplateAdoptedEvent(this.eventParams(userId, now)),
        );
    }

    private endSearch(
        status: NoteCardStatus,
        searchedAt: Date | null,
        now: Date,
    ): void {
        this.props.status = status;
        this.props.searchedAt = searchedAt;
        this.props.metadata = this.props.metadata.recordUpdate(now);
        this.addDomainEvent(
            new NoteCardSearchedEvent(
                this.eventParams(this.props.requestedBy, now),
            ),
        );
    }

    private eventParams(userId: string, now: Date) {
        return {
            coupleId: this.props.coupleId,
            userId,
            noteCardId: this.props.id.getValue(),
            occurredAt: now,
            data: { noteId: this.noteId, status: this.props.status },
        };
    }
}
