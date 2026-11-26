import {
    type CalendarEventAudience,
    CalendarEventAudienceEnum,
} from '@cocooning/couple-shared-kernel/enums';
import {
    type ViewerAudience,
    ViewerAudienceEnum,
} from '../enums/viewer-audience.enum';

const SEEN_BY_AUTHOR: Readonly<Record<CalendarEventAudience, ViewerAudience>> =
    {
        OWNER: ViewerAudienceEnum.ME,
        PARTNER: ViewerAudienceEnum.YOU,
        BOTH: ViewerAudienceEnum.BOTH,
    };

const SEEN_BY_PARTNER: Readonly<Record<CalendarEventAudience, ViewerAudience>> =
    {
        OWNER: ViewerAudienceEnum.YOU,
        PARTNER: ViewerAudienceEnum.ME,
        BOTH: ViewerAudienceEnum.BOTH,
    };

const CHOSEN_BY_AUTHOR: Readonly<
    Record<ViewerAudience, CalendarEventAudience>
> = {
    ME: CalendarEventAudienceEnum.OWNER,
    YOU: CalendarEventAudienceEnum.PARTNER,
    BOTH: CalendarEventAudienceEnum.BOTH,
};

const CHOSEN_BY_PARTNER: Readonly<
    Record<ViewerAudience, CalendarEventAudience>
> = {
    ME: CalendarEventAudienceEnum.PARTNER,
    YOU: CalendarEventAudienceEnum.OWNER,
    BOTH: CalendarEventAudienceEnum.BOTH,
};

// R11: the API keeps who the event is for relative to its author; the reader sees and picks it relative to themself.
export const toViewerAudience = (
    audience: CalendarEventAudience,
    isOwner: boolean,
): ViewerAudience => (isOwner ? SEEN_BY_AUTHOR : SEEN_BY_PARTNER)[audience];

export const toEventAudience = (
    viewerAudience: ViewerAudience,
    isOwner: boolean,
): CalendarEventAudience =>
    (isOwner ? CHOSEN_BY_AUTHOR : CHOSEN_BY_PARTNER)[viewerAudience];
