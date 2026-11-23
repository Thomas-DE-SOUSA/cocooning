import { SharedKernelException } from '../../exceptions/shared-kernel.exception';
import { SharedKernelExceptionCodeEnum } from '../../exceptions/shared-kernel-exception-code.enum';
import type { UuidGenerator } from '../../ports/uuid/uuid-generator';
import { ValueObject } from '../primitives/value-object';

export abstract class Uuid extends ValueObject<string> {
    private static generator: UuidGenerator | null = null;

    protected constructor(value: string) {
        if (!Uuid.requireGenerator().isValid(value)) {
            throw new SharedKernelException({
                code: SharedKernelExceptionCodeEnum.UUID_INVALID,
                message: 'Invalid UUID format',
            });
        }
        super(value);
        Object.freeze(this);
    }

    static configure(generator: UuidGenerator): void {
        if (Uuid.generator !== null) {
            throw new SharedKernelException({
                code: SharedKernelExceptionCodeEnum.UUID_GENERATOR_ALREADY_CONFIGURED,
                message: 'UuidGenerator already configured',
            });
        }
        Uuid.generator = generator;
    }

    static isConfigured(): boolean {
        return Uuid.generator !== null;
    }

    static resetForTests(): void {
        Uuid.generator = null;
    }

    protected static generateValue(): string {
        return Uuid.requireGenerator().generate();
    }

    private static requireGenerator(): UuidGenerator {
        if (Uuid.generator === null) {
            throw new SharedKernelException({
                code: SharedKernelExceptionCodeEnum.UUID_GENERATOR_NOT_CONFIGURED,
                message:
                    'UuidGenerator not configured. Call Uuid.configure() first.',
            });
        }
        return Uuid.generator;
    }

    getValue(): string {
        return this.props;
    }

    override equals(other: Uuid | null): boolean {
        return (
            other !== null &&
            other.constructor === this.constructor &&
            other.getValue() === this.getValue()
        );
    }
}
