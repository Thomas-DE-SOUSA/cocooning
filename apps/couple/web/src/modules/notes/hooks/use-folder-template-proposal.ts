import type { FolderNameForm } from '@cocooning/couple-client-business-logic/notes';
import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import type { FolderTemplateProposalResponse } from '@cocooning/couple-contract/notes';
import { useCallback, useTransition } from 'react';
import type { FolderCommandGateway } from '../gateways/ports/folder-command.gateway';
import type { NoteLocation } from '../view-models/note-place.view-model';

type Options = {
    readonly gateway: FolderCommandGateway;
    readonly destination: NoteLocation;
    readonly onProposed: (proposal: FolderTemplateProposalResponse) => void;
    readonly onFailed: (error: ApiError) => void;
};

// R17: the AI proposes the subject and the fields from the name; the sheet stays open either way.
export function useFolderTemplateProposal({
    gateway,
    destination,
    onProposed,
    onFailed,
}: Options) {
    const [isProposing, startTransition] = useTransition();
    const propose = useCallback(
        (form: FolderNameForm) =>
            startTransition(async () => {
                const result = await gateway.proposeFolderTemplate(
                    form,
                    destination,
                );
                if (result.success) {
                    onProposed(result.value);
                    return;
                }
                onFailed(result.error);
            }),
        [gateway, destination, onProposed, onFailed],
    );
    return { propose, isProposing };
}
