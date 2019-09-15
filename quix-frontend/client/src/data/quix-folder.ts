import {createFolderPayload, createFile, } from '@wix/quix-shared';
import {QuixFolder, ExamplesNotebook} from '../config';

export default () => createFolderPayload([], {
  ...QuixFolder,
  files: [createFile([{
    id: QuixFolder.id,
    name: QuixFolder.name
  }], {
    id: ExamplesNotebook.id,
    name: ExamplesNotebook.name
  })]
});
