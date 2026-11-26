import { isPartnerPresent } from './partner-presence';

const ME = 'me';

describe('Feature: the other partner in the list (R32)', () => {
    it('sees the other partner among the phones on the list', () => {
        expect(
            isPartnerPresent(
                [
                    { clientId: 1, viewerId: ME },
                    { clientId: 2, viewerId: 'you' },
                ],
                ME,
            ),
        ).toBe(true);
    });

    it('is alone with its own phones, or with an editor that shares no reader', () => {
        expect(
            isPartnerPresent(
                [
                    { clientId: 1, viewerId: ME },
                    { clientId: 2, viewerId: ME },
                    { clientId: 3 },
                ],
                ME,
            ),
        ).toBe(false);
    });
});
