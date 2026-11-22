import { UuidGenerator } from '@cocooning/shared-kernel/ports';
import { v7, validate, version } from 'uuid';

const UUID_V7 = 7;

export class UuidV7GeneratorProvider extends UuidGenerator {
    override generate(): string {
        return v7();
    }

    override isValid(value: string): boolean {
        return validate(value) && version(value) === UUID_V7;
    }
}
