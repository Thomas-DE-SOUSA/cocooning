import {
    type ApiError,
    ApiErrorCodeEnum,
} from '@cocooning/couple-client-business-logic/shared';
import { A_PROPOSED_TEMPLATE } from '@cocooning/couple-client-business-logic/testing';
import { NoteExceptionCodeEnum } from '@cocooning/couple-contract/notes';
import { NoteSpaceEnum } from '@cocooning/couple-shared-kernel/enums';
import { fail } from '@cocooning/shared-kernel/utils';
import { act, renderHook } from '@testing-library/react';
import { FakeFolderCommandGateway } from '../gateways/fake/fake-folder-command.gateway';
import { useFolderTemplateProposal } from './use-folder-template-proposal';

const SHARED_ROOT = { space: NoteSpaceEnum.SHARED, folderId: null };
const WRITER_UNAVAILABLE: ApiError = {
    code: ApiErrorCodeEnum.UNKNOWN,
    message: 'Unavailable',
    backendCode: NoteExceptionCodeEnum.NOTE_CARD_WRITER_UNAVAILABLE,
};

function renderProposal() {
    const gateway = new FakeFolderCommandGateway();
    const events: string[] = [];
    const { result } = renderHook(() =>
        useFolderTemplateProposal({
            gateway,
            destination: SHARED_ROOT,
            onProposed: (proposal) => events.push(proposal.subject),
            onFailed: (error) => events.push(`failed:${error.backendCode}`),
        }),
    );
    return { result, gateway, events };
}

describe('Feature: R17, the AI proposes the subject and the fields of a smart folder', () => {
    it('asks with the name and the place, then gives the proposal', async () => {
        const { result, gateway, events } = renderProposal();

        await act(async () => result.current.propose({ name: 'Restaurants' }));

        expect(gateway.answers.calls).toEqual([
            {
                operation: 'proposeFolderTemplate',
                form: { name: 'Restaurants' },
                destination: SHARED_ROOT,
            },
        ]);
        expect(events).toEqual([A_PROPOSED_TEMPLATE.subject]);
    });

    it('says when the AI does not answer', async () => {
        const { result, gateway, events } = renderProposal();
        gateway.answers.givenOutcome(fail(WRITER_UNAVAILABLE));

        await act(async () => result.current.propose({ name: 'Restaurants' }));

        expect(events).toEqual(['failed:NOTE_CARD_WRITER_UNAVAILABLE']);
    });

    it('is proposing until the AI answers', async () => {
        const { result, gateway } = renderProposal();
        const release = gateway.answers.holdAnswers();

        act(() => result.current.propose({ name: 'Restaurants' }));
        expect(result.current.isProposing).toBe(true);
        await act(async () => release());

        expect(result.current.isProposing).toBe(false);
    });
});
