import type { z } from 'zod';
import type { Translator } from '../../../shared/translator';
import {
    type ViewerAudience,
    ViewerAudienceEnum,
} from '../../domain/enums/viewer-audience.enum';

type AudienceFields = {
    readonly audience: ViewerAudience;
    readonly isPrivate: boolean;
};

// R11, as the API checks it: an event « rien que pour moi » is for me.
export const checkCalendarEventAudience =
    (t: Translator) =>
    (form: AudienceFields, context: z.RefinementCtx): void => {
        if (!form.isPrivate || form.audience === ViewerAudienceEnum.ME) return;
        context.addIssue({
            code: 'custom',
            path: ['audience'],
            message: t('form.audience.errors.privateNotForMe'),
        });
    };
