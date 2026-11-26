import { CalendarEventAudienceEnum } from '@cocooning/couple-shared-kernel/enums';
import { ViewerAudienceEnum } from '../enums/viewer-audience.enum';
import { toEventAudience, toViewerAudience } from './viewer-audience';

const { OWNER, PARTNER } = CalendarEventAudienceEnum;
const { ME, YOU } = ViewerAudienceEnum;

describe('Feature: who an event is for, between the API and the reader (R11)', () => {
    describe.each([
        [
            'the author',
            true,
            [
                [OWNER, ME],
                [PARTNER, YOU],
                ['BOTH', 'BOTH'],
            ],
        ],
        [
            'the other partner',
            false,
            [
                [OWNER, YOU],
                [PARTNER, ME],
                ['BOTH', 'BOTH'],
            ],
        ],
    ] as const)('Scenario: %s reads and picks', (_reader, isOwner, pairs) => {
        it.each(pairs)(
            'sees %s as %s and sends it back unchanged',
            (audience, viewerAudience) => {
                expect(toViewerAudience(audience, isOwner)).toBe(
                    viewerAudience,
                );
                expect(toEventAudience(viewerAudience, isOwner)).toBe(audience);
            },
        );
    });

    it('sends PARTNER when the other partner picks « Moi » on the author event', () => {
        expect(toEventAudience(ME, false)).toBe(PARTNER);
    });
});
