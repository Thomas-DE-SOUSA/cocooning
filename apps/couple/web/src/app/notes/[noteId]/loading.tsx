import { Skeleton } from '@cocooning/design-system';

// Shown while the page reads the note (core-frontend.md rule 9): the shape of the page.
export default function NoteLoading() {
    return (
        <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col gap-4 px-5 pt-6 pb-6">
            <Skeleton className="h-11 w-28" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-6 w-56" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-64 w-full rounded-2xl" />
        </main>
    );
}
