import type { ComponentProps } from 'react';
import { cn } from '../utils/cn';

export function Card({ className, ...props }: ComponentProps<'div'>) {
    return (
        <div
            data-slot="card"
            className={cn(
                'rounded-2xl border border-border bg-card p-4 text-card-foreground shadow-xs',
                className,
            )}
            {...props}
        />
    );
}
