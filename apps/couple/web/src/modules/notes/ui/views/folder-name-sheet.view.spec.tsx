import type { FolderNameForm } from '@cocooning/couple-client-business-logic/notes';
import { FOLDER_NAME_MAX_LENGTH } from '@cocooning/couple-shared-kernel/limits';
import { Drawer, DrawerContent } from '@cocooning/design-system';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WithI18n } from '@/testing/with-i18n';
import { useFolderNameForm } from '../../hooks/use-folder-name-form';
import { FolderNameSheetView } from './folder-name-sheet.view';

const LABELS = {
    title: 'Nouveau dossier',
    description: 'Dans « Partagé »',
    submit: 'Créer le dossier',
    pending: 'Création en cours',
};

function SheetHarness({
    name,
    isPending,
    submitted,
}: {
    readonly name: string;
    readonly isPending: boolean;
    readonly submitted: FolderNameForm[];
}) {
    const form = useFolderNameForm(name);
    return (
        <Drawer open>
            <DrawerContent>
                <FolderNameSheetView
                    form={form}
                    labels={LABELS}
                    isPending={isPending}
                    isBusy={isPending}
                    onSubmit={(values) => submitted.push(values)}
                />
            </DrawerContent>
        </Drawer>
    );
}

function renderSheet({ name = '', isPending = false } = {}) {
    const submitted: FolderNameForm[] = [];
    render(
        <WithI18n>
            <SheetHarness
                name={name}
                isPending={isPending}
                submitted={submitted}
            />
        </WithI18n>,
    );
    return { submitted, user: userEvent.setup() };
}

const submitButton = () =>
    screen.getByRole('button', { name: 'Créer le dossier' });

describe('Feature: the name of a folder (R13)', () => {
    it('shows the words of its container and submits the trimmed name', async () => {
        const { submitted, user } = renderSheet();

        expect(
            screen.getByRole('dialog', { name: 'Nouveau dossier' }),
        ).not.toBeNull();
        expect(screen.getByText('Dans « Partagé »')).not.toBeNull();
        await user.type(screen.getByLabelText('Nom'), ' Maison ');
        await user.click(submitButton());

        await waitFor(() => expect(submitted).toEqual([{ name: 'Maison' }]));
    });

    it('starts from the name it is given', () => {
        renderSheet({ name: 'Maison' });

        expect((screen.getByLabelText('Nom') as HTMLInputElement).value).toBe(
            'Maison',
        );
    });

    it.each([
        ['an empty name', '', 'Donne un nom au dossier.'],
        [
            'a name above the maximum',
            'a'.repeat(FOLDER_NAME_MAX_LENGTH + 1),
            'Ce nom est trop long : 60 signes au plus.',
        ],
    ])('refuses %s under the field', async (_label, name, message) => {
        const { submitted, user } = renderSheet({ name });

        await user.click(submitButton());

        expect(await screen.findByText(message)).not.toBeNull();
        expect(submitted).toEqual([]);
    });

    it('spins while the command runs', () => {
        renderSheet({ isPending: true });

        const spinner = screen.getByLabelText('Création en cours');
        expect(spinner.closest('button')?.hasAttribute('disabled')).toBe(true);
    });
});
