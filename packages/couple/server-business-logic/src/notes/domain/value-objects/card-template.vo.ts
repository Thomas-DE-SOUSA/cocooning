import { NoteExceptionCodeEnum } from '@cocooning/couple-contract/notes';
import {
    CARD_FIELD_NAME_MAX_LENGTH,
    CARD_TEMPLATE_MAX_FIELDS,
} from '@cocooning/couple-shared-kernel/limits';
import { ValueObject } from '@cocooning/shared-kernel/domain';
import { NoteException } from '../exceptions/note.exception';
import { sameFieldName } from './card-field-name';

type CardTemplateProps = {
    readonly fieldNames: ReadonlyArray<string>;
};

const invalidTemplate = (): NoteException =>
    new NoteException({
        code: NoteExceptionCodeEnum.CARD_TEMPLATE_INVALID,
        message: 'Invalid card template',
        context: {
            maxFields: CARD_TEMPLATE_MAX_FIELDS,
            maxLength: CARD_FIELD_NAME_MAX_LENGTH,
        },
    });

const isValidName = (name: string): boolean =>
    name.length > 0 && name.length <= CARD_FIELD_NAME_MAX_LENGTH;

const isRepeated = (names: ReadonlyArray<string>): boolean =>
    names.some((name, index) =>
        names.slice(0, index).some((earlier) => sameFieldName(earlier, name)),
    );

export class CardTemplate extends ValueObject<CardTemplateProps> {
    private constructor(props: CardTemplateProps) {
        super(props);
        Object.freeze(this);
    }

    // R17: 1 to CARD_TEMPLATE_MAX_FIELDS fields, each named in 1 to CARD_FIELD_NAME_MAX_LENGTH signs, never twice.
    static create(raw: ReadonlyArray<string>): CardTemplate {
        const fieldNames = raw.map((name) => name.trim());
        if (
            fieldNames.length === 0 ||
            fieldNames.length > CARD_TEMPLATE_MAX_FIELDS
        )
            throw invalidTemplate();
        if (!fieldNames.every(isValidName) || isRepeated(fieldNames))
            throw invalidTemplate();
        return new CardTemplate({ fieldNames });
    }

    static from(fieldNames: ReadonlyArray<string>): CardTemplate {
        return new CardTemplate({ fieldNames: [...fieldNames] });
    }

    get fieldNames(): ReadonlyArray<string> {
        return this.props.fieldNames;
    }
}
