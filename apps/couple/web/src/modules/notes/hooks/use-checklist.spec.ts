import { ViewerCheckerEnum } from '@cocooning/couple-client-business-logic/notes';
import { act, renderHook } from '@testing-library/react';
import { applyUpdate, Doc, encodeStateAsUpdate } from 'yjs';
import { FakeLineIdGenerator } from '../gateways/fake/fake-line-id.generator';
import { useChecklist } from './use-checklist';

const ME = '01936b2e-7c4a-7000-8000-0000000000a1';
const YOU = '01936b2e-7c4a-7000-8000-0000000000a2';

function renderChecklist(document: Doc, viewerId: string) {
    const lineIds = new FakeLineIdGenerator();
    return renderHook(() => useChecklist({ document, viewerId, lineIds }));
}

// The other phone: its document receives every update of this one, as Hocuspocus relays them.
function aPairOfPhones() {
    const mine = new Doc();
    const theirs = new Doc();
    mine.on('update', (update: Uint8Array) => applyUpdate(theirs, update));
    return { mine, theirs };
}

describe('Feature: a list written in the shared document (R29 to R31)', () => {
    it('adds a trimmed line at the end, open, and ignores an empty one', () => {
        const { result } = renderChecklist(new Doc(), ME);

        act(() => result.current.add('  Pain '));
        act(() => result.current.add('Lait'));
        act(() => result.current.add('   '));

        expect(result.current.open.map(({ text }) => text)).toEqual([
            'Pain',
            'Lait',
        ]);
        expect(result.current.done).toEqual([]);
    });

    it('moves a checked line to « Fait » with its checker, and back up once unchecked (R29, R30)', () => {
        const { result } = renderChecklist(new Doc(), ME);
        act(() => result.current.add('Pain'));
        act(() => result.current.add('Lait'));

        act(() => result.current.toggle(result.current.open[0]!));
        expect(result.current.open.map(({ text }) => text)).toEqual(['Lait']);
        expect(result.current.done).toEqual([
            {
                id: 'line-1',
                text: 'Pain',
                checked: true,
                checkedBy: ME,
                checkedByViewer: ViewerCheckerEnum.ME,
            },
        ]);

        act(() => result.current.toggle(result.current.done[0]!));
        expect(result.current.open.map(({ text }) => text)).toEqual([
            'Pain',
            'Lait',
        ]);
    });

    it('shows the other phone my check as « Toi »', () => {
        const { mine, theirs } = aPairOfPhones();
        const me = renderChecklist(mine, ME);
        const you = renderChecklist(theirs, YOU);

        act(() => me.result.current.add('Pain'));
        act(() => me.result.current.toggle(me.result.current.open[0]!));

        expect(
            you.result.current.done.map((line) => line.checkedByViewer),
        ).toEqual([ViewerCheckerEnum.YOU]);
    });

    it('edits the text of a line in place, and removes a line left empty', () => {
        const { result } = renderChecklist(new Doc(), ME);
        act(() => result.current.add('Pain'));
        act(() => result.current.add('Lait'));

        act(() => result.current.rename('line-1', ' Pain complet '));
        act(() => result.current.rename('line-2', ' '));

        expect(result.current.open.map(({ text }) => text)).toEqual([
            'Pain complet',
        ]);
    });

    it('removes one line', () => {
        const { result } = renderChecklist(new Doc(), ME);
        act(() => result.current.add('Pain'));
        act(() => result.current.add('Lait'));

        act(() => result.current.remove('line-1'));

        expect(result.current.open.map(({ id }) => id)).toEqual(['line-2']);
    });

    it('clears every checked line in one update for the other phone (R31)', () => {
        const { mine, theirs } = aPairOfPhones();
        const { result } = renderChecklist(mine, ME);
        act(() => ['Pain', 'Lait', 'Oeufs'].forEach(result.current.add));
        act(() => result.current.toggle(result.current.open[0]!));
        act(() => result.current.toggle(result.current.open[1]!));
        const updates: Uint8Array[] = [];
        theirs.on('update', (update: Uint8Array) => updates.push(update));

        act(() => result.current.clearDone());

        expect(result.current.open.map(({ text }) => text)).toEqual(['Lait']);
        expect(result.current.done).toEqual([]);
        expect(updates).toHaveLength(1);
    });

    it('reads the lines of a document received from the server', () => {
        const server = new Doc();
        const writer = renderChecklist(server, YOU);
        act(() => writer.result.current.add('Café'));
        const phone = new Doc();
        const { result } = renderChecklist(phone, ME);

        act(() => applyUpdate(phone, encodeStateAsUpdate(server)));

        expect(result.current.open.map(({ text }) => text)).toEqual(['Café']);
    });
});
