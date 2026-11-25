import type { FactoryProvider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NoteCardWriter } from '@cocooning/couple-server-business-logic/notes';
import { Logger } from '@cocooning/shared-kernel/ports';
import type { Environment } from '../../../../env';
import { GeminiInteractionsClient } from './gemini-interactions.client';
import { GeminiNoteCardWriter } from './gemini-note-card.writer';

// The key is read here only and travels in a header, never in a log (core.md rule 29).
export const geminiNoteCardWriterProvider: FactoryProvider<NoteCardWriter> = {
    provide: NoteCardWriter,
    inject: [ConfigService, Logger],
    useFactory: (config: ConfigService<Environment, true>, logger: Logger) => {
        logger.setContext(GeminiNoteCardWriter.name);
        return new GeminiNoteCardWriter(
            new GeminiInteractionsClient(
                {
                    apiKey: config.getOrThrow('NOTE_CARD_GEMINI_API_KEY', {
                        infer: true,
                    }),
                    model: config.getOrThrow('NOTE_CARD_GEMINI_MODEL', {
                        infer: true,
                    }),
                },
                logger,
            ),
        );
    },
};
