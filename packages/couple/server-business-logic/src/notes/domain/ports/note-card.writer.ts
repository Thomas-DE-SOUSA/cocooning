import type {
    FolderTemplateProposal,
    FolderTemplateRequest,
} from '../models/folder-template-request';

// The AI behind the smart folders (decision 0054): it never searches, it reads what it is given (R24).
// A failure throws NOTE_CARD_WRITER_UNAVAILABLE, never the answer or the request (core.md rule 26).
export abstract class NoteCardWriter {
    // R17: a subject and a card template for a new smart folder, from its name and place.
    abstract proposeTemplate(
        request: FolderTemplateRequest,
    ): Promise<FolderTemplateProposal>;
}
