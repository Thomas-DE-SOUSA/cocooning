import { renderHook } from '@testing-library/react';
import { useRefreshOnReturn } from './use-refresh-on-return';

function setVisibility(state: DocumentVisibilityState): void {
    Object.defineProperty(document, 'visibilityState', {
        configurable: true,
        get: () => state,
    });
    document.dispatchEvent(new Event('visibilitychange'));
}

describe('Feature: decision 0036, the screen reads the couple again on return', () => {
    it('refreshes when the PWA comes back to the foreground, not when it leaves', () => {
        const refreshes: string[] = [];
        const { unmount } = renderHook(() =>
            useRefreshOnReturn(() => refreshes.push('refresh')),
        );

        setVisibility('hidden');
        setVisibility('visible');
        unmount();
        setVisibility('visible');

        expect(refreshes).toEqual(['refresh']);
    });
});
