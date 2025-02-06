import { OutputBinaryFile, OutputCopyRemoteURLFile, OutputFileType, OutputTextFile } from '@supernovaio/sdk-exporters'

/** A utility class to help with creation of files for Supernova export routines */
export class FileHelper {
  /** Creates a new file that will copy its content from a remote URL to a specified destination (path + name) */
  static createCopyRemoteFile({
    relativePath,
    fileName,
    url
  }: {
    relativePath: string
    fileName: string
    url: string
  }): OutputCopyRemoteURLFile {
    return {
      path: relativePath,
      name: fileName,
      type: OutputFileType.copyRemoteUrl,
      url: url
    }
  }

  /** Creates a new file that write its content to a specified destination (path + name) */
  static createTextFile({
    relativePath,
    fileName,
    content
  }: {
    relativePath: string
    fileName: string
    content: string
  }): OutputTextFile {
    return {
      path: relativePath,
      name: fileName,
      type: OutputFileType.text,
      content: content
    }
  }

  /** Creates a new file that write its content to a specified destination (path + name) */
  static createBinaryFile({
    relativePath,
    fileName,
    data
  }: {
    relativePath: string
    fileName: string
    data: ArrayBuffer
  }): OutputBinaryFile {
    return {
      path: relativePath,
      name: fileName,
      type: OutputFileType.binary,
      data: data
    }
  }
}
