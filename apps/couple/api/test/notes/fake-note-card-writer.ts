import { NoteExceptionCodeEnum } from '@cocooning/couple-contract/notes';
import {
    type FolderTemplateProposal,
    type FolderTemplateRequest,
    type NoteCardWriting,
    type NoteCardWritingRequest,
    NoteCardWriter,
    NoteException,
} from '@cocooning/couple-server-business-logic/notes';

const unavailable = (): NoteException =>
    new NoteException({
        code: NoteExceptionCodeEnum.NOTE_CARD_WRITER_UNAVAILABLE,
        message: 'The AI did not answer',
    });

export const PROPOSED_TEMPLATE: FolderTemplateProposal = {
    subject: 'Les restaurants que nous voulons essayer',
    fieldNames: ['Adresse', 'Cuisine', 'Prix'],
};

// The E2E tests never call Gemini: what would leave for the AI is recorded, the answer is chosen by the spec.
export class FakeNoteCardWriter extends NoteCardWriter {
    private proposal: FolderTemplateProposal | null = PROPOSED_TEMPLATE;
    private requests: ReadonlyArray<FolderTemplateRequest> = [];
    private writing: NoteCardWriting | null = null;
    private writings: ReadonlyArray<NoteCardWritingRequest> = [];

    get cardRequests(): ReadonlyArray<NoteCardWritingRequest> {
        return this.writings;
    }

    willWrite(writing: NoteCardWriting): void {
        this.writing = writing;
    }

    get templateRequests(): ReadonlyArray<FolderTemplateRequest> {
        return this.requests;
    }

    reset(): void {
        this.proposal = PROPOSED_TEMPLATE;
        this.requests = [];
        this.writing = null;
        this.writings = [];
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

    // Unavailable until the spec chose an answer.
    override writeCard(
        request: NoteCardWritingRequest,
    ): Promise<NoteCardWriting> {
        this.writings = [...this.writings, request];
        if (this.writing === null) return Promise.reject(unavailable());
        return Promise.resolve(this.writing);
    }
}
