import { OutputBinaryFile, OutputCopyRemoteURLFile, OutputTextFile } from '@supernovaio/sdk-exporters';
/** A utility class to help with creation of files for Supernova export routines */
export declare class FileHelper {
    /** Creates a new file that will copy its content from a remote URL to a specified destination (path + name) */
    static createCopyRemoteFile({ relativePath, fileName, url }: {
        relativePath: string;
        fileName: string;
        url: string;
    }): OutputCopyRemoteURLFile;
    /** Creates a new file that write its content to a specified destination (path + name) */
    static createTextFile({ relativePath, fileName, content }: {
        relativePath: string;
        fileName: string;
        content: string;
    }): OutputTextFile;
    /** Creates a new file that write its content to a specified destination (path + name) */
    static createBinaryFile({ relativePath, fileName, data }: {
        relativePath: string;
        fileName: string;
        data: ArrayBuffer;
    }): OutputBinaryFile;
}
