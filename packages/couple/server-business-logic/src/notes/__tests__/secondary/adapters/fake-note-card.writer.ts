import { NoteExceptionCodeEnum } from '@cocooning/couple-contract/notes';
import { NoteException } from '../../../domain/exceptions/note.exception';
import type {
    FolderTemplateProposal,
    FolderTemplateRequest,
} from '../../../domain/models/folder-template-request';
import type {
    NoteCardWriting,
    NoteCardWritingRequest,
} from '../../../domain/models/note-card-writing';
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
    private writing: NoteCardWriting | Error | null = null;
    private writings: ReadonlyArray<NoteCardWritingRequest> = [];

    get cardRequests(): ReadonlyArray<NoteCardWritingRequest> {
        return this.writings;
    }

    willWrite(writing: NoteCardWriting): void {
        this.writing = writing;
    }

    // A failure that is not the unavailable AI: a defect, never turned into a failed card.
    willBreak(): void {
        this.writing = new Error('Fake writer defect');
    }

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

    // Unavailable until the test chose an answer.
    override writeCard(
        request: NoteCardWritingRequest,
    ): Promise<NoteCardWriting> {
        this.writings = [...this.writings, request];
        if (this.writing === null) return Promise.reject(unavailable());
        if (this.writing instanceof Error) return Promise.reject(this.writing);
        return Promise.resolve(this.writing);
    }
}
