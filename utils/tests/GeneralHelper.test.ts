import { GeneralHelper } from '../helpers/GeneralHelper'

describe('GeneralHelper', () => {
  describe('indent', () => {
    it('should create indentation with default spaces (2)', () => {
      expect(GeneralHelper.indent()).toBe('  ')
    })

    it('should create indentation with specified spaces', () => {
      expect(GeneralHelper.indent(4)).toBe('    ')
    })

    it('should handle zero spaces', () => {
      expect(GeneralHelper.indent(0)).toBe('')
    })

    it('should handle negative spaces', () => {
      expect(GeneralHelper.indent(-2)).toBe('')
    })
  })

  describe('addDisclaimer', () => {
    it('should format single-line disclaimer correctly', () => {
      const disclaimer = 'This is a disclaimer'
      const content = 'const x = 1;'
      const expected = 
        '/**\n' +
        ' * This is a disclaimer \n' +
        ' */\n\n' +
        'const x = 1;'
      expect(GeneralHelper.addDisclaimer(disclaimer, content)).toBe(expected)
    })

    it('should format multi-line disclaimer correctly', () => {
      const disclaimer = 'Line 1\nLine 2\nLine 3'
      const content = 'const x = 1;'
      const expected = 
        '/**\n' +
        ' * Line 1\n' +
        ' * Line 2\n' +
        ' * Line 3 \n' +
        ' */\n\n' +
        'const x = 1;'
      expect(GeneralHelper.addDisclaimer(disclaimer, content)).toBe(expected)
    })

    it('should return content only when disclaimer is empty', () => {
      const content = 'const x = 1;'
      expect(GeneralHelper.addDisclaimer('', content)).toBe(content)
    })

    it('should handle empty content with disclaimer', () => {
      const disclaimer = 'This is a disclaimer'
      const expected = 
        '/**\n' +
        ' * This is a disclaimer \n' +
        ' */\n\n'
      expect(GeneralHelper.addDisclaimer(disclaimer, '')).toBe(expected)
    })
  })
}) 