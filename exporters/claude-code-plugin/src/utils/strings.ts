export function trimToUndefined(value: string | undefined): string | undefined {
  const trimmed = value?.trim()
  return trimmed ? trimmed : undefined
}

export function slugify(value: string): string {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

  return slug || "supernova-context"
}

export function sanitizePathSegment(segment: string): string {
  return segment.trim().replace(/[<>:"\\|?*\x00-\x1F]/g, "-")
}
