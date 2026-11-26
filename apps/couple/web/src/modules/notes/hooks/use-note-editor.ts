import Collaboration from '@tiptap/extension-collaboration';
import { TaskList } from '@tiptap/extension-list';
import { type Editor, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import type { Doc } from 'yjs';
import { NoteTaskItem } from './note-task-item.extension';

// The look of the content: Tailwind classes on the editable root, no stylesheet of its own.
const CONTENT_CLASS = [
    'min-h-64 rounded-2xl border border-border bg-card p-5 leading-relaxed focus:outline-none',
    '[&_h2]:text-xl [&_h2]:font-semibold [&_h3]:text-lg [&_h3]:font-semibold [&_p+*]:mt-2',
    '[&_input[type=checkbox]]:mt-1 [&_input[type=checkbox]]:size-5 [&_input[type=checkbox]]:accent-primary',
    '[&_ul]:list-disc [&_ol]:list-decimal [&_ul,&_ol]:pl-6',
    '[&_ul[data-type=taskList]]:list-none [&_ul[data-type=taskList]]:pl-0',
    '[&_li[data-checked]]:flex [&_li[data-checked]]:items-start [&_li[data-checked]]:gap-2',
    '[&_li[data-checked=true]>div]:text-muted-foreground [&_li[data-checked=true]>div]:line-through',
].join(' ');

// R6: the editor writes into the shared Yjs document; Yjs keeps the history, so Tiptap's own undo is off.
export function useNoteEditor(document: Doc, label: string): Editor | null {
    return useEditor(
        {
            immediatelyRender: false,
            extensions: [
                StarterKit.configure({
                    undoRedo: false,
                    heading: { levels: [2, 3] },
                }),
                TaskList,
                NoteTaskItem.configure({ nested: true }),
                Collaboration.configure({ document }),
            ],
            editorProps: {
                attributes: { 'aria-label': label, 'class': CONTENT_CLASS },
            },
        },
        [document],
    );
}
