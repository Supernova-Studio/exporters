import { Token } from '@supernovaio/sdk-exporters'

/** Finds reference and makes sure it exists if reference was provided. If null was provided, null is on the output as well to make seeking outside few lines smaller */
export function sureOptionalReference(
  referenceId: string | undefined | null,
  allTokens: Map<string, Token>,
  allowReferences: boolean = true
): Token | null {
  if (!referenceId || !allowReferences) {
    return null
  }
  const token = allTokens.get(referenceId)
  if (!token) {
    throw new Error(`Trying to retrieve unknown referenced token ${referenceId}`)
  }
  return token
}
