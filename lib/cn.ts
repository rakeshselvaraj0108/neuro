type ClassValue = string | number | false | null | undefined;

/** Joins class names, dropping anything falsy. */
export function cn(...values: ClassValue[]): string {
  return values.filter((value): value is string | number => Boolean(value)).join(" ");
}
