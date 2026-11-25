import type { Uuid } from '@cocooning/shared-kernel/domain';
import { eventParamsOf } from './messaging-event-params';
import { PhotoPromptDrawnEvent } from './photo-prompt-drawn.event';
import { PhotoPromptIssuedEvent } from './photo-prompt-issued.event';

// The app, not a partner, draws and issues a photo prompt (R7): the nil UUID stands for it in the event context.
export const SCHEDULED_TASK_USER_ID = '00000000-0000-0000-0000-000000000000';

export const photoPromptFactOf = (
    Fact: typeof PhotoPromptDrawnEvent | typeof PhotoPromptIssuedEvent,
    photoPrompt: { readonly coupleId: string; readonly id: Uuid },
    now: Date,
): PhotoPromptDrawnEvent | PhotoPromptIssuedEvent =>
    new Fact(eventParamsOf(photoPrompt, SCHEDULED_TASK_USER_ID, now, null));
