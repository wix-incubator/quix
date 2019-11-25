import * as antlr4 from 'antlr4';

export interface IErrorAnnotation {
  row: number;
  column: number;
  text: string;
  type: string;
}

export class PythonErrorListener extends antlr4.error.ErrorListener {
  private readonly annotations: IErrorAnnotation[] = [];

  getErrors = () => this.annotations;

  syntaxError(recognizer, offendingSymbol, line, column, msg, e) {
    this.annotations.push({
      row: line - 1,
      column,
      text: msg,
      type: 'error'
    });
  }
}
