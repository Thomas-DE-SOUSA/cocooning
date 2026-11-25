import {
    FolderTemplateAnswerSchema,
    folderTemplatePrompt,
} from './folder-template.prompt';

describe('Feature: the prompt of a template proposal (R17, R24)', () => {
    it('sends the names only, as JSON', () => {
        const prompt = folderTemplatePrompt({
            folderName: 'Restaurants',
            parentFolderNames: ['Sorties'],
        });
        expect(prompt.operation).toBe('proposeTemplate');
        expect(JSON.parse(prompt.input)).toEqual({
            folderName: 'Restaurants',
            parentFolderNames: ['Sorties'],
        });
        expect(prompt.responseSchema).toMatchObject({
            required: ['subject', 'fields'],
        });
    });

    it('accepts a trimmed answer and refuses one without field', () => {
        expect(
            FolderTemplateAnswerSchema.parse({
                subject: ' Restos ',
                fields: [' Prix '],
            }),
        ).toEqual({ subject: 'Restos', fields: ['Prix'] });
        expect(
            FolderTemplateAnswerSchema.safeParse({ subject: 'R', fields: [] })
                .success,
        ).toBe(false);
    });
});
