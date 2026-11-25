import {
    A_SMART_SPACE_CONTENTS,
    A_SPACE_CONTENTS,
} from '@cocooning/couple-client-business-logic/testing';
import { presentCardContext } from './card-context.presenter';

const LYON = {
    folderId: '01936b2e-7c4a-7000-8000-0000000000e4',
    name: 'Lyon',
};

describe('Feature: the smart tree of a place (R17, R18)', () => {
    it('has none outside a smart folder', () => {
        expect(presentCardContext(A_SPACE_CONTENTS)).toBeNull();
    });

    it('reads the subject and the fields of the smart folder opened', () => {
        expect(presentCardContext(A_SMART_SPACE_CONTENTS)).toEqual({
            subject: 'Les restaurants où nous voulons aller',
            fields: ['Adresse', 'Cuisine', 'Prix'],
            holderName: 'Restaurants',
            isInherited: false,
        });
    });

    it('names the smart folder above a sub-folder, which keeps its card template', () => {
        const contents = {
            ...A_SMART_SPACE_CONTENTS,
            path: [...A_SMART_SPACE_CONTENTS.path, LYON],
        };

        expect(presentCardContext(contents)).toMatchObject({
            holderName: 'Restaurants',
            isInherited: true,
        });
    });

    it('has none when the smart folder is missing from the path', () => {
        const contents = { ...A_SMART_SPACE_CONTENTS, path: [LYON] };

        expect(presentCardContext(contents)).toBeNull();
    });
});
