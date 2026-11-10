import { NamingHelper } from '../helpers/NamingHelper'
import { StringCase } from '../enums/StringCase'
import { test, expect } from '@jest/globals'

test('codeSafeVariableName_autosplit_1', () => {
  const string = 'test variable'
  expect(NamingHelper.codeSafeVariableName(string, StringCase.capitalCase)).toBe('Test Variable')
})

test('codeSafeVariableName_autosplit_2', () => {
  const string = 'test_variable'
  expect(NamingHelper.codeSafeVariableName(string, StringCase.capitalCase)).toBe('Test Variable')
})

test('codeSafeVariableName_autosplit_3', () => {
  const string = 'testVariable'
  expect(NamingHelper.codeSafeVariableName(string, StringCase.capitalCase)).toBe('Test Variable')
})

test('codeSafeVariableName_startsWithNumber', () => {
  const string = '2testVariable'
  expect(NamingHelper.codeSafeVariableName(string, StringCase.capitalCase)).toBe('_2test Variable')
})

test('codeSafeVariableName_containsGarbage', () => {
  const string = 'test##Variable'
  expect(NamingHelper.codeSafeVariableName(string, StringCase.capitalCase)).toBe('Test Variable')
})

test('codeSafeVariableName_camelCase', () => {
  const string = 'Test Variable'
  expect(NamingHelper.codeSafeVariableName(string, StringCase.camelCase)).toBe('testVariable')
})

test('codeSafeVariableName_capitalCase', () => {
  const string = 'test variable'
  expect(NamingHelper.codeSafeVariableName(string, StringCase.capitalCase)).toBe('Test Variable')
})

test('codeSafeVariableName_constantCase', () => {
  const string = 'test variable'
  expect(NamingHelper.codeSafeVariableName(string, StringCase.constantCase)).toBe('TEST_VARIABLE')
})

test('codeSafeVariableName_dotCase', () => {
  const string = 'test variable'
  expect(NamingHelper.codeSafeVariableName(string, StringCase.dotCase)).toBe('test.variable')
})

test('codeSafeVariableName_trainCase', () => {
  const string = 'test variable'
  expect(NamingHelper.codeSafeVariableName(string, StringCase.trainCase)).toBe('Test-Variable')
})

test('codeSafeVariableName_noCase', () => {
  const string = 'test variable'
  expect(NamingHelper.codeSafeVariableName(string, StringCase.noCase)).toBe('test variable')
})

test('codeSafeVariableName_kebabCase', () => {
  const string = 'test variable'
  expect(NamingHelper.codeSafeVariableName(string, StringCase.kebabCase)).toBe('test-variable')
})

test('codeSafeVariableName_pascalCase', () => {
  const string = 'test variable'
  expect(NamingHelper.codeSafeVariableName(string, StringCase.pascalCase)).toBe('TestVariable')
})

test('codeSafeVariableName_pathCase', () => {
  const string = 'test variable'
  expect(NamingHelper.codeSafeVariableName(string, StringCase.pathCase)).toBe('test/variable')
})

test('codeSafeVariableName_sentenceCase', () => {
  const string = 'test variable'
  expect(NamingHelper.codeSafeVariableName(string, StringCase.sentenceCase)).toBe('Test variable')
})

test('codeSafeVariableName_snakeCase', () => {
  const string = 'test variable'
  expect(NamingHelper.codeSafeVariableName(string, StringCase.snakeCase)).toBe('test_variable')
})

test('codeSafeVariableName_default', () => {
  const string = 'test variable'
  expect(NamingHelper.codeSafeVariableName(string, 'invalid-case' as StringCase)).toBe('testvariable')
})

test('nameAsCSSVarReference', () => {
  const string = 'test-variable'
  expect(NamingHelper.nameAsCSSVarReference(string)).toBe('var(--test-variable)')
})

test('nameAsCSSVarDeclaration', () => {
  const string = 'test-variable'
  expect(NamingHelper.nameAsCSSVarDeclaration(string)).toBe('--test-variable')
})

test('codeSafeVariableNameForToken_case_1', () => {
  const string = 'test variable'
  const token = {
    name: '1000'
  }
  const tokenGroup = {
    name: 'Red',
    path: ['Brand', 'Primary'],
    isRoot: false
  }
  expect(NamingHelper.codeSafeVariableNameForToken(token, StringCase.snakeCase, tokenGroup, 'colors')).toBe(
    'colors_brand_primary_red_1000'
  )
})

test('codeSafeVariableNameForToken_case_2', () => {
  const string = 'test variable'
  const token = {
    name: 'red1000'
  }
  const tokenGroup = {
    name: 'Red',
    path: ['Brand'],
    isRoot: false
  }
  expect(NamingHelper.codeSafeVariableNameForToken(token, StringCase.pathCase, tokenGroup, null)).toBe(
    'brand/red/red1000'
  )
})

