import {
    A_SHARED_FOLDER,
    A_SMART_FOLDER,
    A_SMART_SPACE_CONTENTS,
    A_SPACE_CONTENTS,
} from '@cocooning/couple-client-business-logic/testing';
import { presentPlaceLevel } from './place-level.presenter';

const entry = (folder: typeof A_SHARED_FOLDER) => ({
    ...folder,
    folderCount: 0,
    noteCount: 0,
});
const LYON = {
    ...A_SMART_FOLDER,
    folderId: '01936b2e-7c4a-7000-8000-0000000000e4',
    name: 'Lyon',
    subject: null,
    cardTemplate: null,
};

describe('Feature: the folders of a level and their card template (R17, R18)', () => {
    it('has no template for a classic folder', () => {
        const [folder] = presentPlaceLevel(A_SPACE_CONTENTS).folders;

        expect(folder).toMatchObject({ isSmart: false, template: null });
    });

    it('reads the subject and the fields a smart folder holds', () => {
        const [folder] = presentPlaceLevel({
            ...A_SPACE_CONTENTS,
            folders: [entry(A_SMART_FOLDER)],
        }).folders;

        expect(folder).toMatchObject({
            isSmart: true,
            template: {
                subject: A_SMART_FOLDER.subject,
                fields: A_SMART_FOLDER.cardTemplate,
            },
        });
    });

    it('gives a sub-folder of a smart tree the template of the place', () => {
        const [folder] = presentPlaceLevel({
            ...A_SMART_SPACE_CONTENTS,
            folders: [entry(LYON)],
        }).folders;

        expect(folder?.template).toEqual({
            subject: A_SMART_SPACE_CONTENTS.cardContext?.subject,
            fields: A_SMART_SPACE_CONTENTS.cardContext?.cardTemplate,
        });
    });
});
