import { SharedKernelException } from '../exceptions/shared-kernel.exception';
import { SharedKernelExceptionCodeEnum } from '../exceptions/shared-kernel-exception-code.enum';

type EnumObject = Readonly<Record<string, string>>;

export function parseEnum<const TEnum extends EnumObject>(
    raw: string,
    enumObject: TEnum,
    label: string,
): TEnum[keyof TEnum] {
    const value = Object.values(enumObject).find(
        (candidate) => candidate === raw,
    );
    if (value === undefined) {
        throw new SharedKernelException({
            code: SharedKernelExceptionCodeEnum.ENUM_VALUE_INVALID,
            message: `Invalid ${label} value`,
            context: { label },
        });
    }
    return value as TEnum[keyof TEnum];
}