test('codeSafeVariableNameForToken_case_3', () => {
  const string = 'test variable'
  const token = {
    name: 'red 1000'
  }
  const tokenGroup = {
    name: 'Red',
    path: ['Brand'],
    isRoot: false
  }
  expect(NamingHelper.codeSafeVariableNameForToken(token, StringCase.camelCase, tokenGroup, null)).toBe(
    'brandRed1000'
  )
})

test('codeSafeVariableNameForToken_removes_consecutive_duplicates_1', () => {
  const token = {
    name: '500'
  }
  const tokenGroup = {
    name: 'Neutral',
    path: ['Neutral', 'Neutral'],
    isRoot: false
  }
  expect(NamingHelper.codeSafeVariableNameForToken(token, StringCase.kebabCase, tokenGroup, null)).toBe(
    'neutral-500'
  )
})

test('codeSafeVariableNameForToken_removes_consecutive_duplicates_2', () => {
  const token = {
    name: '500'
  }
  const tokenGroup = {
    name: 'Neutral',
    path: ['Color', 'Color', 'Neutral'],
    isRoot: false
  }
  expect(NamingHelper.codeSafeVariableNameForToken(token, StringCase.kebabCase, tokenGroup, null)).toBe(
    'color-neutral-500'
  )
})

test('codeSafeVariableNameForToken_keeps_non_consecutive_duplicates', () => {
  const token = {
    name: '500'
  }
  const tokenGroup = {
    name: 'Neutral',
    path: ['Neutral', 'Color', 'Neutral'],
    isRoot: false
  }
  expect(NamingHelper.codeSafeVariableNameForToken(token, StringCase.kebabCase, tokenGroup, null)).toBe(
    'neutral-color-neutral-500'
  )
})

test('codeSafeVariableNameForToken_handles_token_name_duplicate_1', () => {
  const token = {
    name: 'Neutral 500'
  }
  const tokenGroup = {
    name: 'Neutral',
    path: ['Color'],
    isRoot: false
  }
  expect(NamingHelper.codeSafeVariableNameForToken(token, StringCase.kebabCase, tokenGroup, null)).toBe(
    'color-neutral-500'
  )
})

test('codeSafeVariableNameForToken_handles_token_name_duplicate_2', () => {
  const token = {
    name: 'Neutral 500'
  }
  const tokenGroup = {
    name: 'Neutral',
    path: ['Color', 'Neutral'],
    isRoot: false
  }
  expect(NamingHelper.codeSafeVariableNameForToken(token, StringCase.kebabCase, tokenGroup, null)).toBe(
    'color-neutral-500'
  )
})

test('codeSafeVariableNameForToken_handles_token_name_with_different_case', () => {
  const token = {
    name: 'neutral 500'
  }
  const tokenGroup = {
    name: 'Neutral',
    path: ['Color', 'NEUTRAL'],
    isRoot: false
  }
  expect(NamingHelper.codeSafeVariableNameForToken(token, StringCase.kebabCase, tokenGroup, null)).toBe(
    'color-neutral-500'
  )
})

test('codeSafeVariableNameForToken_find_replace_1', () => {
  const token = {
    name: 'Border Color Medium Contrast'
  }
  const tokenGroup = {
    name: 'Border',
    path: ['Color'],
    isRoot: false
  }
  const findReplace = {
    'Border Radius': '',
    'border': '',
    'Contrast': ''
  }
  expect(NamingHelper.codeSafeVariableNameForToken(token, StringCase.kebabCase, tokenGroup, null, findReplace)).toBe(
    'color-medium'
  )
})

test('codeSafeVariableNameForToken_find_replace_2', () => {
  const token = {
    name: 'Border Color Medium'
  }
  const tokenGroup = {
    name: 'Border',
    path: ['Color'],
    isRoot: false
  }
  const findReplace = {
    'Border': 'Edge',
    'Color': ''
  }
  expect(NamingHelper.codeSafeVariableNameForToken(token, StringCase.kebabCase, tokenGroup, null, findReplace)).toBe(
    'edge-medium'
  )
})

test('codeSafeVariableNameForToken_find_replace_case_insensitive', () => {
  const token = {
    name: 'BORDER COLOR MEDIUM'
  }
  const tokenGroup = {
    name: 'Border',
    path: ['Color'],
    isRoot: false
  }
  const findReplace = {
    'border': 'edge',
    'color': 'hue'
  }
  expect(NamingHelper.codeSafeVariableNameForToken(token, StringCase.kebabCase, tokenGroup, null, findReplace)).toBe(
    'hue-edge-hue-medium'
  )
})

test('codeSafeVariableNameForToken_find_replace_special_chars', () => {
  const token = {
    name: 'Border.Color.Medium'
  }
  const tokenGroup = {
    name: 'Border',
    path: ['Color'],
    isRoot: false
  }
  const findReplace = {
    'Border.Color': 'Edge'
  }
  expect(NamingHelper.codeSafeVariableNameForToken(token, StringCase.kebabCase, tokenGroup, null, findReplace)).toBe(
    'color-border-edge-medium'
  )
})

