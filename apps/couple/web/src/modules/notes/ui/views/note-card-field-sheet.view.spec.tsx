import type { NoteCardFieldForm } from '@cocooning/couple-client-business-logic/notes';
import { Drawer, DrawerContent } from '@cocooning/design-system';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WithI18n } from '@/testing/with-i18n';
import { useNoteCardFieldForm } from '../../hooks/use-note-card-field-form';
import { NoteCardFieldSheetView } from './note-card-field-sheet.view';

function SheetHarness({
    submitted,
}: {
    readonly submitted: NoteCardFieldForm[];
}) {
    const form = useNoteCardFieldForm();
    return (
        <Drawer open>
            <DrawerContent>
                <NoteCardFieldSheetView
                    field={{ name: 'Prix', value: null, isManual: false }}
                    form={form}
                    isPending={false}
                    isBusy={false}
                    onSubmit={(values) => submitted.push(values)}
                />
            </DrawerContent>
        </Drawer>
    );
}

function renderSheet() {
    const submitted: NoteCardFieldForm[] = [];
    render(
        <WithI18n>
            <SheetHarness submitted={submitted} />
        </WithI18n>,
    );
    return { submitted, user: userEvent.setup() };
}

describe('Feature: R22, the couple corrects one field of a card', () => {
    it('sends the trimmed value of the field', async () => {
        const { submitted, user } = renderSheet();

        expect(
            screen.getByRole('dialog', { name: 'Corriger « Prix »' }),
        ).not.toBeNull();
        await user.type(screen.getByLabelText('Prix'), ' 30 € ');
        await user.click(screen.getByRole('button', { name: 'Enregistrer' }));

        await waitFor(() => expect(submitted).toEqual([{ value: '30 €' }]));
    });

    it('refuses an empty value under the field', async () => {
        const { submitted, user } = renderSheet();

        await user.click(screen.getByRole('button', { name: 'Enregistrer' }));

        expect(await screen.findByText('Écris une valeur.')).not.toBeNull();
        expect(submitted).toEqual([]);
    });
});
