import { cn } from '@cocooning/design-system';
import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';

export type TabBarItem = {
    readonly href: string;
    readonly label: string;
    readonly icon: LucideIcon;
    readonly isActive: boolean;
};

type Props = {
    readonly label: string;
    readonly items: readonly TabBarItem[];
};

// Decision 0044: the active tab differs by color, weight and a pill, never by color alone.
export function TabBar({ label, items }: Props) {
    return (
        <nav
            aria-label={label}
            className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-card pb-[env(safe-area-inset-bottom)]"
        >
            <ul className="mx-auto flex max-w-lg gap-2 px-6 py-2">
                {items.map((item) => (
                    <li
                        key={item.href}
                        className="flex-1"
                    >
                        <Link
                            href={item.href}
                            aria-current={item.isActive ? 'page' : false}
                            className={cn(
                                'flex min-h-14 flex-col items-center justify-center gap-1 text-xs',
                                item.isActive
                                    ? 'font-bold text-primary'
                                    : 'font-medium text-muted-foreground',
                            )}
                        >
                            <span
                                className={cn(
                                    'inline-flex h-8 w-14 items-center justify-center rounded-full',
                                    item.isActive && 'bg-secondary',
                                )}
                            >
                                <item.icon
                                    aria-hidden="true"
                                    className="size-5"
                                />
                            </span>
                            {item.label}
                        </Link>
                    </li>
                ))}
            </ul>
        </nav>
    );
}
