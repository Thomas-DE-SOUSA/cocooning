import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

type Props = {
    readonly href: string;
    readonly label: string;
};

// The way to the level above, in the accent color, above the title of the screen.
export function BackLink({ href, label }: Props) {
    return (
        <Link
            href={href}
            className="inline-flex min-h-11 items-center gap-1 self-start font-semibold text-primary underline-offset-4 hover:underline"
        >
            <ChevronLeft
                aria-hidden="true"
                className="size-5"
            />
            {label}
        </Link>
    );
}
