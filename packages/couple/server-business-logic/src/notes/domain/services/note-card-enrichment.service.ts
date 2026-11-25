import { NoteExceptionCodeEnum } from '@cocooning/couple-contract/notes';
import { isBaseException } from '@cocooning/shared-kernel/exceptions';
import { NoteCardWritingKindEnum } from '../enums/note-card-writing-kind.enum';
import type { CardContext } from '../models/card-context';
import type { NoteCard } from '../models/note-card.aggregate';
import {
    noteCardWritingRequestOf,
    pagesToRead,
    searchQueryOf,
} from '../models/note-card-search';
import type { NoteCardWriting } from '../models/note-card-writing';
import type { NoteCardSearchCounter } from '../ports/note-card-search.counter';
import type { NoteCardRepository } from '../ports/note-card.repository';
import type { NoteCardWriter } from '../ports/note-card.writer';
import type { NoteRepository } from '../ports/note.repository';
import type { PlaceDirectory } from '../ports/place.directory';
import type { WebPageReader } from '../ports/web-page.reader';
import type { WebSearchProvider } from '../ports/web-search.provider';
import type { CardContextService } from './card-context.service';

const UNAVAILABLE: ReadonlyArray<string> = [
    NoteExceptionCodeEnum.NOTE_CARD_SEARCH_UNAVAILABLE,
    NoteExceptionCodeEnum.NOTE_CARD_WRITER_UNAVAILABLE,
];

// R26 of core.md: an engine or an AI that fails is a card that failed, never an error of the task.
const isUnavailable = (error: unknown): boolean =>
    isBaseException(error) && UNAVAILABLE.includes(error.code);

export type NoteCardSearchPorts = {
    readonly webSearchProvider: WebSearchProvider;
    readonly webPageReader: WebPageReader;
    readonly placeDirectory: PlaceDirectory;
    readonly noteCardWriter: NoteCardWriter;
};

// Decisions 0054 and 0055: one card after the other, each through the daily limit, the search and OpenStreetMap
// together, the pages and the AI.
export class NoteCardEnrichmentService {
    constructor(
        private readonly noteCardRepository: NoteCardRepository,
        private readonly noteRepository: NoteRepository,
        private readonly cardContextService: CardContextService,
        private readonly noteCardSearchCounter: NoteCardSearchCounter,
        private readonly ports: NoteCardSearchPorts,
        private readonly dailySearchLimit: number,
    ) {}

    // One at a time on purpose: the free AI allows a few requests a minute, and each card waits for its pages.
    async enrichAll(cards: ReadonlyArray<NoteCard>, now: Date): Promise<void> {
        await cards.reduce(async (previous, card) => {
            await previous;
            await this.enrich(card, now);
            await this.noteCardRepository.save(card);
        }, Promise.resolve());
    }

    // R20 to R23: the card ends CHOOSING, FILLED, FAILED or LIMIT_REACHED.
    private async enrich(card: NoteCard, now: Date): Promise<void> {
        const done = await this.noteCardSearchCounter.countOfCoupleDay(
            card.coupleId,
            now,
        );
        if (done >= this.dailySearchLimit) {
            card.markLimitReached(now);
            return;
        }
        const context = await this.contextOf(card);
        if (context === null) {
            card.fail(now);
            return;
        }
        await this.noteCardSearchCounter.record(
            card.coupleId,
            card.id.getValue(),
            now,
        );
        try {
            this.record(card, await this.write(card, context), now);
        } catch (error) {
            if (!isUnavailable(error)) throw error;
            card.fail(now);
        }
    }

    // In the name of the partner who asked: a note gone, or no longer in a smart tree, fails the card (R20).
    private async contextOf(card: NoteCard): Promise<CardContext | null> {
        const note = await this.noteRepository.findVisibleById(
            card.coupleId,
            card.requestedBy,
            card.noteId,
        );
        if (note === null) return null;
        return this.cardContextService.findCardContextOf(note);
    }

    private async write(
        card: NoteCard,
        context: CardContext,
    ): Promise<NoteCardWriting> {
        const { webSearchProvider, webPageReader, placeDirectory } = this.ports;
        const query = searchQueryOf(card, context);
        const [results, place] = await Promise.all([
            webSearchProvider.search(query),
            placeDirectory.findPlace(query),
        ]);
        const pages = await webPageReader.read(pagesToRead(results));
        return this.ports.noteCardWriter.writeCard(
            noteCardWritingRequestOf(card, context, { place, results, pages }),
        );
    }

    private record(card: NoteCard, writing: NoteCardWriting, now: Date): void {
        if (writing.kind === NoteCardWritingKindEnum.CANDIDATES) {
            card.recordCandidates(writing.candidates, now);
            return;
        }
        card.recordResult(writing.values, writing.sourceUrls, now);
    }
}
