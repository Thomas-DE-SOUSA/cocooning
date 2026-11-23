import type { ComponentProps } from 'react';
import { cn } from '../utils/cn';

// text-base: below 16 px, Safari on iPhone zooms into the page when the field gets the focus.
export function Input({
    className,
    type = 'text',
    ...props
}: ComponentProps<'input'>) {
    return (
        <input
            data-slot="input"
            type={type}
            className={cn(
                'h-10 w-full rounded-lg border border-border bg-background px-3 text-base text-foreground placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive',
                className,
            )}
            {...props}
        />
    );
}
