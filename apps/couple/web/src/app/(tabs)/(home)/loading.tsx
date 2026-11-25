import { Skeleton } from '@cocooning/design-system';

// Shown while the page reads the notes (core-frontend.md rule 9): the two spaces, then the notes changed last.
export default function HomeLoading() {
    return (
        <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col gap-6 px-5 pt-10 pb-6">
            <Skeleton className="h-9 w-40" />
            <section className="flex flex-col gap-3">
                <Skeleton className="h-22 w-full rounded-2xl" />
                <Skeleton className="h-22 w-full rounded-2xl" />
            </section>
            <section className="flex flex-col gap-2">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-16 w-full rounded-2xl" />
                <Skeleton className="h-16 w-full rounded-2xl" />
            </section>
        </main>
    );
}
