import { FileNameHelper } from '../helpers/FileNameHelper'
import { TokenType } from "@supernovaio/sdk-exporters"
import { test, expect } from '@jest/globals'

describe('FileNameHelper', () => {
  describe('ensureFileExtension', () => {
    it('should add extension if missing', () => {
      expect(FileNameHelper.ensureFileExtension('styles', '.css')).toBe('styles.css')
    })

    it('should not add extension if already present', () => {
      expect(FileNameHelper.ensureFileExtension('styles.css', '.css')).toBe('styles.css')
    })

    it('should handle case-insensitive extensions', () => {
      expect(FileNameHelper.ensureFileExtension('styles.CSS', '.css')).toBe('styles.CSS')
    })
  })

  describe('replaceFileExtension', () => {
    it('should replace old extension with new one', () => {
      expect(FileNameHelper.replaceFileExtension('styles.css', '.css', '.scss')).toBe('styles.scss')
    })

    it('should handle extensions without dots', () => {
      expect(FileNameHelper.replaceFileExtension('styles.css', 'css', 'scss')).toBe('styles.scss')
    })
  })

  describe('getDefaultStyleFileName', () => {
    it('should return correct filename for Color type with default extension', () => {
      expect(FileNameHelper.getDefaultStyleFileName(TokenType.color)).toBe('color.css')
    })

    it('should return correct filename for Typography type with custom extension', () => {
      expect(FileNameHelper.getDefaultStyleFileName(TokenType.typography, '.scss')).toBe('typography.scss')
    })

    it('should return correct filename for all token types', () => {
      const tokenTypes = Object.values(TokenType)
      tokenTypes.forEach(type => {
        const result = FileNameHelper.getDefaultStyleFileName(type)
        expect(result).toBeTruthy()
        expect(result.endsWith('.css')).toBeTruthy()
      })
    })

    it('should handle extension without dot', () => {
      expect(FileNameHelper.getDefaultStyleFileName(TokenType.color, 'scss')).toBe('color.scss')
    })
  })
})

test('ensureFileExtension_with_dot', () => {
  expect(FileNameHelper.ensureFileExtension('test', '.css')).toBe('test.css')
  expect(FileNameHelper.ensureFileExtension('test.css', '.css')).toBe('test.css')
})

test('ensureFileExtension_without_dot', () => {
  expect(FileNameHelper.ensureFileExtension('test', 'css')).toBe('test.css')
  expect(FileNameHelper.ensureFileExtension('test.css', 'css')).toBe('test.css')
})

test('replaceFileExtension_with_dot', () => {
  expect(FileNameHelper.replaceFileExtension('test.css', '.css', '.scss')).toBe('test.scss')
})

test('replaceFileExtension_without_dot', () => {
  expect(FileNameHelper.replaceFileExtension('test.css', 'css', 'scss')).toBe('test.scss')
})

test('getDefaultStyleFileName_with_dot', () => {
  expect(FileNameHelper.getDefaultStyleFileName(TokenType.color, '.css')).toBe('color.css')
})

test('getDefaultStyleFileName_without_dot', () => {
  expect(FileNameHelper.getDefaultStyleFileName(TokenType.typography, 'css')).toBe('typography.css')
}) 