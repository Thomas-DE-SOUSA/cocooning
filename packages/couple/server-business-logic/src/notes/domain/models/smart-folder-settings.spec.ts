import { smartFolderSettingsFrom } from './smart-folder-settings';

describe('Feature: the settings of a smart folder read back from the database (R17)', () => {
    it.each([
        ['without a subject', { subject: null, cardTemplate: ['Prix'] }],
        [
            'without a template',
            { subject: 'Les restaurants', cardTemplate: null },
        ],
    ])(
        'loads a stored half %s as no settings, without validating',
        (_label, columns) => {
            expect(smartFolderSettingsFrom(columns)).toBeNull();
        },
    );

    it('loads both halves as they are stored', () => {
        const settings = smartFolderSettingsFrom({
            subject: 'Les restaurants',
            cardTemplate: ['Prix'],
        });
        expect(settings?.subject.value).toBe('Les restaurants');
        expect(settings?.template.fieldNames).toEqual(['Prix']);
    });
});
