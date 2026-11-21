import { PERMISSION_VALUES, type Permission } from '../auth';

/** All values of a constants object, typed as the union of its literal values. */
export function valuesOf<T extends Readonly<Record<string, string | number>>>(
  constants: T
): readonly T[keyof T][] {
  return Object.freeze(Object.values(constants)) as readonly T[keyof T][];
}

/** Type guard: is `candidate` one of the allowed `values`? */
export function isOneOf<const V extends readonly (string | number)[]>(
  values: V,
  candidate: unknown
): candidate is V[number] {
  return (values as readonly unknown[]).includes(candidate);
}

/** Type guard: is `value` a Permission in the catalogue? */
export function isPermission(value: unknown): value is Permission {
  return isOneOf(PERMISSION_VALUES, value);
}

/** Does the granted set include `required`? */
export function hasPermission(granted: readonly string[], required: Permission): boolean {
  return granted.includes(required);
}

/** Does the granted set include every one of `required`? */
export function hasAllPermissions(
  granted: readonly string[],
  required: readonly Permission[]
): boolean {
  return required.every((permission) => granted.includes(permission));
}

/** Does the granted set include at least one of `required`? */
export function hasAnyPermission(
  granted: readonly string[],
  required: readonly Permission[]
): boolean {
  return required.some((permission) => granted.includes(permission));
}
