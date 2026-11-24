import { Skeleton } from '@cocooning/design-system';

// Shown while the page reads the agenda (core-frontend.md rule 9): the header, the month grid, the chosen day.
export default function AgendaLoading() {
    return (
        <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col gap-6 px-5 pt-10 pb-6">
            <div className="flex items-center justify-between gap-3">
                <Skeleton className="h-9 w-32" />
                <Skeleton className="h-11 w-32 rounded-full" />
            </div>
            <Skeleton className="h-96 w-full rounded-2xl" />
            <section className="flex flex-col gap-3">
                <Skeleton className="h-7 w-48" />
                <Skeleton className="h-24 w-full rounded-2xl" />
                <Skeleton className="h-24 w-full rounded-2xl" />
            </section>
        </main>
    );
}
