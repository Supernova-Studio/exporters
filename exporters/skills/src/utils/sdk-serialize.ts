function toPlainValue(value: unknown, seen: WeakSet<object>): unknown {
  if (value === undefined || value === null) {
    return value
  }

  if (typeof value !== "object") {
    return value
  }

  if (value instanceof Date) {
    return value.toISOString()
  }

  if (seen.has(value)) {
    return "[Circular]"
  }

  seen.add(value)

  if (Array.isArray(value)) {
    return value.map((item) => toPlainValue(item, seen))
  }

  const withRemote = value as { toRemote?: () => unknown }
  if (typeof withRemote.toRemote === "function") {
    return toPlainValue(withRemote.toRemote(), seen)
  }

  const record = value as Record<string, unknown>
  const plain: Record<string, unknown> = {}

  for (const key of Object.keys(record).sort()) {
    if (typeof record[key] === "function") {
      continue
    }

    plain[key] = toPlainValue(record[key], seen)
  }

  return plain
}

export function serializeSdkValue(value: unknown): string {
  if (value === undefined) {
    return "(undefined)\n"
  }

  if (value === null) {
    return "(null)\n"
  }

  return `${JSON.stringify(toPlainValue(value, new WeakSet()), null, 2)}\n`
}
