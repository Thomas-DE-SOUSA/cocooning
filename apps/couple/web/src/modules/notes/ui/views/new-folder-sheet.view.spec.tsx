import type { SmartFolderForm } from '@cocooning/couple-client-business-logic/notes';
import { Drawer, DrawerContent } from '@cocooning/design-system';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useWatch } from 'react-hook-form';
import { WithI18n } from '@/testing/with-i18n';
import { useCardFieldsDraft } from '../../hooks/use-card-fields-draft';
import { useNewFolderForm } from '../../hooks/use-new-folder-form';
import { NewFolderSheetView } from './new-folder-sheet.view';

type Journal = {
    readonly submitted: SmartFolderForm[];
    readonly events: string[];
};

function SheetHarness({
    journal,
    isProposing,
}: {
    readonly journal: Journal;
    readonly isProposing: boolean;
}) {
    const { form, kind, setKind } = useNewFolderForm();
    const fields = useWatch({ control: form.control, name: 'fields' });
    const draft = useCardFieldsDraft(fields, (next) =>
        form.setValue('fields', next),
    );
    return (
        <Drawer open>
            <DrawerContent>
                <NewFolderSheetView
                    form={form}
                    description="Dans « Partagé »"
                    kind={kind}
                    template={{
                        fields,
                        error: draft.isDuplicate
                            ? 'duplicate'
                            : (form.formState.errors.fields?.message ?? null),
                        newField: draft.newField,
                        onNewFieldChange: draft.setNewField,
                        onAddField: draft.addField,
                        onRemoveField: draft.removeField,
                    }}
                    isProposing={isProposing}
                    isPending={false}
                    isBusy={isProposing}
                    onKindChange={setKind}
                    onPropose={() => journal.events.push('propose')}
                    onSubmit={(values) => journal.submitted.push(values)}
                />
            </DrawerContent>
        </Drawer>
    );
}

function renderSheet({ isProposing = false } = {}) {
    const journal: Journal = { submitted: [], events: [] };
    render(
        <WithI18n>
            <SheetHarness
                journal={journal}
                isProposing={isProposing}
            />
        </WithI18n>,
    );
    return { journal, user: userEvent.setup() };
}

const create = () => screen.getByRole('button', { name: 'Créer le dossier' });

describe('Feature: « Nouveau dossier », classic or smart (R13, R17)', () => {
    it('creates a classic folder from its name alone', async () => {
        const { journal, user } = renderSheet();

        expect(
            screen.getByRole('button', { name: 'Classique' }).ariaPressed,
        ).toBe('true');
        expect(screen.queryByLabelText('Sujet')).toBeNull();
        await user.type(screen.getByLabelText('Nom'), 'Maison');
        await user.click(create());

        await waitFor(() =>
            expect(journal.submitted).toEqual([
                { name: 'Maison', subject: '', fields: [] },
            ]),
        );
    });

    it('asks the AI, then lets the couple write the subject and the fields', async () => {
        const { journal, user } = renderSheet();

        await user.click(screen.getByRole('button', { name: 'IA' }));
        await user.click(
            screen.getByRole('button', { name: "Proposer avec l'IA" }),
        );
        await user.type(screen.getByLabelText('Nom'), 'Restaurants');
        await user.type(screen.getByLabelText('Sujet'), 'Nos restos');
        await user.type(
            screen.getByLabelText('Ajouter une information (ex. : Terrasse)'),
            'Adresse{Enter}',
        );
        await user.type(
            screen.getByLabelText('Ajouter une information (ex. : Terrasse)'),
            'adresse',
        );
        expect(screen.getByText('duplicate')).not.toBeNull();
        await user.clear(
            screen.getByLabelText('Ajouter une information (ex. : Terrasse)'),
        );
        await user.type(
            screen.getByLabelText('Ajouter une information (ex. : Terrasse)'),
            'Prix',
        );
        await user.click(
            screen.getByRole('button', { name: 'Ajouter une case' }),
        );
        await user.click(
            screen.getByRole('button', { name: 'Retirer « Adresse »' }),
        );
        await user.click(create());

        expect(journal.events).toEqual(['propose']);
        await waitFor(() =>
            expect(journal.submitted).toEqual([
                {
                    name: 'Restaurants',
                    subject: 'Nos restos',
                    fields: ['Prix'],
                },
            ]),
        );
    });

    it('refuses a smart folder without subject nor fields, under each field', async () => {
        const { journal, user } = renderSheet();

        await user.click(screen.getByRole('button', { name: 'IA' }));
        await user.type(screen.getByLabelText('Nom'), 'Restaurants');
        await user.click(create());

        expect(
            await screen.findByText(
                'Dis en une phrase de quoi parle ce dossier.',
            ),
        ).not.toBeNull();
        expect(screen.getByText('Ajoute au moins une case.')).not.toBeNull();
        expect(journal.submitted).toEqual([]);
    });

    it("spins on « Proposer avec l'IA » while the AI answers", async () => {
        const { user } = renderSheet({ isProposing: true });

        await user.click(screen.getByRole('button', { name: 'IA' }));

        const spinner = screen.getByLabelText('Proposition en cours');
        expect(spinner.closest('button')?.hasAttribute('disabled')).toBe(true);
    });
});
