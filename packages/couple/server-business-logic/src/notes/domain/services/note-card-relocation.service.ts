import type { NoteCard } from '../models/note-card.aggregate';
import type { Note } from '../models/note.aggregate';
import type { NoteCardRepository } from '../ports/note-card.repository';
import type { CardContextService } from './card-context.service';

export class NoteCardRelocationService {
    constructor(
        private readonly noteCardRepository: NoteCardRepository,
        private readonly cardContextService: CardContextService,
    ) {}

    // R25: a card moved into a smart folder takes its template, keeping the fields of the same name; « Mettre à jour »
    // fills the others. Moved out of the smart folders, it keeps its values as they are: nothing to save.
    async cardsFollowing(
        note: Note,
        userId: string,
        now: Date,
    ): Promise<ReadonlyArray<NoteCard>> {
        const card = await this.noteCardRepository.findByNoteId(
            note.coupleId,
            note.id.getValue(),
        );
        if (card === null) return [];
        const context = await this.cardContextService.findCardContextOf(note);
        if (context === null) return [];
        card.adoptTemplate(userId, context.settings.template, now);
        return [card];
    }
}
