import type { z } from 'zod';
import type { Translator } from '../../../shared/translator';

type MomentFields = {
    readonly startsOn: string;
    readonly endsOn: string | null;
    readonly startsAt: string | null;
    readonly endsAt: string | null;
};

type MomentIssue = {
    readonly path: keyof MomentFields;
    readonly key: string;
};

const findEndsAtIssue = (moment: MomentFields): MomentIssue | null => {
    const { endsOn, startsAt, endsAt } = moment;
    if (endsAt === null) return null;
    if (startsAt === null) {
        return { path: 'endsAt', key: 'endsAtWithoutStartsAt' };
    }
    if (endsOn !== null || endsAt > startsAt) return null;
    return { path: 'endsAt', key: 'endsAtNotAfterStartsAt' };
};

// R5, as CalendarEventMoment checks it: days and hours compare as strings (decision 0047).
const findMomentIssues = (moment: MomentFields): MomentIssue[] => {
    const { startsOn, endsOn } = moment;
    const endsOnIssue: MomentIssue | null =
        endsOn !== null && endsOn <= startsOn
            ? { path: 'endsOn', key: 'endsOnNotAfterStartsOn' }
            : null;
    return [endsOnIssue, findEndsAtIssue(moment)].filter(
        (issue): issue is MomentIssue => issue !== null,
    );
};

export const checkCalendarEventMomentOrder =
    (t: Translator) =>
    (moment: MomentFields, context: z.RefinementCtx): void => {
        findMomentIssues(moment).forEach(({ path, key }) => {
            context.addIssue({
                code: 'custom',
                path: [path],
                message: t(`form.moment.errors.${key}`),
            });
        });
    };
