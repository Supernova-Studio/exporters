"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const FileNameHelper_1 = require("./FileNameHelper");
const sdk_exporters_1 = require("@supernovaio/sdk-exporters");
describe('FileNameHelper', () => {
    describe('ensureFileExtension', () => {
        it('should add extension if missing', () => {
            expect(FileNameHelper_1.FileNameHelper.ensureFileExtension('styles', '.css')).toBe('styles.css');
        });
        it('should not add extension if already present', () => {
            expect(FileNameHelper_1.FileNameHelper.ensureFileExtension('styles.css', '.css')).toBe('styles.css');
        });
        it('should handle case-insensitive extensions', () => {
            expect(FileNameHelper_1.FileNameHelper.ensureFileExtension('styles.CSS', '.css')).toBe('styles.CSS');
        });
    });
    describe('replaceFileExtension', () => {
        it('should replace old extension with new one', () => {
            expect(FileNameHelper_1.FileNameHelper.replaceFileExtension('styles.css', '.css', '.scss')).toBe('styles.scss');
        });
        it('should handle extensions without dots', () => {
            expect(FileNameHelper_1.FileNameHelper.replaceFileExtension('styles.css', 'css', 'scss')).toBe('styles.scss');
        });
    });
    describe('getDefaultStyleFileName', () => {
        it('should return correct filename for Color type with default extension', () => {
            expect(FileNameHelper_1.FileNameHelper.getDefaultStyleFileName(sdk_exporters_1.TokenType.color)).toBe('color.css');
        });
        it('should return correct filename for Typography type with custom extension', () => {
            expect(FileNameHelper_1.FileNameHelper.getDefaultStyleFileName(sdk_exporters_1.TokenType.typography, '.scss')).toBe('typography.scss');
        });
        it('should return correct filename for all token types', () => {
            const tokenTypes = Object.values(sdk_exporters_1.TokenType);
            tokenTypes.forEach(type => {
                const result = FileNameHelper_1.FileNameHelper.getDefaultStyleFileName(type);
                expect(result).toBeTruthy();
                expect(result.endsWith('.css')).toBeTruthy();
            });
        });
        it('should handle extension without dot', () => {
            expect(FileNameHelper_1.FileNameHelper.getDefaultStyleFileName(sdk_exporters_1.TokenType.color, 'scss')).toBe('color.scss');
        });
    });
});
