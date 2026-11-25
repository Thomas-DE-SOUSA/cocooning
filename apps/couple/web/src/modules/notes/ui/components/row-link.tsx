import Link from 'next/link';
import type { ReactNode } from 'react';

type Props = {
    readonly href: string;
    readonly children: ReactNode;
};

// The name of a row, stretched over the whole card: a tap anywhere opens it, the « ⋯ » button sits above it.
export function RowLink({ href, children }: Props) {
    return (
        <h3 className="font-sans text-base font-semibold break-words">
            <Link
                href={href}
                className="after:absolute after:inset-0 after:rounded-2xl focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-ring"
            >
                {children}
            </Link>
        </h3>
    );
}
