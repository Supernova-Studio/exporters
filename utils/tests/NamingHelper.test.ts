import { NamingHelper } from '../helpers/NamingHelper'
import { StringCase } from '../enums/StringCase'
import { RepeatedWords } from '../enums/RepeatedWords'
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
  expect(NamingHelper.codeSafeVariableNameForToken(token, StringCase.kebabCase, tokenGroup, 'color', undefined, RepeatedWords.RemoveWhereFragmentsMeet)).toBe(
    'color-bg-fill-warning'
  )
  expect(NamingHelper.codeSafeVariableNameForToken(token, StringCase.camelCase, tokenGroup, 'color', undefined, RepeatedWords.RemoveWhereFragmentsMeet)).toBe(
    'colorBgFillWarning'
  )
  expect(NamingHelper.codeSafeVariableNameForToken(token, StringCase.snakeCase, tokenGroup, 'color', undefined, RepeatedWords.RemoveWhereFragmentsMeet)).toBe(
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
  expect(NamingHelper.codeSafeVariableNameForToken(token, StringCase.kebabCase, tokenGroup, 'color', undefined, RepeatedWords.Keep)).toBe(
    'color-color-bg-fill-fill-warning'
  )
  expect(NamingHelper.codeSafeVariableNameForToken(token, StringCase.camelCase, tokenGroup, 'color')).toBe(
    'colorBgFillWarning'
  )
  expect(NamingHelper.codeSafeVariableNameForToken(token, StringCase.snakeCase, tokenGroup, 'color')).toBe(
    'color_bg_fill_warning'
  )
})

test('RemoveWhereFragmentsMeet keeps every word of a single string, which is one fragment', () => {
  expect(NamingHelper.codeSafeVariableName('color color bg', StringCase.kebabCase, undefined, RepeatedWords.RemoveWhereFragmentsMeet)).toBe(
    'color-color-bg'
  )
})

test('RemoveAll on a string writes every repeated word once', () => {
  expect(NamingHelper.codeSafeVariableName('color color bg fill fill warning', StringCase.kebabCase, undefined, RepeatedWords.RemoveAll)).toBe(
    'color-bg-fill-warning'
  )
  expect(NamingHelper.codeSafeVariableName('color color bg fill fill warning', StringCase.camelCase, undefined, RepeatedWords.RemoveAll)).toBe(
    'colorBgFillWarning'
  )
  expect(NamingHelper.codeSafeVariableName('color color bg fill fill warning', StringCase.snakeCase, undefined, RepeatedWords.RemoveAll)).toBe(
    'color_bg_fill_warning'
  )
})

test('keeps a word repeated inside the token name, so it does not collide with the name without the repeat', () => {
  const rootGroup = { name: 'Duration', path: [], isRoot: true }
  expect(NamingHelper.codeSafeVariableNameForToken({ name: 'Fast-fast themed ref' }, StringCase.kebabCase, rootGroup, 'duration')).toBe(
    'duration-fast-fast-themed-ref'
  )
  expect(NamingHelper.codeSafeVariableNameForToken({ name: 'Fast themed ref' }, StringCase.kebabCase, rootGroup, 'duration')).toBe(
    'duration-fast-themed-ref'
  )
  expect(NamingHelper.codeSafeVariableNameForToken({ name: 'Fast-fast themed ref' }, StringCase.camelCase, rootGroup, 'duration')).toBe(
    'durationFastFastThemedRef'
  )
})

test('keeps a word repeated inside the token name with an empty find and replace, the Tailwind default', () => {
  const rootGroup = { name: 'Duration', path: [], isRoot: true }
  expect(NamingHelper.codeSafeVariableNameForToken({ name: 'Fast-fast themed ref' }, StringCase.kebabCase, rootGroup, 'duration', {})).toBe(
    'duration-fast-fast-themed-ref'
  )
})

test('keeps a word repeated inside a group name', () => {
  const tokenGroup = { name: 'Neutral Neutral', path: ['Color'], isRoot: false }
  expect(NamingHelper.codeSafeVariableNameForToken({ name: '500' }, StringCase.kebabCase, tokenGroup, null)).toBe(
    'color-neutral-neutral-500'
  )
})

test('still collapses a word repeated inside the prefix, such as the type prefix and a collection named after it', () => {
  const tokenGroup = { name: 'Text', path: [], isRoot: false }
  expect(NamingHelper.codeSafeVariableNameForToken({ name: 'Primary' }, StringCase.kebabCase, tokenGroup, 'color-Color tokens')).toBe(
    'color-tokens-text-primary'
  )
})

test('drops the group name from the start of the token name once, even when the group name is camelCase', () => {
  const tokenGroup = { name: 'BgColor', path: [], isRoot: false }
  expect(NamingHelper.codeSafeVariableNameForToken({ name: 'BgColor Hover' }, StringCase.kebabCase, tokenGroup, 'color')).toBe(
    'color-bg-color-hover'
  )
})

