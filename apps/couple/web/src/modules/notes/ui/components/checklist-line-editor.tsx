import type { KeyboardEvent } from 'react';

type Props = {
    readonly text: string;
    readonly label: string;
    readonly onSave: (text: string) => void;
    readonly onCancel: () => void;
};

// A line edited in place: Enter or leaving the field saves, Escape gives the text back.
export function ChecklistLineEditor({ text, label, onSave, onCancel }: Props) {
    const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Escape') event.currentTarget.value = text;
        if (event.key === 'Enter' || event.key === 'Escape') {
            event.preventDefault();
            event.currentTarget.blur();
        }
    };
    return (
        <input
            autoFocus
            aria-label={label}
            defaultValue={text}
            enterKeyHint="done"
            onKeyDown={onKeyDown}
            onBlur={(event) => {
                const value = event.currentTarget.value;
                if (value.trim() === text) onCancel();
                else onSave(value);
            }}
            className="h-11 min-w-0 flex-1 rounded-lg bg-transparent text-base focus:outline-none"
        />
    );
}
