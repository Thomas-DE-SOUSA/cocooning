import { act, renderHook } from '@testing-library/react';
import { FakeNoteDocumentGateway } from '../gateways/fake/fake-note-document.gateway';
import { useNoteDocument } from './use-note-document';

const NOTE_ID = '01936b2e-7c4a-7000-8000-0000000000d1';

function renderDocument(gateway: FakeNoteDocumentGateway) {
    const lost: string[] = [];
    const onLost = () => lost.push('lost');
    const view = renderHook(() =>
        useNoteDocument({ gateway, noteId: NOTE_ID, onLost }),
    );
    return { ...view, lost };
}

describe('Feature: R6, the document of a note stays in sync', () => {
    it('connects the document of the page to its note, once', () => {
        const gateway = new FakeNoteDocumentGateway();
        const { result } = renderDocument(gateway);

        expect(gateway.openConnections).toBe(1);
        expect(gateway.lastConnection().noteId).toBe(NOTE_ID);
        expect(gateway.lastConnection().document).toBe(result.current);
    });

    it('disconnects when the page closes', () => {
        const gateway = new FakeNoteDocumentGateway();
        const { unmount } = renderDocument(gateway);

        unmount();

        expect(gateway.openConnections).toBe(0);
    });

    it('R4, R5, reports a refused connection', () => {
        const gateway = new FakeNoteDocumentGateway();
        const { lost } = renderDocument(gateway);

        act(() => gateway.lastConnection().events.onRefused());

        expect(lost).toEqual(['lost']);
    });

    it('reopens the same document when the server closed it', () => {
        const gateway = new FakeNoteDocumentGateway();
        const { result, lost } = renderDocument(gateway);
        const document = result.current;

        act(() => gateway.lastConnection().events.onClosedByServer());

        expect(lost).toEqual(['lost']);
        expect(gateway.connectionCount).toBe(2);
        expect(gateway.openConnections).toBe(1);
        expect(gateway.lastConnection().document).toBe(document);
    });
});
