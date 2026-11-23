import { LoaderCircleIcon } from 'lucide-react';
import type { ComponentProps } from 'react';
import { cn } from '../utils/cn';

// Replaces the label of the button whose action is running (core-frontend.md rule 9); its aria-label comes from the caller.
export function Spinner({ className, ...props }: ComponentProps<'svg'>) {
    return (
        <LoaderCircleIcon
            data-slot="spinner"
            role="status"
            className={cn('size-4 animate-spin', className)}
            {...props}
        />
    );
}
