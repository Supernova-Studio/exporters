"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileHelper = void 0;
const sdk_exporters_1 = require("@supernovaio/sdk-exporters");
/** A utility class to help with creation of files for Supernova export routines */
class FileHelper {
    /** Creates a new file that will copy its content from a remote URL to a specified destination (path + name) */
    static createCopyRemoteFile({ relativePath, fileName, url }) {
        return {
            path: relativePath,
            name: fileName,
            type: sdk_exporters_1.OutputFileType.copyRemoteUrl,
            url: url
        };
    }
    /** Creates a new file that write its content to a specified destination (path + name) */
    static createTextFile({ relativePath, fileName, content }) {
        return {
            path: relativePath,
            name: fileName,
            type: sdk_exporters_1.OutputFileType.text,
            content: content
        };
    }
    /** Creates a new file that write its content to a specified destination (path + name) */
    static createBinaryFile({ relativePath, fileName, data }) {
        return {
            path: relativePath,
            name: fileName,
            type: sdk_exporters_1.OutputFileType.binary,
            data: data
        };
    }
}
exports.FileHelper = FileHelper;
