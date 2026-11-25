import { describe, test, expect, afterEach } from "@jest/globals"
import { Token, TokenGroup, TokenType } from "@supernovaio/sdk-exporters"
import config from "../config.json"

const mockDefaults = Object.fromEntries(
  (config as Array<{ key: string; default: unknown }>).map((p) => [p.key, p.default])
)
const mockConfig: Record<string, unknown> = { ...mockDefaults }

jest.mock("../src/index", () => ({ exportConfiguration: mockConfig }))

afterEach(() => {
  Object.assign(mockConfig, mockDefaults)
})

const { tokenVariableName } = require("../src/content/token") as typeof import("../src/content/token")
const { generateTypographyClass } = require("../src/content/typography") as typeof import("../src/content/typography")

const durationGroup = { id: "duration", name: "Duration", isRoot: true, path: [] } as unknown as TokenGroup
const headingGroup = { id: "heading", name: "Heading", isRoot: false, path: ["Typography"] } as unknown as TokenGroup
const tokenGroups = [durationGroup, headingGroup]

const durationToken = {
  id: "fast",
  name: "Fast-fast themed ref",
  tokenType: TokenType.duration,
  parentGroupId: "duration"
} as unknown as Token
const typographyToken = {
  id: "xl",
  name: "Heading heading XL",
  tokenType: TokenType.typography,
  parentGroupId: "heading",
  tokenPath: ["Typography", "Heading"]
} as unknown as Token

describe("Remove repeated words", () => {
  test("is on by default and writes a word repeated inside the token name once", () => {
    expect(tokenVariableName(durationToken, tokenGroups)).toBe("duration-fast-themed-ref")
    expect(generateTypographyClass(typographyToken, tokenGroups)).toContain(".typography-heading-xl {")
  })

  test("keeps a word repeated inside the token name when off", () => {
    mockConfig.removeRepeatedWords = false
    expect(tokenVariableName(durationToken, tokenGroups)).toBe("duration-fast-fast-themed-ref")
    expect(generateTypographyClass(typographyToken, tokenGroups)).toContain(".typography-heading-heading-xl {")
  })
})
