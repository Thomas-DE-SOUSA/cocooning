import { NoteExceptionCodeEnum } from '@cocooning/couple-contract/notes';
import {
    type FolderTemplateProposal,
    type FolderTemplateRequest,
    NoteCardWriter,
    NoteException,
} from '@cocooning/couple-server-business-logic/notes';

export const PROPOSED_TEMPLATE: FolderTemplateProposal = {
    subject: 'Les restaurants que nous voulons essayer',
    fieldNames: ['Adresse', 'Cuisine', 'Prix'],
};

// The E2E tests never call Gemini: what would leave for the AI is recorded, the answer is chosen by the spec.
export class FakeNoteCardWriter extends NoteCardWriter {
    private proposal: FolderTemplateProposal | null = PROPOSED_TEMPLATE;
    private requests: ReadonlyArray<FolderTemplateRequest> = [];

    get templateRequests(): ReadonlyArray<FolderTemplateRequest> {
        return this.requests;
    }

    reset(): void {
        this.proposal = PROPOSED_TEMPLATE;
        this.requests = [];
    }

    willBeUnavailable(): void {
        this.proposal = null;
    }

    override proposeTemplate(
        request: FolderTemplateRequest,
    ): Promise<FolderTemplateProposal> {
        this.requests = [...this.requests, request];
        if (this.proposal === null) {
            return Promise.reject(
                new NoteException({
                    code: NoteExceptionCodeEnum.NOTE_CARD_WRITER_UNAVAILABLE,
                    message: 'The AI did not answer',
                }),
            );
        }
        return Promise.resolve(this.proposal);
    }
}
