import { Skeleton } from '@cocooning/design-system';

// Shown while the page reads the note (core-frontend.md rule 9): the shape of the page.
export default function NoteLoading() {
    return (
        <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col gap-4 p-4">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-4 w-48" />
        </main>
    );
}
