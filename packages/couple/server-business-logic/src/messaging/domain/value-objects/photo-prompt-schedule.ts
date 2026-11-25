import type { SecureRandomGenerator } from '@cocooning/shared-kernel/ports';
import {
    coupleInstantOf,
    MINUTES_PER_DAY,
    MINUTES_PER_HOUR,
} from './couple-time';

// R7: the prompt comes at a minute drawn between 9:00 included and 21:00 excluded, Paris time.
const WINDOW_START_MINUTE = 9 * MINUTES_PER_HOUR;
const WINDOW_END_MINUTE = 21 * MINUTES_PER_HOUR;

// R8: a photo of the day sent more than ten minutes after the prompt is late.
const LATE_AFTER_MILLISECONDS = 10 * 60_000;

// core.md rule 19: the minute comes from the injected random port, uniform over the window.
export const drawPhotoPromptTime = (
    day: string,
    secureRandomGenerator: SecureRandomGenerator,
): Date =>
    coupleInstantOf(
        day,
        secureRandomGenerator.generateInteger(
            WINDOW_START_MINUTE,
            WINDOW_END_MINUTE,
        ),
    );

// R8: the prompt of a day is answered until the next midnight in Paris.
export const photoPromptClosingOf = (day: string): Date =>
    coupleInstantOf(day, MINUTES_PER_DAY);

export const photoPromptLateFrom = (issuedAt: Date): Date =>
    new Date(issuedAt.getTime() + LATE_AFTER_MILLISECONDS);
