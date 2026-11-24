'use client';

import { type Editor, EditorContent } from '@tiptap/react';
import { NoteEditorToolbar } from '../components/note-editor-toolbar';

// The content of the note, edited by both partners at once (R6, decision 0040).
export function NoteEditorView({ editor }: { readonly editor: Editor | null }) {
    if (editor === null) return null;
    return (
        <section className="flex flex-col gap-2">
            <NoteEditorToolbar editor={editor} />
            <EditorContent editor={editor} />
        </section>
    );
}
