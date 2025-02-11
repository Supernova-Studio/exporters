import { OutputFileType } from '@supernovaio/sdk-exporters'
import { FileHelper } from '../helpers/FileHelper'
import { test, expect } from '@jest/globals'

test('createTextFile', () => {
  expect(
    FileHelper.createTextFile({
      relativePath: './',
      fileName: 'test.txt',
      content: 'Test Variable'
    })
  ).toStrictEqual({
    path: './',
    name: 'test.txt',
    content: 'Test Variable',
    type: OutputFileType.text
  })
})

test('createCopyFile', () => {
  expect(
    FileHelper.createCopyRemoteFile({
      relativePath: './',
      fileName: 'test.png',
      url: 'https://google.com/test.png'
    })
  ).toStrictEqual({
    path: './',
    name: 'test.png',
    url: 'https://google.com/test.png',
    type: OutputFileType.copyRemoteUrl
  })
})

test('createBinaryFile', () => {
  expect(
    FileHelper.createBinaryFile({
      relativePath: './',
      fileName: 'test.data',
      data: new ArrayBuffer(256)
    })
  ).toStrictEqual({
    path: './',
    name: 'test.data',
    data: new ArrayBuffer(256),
    type: OutputFileType.binary
  })
})
