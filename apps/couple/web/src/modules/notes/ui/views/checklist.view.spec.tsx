import { ViewerCheckerEnum } from '@cocooning/couple-client-business-logic/notes';
import type { NoteListKind } from '@cocooning/couple-shared-kernel/enums';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WithI18n } from '@/testing/with-i18n';
import type {
    ChecklistActions,
    ChecklistScreen,
} from '../../view-models/checklist-screen.view-model';
import { ChecklistView } from './checklist.view';

const MILK = { id: 'line-1', text: 'Lait', checked: false, checkedBy: null };
const BREAD = { id: 'line-2', text: 'Pain', checked: true, checkedBy: 'me' };
const EGGS = { id: 'line-3', text: 'Œufs', checked: true, checkedBy: 'you' };
const A_SCREEN: ChecklistScreen = {
    isSynced: true,
    open: [MILK],
    done: [
        { ...BREAD, checkedByViewer: ViewerCheckerEnum.ME },
        { ...EGGS, checkedByViewer: ViewerCheckerEnum.YOU },
    ],
    draft: '',
    editingLineId: null,
};

function renderChecklist(
    screenState: Partial<ChecklistScreen> = {},
    kind: NoteListKind = 'GROCERIES',
) {
    const journal: string[] = [];
    const actions: ChecklistActions = {
        onDraftChange: (draft) => journal.push(`draft ${draft}`),
        onAdd: () => journal.push('add'),
        onToggle: (line) => journal.push(`toggle ${line.text}`),
        onStartEdit: (lineId) => journal.push(`edit ${lineId}`),
        onRename: (lineId, text) => journal.push(`rename ${lineId} ${text}`),
        onStopEdit: () => journal.push('stop'),
        onRemove: (lineId) => journal.push(`remove ${lineId}`),
        onAskClear: () => journal.push('ask clear'),
    };
    render(
        <WithI18n>
            <ChecklistView
                kind={kind}
                screen={{ ...A_SCREEN, ...screenState }}
                actions={actions}
            />
        </WithI18n>,
    );
    return { journal, user: userEvent.setup() };
}

describe('Feature: a list checked at two (R29 to R31)', () => {
    it('shows the open lines, then « Fait » with who checked each line', () => {
        renderChecklist();

        expect(
            screen
                .getByRole('checkbox', { name: 'Lait' })
                .getAttribute('aria-checked'),
        ).toBe('false');
        expect(screen.getByRole('heading', { name: 'Fait · 2' })).toBeTruthy();
        expect(
            screen.getByRole('checkbox', { name: 'Pain' }).closest('li')
                ?.textContent,
        ).toContain('Moi');
        expect(
            screen.getByRole('checkbox', { name: 'Œufs' }).closest('li')
                ?.textContent,
        ).toContain('Toi');
    });

    it('checks a line by its box, and edits it by its text', async () => {
        const { journal, user } = renderChecklist();

        await user.click(screen.getByRole('checkbox', { name: 'Lait' }));
        await user.click(
            screen.getByRole('button', { name: 'Modifier « Pain »' }),
        );

        expect(journal).toEqual(['toggle Lait', 'edit line-2']);
    });

    it('saves the line edited in place on Enter', async () => {
        const { journal, user } = renderChecklist({ editingLineId: 'line-1' });

        const field = screen.getByRole('textbox', {
            name: 'Texte de la ligne',
        });
        await user.clear(field);
        await user.type(field, 'Lait demi-écrémé{Enter}');

        expect(journal).toContain('rename line-1 Lait demi-écrémé');
    });

    it('adds a line by Enter and keeps the field focused', async () => {
        const { journal, user } = renderChecklist({ draft: 'Tomates' });

        const field = screen.getByRole('textbox', {
            name: 'Ajouter un article',
        });
        await user.click(field);
        await user.keyboard('{Enter}');
        await user.click(screen.getByRole('button', { name: 'Ajouter' }));

        expect(journal).toEqual(['add', 'add']);
        expect(document.activeElement).toBe(field);
    });

    it('asks before clearing the lines done', async () => {
        const { journal, user } = renderChecklist();

        await user.click(
            screen.getByRole('button', { name: 'Vider les faits' }),
        );

        expect(journal).toEqual(['ask clear']);
    });

    it('says a task list is empty, without « Fait »', () => {
        renderChecklist({ open: [], done: [] }, 'TASKS');

        expect(screen.getByText(/Rien à faire pour l'instant/)).toBeTruthy();
        expect(
            screen.getByRole('textbox', { name: 'Ajouter une tâche' }),
        ).toBeTruthy();
        expect(
            screen.queryByRole('button', { name: 'Vider les faits' }),
        ).toBeNull();
    });
});
