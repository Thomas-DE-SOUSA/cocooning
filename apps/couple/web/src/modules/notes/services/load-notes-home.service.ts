import 'server-only';
import type { NotesHomeReading } from '../view-models/notes-screen.view-model';
import { RECENT_NOTES_COUNT } from '../data/recent-notes-count';
import { notesModule } from './notes-module.factory';

// Read by the home with the session cookie of the request (decision 0036): the two spaces and, in parallel, the notes
// changed last (the API lists them from the most recent change).
export async function loadNotesHome(): Promise<NotesHomeReading> {
    const { listNoteSpaces, listNotes } = notesModule();
    const [spaces, recentNotes] = await Promise.all([
        listNoteSpaces.execute(),
        listNotes.execute({ page: 1, pageSize: RECENT_NOTES_COUNT }),
    ]);
    return { spaces, recentNotes };
}
