import {IErrorAnnotation} from '../../../language-parsers/sql-parser/parser/errors-listener';
import {CodeEditorInstance} from '../../../code-editor';
import {ModelConf} from '../../../core/ang/srv/ng-model/ng-model';
export interface HasGetErrorsMethod {
  getErrors(s: string): Promise<IErrorAnnotation[]>;
}

export function getParamsOffset(editorInstance: CodeEditorInstance) {
  if (editorInstance.getParams().hasParams()) {
    const locked = editorInstance.getLockedRange();
    return (locked[locked.length - 1][1] as number) + 1; /* casting because of tslint... */
  }
  return 0;
}

export const attachErrorHandler =
  async (initWorker: () => Promise<HasGetErrorsMethod>, editorInstance: CodeEditorInstance, modelConf: ModelConf) => {
    const worker = await initWorker();

    modelConf.watchWith(({value}) => {
      worker.getErrors(editorInstance.getParams().format(value))
        .then(errors => {
          editorInstance.getAnnotator().hideAll();
          if (errors.length) {
            const e = errors[0];
            const offset = getParamsOffset(editorInstance);
            editorInstance.getAnnotator().showError(e.row + offset + 1, e.text);
          }
        }).catch(e => null);
    });
  };