test('codeSafeVariableName_find_replace_1', () => {
  const findReplace = {
    'Border Radius': '',
    'border': '',
    'Contrast': ''
  }
  expect(NamingHelper.codeSafeVariableName('Border Color Medium Contrast', StringCase.kebabCase, findReplace)).toBe(
    'color-medium'
  )
})

test('codeSafeVariableName_find_replace_2', () => {
  const findReplace = {
    'Border': 'Edge',
    'Color': 'Hue'
  }
  expect(NamingHelper.codeSafeVariableName('Border Color Medium', StringCase.kebabCase, findReplace)).toBe(
    'edge-hue-medium'
  )
})

test('codeSafeVariableName_find_replace_case_insensitive', () => {
  const findReplace = {
    'border': 'edge',
    'color': 'hue'
  }
  expect(NamingHelper.codeSafeVariableName('BORDER COLOR MEDIUM', StringCase.kebabCase, findReplace)).toBe(
    'edge-hue-medium'
  )
})

test('codeSafeVariableName_find_replace_special_chars', () => {
  const findReplace = {
    'Border.Color': 'Edge.Hue'
  }
  expect(NamingHelper.codeSafeVariableName('Border.Color.Medium', StringCase.kebabCase, findReplace)).toBe(
    'edge-hue-medium'
  )
})

test('codeSafeVariableName_find_replace_overlapping_patterns', () => {
  const findReplace = {
    'Border': 'Edge',
    'Border Color': 'BorderHue'
  }
  expect(NamingHelper.codeSafeVariableName('Border Color Medium', StringCase.kebabCase, findReplace)).toBe(
    'border-hue-medium'
  )
})

test('codeSafeVariableName_find_replace_empty_strings', () => {
  const findReplace = {
    'Border': '',
    'Color': '',
    'Medium': ''
  }
  expect(NamingHelper.codeSafeVariableName('Border Color Medium', StringCase.kebabCase, findReplace)).toBe(
    ''
  )
})

test('codeSafeVariableNameForToken_deduplication_with_kebabCase', () => {
  // Token: {"name":"fill-warning","type":"Color","path":["Color","bg","fill"],"prefix":"color","value":{"color":{"r":255,"g":184,"b":0,"referencedTokenId":null},"opacity":{"unit":"Raw","measure":1,"referencedTokenId":null},"referencedTokenId":"6e32c1bc-489b-43f2-8aa0-07fdf3cfb8ee"}}
  const token = {
    name: 'fill-warning'
  }
  const tokenGroup = {
    name: 'fill',
    path: ['Color', 'bg', 'fill'],
    isRoot: false
  }
  // Test with different case formats to ensure deduplication works in all cases
  expect(NamingHelper.codeSafeVariableNameForToken(token, StringCase.kebabCase, tokenGroup, 'color', undefined, true)).toBe(
    'color-bg-fill-warning'
  )
  expect(NamingHelper.codeSafeVariableNameForToken(token, StringCase.camelCase, tokenGroup, 'color', undefined, true)).toBe(
    'colorBgFillWarning'
  )
  expect(NamingHelper.codeSafeVariableNameForToken(token, StringCase.snakeCase, tokenGroup, 'color', undefined, true)).toBe(
    'color_bg_fill_warning'
  )
})

test('codeSafeVariableNameForToken_without_deduplication', () => {
  // Same token as above but without deduplication
  const token = {
    name: 'fill-warning'
  }
  const tokenGroup = {
    name: 'fill',
    path: ['Color', 'bg', 'fill'],
    isRoot: false
  }
  // Test with different case formats to ensure no deduplication happens when removeDuplicateFragments is false
  expect(NamingHelper.codeSafeVariableNameForToken(token, StringCase.kebabCase, tokenGroup, 'color', undefined, false)).toBe(
    'color-color-bg-fill-fill-warning'
  )
  expect(NamingHelper.codeSafeVariableNameForToken(token, StringCase.camelCase, tokenGroup, 'color')).toBe(
    'colorBgFillWarning'
  )
  expect(NamingHelper.codeSafeVariableNameForToken(token, StringCase.snakeCase, tokenGroup, 'color')).toBe(
    'color_bg_fill_warning'
  )
})

test('codeSafeVariableName_with_removeDuplicateFragments', () => {
  // Test the removeDuplicateFragments parameter directly on codeSafeVariableName
  expect(NamingHelper.codeSafeVariableName('color color bg fill fill warning', StringCase.kebabCase, undefined, true)).toBe(
    'color-bg-fill-warning'
  )
  expect(NamingHelper.codeSafeVariableName('color color bg fill fill warning', StringCase.camelCase, undefined, true)).toBe(
    'colorBgFillWarning'
  )
  expect(NamingHelper.codeSafeVariableName('color color bg fill fill warning', StringCase.snakeCase, undefined, true)).toBe(
    'color_bg_fill_warning'
  )
})