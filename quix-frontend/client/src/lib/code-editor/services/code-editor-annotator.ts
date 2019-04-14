export default class CodeEditorAnnotator {
  constructor (private readonly ace) {

  }

  showError(row: number, message: string) {
    this.ace.getSession().setAnnotations([{
      row: row - 1,
      column: 0,
      text: message,
      type: 'error'
    }]);
  }

  hideAll() {
    this.ace.getSession().clearAnnotations();
  }
}
