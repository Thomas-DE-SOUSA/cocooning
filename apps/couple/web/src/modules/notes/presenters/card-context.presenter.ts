import type { NoteSpaceContentsResponse } from '@cocooning/couple-contract/notes';
import type { NoteCardContext } from '../view-models/note-card-context.view-model';

// R18: the smart folder that holds the subject and the card template is the opened folder or one above it.
export function presentCardContext({
    path,
    cardContext,
}: NoteSpaceContentsResponse): NoteCardContext | null {
    if (cardContext === null) return null;
    const holder = path.find(
        (folder) => folder.folderId === cardContext.folderId,
    );
    // The API puts the smart folder on the path of every folder of its tree.
    if (holder === undefined) return null;
    return {
        subject: cardContext.subject,
        fields: cardContext.cardTemplate,
        holderName: holder.name,
        isInherited: holder !== path.at(-1),
    };
}
