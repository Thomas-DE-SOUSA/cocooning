import { cn } from '@cocooning/design-system';
import type { EventTint } from '../../view-models/event-tint.view-model';
import { TINT_BORDER, TINT_FILL } from './event-tint-classes';

type Props = {
    readonly tint: EventTint;
    readonly isPrivate: boolean;
    readonly className: string;
};

// R13: a dot in the colour of the label; a hollow ring for "rien que pour moi" (R7).
export function EventDot({ tint, isPrivate, className }: Props) {
    return (
        <span
            aria-hidden="true"
            data-tint={tint}
            data-private={isPrivate}
            className={cn(
                'inline-block shrink-0 rounded-full',
                isPrivate
                    ? cn('border-[1.5px]', TINT_BORDER[tint])
                    : TINT_FILL[tint],
                className,
            )}
        />
    );
}
