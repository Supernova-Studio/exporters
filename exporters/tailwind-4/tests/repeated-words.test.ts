import { describe, test, expect, afterEach } from "@jest/globals"
import { Token, TokenGroup, TokenType } from "@supernovaio/sdk-exporters"
import config from "../config.json"

const mockDefaults = Object.fromEntries(
  (config as Array<{ key: string; default: unknown }>).map((p) => [p.key, p.default])
)
const mockConfig: Record<string, unknown> = { ...mockDefaults }

jest.mock("../src/index", () => ({ exportConfiguration: mockConfig }))

afterEach(() => {
  Object.keys(mockConfig).forEach((key) => delete mockConfig[key])
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

describe("Repeated words", () => {
  test("defaults to removing every repeated word", () => {
    expect(mockConfig.repeatedWords).toBe("removeAll")
  })

  test.each([
    ["removeAll", "duration-fast-themed-ref", "typography-heading-xl"],
    ["removeWhereFragmentsMeet", "duration-fast-fast-themed-ref", "typography-heading-heading-xl"],
    ["keep", "duration-fast-fast-themed-ref", "typography-heading-heading-heading-xl"],
  ])("%s names the variables and the typography class", (option, durationName, typographyName) => {
    mockConfig.repeatedWords = option
    expect(tokenVariableName(durationToken, tokenGroups)).toBe(durationName)
    expect(tokenVariableName(typographyToken, tokenGroups)).toBe(`text-${typographyName}`)
    expect(generateTypographyClass(typographyToken, tokenGroups)).toContain(`.${typographyName} {`)
  })
})
