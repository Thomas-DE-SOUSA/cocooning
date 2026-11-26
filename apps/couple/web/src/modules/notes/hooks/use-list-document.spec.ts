import { act, renderHook } from '@testing-library/react';
import { FakeNoteDocumentGateway } from '../gateways/fake/fake-note-document.gateway';
import { useListDocument } from './use-list-document';

const LIST_ID = '01936b2e-7c4a-7000-8000-0000000000e1';

function renderDocument(gateway: FakeNoteDocumentGateway) {
    const lost: string[] = [];
    const view = renderHook(() =>
        useListDocument({
            gateway,
            noteId: LIST_ID,
            viewerId: 'me',
            onLost: () => lost.push('lost'),
        }),
    );
    return { ...view, lost };
}

const listEventsOf = (gateway: FakeNoteDocumentGateway) => {
    const { listEvents } = gateway.lastConnection();
    if (listEvents === null) throw new Error('No list events');
    return listEvents;
};

describe('Feature: the shared document of a list (R6, R32)', () => {
    it('knows its lines once the document is first synced', () => {
        const gateway = new FakeNoteDocumentGateway();
        const { result } = renderDocument(gateway);
        expect(gateway.lastConnection().noteId).toBe(LIST_ID);
        expect(result.current.isSynced).toBe(false);

        act(() => listEventsOf(gateway).onSynced());

        expect(result.current.isSynced).toBe(true);
    });

    it('shares who reads the list, and shows when the other partner is in it (R32)', () => {
        const gateway = new FakeNoteDocumentGateway();
        const { result } = renderDocument(gateway);
        expect(listEventsOf(gateway).viewerId).toBe('me');
        expect(result.current.isPartnerHere).toBe(false);

        act(() => listEventsOf(gateway).onPartnerPresence(true));
        expect(result.current.isPartnerHere).toBe(true);

        act(() => listEventsOf(gateway).onPartnerPresence(false));
        expect(result.current.isPartnerHere).toBe(false);
    });

    it('reopens the same document when the server closed it, and reports it', () => {
        const gateway = new FakeNoteDocumentGateway();
        const { result, lost } = renderDocument(gateway);
        const { document } = result.current;

        act(() => gateway.lastConnection().events.onClosedByServer());

        expect(lost).toEqual(['lost']);
        expect(gateway.openConnections).toBe(1);
        expect(gateway.lastConnection().document).toBe(document);
    });

    it('reports a refused connection', () => {
        const gateway = new FakeNoteDocumentGateway();
        const { lost } = renderDocument(gateway);

        act(() => gateway.lastConnection().events.onRefused());

        expect(lost).toEqual(['lost']);
    });
});
