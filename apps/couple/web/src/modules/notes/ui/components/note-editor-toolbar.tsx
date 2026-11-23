'use client';

import { Button } from '@cocooning/design-system';
import { type Editor, useEditorState } from '@tiptap/react';
import {
    Bold,
    Heading2,
    Italic,
    List,
    ListChecks,
    ListOrdered,
    type LucideIcon,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { NOTE_NAMESPACE } from '../../data/note-page-i18n-namespaces';

type Format = {
    readonly key: string;
    readonly icon: LucideIcon;
    readonly isActive: (editor: Editor) => boolean;
    readonly toggle: (editor: Editor) => void;
};

const FORMATS: readonly Format[] = [
    {
        key: 'heading',
        icon: Heading2,
        isActive: (editor) => editor.isActive('heading', { level: 2 }),
        toggle: (editor) =>
            editor.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
        key: 'bold',
        icon: Bold,
        isActive: (editor) => editor.isActive('bold'),
        toggle: (editor) => editor.chain().focus().toggleBold().run(),
    },
    {
        key: 'italic',
        icon: Italic,
        isActive: (editor) => editor.isActive('italic'),
        toggle: (editor) => editor.chain().focus().toggleItalic().run(),
    },
    {
        key: 'bulletList',
        icon: List,
        isActive: (editor) => editor.isActive('bulletList'),
        toggle: (editor) => editor.chain().focus().toggleBulletList().run(),
    },
    {
        key: 'orderedList',
        icon: ListOrdered,
        isActive: (editor) => editor.isActive('orderedList'),
        toggle: (editor) => editor.chain().focus().toggleOrderedList().run(),
    },
    {
        key: 'taskList',
        icon: ListChecks,
        isActive: (editor) => editor.isActive('taskList'),
        toggle: (editor) => editor.chain().focus().toggleTaskList().run(),
    },
];

// D43: headings, bold, italic, lists and checkboxes; the state follows the cursor.
export function NoteEditorToolbar({ editor }: { readonly editor: Editor }) {
    const { t } = useTranslation(NOTE_NAMESPACE);
    const active = useEditorState({
        editor,
        selector: ({ editor: current }) =>
            FORMATS.map((format) => format.isActive(current)),
    });
    return (
        <div
            role="toolbar"
            aria-label={t('editor.toolbar')}
            className="sticky top-0 z-10 flex flex-wrap gap-1 bg-background py-1"
        >
            {FORMATS.map((format, index) => (
                <Button
                    key={format.key}
                    type="button"
                    variant={active[index] ? 'secondary' : 'ghost'}
                    aria-label={t(`editor.${format.key}`)}
                    aria-pressed={active[index]}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => format.toggle(editor)}
                >
                    <format.icon aria-hidden="true" />
                </Button>
            ))}
        </div>
    );
}
