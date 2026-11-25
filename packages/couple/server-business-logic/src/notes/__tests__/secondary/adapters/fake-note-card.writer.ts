import { NoteExceptionCodeEnum } from '@cocooning/couple-contract/notes';
import { NoteException } from '../../../domain/exceptions/note.exception';
import type {
    FolderTemplateProposal,
    FolderTemplateRequest,
} from '../../../domain/models/folder-template-request';
import { NoteCardWriter } from '../../../domain/ports/note-card.writer';

export const PROPOSED_TEMPLATE: FolderTemplateProposal = {
    subject: 'Les restaurants que nous voulons essayer',
    fieldNames: ['Adresse', 'Cuisine', 'Prix'],
};

const unavailable = (): NoteException =>
    new NoteException({
        code: NoteExceptionCodeEnum.NOTE_CARD_WRITER_UNAVAILABLE,
        message: 'Fake writer unavailable',
    });

// Records what would leave for the AI (R24) and answers what the test chose, or the unavailable AI.
export class FakeNoteCardWriter extends NoteCardWriter {
    private proposal: FolderTemplateProposal | null = PROPOSED_TEMPLATE;
    private requests: ReadonlyArray<FolderTemplateRequest> = [];

    get templateRequests(): ReadonlyArray<FolderTemplateRequest> {
        return this.requests;
    }

    willPropose(proposal: FolderTemplateProposal): void {
        this.proposal = proposal;
    }

    willBeUnavailable(): void {
        this.proposal = null;
    }

    override proposeTemplate(
        request: FolderTemplateRequest,
    ): Promise<FolderTemplateProposal> {
        this.requests = [...this.requests, request];
        if (this.proposal === null) return Promise.reject(unavailable());
        return Promise.resolve(this.proposal);
    }
}
