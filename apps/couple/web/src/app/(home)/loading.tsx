import { Skeleton } from '@cocooning/design-system';

// Shown while the page reads the notes (core-frontend.md rule 9): the shape of the list.
export default function HomeLoading() {
    return (
        <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col gap-6 p-4">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-10 w-full" />
            <section className="flex flex-col gap-3">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
            </section>
        </main>
    );
}
