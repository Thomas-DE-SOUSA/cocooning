import { Injectable } from '@nestjs/common';
import {
    type FolderTemplateProposal,
    type FolderTemplateRequest,
    NoteCardWriter,
} from '@cocooning/couple-server-business-logic/notes';
import {
    FolderTemplateAnswerSchema,
    folderTemplatePrompt,
} from './folder-template.prompt';
import type { GeminiInteractionsClient } from './gemini-interactions.client';

// The free Gemini behind the smart folders (decision 0054), through the Interactions API.
@Injectable()
export class GeminiNoteCardWriter extends NoteCardWriter {
    constructor(private readonly client: GeminiInteractionsClient) {
        super();
    }

    override async proposeTemplate(
        request: FolderTemplateRequest,
    ): Promise<FolderTemplateProposal> {
        const answer = await this.client.answer(
            folderTemplatePrompt(request),
            FolderTemplateAnswerSchema,
        );
        return { subject: answer.subject, fieldNames: answer.fields };
    }
}
