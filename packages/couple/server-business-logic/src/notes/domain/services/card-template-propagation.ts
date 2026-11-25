import type { NoteCard } from '../models/note-card.aggregate';
import type { CardTemplate } from '../value-objects/card-template.vo';

// R18, R22: an edited template reaches every card of the tree.
export const applyEditedTemplate = (
    cards: ReadonlyArray<NoteCard>,
    userId: string,
    template: CardTemplate,
    now: Date,
): void => {
    cards.forEach((card) => card.applyEditedTemplate(userId, template, now));
};
