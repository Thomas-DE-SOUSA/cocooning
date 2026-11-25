import type { ReactNode } from 'react';

type Props = {
    readonly title: string;
    readonly children: ReactNode;
};

// « Dossiers », « Notes » or « Modifiées récemment »: a small heading over its rows.
export function NotesSection({ title, children }: Props) {
    return (
        <section className="flex flex-col gap-2">
            <h2 className="px-1 font-sans text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                {title}
            </h2>
            <ul className="flex flex-col gap-2">{children}</ul>
        </section>
    );
}
