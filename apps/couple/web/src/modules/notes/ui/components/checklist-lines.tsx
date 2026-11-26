import type {
    ChecklistActions,
    ChecklistRow,
} from '../../view-models/checklist-screen.view-model';
import { ChecklistLineRow } from './checklist-line-row';

type Props = {
    readonly rows: readonly ChecklistRow[];
    readonly editingLineId: string | null;
    readonly actions: ChecklistActions;
};

// One card for the open lines or for « Fait », each line under the one before.
export function ChecklistLines({ rows, editingLineId, actions }: Props) {
    if (rows.length === 0) return null;
    return (
        <ul className="overflow-hidden rounded-2xl border border-border bg-card">
            {rows.map(({ line, checker }) => (
                <ChecklistLineRow
                    key={line.id}
                    line={line}
                    checker={checker}
                    isEditing={line.id === editingLineId}
                    onToggle={() => actions.onToggle(line)}
                    onStartEdit={() => actions.onStartEdit(line.id)}
                    onRename={(text) => actions.onRename(line.id, text)}
                    onStopEdit={actions.onStopEdit}
                    onRemove={() => actions.onRemove(line.id)}
                />
            ))}
        </ul>
    );
}
