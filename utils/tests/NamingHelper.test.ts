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
    'brandRedRed1000'
  )
})