import { Skeleton } from '@cocooning/design-system';

// Shown while the page reads the list (core-frontend.md rule 9): the way back, the title, the field, the lines.
export default function NoteListLoading() {
    return (
        <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col gap-3.5 px-5 pt-6 pb-6">
            <Skeleton className="h-11 w-28" />
            <Skeleton className="h-9 w-56" />
            <Skeleton className="h-12.5 w-full rounded-xl" />
            <Skeleton className="h-37.5 w-full rounded-2xl" />
        </main>
    );
}
