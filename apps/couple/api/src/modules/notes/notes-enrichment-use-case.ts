import type { FactoryProvider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
    CardContextService,
    EnrichPendingNoteCardsUseCase,
    FolderRepository,
    NoteCardEnrichmentService,
    NoteCardRepository,
    NoteCardSearchCounter,
    NoteCardWriter,
    NoteRepository,
    PlaceDirectory,
    WebPageReader,
    WebSearchProvider,
} from '@cocooning/couple-server-business-logic/notes';
import { EventPublishingService } from '@cocooning/shared-kernel/application';
import {
    DateTimeProvider,
    EventPublisher,
    Logger,
} from '@cocooning/shared-kernel/ports';
import type { Environment } from '../../env';

// A few cards per pass: each one waits for a search and OpenStreetMap, three pages and the AI (decisions 0054, 0055).
export const NOTE_CARD_ENRICHMENT_BATCH_SIZE = 3;

type Dependencies = [
    NoteCardRepository,
    NoteRepository,
    FolderRepository,
    NoteCardSearchCounter,
    WebSearchProvider,
    WebPageReader,
    PlaceDirectory,
    NoteCardWriter,
    DateTimeProvider,
    EventPublisher,
    Logger,
    ConfigService<Environment, true>,
];

// The daily limit of R23 is read here and handed to the domain service (wiring.md rule 13).
export const enrichPendingNoteCardsUseCase: FactoryProvider<EnrichPendingNoteCardsUseCase> =
    {
        provide: EnrichPendingNoteCardsUseCase,
        inject: [
            NoteCardRepository,
            NoteRepository,
            FolderRepository,
            NoteCardSearchCounter,
            WebSearchProvider,
            WebPageReader,
            PlaceDirectory,
            NoteCardWriter,
            DateTimeProvider,
            EventPublisher,
            Logger,
            ConfigService,
        ],
        useFactory: (
            ...[
                cards,
                notes,
                folders,
                counter,
                webSearchProvider,
                webPageReader,
                placeDirectory,
                noteCardWriter,
                clock,
                publisher,
                logger,
                config,
            ]: Dependencies
        ) => {
            logger.setContext(EventPublishingService.name);
            return new EnrichPendingNoteCardsUseCase(
                cards,
                new NoteCardEnrichmentService(
                    cards,
                    notes,
                    new CardContextService(folders),
                    counter,
                    {
                        webSearchProvider,
                        webPageReader,
                        placeDirectory,
                        noteCardWriter,
                    },
                    config.getOrThrow('NOTE_CARD_DAILY_SEARCH_LIMIT', {
                        infer: true,
                    }),
                ),
                clock,
                new EventPublishingService(publisher, logger),
                NOTE_CARD_ENRICHMENT_BATCH_SIZE,
            );
        },
    };
