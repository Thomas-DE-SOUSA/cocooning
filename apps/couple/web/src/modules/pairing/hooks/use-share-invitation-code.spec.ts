import { act, renderHook } from '@testing-library/react';
import { useShareInvitationCode } from './use-share-invitation-code';

type NavigatorPart = Partial<Pick<Navigator, 'share' | 'clipboard'>>;

function givenNavigator(part: NavigatorPart): void {
    Object.defineProperty(navigator, 'share', {
        configurable: true,
        value: part.share,
    });
    Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: part.clipboard,
    });
}

function renderShare() {
    const events: string[] = [];
    const { result } = renderHook(() =>
        useShareInvitationCode({
            onCopied: () => events.push('copied'),
            onShareFailed: () => events.push('failed'),
        }),
    );
    return { share: result.current, events };
}

const TEXT = 'Rejoins-moi sur Cocooning avec le code K7M2Q9XR.';

describe('Feature: the creator passes the invitation code on', () => {
    it('opens the share sheet of the phone when it has one', async () => {
        const shared: ShareData[] = [];
        givenNavigator({
            share: (data) => {
                shared.push(data ?? {});
                return Promise.resolve();
            },
        });
        const { share, events } = renderShare();

        await act(() => share(TEXT));

        expect(shared).toEqual([{ text: TEXT }]);
        expect(events).toEqual([]);
    });

    it('copies the text where the browser has no share sheet', async () => {
        const copied: string[] = [];
        givenNavigator({
            clipboard: {
                writeText: (text: string) => {
                    copied.push(text);
                    return Promise.resolve();
                },
            } as Clipboard,
        });
        const { share, events } = renderShare();

        await act(() => share(TEXT));

        expect(copied).toEqual([TEXT]);
        expect(events).toEqual(['copied']);
    });

    it('stays silent when the partner closes the share sheet', async () => {
        givenNavigator({
            share: () => Promise.reject(new DOMException('', 'AbortError')),
        });
        const { share, events } = renderShare();

        await act(() => share(TEXT));

        expect(events).toEqual([]);
    });

    it('reports a share that fails', async () => {
        givenNavigator({
            share: () =>
                Promise.reject(new DOMException('', 'NotAllowedError')),
        });
        const { share, events } = renderShare();

        await act(() => share(TEXT));

        expect(events).toEqual(['failed']);
    });
});
