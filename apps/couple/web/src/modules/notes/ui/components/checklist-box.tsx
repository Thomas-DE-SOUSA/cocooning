import {
    type ViewerChecker,
    ViewerCheckerEnum,
} from '@cocooning/couple-client-business-logic/notes';
import { cn } from '@cocooning/design-system';
import { Check } from 'lucide-react';

type Props = {
    readonly checked: boolean;
    readonly checker: ViewerChecker | null;
};

// R29: terre cuite for « Moi », sage for « Toi », seen by the reader; a check from before R29 stays neutral.
const FILL = {
    [ViewerCheckerEnum.ME]: 'bg-primary',
    [ViewerCheckerEnum.YOU]: 'bg-label-sage',
} as const;

export function ChecklistBox({ checked, checker }: Props) {
    if (!checked) {
        return (
            <span
                aria-hidden="true"
                className="size-6 shrink-0 rounded-[7px] border-2 border-input"
            />
        );
    }
    return (
        <span
            aria-hidden="true"
            className={cn(
                'flex size-6 shrink-0 items-center justify-center rounded-[7px] text-primary-foreground',
                checker === null ? 'bg-muted-foreground' : FILL[checker],
            )}
        >
            <Check
                className="size-3.5"
                strokeWidth={3.2}
            />
        </span>
    );
}
