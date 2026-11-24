import { Skeleton } from '@cocooning/design-system';

// Shown while the page reads the notes (core-frontend.md rule 9): the shape of the list.
export default function HomeLoading() {
    return (
        <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col gap-6 px-5 pt-10 pb-6">
            <Skeleton className="h-9 w-40" />
            <Skeleton className="h-12 w-full" />
            <section className="flex flex-col gap-3">
                <Skeleton className="h-28 w-full rounded-2xl" />
                <Skeleton className="h-28 w-full rounded-2xl" />
                <Skeleton className="h-28 w-full rounded-2xl" />
            </section>
        </main>
    );
}
