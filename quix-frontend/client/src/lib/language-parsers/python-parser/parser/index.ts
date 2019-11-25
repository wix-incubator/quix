import {Python3Parser} from '../../python-grammar/lang/python/Python3Parser';
import {createTokenizer} from '../tokenizer/index';
import {PythonErrorListener, IErrorAnnotation} from './errors-listener';

export const createParser = (input: string): any => {
  const tokens = createTokenizer(input);
  return new Python3Parser(tokens);
};

export const getPythonErrors = (input: string) => {
  const parser = createParser(input);
  const listener = new PythonErrorListener();
  parser.removeErrorListeners();
  parser.addErrorListener(listener);
  parser.file_input();
  return listener.getErrors();
};