test('keeps a word repeated inside one fragment of an array, and collapses it where fragments meet', () => {
  expect(NamingHelper.codeSafeVariableName(['Typography', 'Heading', 'Heading heading XL'], StringCase.kebabCase, {}, RepeatedWords.RemoveWhereFragmentsMeet)).toBe(
    'typography-heading-heading-xl'
  )
  expect(NamingHelper.codeSafeVariableName(['color', 'color', 'bg', 'fill', 'fill', 'warning'], StringCase.kebabCase, undefined, RepeatedWords.RemoveWhereFragmentsMeet)).toBe(
    'color-bg-fill-warning'
  )
})

test('keeps a word repeated inside the token name when the group name matches the first word of the token name', () => {
  const tokenGroup = { name: 'Fast', path: [], isRoot: false }
  expect(NamingHelper.codeSafeVariableNameForToken({ name: 'Fast-fast themed ref' }, StringCase.kebabCase, tokenGroup, 'duration')).toBe(
    'duration-fast-fast-themed-ref'
  )
  expect(NamingHelper.codeSafeVariableNameForToken({ name: 'Fast themed ref' }, StringCase.kebabCase, tokenGroup, 'duration')).toBe(
    'duration-fast-themed-ref'
  )
})

test('leaves no empty segment when find and replace removes a whole group name', () => {
  const tokenGroup = { name: 'Blue', path: ['Primitives'], isRoot: false }
  expect(NamingHelper.codeSafeVariableNameForToken({ name: '500' }, StringCase.kebabCase, tokenGroup, null, { Primitives: '' })).toBe(
    'blue-500'
  )
})

test('RemoveAll writes a word repeated inside the token name once', () => {
  const rootGroup = { name: 'Color', path: [], isRoot: true }
  expect(NamingHelper.codeSafeVariableNameForToken({ name: 'Super super token' }, StringCase.kebabCase, rootGroup, 'color', undefined, RepeatedWords.RemoveAll)).toBe(
    'color-super-token'
  )
  expect(NamingHelper.codeSafeVariableNameForToken({ name: 'Fast-fast themed ref' }, StringCase.camelCase, rootGroup, 'duration', undefined, RepeatedWords.RemoveAll)).toBe(
    'durationFastThemedRef'
  )
  expect(NamingHelper.codeSafeVariableNameForToken({ name: 'Super super token' }, StringCase.constantCase, rootGroup, 'color', undefined, RepeatedWords.RemoveAll)).toBe(
    'COLOR_SUPER_TOKEN'
  )
})

test('RemoveAll writes a word repeated inside a group name once', () => {
  const tokenGroup = { name: 'Neutral Neutral', path: ['Color'], isRoot: false }
  expect(NamingHelper.codeSafeVariableNameForToken({ name: '500' }, StringCase.kebabCase, tokenGroup, null, undefined, RepeatedWords.RemoveAll)).toBe(
    'color-neutral-500'
  )
})

test('RemoveAll still writes a word repeated where the group and the token name meet once', () => {
  const tokenGroup = { name: 'Neutral', path: ['Color'], isRoot: false }
  expect(NamingHelper.codeSafeVariableNameForToken({ name: 'Neutral 500' }, StringCase.kebabCase, tokenGroup, null, undefined, RepeatedWords.RemoveAll)).toBe(
    'color-neutral-500'
  )
})

test('RemoveAll keeps a repeated word that is not next to itself', () => {
  const rootGroup = { name: 'Color', path: [], isRoot: true }
  expect(NamingHelper.codeSafeVariableNameForToken({ name: 'Red dark red' }, StringCase.kebabCase, rootGroup, 'color', undefined, RepeatedWords.RemoveAll)).toBe(
    'color-red-dark-red'
  )
})

test('RemoveAll on an array of fragments writes a word repeated inside one fragment once', () => {
  expect(NamingHelper.codeSafeVariableName(['Typography', 'Heading', 'Heading heading XL'], StringCase.kebabCase, {}, RepeatedWords.RemoveAll)).toBe(
    'typography-heading-xl'
  )
})

test('RemoveAll runs find and replace on each fragment, before words are removed', () => {
  expect(NamingHelper.codeSafeVariableName(['Theme', 'Icon', 'Primary'], StringCase.kebabCase, { 'theme icon': 'ti' }, RepeatedWords.RemoveAll)).toBe(
    'theme-icon-primary'
  )
  expect(NamingHelper.codeSafeVariableName(['Brand', 'Brand brand'], StringCase.kebabCase, { Brand: 'Accent' }, RepeatedWords.RemoveAll)).toBe(
    'accent'
  )
})
