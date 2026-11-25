import { Skeleton } from '@cocooning/design-system';

// Shown while the page reads the space (core-frontend.md rule 9): the way back, the title, then the rows.
export default function NoteSpaceLoading() {
    return (
        <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col gap-6 px-5 pt-6 pb-24">
            <div className="flex flex-col gap-1">
                <Skeleton className="h-11 w-24" />
                <Skeleton className="h-9 w-44" />
            </div>
            <section className="flex flex-col gap-2">
                <Skeleton className="h-16 w-full rounded-2xl" />
                <Skeleton className="h-16 w-full rounded-2xl" />
                <Skeleton className="h-16 w-full rounded-2xl" />
            </section>
        </main>
    );
}
