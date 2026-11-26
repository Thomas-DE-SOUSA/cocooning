import { Injectable } from '@nestjs/common';
import { NoteChecklistReader } from '@cocooning/couple-server-business-logic/notes';
import { Logger } from '@cocooning/shared-kernel/ports';
import { countOpenTaskItems } from './open-task-items';

// R28: an unreadable content must not stop the save of the document, so it counts 0; logged by the note id and the
// kind of error only, never the content (core.md rule 33).
@Injectable()
export class YjsNoteChecklistReader extends NoteChecklistReader {
    constructor(private readonly logger: Logger) {
        super();
        this.logger.setContext(YjsNoteChecklistReader.name);
    }

    override countOpenItems(noteId: string, content: Uint8Array): number {
        try {
            return countOpenTaskItems(content);
        } catch (error) {
            this.logger.warn('Unreadable note checklist, counted 0', {
                noteId,
                errorType: error instanceof Error ? error.name : typeof error,
            });
            return 0;
        }
    }
}
