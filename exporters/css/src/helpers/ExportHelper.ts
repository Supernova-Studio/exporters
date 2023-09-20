import { OutputCopyRemoteURLFile, OutputFileType, OutputTextFile, OutputBinaryFile } from "@supernova-studio/pulsar-next"

export class ExportHelper {
  /** Creates a new file that will copy its content from a remote URL to a specified destination (path + name) */
  static outputCopyRemoteFile({ relativePath, name, url }: { relativePath: string; name: string; url: string }): OutputCopyRemoteURLFile {
    return {
      path: relativePath,
      name: name,
      type: OutputFileType.copyRemoteUrl,
      url: url,
    }
  }

  /** Creates a new file that write its content to a specified destination (path + name) */
  static outputTextFile({ relativePath, name, content }: { relativePath: string; name: string; content: string }): OutputTextFile {
    return {
      path: relativePath,
      name: name,
      type: OutputFileType.text,
      content: content,
    }
  }

  /** Creates a new file that write its content to a specified destination (path + name) */
  static outputBinaryFile({ relativePath, name, data }: { relativePath: string; name: string; data: ArrayBuffer }): OutputBinaryFile {
    return {
      path: relativePath,
      name: name,
      type: OutputFileType.binary,
      data: data,
    }
  }
}
