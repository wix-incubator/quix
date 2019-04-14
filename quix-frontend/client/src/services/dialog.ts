import {confirm as confirmDialog} from '../lib/ui';

export const confirm = (action: 'delete', context: 'notebook' | 'note' | 'folder', list = false) => {
  return confirmDialog(`
    <dialog yes="${action}" no="cancel">
      <dialog-title>${action} ${context}</dialog-title>
      <dialog-content>
        Are you sure you want to delete ${list ? 'the selected' : 'this'} ${context}?
      </dialog-content>
    </dialog>
  `);
}