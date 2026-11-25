import type { FolderTemplateForm } from '@cocooning/couple-client-business-logic/notes';
import { Drawer, DrawerContent } from '@cocooning/design-system';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useWatch } from 'react-hook-form';
import { WithI18n } from '@/testing/with-i18n';
import { useCardFieldsDraft } from '../../hooks/use-card-fields-draft';
import { useFolderTemplateForm } from '../../hooks/use-folder-template-form';
import { FolderTemplateSheetView } from './folder-template-sheet.view';

const RESTAURANTS = {
    subject: 'Les restaurants où nous voulons aller',
    fields: ['Adresse', 'Prix'],
};

function SheetHarness({
    submitted,
}: {
    readonly submitted: FolderTemplateForm[];
}) {
    const form = useFolderTemplateForm(RESTAURANTS);
    const fields = useWatch({ control: form.control, name: 'fields' });
    const draft = useCardFieldsDraft(fields, (next) =>
        form.setValue('fields', next),
    );
    return (
        <Drawer open>
            <DrawerContent>
                <FolderTemplateSheetView
                    folderName="Restaurants"
                    form={form}
                    editor={{
                        fields,
                        error: form.formState.errors.fields?.message ?? null,
                        newField: draft.newField,
                        onNewFieldChange: draft.setNewField,
                        onAddField: draft.addField,
                        onRemoveField: draft.removeField,
                    }}
                    isPending={false}
                    isBusy={false}
                    onSubmit={form.handleSubmit((values) =>
                        submitted.push(values),
                    )}
                />
            </DrawerContent>
        </Drawer>
    );
}

function renderSheet() {
    const submitted: FolderTemplateForm[] = [];
    render(
        <WithI18n>
            <SheetHarness submitted={submitted} />
        </WithI18n>,
    );
    return { submitted, user: userEvent.setup() };
}

const save = () => screen.getByRole('button', { name: 'Enregistrer la fiche' });

describe('Feature: « Modifier la fiche » of a smart folder (R17, R22)', () => {
    it('starts from the template the folder reads, then saves the one corrected', async () => {
        const { submitted, user } = renderSheet();

        expect(
            screen.getByRole('dialog', { name: 'Fiche de « Restaurants »' }),
        ).not.toBeNull();
        expect(
            (screen.getByLabelText('Sujet') as HTMLTextAreaElement).value,
        ).toBe(RESTAURANTS.subject);
        await user.click(
            screen.getByRole('button', { name: 'Retirer « Prix »' }),
        );
        await user.type(
            screen.getByLabelText('Nouvelle case'),
            'Horaires{Enter}',
        );
        await user.click(save());

        await waitFor(() =>
            expect(submitted).toEqual([
                {
                    subject: RESTAURANTS.subject,
                    fields: ['Adresse', 'Horaires'],
                },
            ]),
        );
    });

    it('refuses a template without fields under the fields', async () => {
        const { submitted, user } = renderSheet();

        await user.click(
            screen.getByRole('button', { name: 'Retirer « Adresse »' }),
        );
        await user.click(
            screen.getByRole('button', { name: 'Retirer « Prix »' }),
        );
        await user.click(save());

        expect(
            await screen.findByText('Ajoute au moins une case.'),
        ).not.toBeNull();
        expect(submitted).toEqual([]);
    });
});
