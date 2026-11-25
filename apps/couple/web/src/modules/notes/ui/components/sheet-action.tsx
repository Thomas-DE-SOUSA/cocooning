import { cn } from '@cocooning/design-system';
import type { LucideIcon } from 'lucide-react';

type Props = {
    readonly icon: LucideIcon;
    readonly label: string;
    readonly isDestructive: boolean;
    readonly onClick: () => void;
};

// One action of a sheet's list: an icon and its words, in red when it deletes.
export function SheetAction({
    icon: Icon,
    label,
    isDestructive,
    onClick,
}: Props) {
    return (
        <li className="border-b border-border last:border-b-0">
            <button
                type="button"
                onClick={onClick}
                className={cn(
                    'flex h-13 w-full items-center gap-3.5 px-1 text-left text-base font-medium focus-visible:outline-2 focus-visible:outline-ring',
                    isDestructive && 'text-destructive',
                )}
            >
                <Icon
                    aria-hidden="true"
                    className="size-5"
                />
                {label}
            </button>
        </li>
    );
}
