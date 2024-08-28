export function capitalizeFirstLetter(input: string): string {
  if (input.length === 0) return input; // Comprobación si el string está vacío
  return input.charAt(0).toUpperCase() + input.slice(1);
}
