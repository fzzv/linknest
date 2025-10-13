import { applyDecorators } from "@nestjs/common";
import { Transform } from "class-transformer";
import { IsBoolean, IsOptional, ValidateIf, ValidationOptions } from "class-validator";

export interface OptionalOptions extends ValidationOptions {
  nullable?: boolean;
  /** convert empty strings to null */
  emptyToNull?: boolean;
}

/**
 * Checks if value is missing and if so, ignores all validators.
 *
 * @param validationOptions {@link OptionalOptions}
 *
 * @see IsOptional exported from `class-validator.
 */
// https://stackoverflow.com/a/71353929
export function Optional({ nullable, emptyToNull, ...validationOptions }: OptionalOptions = {}) {
  const decorators: PropertyDecorator[] = [];

  // If nullable is true, use IsOptional, otherwise use ValidateIf
  if (nullable === true) {
    decorators.push(IsOptional(validationOptions));
  } else {
    decorators.push(ValidateIf((object: any, v: any) => v !== undefined, validationOptions));
  }

  // If emptyToNull is true, transform empty strings to null
  if (emptyToNull) {
    decorators.push(Transform(({ value }) => (value === '' ? null : value)));
  }

  return applyDecorators(...decorators);
}

type BooleanOptions = { optional?: boolean };
/**
 * Validates if the value is a boolean.
 * @param options 
 * @returns 
 */
export const ValidateBoolean = (options?: BooleanOptions) => {
  const { optional } = { optional: false, ...options };
  const decorators = [
    IsBoolean(),
    Transform(({ value }) => {
      if (value == 'true') {
        return true;
      } else if (value == 'false') {
        return false;
      }
      return value;
    }),
  ];

  // If optional is true, use Optional
  if (optional) {
    decorators.push(Optional());
  }

  return applyDecorators(...decorators);
};
