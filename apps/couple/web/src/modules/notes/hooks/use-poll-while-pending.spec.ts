import { renderHook } from '@testing-library/react';
import { NOTE_CARD_POLL_INTERVAL_MS } from '../data/note-card-polling';
import { usePollWhilePending } from './use-poll-while-pending';

function setVisibility(state: DocumentVisibilityState): void {
    Object.defineProperty(document, 'visibilityState', {
        configurable: true,
        get: () => state,
    });
}

describe('Feature: R20, a screen follows a card in search', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        setVisibility('visible');
    });

    afterEach(() => jest.useRealTimers());

    it('reads again at each interval while a card is pending, then stops', () => {
        const refreshes: string[] = [];
        const { rerender } = renderHook(
            ({ isPending }) =>
                usePollWhilePending(isPending, () => refreshes.push('refresh')),
            { initialProps: { isPending: true } },
        );

        jest.advanceTimersByTime(NOTE_CARD_POLL_INTERVAL_MS * 2);
        rerender({ isPending: false });
        jest.advanceTimersByTime(NOTE_CARD_POLL_INTERVAL_MS * 2);

        expect(refreshes).toEqual(['refresh', 'refresh']);
    });

    it('does not read while the PWA is hidden', () => {
        const refreshes: string[] = [];
        setVisibility('hidden');
        renderHook(() =>
            usePollWhilePending(true, () => refreshes.push('refresh')),
        );

        jest.advanceTimersByTime(NOTE_CARD_POLL_INTERVAL_MS * 2);

        expect(refreshes).toEqual([]);
    });
});
